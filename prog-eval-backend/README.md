# Spring Boot Backend - Program Evaluation System

This is your Java Spring Boot backend that connects your React GUI to a MySQL database. Here's a comprehensive guide to get everything running.

## Project Structure

```
prog-eval-backend/
├── src/main/java/com/progevalsystem/
│   ├── ProgEvalSystemApplication.java    # Main entry point
│   ├── config/
│   │   └── CorsConfig.java               # CORS configuration for React frontend
│   ├── entity/                           # JPA entities (database models)
│   │   ├── Degree.java
│   │   ├── Course.java
│   │   ├── Instructor.java
│   │   ├── Section.java
│   │   ├── LearningObjective.java
│   │   ├── Evaluation.java
│   │   ├── DegreeCourseMappings.java
│   │   └── CourseObjectiveMapping.java
│   ├── repository/                       # Spring Data JPA repositories
│   │   ├── DegreeRepository.java
│   │   ├── CourseRepository.java
│   │   ├── InstructorRepository.java
│   │   ├── SectionRepository.java
│   │   ├── LearningObjectiveRepository.java
│   │   ├── EvaluationRepository.java
│   │   └── ...
│   ├── service/                          # Business logic layer
│   │   ├── DegreeService.java
│   │   ├── CourseService.java
│   │   ├── InstructorService.java
│   │   ├── SectionService.java
│   │   ├── LearningObjectiveService.java
│   │   └── EvaluationService.java
│   └── controller/                       # REST API endpoints
│       ├── DegreeController.java
│       ├── CourseController.java
│       ├── InstructorController.java
│       ├── SectionController.java
│       ├── LearningObjectiveController.java
│       └── EvaluationController.java
├── src/main/resources/
│   └── application.properties             # Database and server configuration
├── pom.xml                                # Maven dependencies
└── README.md                              # This file
```

## Prerequisites

### 1. Install Java Development Kit (JDK) 17+
```bash
# On macOS with Homebrew
brew install openjdk@17

# Verify installation
java -version
```

### 2. Install Maven
```bash
# On macOS with Homebrew
brew install maven

# Verify installation
mvn -version
```

### 3. MySQL Server Running Locally

Make sure you have a MySQL server running on your machine with **default settings**:
- **Host:** localhost
- **Port:** 3306
- **Username:** root
- **Password:** (empty/blank by default)

If you haven't installed MySQL yet:
```bash
# On macOS with Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Verify MySQL is running
mysql -u root
```

### 4. Create the Database

Connect to MySQL and create the database:
```bash
mysql -u root -e "CREATE DATABASE prog_eval_system;"
```

Or run the SQL commands manually:
```bash
mysql -u root
mysql> CREATE DATABASE prog_eval_system;
mysql> EXIT;
```

## Building and Running the Backend

### 1. Navigate to the Backend Directory
```bash
cd /Users/timliu999/Desktop/Masters_Fall_2025/Databases/project/prog-eval-backend
```

### 2. Clean and Build the Project
```bash
mvn clean install
```

This will:
- Download all dependencies
- Compile the code
- Create the JAR file
- Run any tests

### 3. Run the Application
```bash
mvn spring-boot:run
```

Or run the built JAR directly:
```bash
java -jar target/prog-eval-system-0.0.1-SNAPSHOT.jar
```

You should see output like:
```
2025-01-14 10:30:45.123  INFO 12345 --- [main] c.p.ProgEvalSystemApplication           : Started ProgEvalSystemApplication in 2.5 seconds
```

The backend will be running at: **http://localhost:8080**

## Important Implementation Notes & Corrections

### 1. **Database Auto-Creation (ddl-auto=update)**
Your `application.properties` has:
```properties
spring.jpa.hibernate.ddl-auto=update
```
This means **Hibernate will automatically create/update database tables** based on your entity annotations. This is great for development! Tables are created when the app starts.

✅ **This is correct for development.**

### 2. **MySQL Connection & Default Settings**
Your configuration correctly uses:
- **Database URL:** `jdbc:mysql://localhost:3306/prog_eval_system`
- **Username:** `root`
- **Password:** (empty - leaves it blank as per your MySQL defaults)

✅ **This matches your MySQL setup.**

### 3. **CORS Configuration**
The backend is configured to allow requests from your React frontend:
- React dev server runs on `localhost:5173`
- Backend listens on `localhost:8080`
- CORS is enabled for cross-origin requests

✅ **This is correct.**

### 4. **JPA Relationships**
Your entities use proper relationships:
- `@ManyToOne` for foreign keys
- `@OneToMany` for reverse relationships
- `cascade = CascadeType.ALL` for automatic cascade deletes
- `FetchType.LAZY` for performance

✅ **These are best practices.**

### 5. **Service Layer**
You have a clear separation of concerns:
- **Entities** - Database models
- **Repositories** - Data access (CRUD operations)
- **Services** - Business logic
- **Controllers** - REST API endpoints

