# UIUC Course Planner

A full-stack web application for planning UIUC courses semester-by-semester with prerequisite tracking and credit management.

## Features

- **Course Catalog**: Browse 18+ UIUC courses across CS, MATH, PHYS, ECE, STAT, and ENG departments
- **Semester Planning**: Create and manage multiple semester plans
- **Course Management**: Add/remove courses to/from semesters with click-to-add interface
- **Prerequisite Tracking**: Automatic prerequisite checking with warnings for missing requirements
- **Credit Calculation**: Real-time credit totals for each semester
- **Filtering**: Search and filter courses by department, level, and keywords
- **Color-Coded UI**: Department-based color coding for easy visual organization

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database management
- **SQLite**: Lightweight database (pre-seeded with courses)
- **Pydantic**: Data validation and serialization

### Frontend
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

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

The app will be available at `http://localhost:5173`

## Usage

1. **View Dashboard**: See all your planned semesters
2. **Create Semester**: Click "+ New Semester" and enter a name (e.g., "Fall 2025")
3. **Browse Catalog**: Switch to "Course Catalog" view to see all available courses
4. **Add Courses**:
   - From Dashboard: Use dropdown in semester card
   - From Catalog: Click "Add to Semester" on any course
5. **Remove Courses**: Click "Remove" button on any course in a semester
6. **Check Prerequisites**: Warnings appear automatically for missing prerequisites
7. **Monitor Credits**: Total credits displayed for each semester

## API Endpoints

### Courses
- `GET /api/courses` - List all courses (filter by `?department=CS&level=200`)
- `GET /api/courses/{course_id}` - Get specific course details
- `GET /api/courses/departments/list` - Get all departments

### Semesters
- `GET /api/semesters` - List all semesters
- `POST /api/semesters` - Create new semester
- `GET /api/semesters/{id}` - Get semester details
- `DELETE /api/semesters/{id}` - Delete semester
- `POST /api/semesters/{id}/courses` - Add course to semester
- `DELETE /api/semesters/{id}/courses/{course_id}` - Remove course from semester

## Project Structure

```
course-planner/
├── backend/
│   ├── main.py              # FastAPI app and CORS setup
│   ├── models.py            # SQLAlchemy models and Pydantic schemas
│   ├── database.py          # Database connection and seeding
│   ├── routers/
│   │   ├── courses.py       # Course endpoints
│   │   └── semesters.py     # Semester endpoints
│   └── requirements.txt     # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.tsx       # Main dashboard view
    │   │   ├── SemesterCard.tsx    # Individual semester cards
    │   │   └── CourseCatalog.tsx   # Course browsing view
    │   ├── App.tsx          # Main app component
    │   ├── api.ts           # API client functions
    │   └── types.ts         # TypeScript interfaces
    └── package.json         # Node dependencies
```

## Sample Courses

The database is pre-seeded with courses including:
- CS101, CS125, CS173, CS225, CS233, CS340, CS374, CS411, CS421
- MATH220, MATH231, MATH241
- PHYS211, PHYS212
- ECE110, ECE220
- STAT400
- ENG100

## Future Enhancements

Potential improvements beyond MVP:
- User authentication and multi-user support
- Drag-and-drop course reordering
- Schedule conflict detection
- Export semester plans to PDF
- Course recommendations based on completed courses
- GPA tracking
- Degree requirement progress tracking
