// API URL
const API_URL = '';

// Show/Hide Sections
function showSection(sectionId) {
    // Update active navigation link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick').includes(sectionId)) {
            link.classList.add('active');
        }
    });

    // Show selected section, hide others
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    
    // Refresh data when switching to a section
    if (sectionId === 'home') {
        updateDashboardCounters();
    } else if (sectionId === 'books') {
        loadBooks();
    } else if (sectionId === 'students') {
        loadStudents();
    } else if (sectionId === 'transactions') {
        loadTransactions();
    } else if (sectionId === 'fines') {
        loadFines();
    }
}

// Modal Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Format Date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Books Functions
async function loadBooks() {
    try {
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();
        const tbody = document.getElementById('booksTableBody');
        tbody.innerHTML = '';
        books.forEach(book => {
            tbody.innerHTML += `
                <tr>
                    <td>${book.book_id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.genre}</td>
                    <td>
                        <button onclick="showEditBook('${book.book_id}', '${book.title}', '${book.author}', '${book.genre}')" class="btn-edit">Edit</button>
                        <button onclick="deleteBook('${book.book_id}')" class="btn-delete">Delete</button>
                    </td>
                </tr>
            `;
        });
        updateBookSelect();
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function showEditBook(bookId, title, author, genre) {
    document.getElementById('editBookId').value = bookId;
    document.getElementById('editBookTitle').value = title;
    document.getElementById('editBookAuthor').value = author;
    document.getElementById('editBookGenre').value = genre;
    showModal('editBookModal');
}

async function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        try {
            const response = await fetch(`${API_URL}/books/${bookId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadBooks();
            } else {
                const data = await response.json();
                alert(data.error || 'Error deleting book');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    }
}

// Students Functions
async function loadStudents() {
    try {
        const response = await fetch(`${API_URL}/students`);
        const students = await response.json();
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = '';
        students.forEach(student => {
            tbody.innerHTML += `
                <tr>
                    <td>${student.student_id}</td>
                    <td>${student.name}</td>
                    <td>${student.semester}</td>
                    <td>${student.mobile}</td>
                    <td>
                        <button onclick="showEditStudent('${student.student_id}', '${student.name}', '${student.semester}', '${student.mobile}')" class="btn-edit">Edit</button>
                        <button onclick="deleteStudent('${student.student_id}')" class="btn-delete">Delete</button>
                    </td>
                </tr>
            `;
        });
        updateStudentSelect();
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function showEditStudent(studentId, name, semester, mobile) {
    document.getElementById('editStudentId').value = studentId;
    document.getElementById('editStudentName').value = name;
    document.getElementById('editStudentSemester').value = semester;
    document.getElementById('editStudentMobile').value = mobile;
    showModal('editStudentModal');
}

async function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            const response = await fetch(`${API_URL}/students/${studentId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadStudents();
            } else {
                const data = await response.json();
                alert(data.error || 'Error deleting student');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
}

// Transactions Functions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/transactions`);
        const transactions = await response.json();
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = '';
        transactions.forEach(transaction => {
            const fineStatus = transaction.current_fine > 0 ? 
                `<span class="fine-warning">Current Fine: Rs. ${transaction.current_fine}</span>` : '';
                
            tbody.innerHTML += `
                <tr>
                    <td>${transaction.transaction_id}</td>
                    <td>${transaction.student_name}</td>
                    <td>${transaction.book_title}</td>
                    <td>${formatDate(transaction.issue_date)}</td>
                    <td>${formatDate(transaction.due_date)}</td>
                    <td>${transaction.return_date ? formatDate(transaction.return_date) : '-'}</td>
                    <td>
                        ${!transaction.return_date ? 
                            `<button onclick="returnBook(${transaction.transaction_id})" class="btn-return">Return</button>
                             ${fineStatus}` : 
                            transaction.fine_amount > 0 ? 
                                `<span class="fine-amount">Fine: Rs. ${transaction.fine_amount}</span>` : 
                                ''}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Fines Functions
async function loadFines() {
    try {
        const response = await fetch(`${API_URL}/fines`);
        const fines = await response.json();
        const tbody = document.getElementById('finesTableBody');
        tbody.innerHTML = '';
        fines.forEach(fine => {
            tbody.innerHTML += `
                <tr>
                    <td>${fine.fine_id}</td>
                    <td>${fine.student_name}</td>
                    <td>${fine.book_title}</td>
                    <td>${formatDate(fine.due_date)}</td>
                    <td>Rs. ${fine.amount}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading fines:', error);
    }
}

// Update Select Options
async function updateStudentSelect() {
    try {
        const response = await fetch(`${API_URL}/students`);
        const students = await response.json();
        const select = document.getElementById('issueStudentId');
        select.innerHTML = '<option value="">Select Student</option>';
        students.forEach(student => {
            select.innerHTML += `<option value="${student.student_id}">${student.name}</option>`;
        });
    } catch (error) {
        console.error('Error updating student select:', error);
    }
}

async function updateBookSelect() {
    try {
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();
        const select = document.getElementById('issueBookId');
        select.innerHTML = '<option value="">Select Book</option>';
        books.forEach(book => {
            select.innerHTML += `<option value="${book.book_id}">${book.title}</option>`;
        });
    } catch (error) {
        console.error('Error updating book select:', error);
    }
}

// Form Submissions
document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookData = {
        book_id: document.getElementById('bookId').value,
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        genre: document.getElementById('bookGenre').value
    };
    try {
        const response = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });
        if (response.ok) {
            hideModal('addBookModal');
            loadBooks();
            e.target.reset();
        }
    } catch (error) {
        console.error('Error adding book:', error);
    }
});

