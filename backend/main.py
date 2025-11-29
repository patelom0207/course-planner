from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import courses, semesters, degree_planning

app = FastAPI(title="UIUC Course Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(semesters.router, prefix="/api/semesters", tags=["semesters"])
app.include_router(degree_planning.router, prefix="/api/degree-planning", tags=["degree-planning"])

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "UIUC Course Planner API"}
