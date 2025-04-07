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
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configure logging 
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Initialize Qdrant
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_HOST"),
    api_key=os.getenv("QDRANT_API_KEY")
)

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

    prompt_parts = ["You are a personalized tutor. Ensure responses are in paragraph format wtih full sentences. Format responses without using special characters like newlines, bullet points, or bold text."]

    if prefs.get("response_length") == "short":
        prompt_parts.append("Keep your answers short and concise.")
    elif prefs.get("response_length") == "long":
        prompt_parts.append("Provide detailed explanations.")

    if prefs.get("guidance_style") == "step_by_step":
        prompt_parts.append("Explain concepts using step-by-step guidance.")
    elif prefs.get("guidance_style") == "real_world":
        prompt_parts.append("Use real-world examples to make concepts relatable.")

    if prefs.get("value_focus") == "process":
        prompt_parts.append("Focus on helping the user understand the learning process.")
    elif prefs.get("value_focus") == "direct":
        prompt_parts.append("Focus on delivering direct, actionable answers.")

    return " ".join(prompt_parts)

# Merging semantic and recent searches for better responses
def merge_histories(semantic, recent, current_prompt_embedding, qdrant_client):
    
    #Prioritize recent messages. Fallback to semantic matches if recent is not helpful.
    #Google to the rescue...?
    def is_relevant(msg_embedding):
        # Cosine similarity between embeddings
        dot = sum(a * b for a, b in zip(current_prompt_embedding, msg_embedding))
        norm_a = sum(a * a for a in current_prompt_embedding) ** 0.5
        norm_b = sum(b * b for b in msg_embedding) ** 0.5
        return dot / (norm_a * norm_b + 1e-8) >= 0.75

    # Filter recent messages by semantic relevance
    filtered_recent = []
    for msg in recent:
        vector_result = qdrant_client.search(
            collection_name="chat_history",
            query_vector=current_prompt_embedding,
            limit=1,
            query_filter={"must": [{"key": "content", "match": {"value": msg["content"]}}]},
            with_payload=False,
            with_vectors=True
        )

        if vector_result:
            recent_embedding = vector_result[0].vector
            if is_relevant(recent_embedding):
                filtered_recent.append(msg)

    # If recent context isn't enough include semantic history
    seen = set()
    final_history = []

    # Add the most relevant recent messages first
    for msg in filtered_recent[-3:]:  # Take last 3 relevant recent messages
        key = (msg["role"], msg["content"])
        if key not in seen:
            final_history.append(msg)
            seen.add(key)

    # Fill in semantic history if the recent history isnt enough
    for msg in semantic:
        key = (msg["role"], msg["content"])
        if key not in seen and len(final_history) < 6:
            final_history.append(msg)
            seen.add(key)

    return final_history

# Detect when the user gives a "vague" prompt. (Use for conversation contexts)
def is_vague_prompt(prompt):
    vague_keywords = ["elaborate", "why", "what do you mean", "explain", "more", "clarify", "continue", "shorten", "summarize", "detail", "example", "again", "another"]
    lowered = prompt.lower().strip()
    return any(kw in lowered for kw in vague_keywords)

