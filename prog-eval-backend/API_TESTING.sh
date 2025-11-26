# Sample curl commands to test the API

# Create a degree
curl -X POST http://localhost:8080/api/degrees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Master of Science in Computer Science",
    "level": "MS",
    "coreObjectives": "LO-1, LO-2"
  }'

# Get all degrees
curl http://localhost:8080/api/degrees

# Create a course
curl -X POST http://localhost:8080/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "courseNumber": "CS 5330",
    "title": "Program Evaluation",
    "description": "Learn how to evaluate computer science programs"
  }'

# Create an instructor
curl -X POST http://localhost:8080/api/instructors \
  -H "Content-Type: application/json" \
  -d '{
    "instructorId": "000123",
    "name": "Dr. Jane Doe",
    "email": "jane@university.edu",
    "department": "Computer Science"
  }'

# Create a learning objective
curl -X POST http://localhost:8080/api/objectives \
  -H "Content-Type: application/json" \
  -d '{
    "code": "LO-1",
    "title": "Design Database Schemas",
    "description": "Students can design efficient relational database schemas"
  }'

# Get all learning objectives
curl http://localhost:8080/api/objectives

# Create a section (requires existing degree, course, instructor IDs)
curl -X POST http://localhost:8080/api/sections \
  -H "Content-Type: application/json" \
  -d '{
    "degree": {"id": 1},
    "course": {"id": 1},
    "instructor": {"id": 1},
    "semester": "Fall 2024",
    "sectionNumber": "101",
    "enrollment": 45
  }'

# Get sections by semester
curl "http://localhost:8080/api/sections/search/semester?semester=Fall%202024"

# Create an evaluation (requires existing section and objective IDs)
curl -X POST http://localhost:8080/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{
    "section": {"id": 1},
    "objective": {"id": 1},
    "evaluationStatus": "Complete",
    "successThreshold": 80,
    "improvementNote": "Students performed well overall"
  }'

# Get evaluations by semester
curl "http://localhost:8080/api/evaluations/search/semester?semester=Fall%202024"

# Update a degree
curl -X PUT http://localhost:8080/api/degrees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Master of Science in Computer Science",
    "level": "MS",
    "coreObjectives": "LO-1, LO-2, LO-3"
  }'

# Delete a degree
curl -X DELETE http://localhost:8080/api/degrees/1
