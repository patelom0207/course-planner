# Improved Degree Planner - Setup Guide

## Overview

The degree planner has been completely redesigned with a better user experience based on your feedback. The new flow automatically pulls completed courses from the Dashboard and adds dedicated screens for AP credits and dual enrollment.

## Key Improvements

### 1. **Automatic Dashboard Integration**
- Automatically pulls all courses from existing Dashboard semesters
- No manual course selection needed - just create your semesters in Dashboard first
- Perfect for both first-year and continuing students

### 2. **Step-by-Step Wizard**
Five clear steps guide users through the process:
1. **Basic Info** - Name, major, minors
2. **AP Credits** - Select AP exams with qualifying scores
3. **Dual Enrollment** - Add transfer credits from other colleges
4. **Review** - See summary of all credits before generating
5. **View Plan** - See semester-by-semester degree plan

### 3. **AP Credits Database**
Includes common AP exams with UIUC equivalents:
- Computer Science A → CS124
- Calculus AB → MATH220
- Calculus BC → MATH220 + MATH231
- Physics C (both) → PHYS211, PHYS212
- Chemistry → CHEM102
- And many more...

### 4. **Dual Enrollment Support**
- Add courses from community colleges or other universities
- Map them to UIUC course equivalents
- System automatically counts them as completed

## Setup Instructions

### Backend Setup

1. **Stop existing backend** (if running):
```bash
lsof -ti:8000 | xargs kill -9
```

2. **Delete old database**:
```bash
cd /Users/patelom0207/Projects/course-planner/backend
rm -f course_planner.db
```

3. **Start backend** (this will create new tables):
```bash
source venv/bin/activate
uvicorn main:app --reload
```

4. **Seed majors and minors** (in a new terminal):
```bash
cd /Users/patelom0207/Projects/course-planner/backend
source venv/bin/activate
python3 seed_majors.py
```

### Frontend Setup

```bash
cd /Users/patelom0207/Projects/course-planner/frontend
npm run dev
```

## How to Use

### For First-Year Students (No Courses Yet)

1. Go to **Degree Planner** tab
2. Enter your name and select your major
3. (Optional) Select minors
4. Click "Next: AP Credits"
5. Select any AP exams you've taken with qualifying scores
6. Click "Next: Dual Enrollment"
7. Add any dual enrollment courses (if applicable)
8. Click "Next: Review"
9. Set start semester, year, and courses per semester
10. Click "Generate My Degree Plan"

**Result**: A full 4-year plan accounting for your AP/DE credits

### For Continuing Students (Have Taken Courses)

1. **First, go to Dashboard** and create semesters for all completed/current coursework
   - Example: "Fall 2024", "Spring 2025"
   - Add all courses you've taken to these semesters

2. **Then, go to Degree Planner**
3. The system will automatically detect your Dashboard courses
4. Follow steps 2-10 above

**Result**: A degree completion plan showing only remaining courses

## What Gets Counted as "Completed"

The system combines courses from three sources:

1. **Dashboard Semesters** - All courses in all your Dashboard semesters
2. **AP Credits** - Course equivalents for selected AP exams
3. **Dual Enrollment** - UIUC equivalents you specified

Total completed courses = Dashboard + AP + Dual Enrollment

## New Database Schema

### Added to StudentProfile:
- `ap_credits` - JSON string of AP exam data
- `dual_enrollment_credits` - JSON string of dual enrollment courses

### New Pydantic Models:
- `APCredit` - Represents an AP exam with score and equivalents
- `DualEnrollmentCourse` - Represents a transfer course

### Modified Endpoint:
- `POST /api/degree-planning/student-profile` now accepts:
  - `ap_credits: List[APCredit]`
  - `dual_enrollment_courses: List[DualEnrollmentCourse]`
  - `use_dashboard_semesters: boolean`

## Files Modified

### Backend:
- `backend/models.py` - Added AP/DE fields and models
- `backend/routers/degree_planning.py` - Updated to aggregate courses from all sources

### Frontend:
- `frontend/src/components/DegreePlanner.tsx` - Complete rewrite with 5-step wizard
- `frontend/src/components/DegreePlanner.css` - New styles for AP/DE sections
- `frontend/src/data/apCredits.ts` - Database of common AP exams
- `frontend/src/types.ts` - Added APCredit and DualEnrollmentCourse types
- `frontend/src/App.tsx` - Now passes semesters to DegreePlanner

## Testing the Feature

1. **Test as first-year student**:
   - Don't create any Dashboard semesters
   - Go to Degree Planner
   - Add AP credits
   - Generate plan
   - Should see full 4-year plan minus AP credits

2. **Test as continuing student**:
   - Create 2-3 semesters in Dashboard with courses
   - Go to Degree Planner
   - Should see message about found courses
   - Add profile info
   - Generate plan
   - Should see only remaining courses

## Known Limitations

1. **Prerequisite Logic**: Still sorts by level, doesn't enforce prerequisites
2. **Course Offering**: Doesn't check if courses are offered in specific semesters
3. **Major Requirements**: Only CS major has detailed requirements
4. **AP Exam List**: Limited to common exams (can be expanded)

## Next Steps

- Add more AP exams to the database
- Implement prerequisite validation
- Add semester-specific course availability
- Expand major requirements beyond CS
- Add ability to edit generated plans
- Export plans to PDF/calendar

## Troubleshooting

**Issue**: "No majors/minors found"
- **Solution**: Run `python3 seed_majors.py` in backend directory

**Issue**: Degree plan is empty
- **Solution**: Check that the major has required courses in database

**Issue**: Dashboard courses not showing in review
- **Solution**: Make sure you created semesters in Dashboard first

**Issue**: AP credits not applying
- **Solution**: Check that the AP exam is in the `apCredits.ts` file and has course equivalents

## Summary

The new degree planner provides a much better user experience:
- ✅ No manual course selection for completed work
- ✅ Automatic Dashboard integration
- ✅ Dedicated AP credit selection
- ✅ Support for dual enrollment/transfer credits
- ✅ Clear step-by-step process
- ✅ Summary review before generating
- ✅ Works for both first-year and continuing students
