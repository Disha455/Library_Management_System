from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

# MySQL Database Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'dbcr',
    'database': 'library'
}

# Helper function to get database connection
def get_db_connection():
    return mysql.connector.connect(**db_config)

@app.route('/')
def home():
    return render_template('index.html')

# Student Routes
@app.route('/students', methods=['GET'])
def get_students():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM student")
        students = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(students)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/students', methods=['POST'])
def add_student():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO student (student_id, name, semester, mobile) VALUES (%s, %s, %s, %s)",
            (data['student_id'], data['name'], data['semester'], data['mobile'])
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Student added successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE student 
            SET name = %s, semester = %s, mobile = %s 
            WHERE student_id = %s""",
            (data['name'], data['semester'], data['mobile'], student_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Student updated successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if student has any active transactions
        cursor.execute(
            "SELECT * FROM transaction WHERE student_id = %s AND return_date IS NULL",
            (student_id,)
        )
        if cursor.fetchone():
            return jsonify({"error": "Cannot delete student with active transactions"}), 400
            
        cursor.execute("DELETE FROM student WHERE student_id = %s", (student_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Student deleted successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

# Book Routes
@app.route('/books', methods=['GET'])
def get_books():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Books")
        books = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(books)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/books', methods=['POST'])
def add_book():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Books (book_id, title, author, genre) VALUES (%s, %s, %s, %s)",
            (data['book_id'], data['title'], data['author'], data['genre'])
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Book added successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/books/<book_id>', methods=['PUT'])
def update_book(book_id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """UPDATE Books 
            SET title = %s, author = %s, genre = %s 
            WHERE book_id = %s""",
            (data['title'], data['author'], data['genre'], book_id)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Book updated successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/books/<book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if book has any active transactions
        cursor.execute(
            "SELECT * FROM transaction WHERE book_id = %s AND return_date IS NULL",
            (book_id,)
        )
        if cursor.fetchone():
            return jsonify({"error": "Cannot delete book with active transactions"}), 400
            
        cursor.execute("DELETE FROM Books WHERE book_id = %s", (book_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Book deleted successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

# Transaction Routes
@app.route('/transactions', methods=['GET'])
def get_transactions():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT t.*, s.name as student_name, b.title as book_title,
                   COALESCE(f.amount, 0) as fine_amount,
                   CASE 
                       WHEN t.return_date IS NULL AND CURRENT_TIMESTAMP > t.due_date 
                       THEN DATEDIFF(CURRENT_TIMESTAMP, t.due_date) * 10
                       ELSE 0 
                   END as current_fine
            FROM transaction t 
            JOIN student s ON t.student_id = s.student_id 
            JOIN Books b ON t.book_id = b.book_id
            LEFT JOIN fines f ON t.transaction_id = f.transaction_id
        """)
        transactions = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(transactions)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/transactions/issue', methods=['POST'])
def issue_book():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if book is already issued
        cursor.execute(
            "SELECT * FROM transaction WHERE book_id = %s AND return_date IS NULL", 
            (data['book_id'],)
        )
        if cursor.fetchone():
            return jsonify({"error": "Book is already issued"}), 400

        # Issue the book with current timestamp and due date (1 day from now)
        issue_date = datetime.now()
        due_date = issue_date + timedelta(days=1)
        
        cursor.execute(
            """INSERT INTO transaction 
            (student_id, book_id, issue_date, due_date) 
            VALUES (%s, %s, %s, %s)""",
            (data['student_id'], data['book_id'], issue_date, due_date)
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Book issued successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

@app.route('/transactions/return', methods=['POST'])
def return_book():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get transaction details
        cursor.execute(
            "SELECT due_date FROM transaction WHERE transaction_id = %s",
            (data['transaction_id'],)
        )
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Transaction not found"}), 404
            
        due_date = result[0]
        return_date = datetime.now()
        
        # Update return date
        cursor.execute(
            "UPDATE transaction SET return_date = %s WHERE transaction_id = %s",
            (return_date, data['transaction_id'])
        )
        
        # Calculate and add fine if book is returned late
        if return_date > due_date:
            days_late = (return_date - due_date).days
            fine_amount = days_late * 10  # Rs. 10 per day
            cursor.execute(
                "INSERT INTO fines (transaction_id, amount) VALUES (%s, %s)",
                (data['transaction_id'], fine_amount)
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Book returned successfully"}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

# Fines Routes
@app.route('/fines', methods=['GET'])
def get_fines():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT f.*, t.student_id, s.name as student_name, b.title as book_title,
                   t.due_date, t.return_date
            FROM fines f
            JOIN transaction t ON f.transaction_id = t.transaction_id
            JOIN student s ON t.student_id = s.student_id
            JOIN Books b ON t.book_id = b.book_id
            ORDER BY f.fine_id DESC
        """)
        fines = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(fines)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    app.run(debug=True)