✅ **This is the standard Spring architecture.**

## API Endpoints Reference

All endpoints are prefixed with `http://localhost:8080/api`

### Degrees
- `GET /degrees` - Get all degrees
- `GET /degrees/{id}` - Get degree by ID
- `POST /degrees` - Create new degree
- `PUT /degrees/{id}` - Update degree
- `DELETE /degrees/{id}` - Delete degree
- `GET /degrees/search/name?name=CS` - Search by name

### Courses
- `GET /courses` - Get all courses
- `GET /courses/{id}` - Get course by ID
- `POST /courses` - Create new course
- `PUT /courses/{id}` - Update course
- `DELETE /courses/{id}` - Delete course
- `GET /courses/search/number?courseNumber=CS5330` - Search by number

### Instructors
- `GET /instructors` - Get all instructors
- `GET /instructors/{id}` - Get instructor by ID
- `POST /instructors` - Create new instructor
- `PUT /instructors/{id}` - Update instructor
- `DELETE /instructors/{id}` - Delete instructor
- `GET /instructors/search/id?instructorId=000123` - Search by ID
- `GET /instructors/search/name?name=Dr.Smith` - Search by name

### Sections
- `GET /sections` - Get all sections
- `GET /sections/{id}` - Get section by ID
- `POST /sections` - Create new section
- `PUT /sections/{id}` - Update section
- `DELETE /sections/{id}` - Delete section
- `GET /sections/search/degree-semester?degreeId=1&semester=Fall2024` - Search by degree and semester
- `GET /sections/search/course?courseId=1` - Get sections for course
- `GET /sections/search/instructor?instructorId=1` - Get sections for instructor
- `GET /sections/search/semester?semester=Fall2024` - Get all sections in semester

### Learning Objectives
- `GET /objectives` - Get all objectives
- `GET /objectives/{id}` - Get objective by ID
- `POST /objectives` - Create new objective
- `PUT /objectives/{id}` - Update objective
- `DELETE /objectives/{id}` - Delete objective
- `GET /objectives/search/code?code=LO-1` - Search by code

### Evaluations
- `GET /evaluations` - Get all evaluations
- `GET /evaluations/{id}` - Get evaluation by ID
- `POST /evaluations` - Create new evaluation
- `PUT /evaluations/{id}` - Update evaluation
- `DELETE /evaluations/{id}` - Delete evaluation
- `GET /evaluations/search/section?sectionId=1` - Get evaluations for section
- `GET /evaluations/search/objective?objectiveId=1` - Get evaluations for objective
- `GET /evaluations/search/semester?semester=Fall2024` - Get evaluations for semester

## Connecting Your React Frontend

In your React app, make API calls like this:

```jsx
// Fetch all degrees
const response = await fetch('http://localhost:8080/api/degrees');
const degrees = await response.json();

// Create a new degree
const newDegree = await fetch('http://localhost:8080/api/degrees', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Computer Science',
    level: 'MS',
    coreObjectives: 'LO-1, LO-2'
  })
});

// Update a degree
const updated = await fetch('http://localhost:8080/api/degrees/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Computer Science',
    level: 'MS',
    coreObjectives: 'LO-1, LO-2, LO-3'
  })
});

// Delete a degree
await fetch('http://localhost:8080/api/degrees/1', {
  method: 'DELETE'
});
```

## Sample Data for Testing

You can insert test data using SQL:

```sql
-- Insert sample degree
INSERT INTO degrees (name, level, core_objectives) 
VALUES ('Master of Science', 'MS', 'LO-1, LO-2');

-- Insert sample course
INSERT INTO courses (course_number, title) 
VALUES ('CS 5330', 'Program Evaluation');

-- Insert sample instructor
INSERT INTO instructors (instructor_id, name, email, department) 
VALUES ('000123', 'Dr. Jane Doe', 'jane@university.edu', 'Computer Science');

-- Insert sample learning objective
INSERT INTO learning_objectives (code, title, description) 
VALUES ('LO-1', 'Understand Database Design', 'Students will understand relational database design principles');
```

## Troubleshooting

### Backend won't start
- Check if MySQL is running: `brew services list`
- Verify database exists: `mysql -u root -e "SHOW DATABASES;"`
- Check port 8080 is not in use: `lsof -i :8080`

### "No database selected" error
- Make sure you created the database: `mysql -u root -e "CREATE DATABASE prog_eval_system;"`

### CORS errors in React
- The backend is already configured for CORS
- Make sure React is running on `localhost:5173`
- Check browser console for specific CORS errors

### Port already in use
Change the port in `application.properties`:
```properties
server.port=8081
```

## Next Steps

1. **Test the backend** using Postman or curl
2. **Connect your React frontend** to make API calls
3. **Add more complex queries** as needed
4. **Consider adding authentication** for production use
5. **Add input validation** using `@Valid` annotations

Good luck with your project! 🚀
