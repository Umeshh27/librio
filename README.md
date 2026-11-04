# LIBRIO — Intelligent Library Management System
> A modern, premium SaaS-style full-stack library management system featuring a ReactJS + Tailwind CSS frontend, a Core Java & JDBC backend, and a MySQL database.

---

## 🚀 Key Highlights & Philosophy

- **Zero Heavy Backend Frameworks**: Pure **Core Java 21 LTS** leveraging the built-in `com.sun.net.httpserver.HttpServer`. No Spring Boot, Hibernate, JPA, or Node.js.
- **Enterprise-Grade UI/UX**: SaaS-grade visual design inspired by Linear, Stripe, and Raycast using Tailwind CSS, Lucide icons, and Recharts.
- **ACID Transaction Guarantee**: Book issuing and returns execute in atomic JDBC transactions (`setAutoCommit(false)` / `commit()` / `rollback()`) to keep physical inventory and loan audit trails in sync.
- **Dynamic Fine Engine**: Automated penalty calculation (₹5.00/day) computed dynamically with `java.time.LocalDate` and `ChronoUnit.DAYS`.
- **Beginner & Interview Friendly**: Clean, modular structure (`model`, `dao`, `service`, `server`, `util`) designed so every class, method, and SQL query can be confidently explained in a Java technical interview.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Component-driven Single Page Application |
| **Styling** | Tailwind CSS v3 | Custom dark/light SaaS palette (`#111113`, `#F7F7F8`, `#6366F1`) |
| **Icons** | Lucide React | Modern minimalist iconography |
| **Visualizations** | Recharts | Responsive area charts, donut charts, and horizontal bar charts |
| **HTTP Client** | Axios | `application/x-www-form-urlencoded` payloads via `URLSearchParams` |
| **Backend** | Core Java 21 LTS | Pure Java Standard Library, OOP, Collections Framework |
| **Web Server** | `com.sun.net.httpserver` | Native multi-threaded Java HTTP server on port 5000 |
| **Persistence** | JDBC + MySQL 8 | `PreparedStatement`, `ResultSet` mapping, and transactions |
| **Database** | MySQL 8 (`libra_db`) | Normalized tables (`books`, `members`, `loans`) with foreign keys and indexes |
| **Build Tool** | Apache Maven | Dependency management (`mysql-connector-j` as sole runtime dependency) |

---

## 📁 Project Directory Structure

```
librio/
├── frontend/                              # React + Vite Application
│   ├── src/
│   │   ├── components/                   # DataTable, Modal, StatCard, StatusBadge, Pagination, Skeletons
│   │   ├── context/                      # ToastContext (global notifications)
│   │   ├── layouts/                      # DashboardLayout (Sidebar, Topbar, Modals)
│   │   ├── pages/                        # Dashboard, Books, Members, IssueReturn, History, Overdue, Reports
│   │   ├── services/                     # Centralized Axios API service
│   │   ├── App.jsx                       # React Router DOM configuration
│   │   ├── index.css                     # Tailwind styling & Inter font
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                               # Core Java & JDBC Application
│   ├── src/main/java/com/libra/
│   │   ├── Main.java                     # Server startup & DB verification
│   │   ├── config/
│   │   │   └── DatabaseConnection.java   # JDBC connection factory
│   │   ├── model/
│   │   │   ├── Book.java                 # Catalog entity
│   │   │   ├── Member.java               # Patron entity
│   │   │   └── Loan.java                 # Circulation transaction entity
│   │   ├── dao/
│   │   │   ├── BookDAO.java              # JDBC Book CRUD & queries
│   │   │   ├── MemberDAO.java            # JDBC Member CRUD & queries
│   │   │   └── LoanDAO.java              # JDBC Loan operations & JOIN analytics
│   │   ├── service/
│   │   │   ├── BookService.java          # Catalog business validations
│   │   │   ├── MemberService.java        # Member invariants & duplicate checks
│   │   │   ├── LoanService.java          # ACID Issue/Return transactions & fines
│   │   │   └── DashboardService.java     # Aggregated analytics
│   │   ├── server/
│   │   │   ├── ApiServer.java            # Built-in HttpServer wrapper
│   │   │   └── ApiHandler.java           # Routing, CORS, and request dispatch
│   │   └── util/
│   │       ├── JsonUtil.java             # Safe JSON serializer with escaping
│   │       ├── RequestUtil.java          # URL decoder & parameter extraction
│   │       └── ResponseUtil.java         # Standardized JSON response sender
│   ├── database/
│   │   ├── schema.sql                    # MySQL 8 schema creation
│   │   └── seed.sql                      # Sample data (12 books, 6 members, 6 loans)
│   ├── config/
│   │   ├── application.properties.example# Template
│   │   └── application.properties        # Local credentials
│   └── pom.xml                           # Maven project file
│
└── README.md
```

---

## ⚡ Quick Start Instructions (Windows PowerShell)

### Prerequisites
- JDK 17 or JDK 21
- Apache Maven
- Node.js (v18+) and npm
- MySQL Server 8.0 running on localhost:3306

---

### Step 1: Database Setup

Open PowerShell and execute:

```powershell
# Navigate to project root
cd C:\Users\hp\Documents\librio

# Run schema and seed scripts into MySQL
Get-Content backend\database\schema.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot
Get-Content backend\database\seed.sql   | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot
```

