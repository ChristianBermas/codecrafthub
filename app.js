// CodeCraftHub - Simple REST API for managing courses
// Requirements satisfied:
// - Node.js + Express
// - JSON file storage (courses.json)
// - CRUD endpoints under /api/courses
// - Each course: id, name, description, target_date, status, created_at
// - Input validation, error handling, automatic file creation
// - Port 5000

'use strict';

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Create Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Path to the JSON data file (in project root)
const DATA_FILE = path.join(__dirname, 'courses.json');

// Allowed status values
const ALLOWED_STATUSES = ['Not Started', 'In Progress', 'Completed'];

// Ensure the JSON data file exists; if not, create it with an empty array
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    // If the file doesn't exist, initialize with an empty array
    await fs.writeFile(DATA_FILE, '[]', 'utf8');
  }
}

// Read all courses from the JSON file
async function readAllCourses() {
  await ensureDataFile();
  const content = await fs.readFile(DATA_FILE, 'utf8');
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    // If JSON is corrupted, treat as empty dataset
    return [];
  }
}

// Write all courses to the JSON file
async function writeAllCourses(courses) {
  await fs.writeFile(DATA_FILE, JSON.stringify(courses, null, 2), 'utf8');
}

// Generate the next ID (start at 1)
function getNextId(courses) {
  if (!Array.isArray(courses) || courses.length === 0) return 1;
  const maxId = courses.reduce((max, c) => (c.id && c.id > max ? c.id : max), 0);
  return maxId + 1;
}

// Basic date format validation: YYYY-MM-DD
function isValidDateFormat(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

// Validate course payload for creation (POST)
function validateNewCourse(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Request body must be a valid JSON object');
    return errors;
  }

  if (!payload.name) errors.push('name is required');
  if (!payload.description) errors.push('description is required');
  if (!payload.target_date) errors.push('target_date is required');
  else if (!isValidDateFormat(payload.target_date)) errors.push('target_date must be in YYYY-MM-DD');
  if (!payload.status) errors.push('status is required');
  else if (!ALLOWED_STATUSES.includes(payload.status))
    errors.push(`status must be one of ${ALLOWED_STATUSES.join(', ')}`);

  return errors;
}

// Validate payload for update (PUT)
function validateUpdateCourse(payload) {
  // For PUT we require the same fields as creation
  return validateNewCourse(payload);
}

// Routes under /api/courses

// 1) POST /api/courses - Add a new course
app.post('/api/courses', async (req, res) => {
  try {
    const errors = validateNewCourse(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], details: errors });
    }

    const courses = await readAllCourses();
    const id = getNextId(courses);
    const newCourse = {
      id,
      name: req.body.name,
      description: req.body.description,
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: new Date().toISOString()
    };

    courses.push(newCourse);
    await writeAllCourses(courses);

    return res.status(201).json(newCourse);
  } catch (err) {
    console.error('Error creating course:', err);
    return res.status(500).json({ error: 'Internal server error while creating course' });
  }
});

// 2) GET /api/courses - Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await readAllCourses();
    return res.json(courses);
  } catch (err) {
    console.error('Error reading courses:', err);
    return res.status(500).json({ error: 'Internal server error while reading courses' });
  }
});

// 3) GET /api/courses/:id - Get a specific course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const courses = await readAllCourses();
    const course = courses.find(c => c.id === id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    return res.json(course);
  } catch (err) {
    console.error('Error fetching course:', err);
    return res.status(500).json({ error: 'Internal server error while retrieving course' });
  }
});

// 4) PUT /api/courses/:id - Update a course completely
app.put('/api/courses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const errors = validateUpdateCourse(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], details: errors });
    }

    const courses = await readAllCourses();
    const idx = courses.findIndex(c => c.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Preserve the original created_at timestamp
    const existingCreatedAt = courses[idx].created_at;

    const updatedCourse = {
      id,
      name: req.body.name,
      description: req.body.description,
      target_date: req.body.target_date,
      status: req.body.status,
      created_at: existingCreatedAt
    };

    courses[idx] = updatedCourse;
    await writeAllCourses(courses);

    return res.json(updatedCourse);
  } catch (err) {
    console.error('Error updating course:', err);
    return res.status(500).json({ error: 'Internal server error while updating course' });
  }
});

// 5) DELETE /api/courses/:id - Delete a course
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const courses = await readAllCourses();
    const idx = courses.findIndex(c => c.id === id);

    if (idx === -1) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Remove the course from the array
    courses.splice(idx, 1);
    await writeAllCourses(courses);

    // 204 No Content indicates success with no response body
    return res.status(204).end();
  } catch (err) {
    console.error('Error deleting course:', err);
    return res.status(500).json({ error: 'Internal server error while deleting course' });
  }
});

// 6) NEW: GET /api/courses/stats - Get statistics about courses
app.get('/api/courses/stats', async (req, res) => {
  try {
    const courses = await readAllCourses();
    const total = courses.length;

    // Initialize counts for expected statuses
    const byStatus = {
      'Not Started': 0,
      'In Progress': 0,
      'Completed': 0
    };

    // Count statuses (ignore any invalid statuses that might exist in data)
    for (const c of courses) {
      if (Object.prototype.hasOwnProperty.call(byStatus, c.status)) {
        byStatus[c.status] += 1;
      }
    }

    return res.json({ total, byStatus });
  } catch (err) {
    console.error('Error computing stats:', err);
    return res.status(500).json({ error: 'Internal server error while computing stats' });
  }
});

// 7) Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`CodeCraftHub API is running on http://localhost:${PORT}/api/courses`);
});

// 8) Export app (optional, useful for testing)
module.exports = app;