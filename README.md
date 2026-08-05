# CodeCraftHub - Personal Learning Goal Tracker API

CodeCraftHub is a lightweight Node.js and Express REST API for tracking courses developers want to learn. Course data is stored in a simple JSON file (no database).

## Project overview

- Create, read, update, and delete (CRUD) learning courses
- Each course has:
  - id (auto-generated, starting from 1)
  - name (required)
  - description (required)
  - target_date (required, format YYYY-MM-DD)
  - status (required, one of: "Not Started", "In Progress", "Completed")
  - created_at (auto-generated timestamp)
- Data persistence is achieved via a JSON file named `courses.json`
- No authentication or user management
- Port: 5000

## Features

- Full CRUD API for courses
- Auto-generated IDs
- Input validation and clear error messages
- Automatic creation of the storage file `courses.json` if it doesn't exist
- Simple, beginner-friendly codebase

## Installation

1. Clone or download the project.
2. Open a terminal and navigate to the project root.
3. Install dependencies:
   - npm install

Note: This project uses Express. The `package.json` should include:

- Name: codecrafthub
- Version: 1.0.0
- Description: Personal learning goal tracker API
- Dependencies: express
- Start script: npm start (which runs node app.js)

## How to run the application

- Start the server:
  - npm start
- The server will listen on http://localhost:5000/api/courses

## API Endpoint Documentation

Base URL: http://localhost:5000

Endpoints (CRUD under /api/courses)

1. Create a new course

- POST /api/courses
- Headers: Content-Type: application/json
- Request body (required):
  {
  "name": "Learn Node.js",
  "description": "Intro to Node.js basics",
  "target_date": "2026-09-01",
  "status": "Not Started" // one of "Not Started", "In Progress", "Completed"
  }
- Successful response:
  - Status: 201 Created
  - Body: the created course including id and created_at
    {
    "id": 1,
    "name": "Learn Node.js",
    "description": "Intro to Node.js basics",
    "target_date": "2026-09-01",
    "status": "Not Started",
    "created_at": "2026-08-05T12:34:56.789Z"
    }
- Validation errors return 400 with details:
  {
  "error": "name is required",
  "details": ["name is required"]
  }

2. Get all courses

- GET /api/courses
- Successful response:
  - Status: 200
  - Body: array of course objects

3. Get a specific course by ID

- GET /api/courses/:id
- Successful response:
  - Status: 200
  - Body: the course object
- Not found:
  - Status: 404
  - Body: { "error": "Course not found" }

4. Update a course (full update)

- PUT /api/courses/:id
- Headers: Content-Type: application/json
- Request body (required, same fields as creation):
  {
  "name": "Learn Node.js",
  "description": "Updated description",
  "target_date": "2026-12-31",
  "status": "In Progress"
  }
- Successful response:
  - Status: 200
  - Body: the updated course
- Validation errors or not-found handled with 400/404 accordingly

5. Delete a course

- DELETE /api/courses/:id
- Successful response:
  - Status: 204 No Content (no body)
- Not found:
  - Status: 404
  - Body: { "error": "Course not found" }

## Data model (JSON file)

The storage file is courses.json in the project root. It stores an array of course objects like:

[
{
"id": 1,
"name": "Learn Node.js",
"description": "Intro to Node.js basics",
"target_date": "2026-09-01",
"status": "Not Started",
"created_at": "2026-08-05T12:34:56.789Z"
}
]

Notes:

- The file is created automatically if it doesn't exist.
- All data operations read/update this array.

## Error handling

- Missing required fields: 400 Bad Request with a descriptive error
- Course not found: 404 Not Found with an error message
- Invalid status values: 400 Bad Request with an error message
- File read/write errors (I/O issues): 500 Internal Server Error with an error message
- Basic validation is performed for date format (YYYY-MM-DD) and status values

## Troubleshooting

- Server not starting or port conflicts
  - Ensure no other process is using port 5000
  - Check console output for errors
- 500 Internal Server Error on requests
  - Check server logs for stack traces
  - Ensure the application has permission to read/write `courses.json` in the project directory
- Data file issues (corrupted JSON)
  - The API handles corrupted JSON by treating data as an empty array; however, it’s best to fix the file contents if possible
- Invalid or missing request data
  - Double-check JSON payload fields and correct data types
  - Ensure `target_date` follows YYYY-MM-DD format
  - Ensure `status` is one of: Not Started, In Progress, Completed

## Project structure (optional reference)

- app.js (Express app, routes for /api/courses)
- courses.json (data storage; created automatically)
- package.json (dependencies and start script)

If you’d like, I can tailor the README with your exact folder structure or add section about testing with curl examples.