document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentData = {
        student_id: document.getElementById('studentId').value,
        name: document.getElementById('studentName').value,
        semester: document.getElementById('studentSemester').value,
        mobile: document.getElementById('studentMobile').value
    };
    try {
        const response = await fetch(`${API_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        if (response.ok) {
            hideModal('addStudentModal');
            loadStudents();
            e.target.reset();
        }
    } catch (error) {
        console.error('Error adding student:', error);
    }
});

document.getElementById('issueBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const issueData = {
        student_id: document.getElementById('issueStudentId').value,
        book_id: document.getElementById('issueBookId').value
    };
    try {
        const response = await fetch(`${API_URL}/transactions/issue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(issueData)
        });
        if (response.ok) {
            hideModal('issueBookModal');
            loadTransactions();
            e.target.reset();
        }
    } catch (error) {
        console.error('Error issuing book:', error);
    }
});

// Return Book Function
async function returnBook(transactionId) {
    try {
        const response = await fetch(`${API_URL}/transactions/return`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transaction_id: transactionId })
        });
        if (response.ok) {
            loadTransactions();
            loadFines();
        }
    } catch (error) {
        console.error('Error returning book:', error);
    }
}

document.getElementById('editBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookId = document.getElementById('editBookId').value;
    const bookData = {
        title: document.getElementById('editBookTitle').value,
        author: document.getElementById('editBookAuthor').value,
        genre: document.getElementById('editBookGenre').value
    };
    try {
        const response = await fetch(`${API_URL}/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });
        if (response.ok) {
            hideModal('editBookModal');
            loadBooks();
            e.target.reset();
        }
    } catch (error) {
        console.error('Error updating book:', error);
    }
});

document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('editStudentId').value;
    const studentData = {
        name: document.getElementById('editStudentName').value,
        semester: document.getElementById('editStudentSemester').value,
        mobile: document.getElementById('editStudentMobile').value
    };
    try {
        const response = await fetch(`${API_URL}/students/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });
        if (response.ok) {
            hideModal('editStudentModal');
            loadStudents();
            e.target.reset();
        }
    } catch (error) {
        console.error('Error updating student:', error);
    }
});

