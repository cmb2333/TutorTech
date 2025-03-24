from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from openai import OpenAI
import logging
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, Range
import time
import json

# Load environment variables
load_dotenv()

# OpenAI client setup
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Allow requests from the frontend with credentials (for cookies)
app = Flask(__name__)

# Enable CORS for the app (Hopefully this will fix cors issues)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Configure logging 
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Initialize Qdrant
qdrant_client = QdrantClient("localhost", port=6333)

# Create a collection if it doesn't exist
# 1536 is the size for OpenAI embeddings
collection_name = "chat_history"
if not qdrant_client.collection_exists(collection_name):
    qdrant_client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
    )

def get_db_connection():
    try:
        connection = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT"),
            cursor_factory=RealDictCursor
        )
        logging.info("Successfully connected to the PostgreSQL database.")
        return connection
    except psycopg2.Error as e:
        logging.error(f"Failed to connect to the PostgreSQL database: {e}")
        raise

def embed_text(text):
    """Generate an embedding using OpenAI (for Qdrant)."""
    response = client.embeddings.create(model="text-embedding-ada-002", input=[text])
    return response.data[0].embedding

# Delete messages older than 30 days
def delete_old_messages():
    threshold_time = time.time() - (30 * 24 * 60 * 60)  # 30 days ago
    qdrant_client.delete(
            collection_name=collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="timestamp",
                        range=Range(lt=threshold_time)
                    )
                ]
            )
        )
        
def generate_prompt_from_preferences(prefs):
    if not prefs:
        return "You are a helpful learning assistant."

    prompt_parts = ["You are a personalized tutor. Ensure responses are in full sentences without using special characters like newlines, bullet points, or bold text."]

    if prefs.get("response_length") == "short":
        prompt_parts.append("Keep your answers short and concise.")
    elif prefs.get("response_length") == "long":
        prompt_parts.append("Provide detailed, thorough explanations.")

    if prefs.get("guidance_style") == "step_by_step":
        prompt_parts.append("Explain concepts using step-by-step guidance.")
    elif prefs.get("guidance_style") == "real_world":
        prompt_parts.append("Use real-world examples to make concepts relatable.")

    if prefs.get("value_focus") == "process":
        prompt_parts.append("Focus on helping the user understand the learning process.")
    elif prefs.get("value_focus") == "direct":
        prompt_parts.append("Focus on delivering direct, actionable answers.")

    return " ".join(prompt_parts)

# -------------------------------- User Login --------------------------------
@app.route('/login', methods=['POST'])
def login():

    data = request.json  
    user_id = data.get("user_id")
    password = data.get("user_password")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM student_information WHERE user_id = %s AND user_password = %s",
            (user_id, password)
        )
        result = cursor.fetchone()

        if not result:
            return jsonify({"message": "Invalid username or password"}), 401

        cursor.execute(
            "SELECT first_name, last_name, email FROM student_information WHERE user_id = %s",
            (user_id,)
        )
        user_info = cursor.fetchone()

        if user_info:
            response = make_response(jsonify({
                "message": "Login successful",
                "user_id": user_id,
                "email": user_info["email"],
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"]
            }))
            response.set_cookie("user_id", user_id, httponly=True, samesite='Strict')
            return response, 200
        else:
            return jsonify({"message": "User information not found"}), 404

    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"message": "Server error"}), 500

    finally:
        if conn:
            conn.close()

# -------------------------------- User Sign up --------------------------------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    user_id = data.get("user_id")
    email = data.get("email")
    user_password = data.get("user_password")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Make sure user does not already exist
        cursor.execute("SELECT * FROM student_information WHERE user_id = %s OR email = %s", (user_id, email))
        existing_user = cursor.fetchone()
        
        if existing_user:
            return jsonify({"message": "User ID or Email already exists"}), 400

        # Insert new user into database
        cursor.execute(
            "INSERT INTO student_information (user_id, email, user_password, first_name, last_name) VALUES (%s, %s, %s, %s, %s)",
            (user_id, email, user_password, first_name, last_name)
        )
        conn.commit()

        return jsonify({"message": "Signup successful"}), 201

    except Exception as e:
        print(f"Error during signup: {e}")
        return jsonify({"message": "Server error"}), 500

    finally:
        if conn:
            conn.close()

# -------------------------------- Check Session --------------------------------
@app.route('/session', methods=['GET'])
def session():
    user_id = request.cookies.get('user_id')
    if not user_id:
        return jsonify({"message": "No active session"}), 401

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT user_id, first_name, last_name, email FROM student_information WHERE user_id = %s",
            (user_id,)
        )
        user_info = cursor.fetchone()

        if user_info:
            return jsonify({
                "user_id": user_info["user_id"],
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"],
                "email": user_info["email"],
                "message": "Session active"
            }), 200
        else:
            return jsonify({"message": "User information not found"}), 404

    except Exception as e:
        print(f"Error checking session: {e}")
        return jsonify({"message": "Server error"}), 500

    finally:
        if conn:
            conn.close()

