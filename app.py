from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Allow requests from the frontend
app = Flask(__name__)
CORS(app)  

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
    # Get JSON data from request body
    data = request.json  
    user_id = data.get("user_id")
    password = data.get("password")

    try:
        # Connect to database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the user exists and the password matches
        cursor.execute(
            "SELECT * FROM login_information WHERE user_id = %s AND password = %s",
            (user_id, password)
        )
        result = cursor.fetchone()

        if not result:
            return jsonify({"message": "Invalid username or password"}), 401

        # Retrieve user information
        cursor.execute(
            "SELECT first_name, last_name FROM student_information WHERE user_id = %s",
            (user_id,)
        )
        user_info = cursor.fetchone()

        if user_info:
            return jsonify({
                "message": "Login successful",
                "user_id": user_id,
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"]
            }), 200
        else:
            return jsonify({"message": "User information not found"}), 404

    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({"message": "Server error"}), 500

    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    app.run(port=5000, debug=True)
