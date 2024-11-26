from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Allow requests from the frontend with credentials (for cookies)
app = Flask(__name__)
CORS(app, supports_credentials=True)

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT"),
        cursor_factory=RealDictCursor
    )

# -------------------------------- User Login --------------------------------
@app.route('/login', methods=['POST'])
def login():
    # Existing code
    data = request.json  
    user_id = data.get("user_id")
    password = data.get("password")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM login_information WHERE user_id = %s AND password = %s",
            (user_id, password)
        )
        result = cursor.fetchone()

        if not result:
            return jsonify({"message": "Invalid username or password"}), 401

        cursor.execute(
            "SELECT first_name, last_name FROM student_information WHERE user_id = %s",
            (user_id,)
        )
        user_info = cursor.fetchone()

        if user_info:
            response = make_response(jsonify({
                "message": "Login successful",
                "user_id": user_id,
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
            "SELECT first_name, last_name FROM student_information WHERE user_id = %s",
            (user_id,)
        )
        user_info = cursor.fetchone()

        if user_info:
            return jsonify({
                "user_id": user_id,
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"],
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

# ------------------------- Fetch Course Information --------------------------------
@app.route('/courses', methods=['GET'])
def get_courses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT course_code, course_title, course_description, credits FROM course_information")
        courses = cursor.fetchall()

        # Return fetched courses as JSON
        return jsonify(courses), 200

    except Exception as e:
        return jsonify({"message": "Server error"}), 500

    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    app.run(port=5000, debug=True)