# -------------------------------- Logout --------------------------------
@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logged out"}))
    response.delete_cookie("user_id")
    return response, 200


# -------------------------------- Update Profile --------------------------------
@app.route('/update-profile', methods=['PUT'])
def update_profile():

    data = request.json  
    user_id = data.get("user_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")

    try:
        conn= get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE student_information SET first_name = %s, last_name = %s, email=%s WHERE user_id = %s RETURNING user_id, first_name, last_name, email",
            (first_name, last_name, email, user_id)
        )
        user_info = cursor.fetchone()

        conn.commit()
        cursor.close()
        conn.close()

        if user_info:
            return jsonify({
                "user_id": user_id,
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"],
                "email": user_info["email"],
            })
        else:
            return jsonify({"message": "Failed to update profile"}), 500

    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({"message": "Server error"}), 500
    
# -------------------------------- Change Password --------------------------------
@app.route('/change-password', methods=["PUT"])
def change_password():
    
    data = request.json
    user_id = data.get("user_id")
    currentPassword = data.get("currentPassword")
    newPassword = data.get("newPassword")

    try:
        conn= get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM student_information WHERE user_id = %s AND user_password = %s",
            (user_id, currentPassword)
        )
        result = cursor.fetchone()

        if not result:
            return jsonify({"message": "Current Password Invalid"}), 401
        
        cursor.execute("UPDATE student_information SET user_password = %s WHERE user_id = %s", (newPassword, user_id))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Password updated successfully."})
    
    except Exception as e:
        print("Error updating password:", e)
        return jsonify({"message": "Failed to update password."}), 500
        


# ------------------------- Fetch Course Information --------------------------------
@app.route('/courses', methods=['GET'])
def get_courses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT course_code, course_title, credits, course_description FROM course_information")
        courses = cursor.fetchall()

        # Return fetched courses as JSON
        return jsonify(courses), 200

    except Exception as e:
        return jsonify({"message": "Server error"}), 500

    finally:
        if conn:
            conn.close()

@app.route('/courses/<course_id>', methods=['GET'])
def get_course(course_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch course by course_id
        cursor.execute(
            "SELECT course_code, course_title, credits FROM course_information WHERE course_code = %s",
            (course_id,)
        )
        course = cursor.fetchone()

        if not course:
            return jsonify({"message": "Course not found"}), 404

        # Fetch lectures
        cursor.execute(
            """
            SELECT lecture_id, lecture_title, video_link
            FROM course_lectures WHERE course_code = %s
            """,
            (course_id,)
        )
        lectures = cursor.fetchall()

        # Fetch assignments
        cursor.execute(
            """
            SELECT assignment_id, assignment_title, max_score
            FROM course_assignments WHERE course_code = %s
            """,
            (course_id,)
        )
        assignments = cursor.fetchall()

        # Return course data as JSON
        return jsonify({
            "course_code": course["course_code"],
            "course_title": course["course_title"],
            "credits": course["credits"],
            "lectures": lectures,
            "assignments": assignments
        }), 200

    except Exception as e:
        print(f"Error fetching course: {e}")
        return jsonify({"message": "Server error"}), 500

    finally:
        if conn:
            conn.close()

# ------------------------- AI Chat -------------------------------------- 
@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200

    try:
        data = request.json
        bot_type = data.get('botType', 'Tutor')
        prompt = data.get('prompt', '')
        user_id = data.get('userId')

        # Clean old messages before storing a new one
        delete_old_messages()

        # Embed the user query
        user_embedding = embed_text(prompt)

        # Store user message in Qdrant
        qdrant_client.upsert(
            collection_name=collection_name,
            points=[
                PointStruct(
                    # Unique ID based on timestamp
                    id=int(time.time()),
                    vector=user_embedding,
                    payload={"user_id": user_id, "role": "user", "content": prompt}
                )
            ]
        )

        # Retrieve chat history using semantic search
        # Get top 5 most relevant messages
        # Ignore low-quality matches
        # Take the more precise results
        search_results = qdrant_client.search(
            collection_name=collection_name,
            query_vector=user_embedding,
            limit=5,
            #filter={"user_id": user_id},
            with_payload=True,
            with_vectors=False,
            score_threshold=0.75,
            #params={"hnsw_ef": 128, "rerank_top": 3}  
        )

        history = [{"role": item.payload["role"], "content": item.payload["content"]} for item in search_results]

        # AI bot customization
        bot_prompts = {
            "Tutor": "Provide structured, step-by-step explanations in full sentences without using special characters like newlines, bullet points, or bold text. Keep explanations concise, ensuring readability in a continuous paragraph format. Encourage follow-up questions for further elaboration.",
            "Mentor": "Combine concise answers with practical steps and or real-life examples where applicable. Maintain a balance between elaboration and clarity. Ensure responses are in full sentences without using special characters like newlines, bullet points, or bold text.",
            "Co-Learner": "Provide quick, digestible answers that summarize key points without excessive detail. Your tone should be friendly, casual, and straight to the point. Provide quick definitions describing only the most important facts. Ensure responses are in full sentences without using special characters like newlines, bullet points, or bold text.",
        }

        # Determine system message
        if bot_type == "Custom":
            # Load learning preferences from DB
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT learning_preferences FROM student_information WHERE user_id = %s", (user_id,))
            result = cursor.fetchone()
            preferences = json.loads(result["learning_preferences"]) if result and result["learning_preferences"] else {}
            system_message = generate_prompt_from_preferences(preferences)
        else:
            # Fallback to default behavior
            system_message = bot_prompts.get(bot_type, "You are a helpful assistant.")

        for message in history:
            if message["role"] == "ai":
                message["role"] = "assistant"

        # Query OpenAI with history
        messages = [{"role": "system", "content": system_message}] + history + [{"role": "user", "content": prompt}]
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )

        ai_response = completion.choices[0].message.content

        # Store AI response in Qdrant
        ai_embedding = embed_text(ai_response)
        qdrant_client.upsert(
            collection_name=collection_name,
            points=[
                PointStruct(
                    id=int(time.time()) + 1,
                    vector=ai_embedding,
                    payload={"user_id": user_id, "role": "assistant", "content": ai_response}
                )
            ]
        )

        return jsonify({"response": ai_response}), 200

    except Exception as e:
        print(f"Error in chat function: {e}")
        return jsonify({"error": "Failed to process the request"}), 500

