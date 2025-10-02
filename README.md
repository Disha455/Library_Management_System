# Library Management System

A full-stack web application for managing a library's books, students, transactions, and fines.

## Features

- Manage books (add, view)
- Manage students (add, view)
- Handle book transactions (issue, return)
- Track fines for overdue books
- Modern, responsive UI

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- MySQL 8.0 or higher

## Setup

### Backend Setup

1. Create a MySQL database named `library`
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Update the database configuration in `app.py` if needed:
   ```python
   db_config = {
       'host': 'localhost',
       'user': 'root',
       'password': 'your_password',
       'database': 'library'
   }
   ```
4. Run the Flask server:
   ```bash
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following tables:

- `student` (student_id, name, semester, mobile)
- `books` (book_id, title, author, genre)
- `transaction` (transaction_id, student_id, book_id, issue_date, due_date, return_date)
- `fines` (fine_id, transaction_id, due_date, amount)

## Usage

1. Add students and books to the system
2. Issue books to students
3. Return books when students bring them back
4. View fines for overdue books (automatically calculated)

## Technologies Used

- Backend: Flask, MySQL
- Frontend: React, TypeScript, Material-UI
- Database: MySQL 