from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from openai import OpenAI
import logging
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

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
collection_name = "tutortech_collection"
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
            "SELECT * FROM login_information WHERE user_id = %s AND password = %s",
            (user_id, currentPassword)
        )
        result = cursor.fetchone()

        if not result:
            return jsonify({"message": "Current Password Invalid"}), 401
        
        cursor.execute("UPDATE login_information SET password = %s WHERE user_id = %s", (newPassword, user_id))
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
        cursor.execute("SELECT course_code, course_title, credits FROM course_information")
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

        # AI bot customization
        bot_prompts = {
            "Tutor": "Provide structured, step-by-step explanations in full sentences without using special characters like newlines, bullet points, or bold text. Keep explanations detailed but concise, ensuring readability in a continuous paragraph format. Encourage follow-up questions for further elaboration.",
            "Mentor": "Combine concise answers with practical steps and or real-life examples where applicable. Maintain a balance between elaboration and clarity. Ensure responses are in full sentences without using special characters like newlines, bullet points, or bold text.",
            "Co-Learner": "Provide quick, digestible answers that summarize key points without excessive detail. Your tone should be friendly, casual, and straight to the point. Provide quick definitions describing only the most important facts. Ensure responses are in full sentences without using special characters like newlines, bullet points, or bold text.",
        }

        system_message = bot_prompts.get(bot_type, "You are a helpful assistant.")

        # OpenAI API call using OpenAI client
        completion = client.chat.completions.create(
            model="gpt-4o",  # Change as needed?
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]
        )

        ai_response = completion.choices[0].message.content

        # Debugging output
        print(f"AI Response: {ai_response}")

        return jsonify({"response": ai_response}), 200

    except Exception as e:
        print(f"Error fetching AI response: {e}")
        return jsonify({"error": "Failed to process the request"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)