@app.route('/save-preferences', methods=['POST'])
def save_preferences():
    data = request.json
    user_id = data.get("user_id")
    preferences = data.get("preferences")  # expects a dictionary

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE student_information SET learning_preferences = %s WHERE user_id = %s",
            (json.dumps(preferences), user_id)
        )
        conn.commit()
        return jsonify({"message": "Preferences saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------------- Course Enrollment -------------------------------------- 
@app.route('/enroll', methods=['POST'])
def enroll_course():
    data = request.json
    user_id = data.get("user_id")
    course_code = data.get("course_code")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if already enrolled
        cursor.execute("SELECT * FROM enrollments WHERE user_id = %s AND course_code = %s", (user_id, course_code))
        if cursor.fetchone():
            return jsonify({"message": "Already enrolled in this course"}), 400
        
        # enroll
        cursor.execute(
            "INSERT INTO enrollments (user_id, course_code) VALUES (%s, %s)",
            (user_id, course_code)
        )
        conn.commit()
        return jsonify({"message": "Enrolled successfully"}), 200

    except Exception as e:
        print(f"Error during enrollment: {e}")
        return jsonify({"message": "Server error"}), 500
    finally:
        if conn:
            conn.close()

@app.route('/enrolled-courses/<user_id>', methods=['GET'])
def get_enrolled_courses(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get enrolled courses for a user
        cursor.execute("""
            SELECT ci.course_code, ci.course_title, ci.credits
            FROM course_information ci
            JOIN enrollments e ON ci.course_code = e.course_code
            WHERE e.user_id = %s
        """, (user_id,))
        
        courses = cursor.fetchall()
        return jsonify(courses), 200

    except Exception as e:
        print(f"Error fetching enrolled courses: {e}")
        return jsonify({"message": "Server error"}), 500
    finally:
        if conn:
            conn.close()


# ------------------------- Assignments -------------------------------------- 
# Fetch questions for an assignment, including correct answers
@app.route('/api/assignments/<assignment_id>/questions', methods=['GET'])
def get_assignment_questions(assignment_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Fetch assignment questions with correct answers
        cur.execute("""
            SELECT question_id, question_text, question_type, options, correct_answer, max_points
            FROM assignment_questions
            WHERE assignment_id = %s
        """, (assignment_id,))
        questions = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify(questions)
    except Exception as e:
        print(f"Error fetching questions: {e}")
        return jsonify({"error": "Failed to fetch questions"}), 500

# Function for evaluating free response questions
def evaluate_text_response_with_openai(user_answer, keyword_list, max_points, question_text):
    try:
        max_points = max_points or 1
        keyword_str = ', '.join(keyword_list)

        # --- Prompt to Chatgpt ---
        prompt = f"""
You are an education grading assistant. Your job is to grade short free-response student answers based on how well they address the key concepts of a specific question.

QUESTION:
\"\"\"
{question_text}
\"\"\"

KEYWORDS:
{keyword_str}

STUDENT ANSWER:
\"\"\"
{user_answer}
\"\"\"

INSTRUCTIONS:
1. Explain which keywords or ideas were addressed and which were missing.
2. Justify how well the student answered the question based on those key ideas.
3. On the FINAL line, provide a numeric score from 0 to {max_points}. Only the number. No extra words.
"""
        # --- Log prompt and user input ---
        print("---------------------------------------------------")
        print("📝 AI Grading Prompt:")
        print(prompt.strip())
        print("---------------------------------------------------")

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )

        
        full_response = response.choices[0].message.content.strip()
        full_response = response.choices[0].message.content.strip()
        print("🧠 AI Reasoning + Score:")
        print(full_response)
        print("---------------------------------------------------")

        # Extract last line (score)
        lines = full_response.splitlines()
        raw_score = lines[-1].strip()
        score = float(raw_score)

        return max(0, min(score, max_points))  # safety bound

    except Exception as e:
        print(f"AI grading error: {e}")
        return 0


# Grade user answers and calculate scores
@app.route('/api/assignments/<assignment_id>/submit', methods=['POST'])
def submit_assignment(assignment_id):
    user_id = request.json.get('user_id')
    course_code = request.json.get('course_code')
    user_answers = request.json.get('answers', {})  # user answers submitted
    results = []

    try:
        conn = get_db_connection()
        if not conn:
            raise Exception("Failed to get database connection")

        # fetch questions from DB
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT question_id, question_text, question_type, options, correct_answer, max_points
                FROM assignment_questions
                WHERE assignment_id = %s
            """, (assignment_id,))
            questions = cur.fetchall()

        # process each question
        for question in questions:
            q_id = str(question['question_id'])
            user_answer = user_answers.get(q_id)
            correct_answer = question['correct_answer']
            max_points = question['max_points']

            # -------- handle AI evaluation for free-response questions --------
            if question['question_type'] == 'text':
                # Expecting keyword array
                keyword_list = correct_answer if isinstance(correct_answer, list) else []
                points_awarded = evaluate_text_response_with_openai(
                    user_answer or "", 
                    keyword_list, 
                    max_points,
                    question['question_text']
                )
                is_correct = points_awarded > 0
            else:
                # normal comparison for multiple_choice, true_false
                points_awarded = max_points if user_answer == correct_answer else 0
                is_correct = user_answer == correct_answer

            # append results
            results.append({
                "question_id": q_id,
                "question_text": question['question_text'],
                "user_answer": user_answer,
                "correct_answer": correct_answer,
                "points_awarded": points_awarded,
                "max_points": max_points,
                "correct": is_correct
            })

        # calculate total score
        total_score = sum(res['points_awarded'] for res in results)
        total_possible = sum(res['max_points'] for res in results)

        # insert/update grade in the grades table
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO grades (user_id, assignment_id, course_code, score, max_score)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (user_id, assignment_id) 
                    DO UPDATE SET score = EXCLUDED.score, max_score = EXCLUDED.max_score;
                """, (user_id, assignment_id, course_code, total_score, total_possible))
                conn.commit()

        except Exception as e:
            print(f"Error saving grade: {e}")
            return jsonify({"error": "Failed to save grade"}), 500

        # return grading results
        return jsonify({"results": results, "total_score": total_score})

    except Exception as e:
        print(f"Error during assignment submission: {e}")
        return jsonify({"error": "Failed to process assignment"}), 500

    finally:
        if conn:
            conn.close()

# Grade submission
@app.route('/api/grades/<user_id>', methods=['GET'])
def get_grades(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        print(f"Fetching grades for user_id: {user_id}")

        # currently all assignments are treated equally in grading and reporting
        # TO DO: different categories ('quiz', 'project', 'exam') 
        # TO DO: weighted grading per category
        # assignment type should be stored in the course_assignments table
        # TO DO: include 'type' in SELECT and use in frontend filtering

        # query for course information
        query = """
        SELECT ca.assignment_title, g.course_code, g.score, g.max_score
        FROM grades g
        JOIN course_assignments ca ON g.assignment_id = ca.assignment_id
        WHERE g.user_id = %s;
        """
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()
        print(f"Query results: {results}")

        # grades access by column name
        grades = [
    {
        "assignment_title": r["assignment_title"],
        "course_code": r["course_code"],
        "score": r["score"],
        "max_score": r["max_score"]
    }
    for r in results
    
    ]
        cursor.close()
        conn.close()

        return jsonify(grades)

    # error handling for console
    except psycopg2.Error as e:
        print(f"Database error: {e.pgcode} - {e.pgerror}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        print(f"General error: {str(e)}")
        return jsonify({"error": "Failed to fetch grades"}), 500



if __name__ == "__main__":
    app.run(port=5000, debug=True)