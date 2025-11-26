# Quick Start Guide - Program Evaluation System

## What Was Created

You now have a complete Spring Boot backend with:
- **7 database tables** (Degrees, Courses, Instructors, Sections, Learning Objectives, Evaluations, Mappings)
- **REST API** with 40+ endpoints
- **CORS configured** to work with your React frontend
- **MySQL integration** with auto-schema generation

## Step 1: Set Up MySQL Database

```bash
# 1. Ensure MySQL is running
brew services start mysql

# 2. Create the database
mysql -u root -e "CREATE DATABASE prog_eval_system;"

# 3. (Optional) Load sample data
mysql -u root prog_eval_system < database_schema.sql
```

## Step 2: Build and Run the Backend

```bash
# 1. Navigate to backend directory
cd /Users/timliu999/Desktop/Masters_Fall_2025/Databases/project/prog-eval-backend

# 2. Build with Maven
mvn clean install

# 3. Run the application
mvn spring-boot:run
```

Expected output: Backend running at http://localhost:8080

## Step 3: Test the Backend

### Using curl
```bash
# Get all degrees
curl http://localhost:8080/api/degrees

# Create a degree
curl -X POST http://localhost:8080/api/degrees \
  -H "Content-Type: application/json" \
  -d '{"name":"MS Computer Science","level":"MS","coreObjectives":"LO-1"}'
```

### Using Postman
- Import the API endpoints (see README.md for endpoint list)
- Test GET requests first
- Then test POST/PUT/DELETE

## Step 4: Connect React Frontend

Your React app is already set to run on `localhost:5173`. The backend is configured for CORS, so you can make requests like:

```jsx
// In your React components
const API_URL = 'http://localhost:8080/api';

// Fetch degrees
const fetchDegrees = async () => {
  const response = await fetch(`${API_URL}/degrees`);
  const data = await response.json();
  console.log(data);
};

// Create a degree
const addDegree = async () => {
  const response = await fetch(`${API_URL}/degrees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Computer Science',
      level: 'MS',
      coreObjectives: 'LO-1, LO-2'
    })
  });
  return response.json();
};
```

## Directory Structure

```
/Users/timliu999/Desktop/Masters_Fall_2025/Databases/project/
├── prog-eval-ui/          # Your React frontend
│   ├── src/
│   ├── package.json
│   └── ...
└── prog-eval-backend/     # New Spring Boot backend
    ├── src/main/java/
    ├── src/main/resources/
    ├── pom.xml
    ├── README.md                 # Full documentation
    ├── API_TESTING.sh            # curl command examples
    ├── database_schema.sql       # Database initialization
    └── ...
```

## Key Technologies

- **Spring Boot 3.3.0** - Web framework
- **Spring Data JPA** - Database ORM
- **MySQL 8+** - Database
- **Maven** - Build tool
- **Lombok** - Code generation (reduces boilerplate)

## Implementation Notes (What's Correct!)

✅ **Your MySQL setup with default credentials (root/blank) is correctly configured**

✅ **The backend uses Hibernate's `ddl-auto=update`** which automatically creates tables from your Java entities

✅ **CORS is properly enabled** for cross-origin requests from React

✅ **REST API follows standard conventions** with `/api` prefix and proper HTTP methods

✅ **Database relationships are properly modeled** with JPA annotations

✅ **Separation of concerns** - Controllers → Services → Repositories → Entities

## Troubleshooting Checklist

- [ ] MySQL running? `brew services list | grep mysql`
- [ ] Database created? `mysql -u root -e "USE prog_eval_system;"`
- [ ] Port 8080 free? `lsof -i :8080`
- [ ] Java 17+? `java -version`
- [ ] Maven installed? `mvn -version`
- [ ] All dependencies downloaded? `mvn dependency:resolve`

## Next: Hook Up Your React Components

Once the backend is running, you can update your `App.jsx` to connect to the real API instead of mock data. See README.md for complete API documentation.

Happy coding! 🚀