---

### Step 2: Configure Database Credentials

Edit `backend/config/application.properties` if your MySQL root password is not `root`:

```properties
db.url=jdbc:mysql://localhost:3306/libra_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
db.username=root
db.password=root
server.port=5000
```

---

### Step 3: Run the Core Java Backend

```powershell
cd C:\Users\hp\Documents\librio\backend
mvn clean compile
mvn exec:java
```

The Java HTTP server will start at `http://localhost:5000/api`.

---

### Step 4: Run the React Frontend

Open a second PowerShell window:

```powershell
cd C:\Users\hp\Documents\librio\frontend
npm install
npm run dev
```

Open your browser to: **`http://localhost:5173`**

---

## 📡 REST API Reference

| Verb | Path | Description | Status Code |
| :--- | :--- | :--- | :---: |
| **GET** | `/api/health` | Health check & MySQL status | 200 |
| **GET** | `/api/dashboard` | KPI counts, monthly activity, category donut, popular books | 200 |
| **GET** | `/api/books` | List books (supports `?query=` and `?category=`) | 200 |
| **GET** | `/api/books/{id}` | Retrieve single book | 200 / 404 |
| **POST** | `/api/books` | Add new book to catalog | 201 / 400 / 409 |
| **PUT** | `/api/books/{id}` | Update book details | 200 / 400 / 409 |
| **DELETE**| `/api/books/{id}` | Delete book (blocked if active loans exist) | 200 / 409 |
| **GET** | `/api/members` | List members (supports `?query=`) | 200 |
| **GET** | `/api/members/{id}` | Retrieve single member | 200 / 404 |
| **POST** | `/api/members` | Register member (checks duplicate email) | 201 / 400 / 409 |
| **PUT** | `/api/members/{id}` | Update member details | 200 / 400 / 409 |
| **DELETE**| `/api/members/{id}` | Delete member (blocked if active loans exist) | 200 / 409 |
| **GET** | `/api/loans` | View all loans with joined book and member data | 200 |
| **GET** | `/api/loans/active` | View currently borrowed books | 200 |
| **GET** | `/api/loans/overdue`| View overdue loans with dynamic fine assessment | 200 |
| **GET** | `/api/loans/history`| View complete circulation audit log | 200 |
| **POST** | `/api/loans` | Issue book (atomic transaction, decrements shelf copies) | 201 / 400 / 409 |
| **PUT** | `/api/loans/{id}/return` | Process return (calculates fine, increments shelf copies) | 200 / 409 |
| **GET** | `/api/reports/summary` | Reports metrics summary | 200 |
| **GET** | `/api/reports/popular-books` | Top borrowed books ranking | 200 |
| **GET** | `/api/reports/categories` | Book distribution by discipline | 200 |
| **GET** | `/api/reports/monthly-borrowing` | Monthly borrowing volume trajectory | 200 |

---

## 🎓 Core Java Concepts Explained (Interview Guide)

### 1. How JDBC Connects Java to MySQL
In `DatabaseConnection.java`, `Class.forName("com.mysql.cj.jdbc.Driver")` registers the MySQL driver with Java's `DriverManager`. `DriverManager.getConnection(url, user, pass)` then opens a TCP socket to MySQL (port 3306), executes handshakes, and returns an active `java.sql.Connection`.

### 2. PreparedStatement vs Statement
Every database query in LIBRA uses `PreparedStatement`. Unlike plain statements where SQL string concatenation can leave the database vulnerable to SQL Injection, `PreparedStatement` pre-compiles the SQL query template on the MySQL engine and treats user inputs as bound parameters via `stmt.setString(...)` or `stmt.setInt(...)`.

### 3. Converting SQL ResultSets into Java Domain Objects
In `BookDAO.java`, a helper method `mapRowToBook(ResultSet rs)` reads column values (`rs.getString("title")`, `rs.getInt("available_copies")`) and populates a new `Book` POJO using standard setter methods.

### 4. ACID Transactions with JDBC
When issuing or returning a book, physical shelf quantities and loan records must be updated together. In `LoanService.java`:
```java
conn.setAutoCommit(false); // 1. Start transaction
// 2. Create loan
loanDAO.createLoan(conn, loan);
// 3. Decrement available copies
bookDAO.updateAvailableCopies(conn, bookId, -1);
conn.commit(); // 4. Atomically commit both operations
```
If an exception occurs at any point before commit, `conn.rollback()` restores the database to its exact prior state.

### 5. Java Built-in HttpServer
Rather than pulling in external frameworks, `ApiServer.java` initializes Java's standard `HttpServer.create(new InetSocketAddress(5000), 0)`. The `ApiHandler` implements `HttpHandler` and processes incoming `HttpExchange` objects, setting UTF-8 JSON headers and handling CORS preflights.

### 6. Dynamic Fine Calculation using Java Time API
In `LoanService.java`:
```java
LocalDate returnDate = LocalDate.now();
LocalDate dueDate = LocalDate.parse(loan.getDueDate());
if (returnDate.isAfter(dueDate)) {
    long daysOverdue = ChronoUnit.DAYS.between(dueDate, returnDate);
    double fine = daysOverdue * 5.0; // ₹5 per day
}
```

---