# Check hosted DB connection via Ping
@app.route("/ping")
def ping():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            dbname=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=os.getenv('DB_PORT', 5432)
        )
        conn.close()
        return {"message": "DB connection successful"}
    except Exception as e:
        return {"error": str(e)}, 500


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
            "SELECT user_id, first_name, last_name, email, history_enabled FROM student_information WHERE user_id = %s",
            (user_id,)
        )
        user_info = cursor.fetchone()

        if user_info:
            return jsonify({
                "user_id": user_info["user_id"],
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"],
                "email": user_info["email"],
                "history_enabled": user_info.get("history_enabled", True),
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
        origin = request.headers.get("Origin")
        response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200

    try:
        data = request.json
        bot_type = data.get('botType', 'Tutor')
        prompt = data.get('prompt', '')
        user_id = data.get('userId')
        history_enabled = data.get('historyEnabled', True)

        # Choose system message
        bot_prompts = {
            "Tutor": "Provide structured, step-by-step explanations in full sentences without using special characters like newlines, bullet points, or bold text. Keep explanations concise, ensuring readability in a continuous paragraph format. Encourage follow-up questions for further elaboration.",
            "Mentor": "Combine concise answers with practical steps and or real-life examples where applicable. Maintain a balance between elaboration and clarity. Ensure responses are in full sentences without using special characters like newlines, bullet points, or bold text.",
            "Co-Learner": "Provide quick, digestible answers that summarize key points without excessive detail. Your tone should be friendly, casual, and straight to the point. Provide quick definitions describing only the most important facts. Ensure responses are in full sentences without using special characters like newlines, bullet points, or bold text.",
        }

        # Fecth the users custom learning preference
        if bot_type == "Custom":
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT learning_preferences FROM student_information WHERE user_id = %s", (user_id,))
            result = cursor.fetchone()
            preferences = json.loads(result["learning_preferences"]) if result and result["learning_preferences"] else {}
            system_message = generate_prompt_from_preferences(preferences)
        else:
            system_message = bot_prompts.get(bot_type, "You are a helpful assistant. If the user's request seems vague, reference their last message or your most recent answer.")

        if not history_enabled:
            print("\n🚫 History is disabled. Skipping context.")
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]

            completion = client.chat.completions.create(
                model="gpt-4o",
                messages=messages
            )

            ai_response = completion.choices[0].message.content
            return jsonify({"response": ai_response}), 200

        # Load scroll BEFORE storing the prompt
        scroll_result, _ = qdrant_client.scroll(
            collection_name=collection_name,
            limit=20,
            with_payload=True,
            with_vectors=False
        )

        # Embed and store the user prompt
        user_embedding = embed_text(prompt)
        timestamp = time.time()

        qdrant_client.upsert(
            collection_name=collection_name,
            points=[
                PointStruct(
                    id=int(timestamp * 1000),
                    vector=user_embedding,
                    payload={"user_id": user_id, "role": "user", "content": prompt, "timestamp": timestamp}
                )
            ]
        )

        # Sort scroll results and build recent history
        sorted_history = sorted(
            scroll_result,
            key=lambda msg: msg.payload.get("timestamp", 0)
        )

        recent_history = [
            {"role": msg.payload["role"], "content": msg.payload["content"]}
            for msg in sorted_history[-6:]
        ]

        # Ignore latest prompt (So we dont match the user prompt with itself)
        filtered_history = [
            msg for msg in sorted_history
            if msg.payload.get("content") != prompt and "role" in msg.payload and "content" in msg.payload
        ]

        # Filter recent messages (last 10 mins or 15 entries)
        cutoff = time.time() - (10 * 60)  # 10 minutes ago
        filtered_history = [
            msg for msg in sorted_history[-15:]  # last 15 messages
            if msg.payload.get("timestamp", 0) >= cutoff
            and msg.payload.get("content") != prompt
            and "role" in msg.payload and "content" in msg.payload
        ]

        # Check if prompt is vague
        inject_last_pair = is_vague_prompt(prompt)

        # Attempt to inject last user→assistant pair (Attempt is the right word)
        last_pair = []
        if inject_last_pair:
            for i in range(len(filtered_history) - 1, 0, -1):
                u = filtered_history[i - 1]
                a = filtered_history[i]

                if u.payload["role"] == "user" and a.payload["role"] == "assistant":
                    last_pair = [
                        {"role": "user", "content": u.payload["content"]},
                        {"role": "assistant", "content": a.payload["content"]}
                    ]
                    # A dash of debugging
                    print("\n✅ Using conversation pairing for vague prompt.")
                    print(f"user: {u.payload['content'][:80]}...")
                    print(f"assistant: {a.payload['content'][:80]}...")
                    break

        # Semantic search (only used if last_pair is NOT injected)
        semantic_history = []
        if not inject_last_pair:
            search_results = qdrant_client.search(
                collection_name=collection_name,
                query_vector=user_embedding,
                limit=5,
                query_filter=Filter(
                    must=[FieldCondition(key="user_id", match={"value": user_id})]
                ),
                with_payload=True,
                with_vectors=False,
                score_threshold=0.75
            )
            semantic_history = [
                {"role": item.payload["role"], "content": item.payload["content"]}
                for item in search_results
            ]

        # Merge history if no last_pair
        history = []
        if not inject_last_pair:
            history = merge_histories(semantic_history, recent_history, user_embedding, qdrant_client)

        # Build final message context
        messages = [{"role": "system", "content": system_message}]
        if inject_last_pair:
            messages += last_pair
        else:
            messages += history
        messages.append({"role": "user", "content": prompt})

        # Debug final messages
        print("\n📤 Final Message Stack:")
        for m in messages:
            print(f"{m['role']}: {m['content'][:80]}...")

        # Send to OpenAI
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        ai_response = completion.choices[0].message.content

        # Store assistant reply
        ai_embedding = embed_text(ai_response)
        ai_timestamp = time.time()
        qdrant_client.upsert(
            collection_name=collection_name,
            points=[
                PointStruct(
                    id=int(ai_timestamp * 1000),
                    vector=ai_embedding,
                    payload={"user_id": user_id, "role": "assistant", "content": ai_response, "timestamp": ai_timestamp}
                )
            ]
        )

        return jsonify({"response": ai_response}), 200

    except Exception as e:
        print(f"Error in chat function: {e}")
        return jsonify({"error": "Failed to process the request"}), 500

@app.route('/update-history-setting', methods=['POST'])
def update_history_setting():
    data = request.json
    user_id = data.get("user_id")
    history_enabled = data.get("history_enabled")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE student_information SET history_enabled = %s WHERE user_id = %s",
            (history_enabled, user_id)
        )
        conn.commit()
        return jsonify({"message": "History setting updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# ------------------------- Save Preferences -------------------------------------- 
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

# ------------------------- Get Preferences  -------------------------------------- 
@app.route('/get-preferences', methods=['GET'])
def get_preferences():
    user_id = request.args.get("user_id")

    try:
        conn = get_db_connection()
        # use RealDictCursor to get dict-style row
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(
            "SELECT learning_preferences FROM student_information WHERE user_id = %s",
            (user_id,)
        )
        result = cursor.fetchone()

        print(f"DB result for user_id {user_id}:", result)

        if result and result["learning_preferences"]:
            try:
                preferences = json.loads(result["learning_preferences"])  # FIX: dict-style access
                return jsonify({"preferences": preferences}), 200
            except json.JSONDecodeError as e:
                print("JSON decode error:", e)
                return jsonify({"error": "Stored preferences are not valid JSON"}), 500
        else:
            return jsonify({"preferences": None}), 200

    except Exception as e:
        print("Exception in get-preferences:", e)
        return jsonify({"error": str(e)}), 500

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