// Update Dashboard Counters
async function updateDashboardCounters() {
    try {
        // Set loading state
        document.querySelectorAll('.dashboard-item p').forEach(counter => {
            counter.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
        
        // Update books count
        const booksResponse = await fetch(`${API_URL}/books`);
        const books = await booksResponse.json();
        document.getElementById('booksCount').textContent = books.length;

        // Update students count
        const studentsResponse = await fetch(`${API_URL}/students`);
        const students = await studentsResponse.json();
        document.getElementById('studentsCount').textContent = students.length;

        // Update active transactions count
        const transactionsResponse = await fetch(`${API_URL}/transactions`);
        const transactions = await transactionsResponse.json();
        const activeTransactions = transactions.filter(t => !t.return_date);
        document.getElementById('activeTransactionsCount').textContent = activeTransactions.length;

        // Update fines count
        const finesResponse = await fetch(`${API_URL}/fines`);
        const fines = await finesResponse.json();
        
        // Calculate total fine amount
        const totalFineAmount = fines.reduce((total, fine) => total + parseFloat(fine.amount), 0);
        document.getElementById('finesCount').textContent = `₹${totalFineAmount.toFixed(2)}`;
        
        // Update card colors based on counts
        updateCardColors(books.length, students.length, activeTransactions.length, totalFineAmount);
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
        document.querySelectorAll('.dashboard-item p').forEach(counter => {
            counter.textContent = 'Error';
        });
    }
}

// Update card colors based on counts
function updateCardColors(booksCount, studentsCount, transactionsCount, finesAmount) {
    // Books card - blue to green based on book count
    const booksItem = document.querySelector('.dashboard-item:nth-child(1)');
    if (booksCount > 50) {
        booksItem.style.borderTopColor = '#4caf50'; // Green for good collection
        booksItem.querySelector('i').style.color = '#4caf50';
    } else {
        booksItem.style.borderTopColor = '#1976d2'; // Default blue
        booksItem.querySelector('i').style.color = '#1976d2';
    }
    
    // Students card - blue to purple based on student count
    const studentsItem = document.querySelector('.dashboard-item:nth-child(2)');
    if (studentsCount > 30) {
        studentsItem.style.borderTopColor = '#9c27b0'; // Purple for high enrollment 
        studentsItem.querySelector('i').style.color = '#9c27b0';
    } else {
        studentsItem.style.borderTopColor = '#1976d2'; // Default blue
        studentsItem.querySelector('i').style.color = '#1976d2';
    }
    
    // Transactions card - blue to orange based on active transaction count
    const transactionsItem = document.querySelector('.dashboard-item:nth-child(3)');
    if (transactionsCount > 20) {
        transactionsItem.style.borderTopColor = '#ff9800'; // Orange for high activity
        transactionsItem.querySelector('i').style.color = '#ff9800';
    } else {
        transactionsItem.style.borderTopColor = '#1976d2'; // Default blue
        transactionsItem.querySelector('i').style.color = '#1976d2';
    }
    
    // Fines card - blue to red based on fine amount
    const finesItem = document.querySelector('.dashboard-item:nth-child(4)');
    if (finesAmount > 500) {
        finesItem.style.borderTopColor = '#f44336'; // Red for high fines
        finesItem.querySelector('i').style.color = '#f44336';
    } else {
        finesItem.style.borderTopColor = '#1976d2'; // Default blue
        finesItem.querySelector('i').style.color = '#1976d2';
    }
}

// Initial Load
window.onload = () => {
    // Show home section by default
    showSection('home');
    
    // Load all data
    loadBooks();
    loadStudents();
    loadTransactions();
    loadFines();
    
    // Update dashboard counters
    updateDashboardCounters();
    
    // Update dashboard every 30 seconds
    setInterval(updateDashboardCounters, 30000);
};

// Close modals when clicking outside
window.onclick = function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}; 