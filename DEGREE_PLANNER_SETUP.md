# Degree Planner Feature Setup

This document explains how to set up and use the new degree planning feature.

## Overview

The degree planning feature allows users to:
1. Create a student profile with their major, minors, and completed coursework
2. Generate a personalized semester-by-semester plan to complete their degree
3. View all remaining required courses organized by semester

## Setup Instructions

### 1. Delete the old database (if it exists)
```bash
cd backend
rm -f course_planner.db
```

### 2. Install/Update dependencies (if needed)
The feature uses existing dependencies, so no new packages are required.

### 3. Seed majors and minors data
```bash
cd backend
source venv/bin/activate
python seed_majors.py
```

This will create:
- 7 popular UIUC majors (CS, ECE, ME, Math, Stats, Physics, Economics)
- 5 popular minors (CS, Math, Stats, Business, Economics)
- Sample required courses for the CS major

### 4. Start the backend server
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### 5. Start the frontend
```bash
cd frontend
npm run dev
```

### 6. Access the application
- Frontend: http://localhost:5173
- Click on "Degree Planner" in the navigation bar

## How to Use

### Creating a Student Profile

1. Click "Create New Profile"
2. Enter your name
3. Select your major (required)
4. Optionally select one or more minors
5. Select all courses you've already completed
6. Choose your start semester (Fall or Spring)
7. Set start year and courses per semester
8. Click "Create Profile & Generate Plan"

### Viewing Your Degree Plan

After creating a profile, you'll see:
- A semester-by-semester breakdown of courses to take
- Each semester shows:
  - Semester name (e.g., "Fall 2026")
  - List of courses with course IDs and titles
  - Total credits for that semester

### Managing Profiles

- You can create multiple profiles for different scenarios
- Click on any existing profile card to view its degree plan
- Use "Regenerate Plan" to create a new plan with updated settings

## API Endpoints

The following new endpoints are available:

### Majors
- `GET /api/degree-planning/majors` - Get all majors
- `GET /api/degree-planning/majors/{id}` - Get specific major

### Minors
- `GET /api/degree-planning/minors` - Get all minors

### Student Profiles
- `POST /api/degree-planning/student-profile` - Create student profile
- `GET /api/degree-planning/student-profile/{id}` - Get student profile
- `GET /api/degree-planning/student-profiles` - Get all student profiles

### Degree Plans
- `POST /api/degree-planning/generate-degree-plan` - Generate degree plan
- `GET /api/degree-planning/degree-plan/{student_id}` - Get degree plan

## Database Schema

New tables added:
- `majors` - Available majors
- `minors` - Available minors
- `student_profiles` - Student information
- `degree_plans` - Generated degree plans
- `planned_semesters` - Individual semesters in a degree plan
- Junction tables for relationships

## Features

✅ Major and minor selection
✅ Completed coursework tracking
✅ Automatic degree plan generation
✅ Prerequisite-aware course ordering (courses sorted by level)
✅ Customizable courses per semester
✅ Multiple profile support
✅ Plan regeneration

## Known Limitations

1. **Prerequisite Logic**: Currently sorts courses by level but doesn't enforce strict prerequisite chains
2. **Course Availability**: Doesn't check if courses are offered in specific semesters
3. **Major Requirements**: Only CS major has detailed course requirements seeded
4. **Electives**: Doesn't yet distinguish between core requirements and electives

## Future Enhancements

- Add prerequisite validation and intelligent course ordering
- Implement semester-specific course availability
- Add more major/minor requirement data
- Include gen-ed requirements
- Add ability to edit generated plans manually
- Export plans to PDF or calendar
- Add credit hour limits per semester
- Support for different degree types (BS vs BA)

## Troubleshooting

**Issue**: Majors/minors not showing up
- **Solution**: Make sure you ran `python seed_majors.py`

**Issue**: No courses in degree plan
- **Solution**: The major may not have required courses set. Check database or add requirements manually

**Issue**: API errors
- **Solution**: Make sure backend is running and database is properly initialized

**Issue**: Completed courses not filtering out
- **Solution**: Verify course IDs match exactly (case-sensitive)
