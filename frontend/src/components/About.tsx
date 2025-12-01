import './About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About UIUC Course Planner</h1>
        <p className="about-subtitle">
          A comprehensive tool for planning your academic journey at the University of Illinois Urbana-Champaign
        </p>
      </div>

      <section className="about-section">
        <h2>Overview</h2>
        <p>
          UIUC Course Planner is a full-stack web application designed to help students plan their
          courses semester-by-semester with intelligent prerequisite tracking and credit management.
          Built with modern technologies, it provides an intuitive interface for organizing your
          academic path.
        </p>
      </section>

      <section className="about-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Course Catalog</h3>
            <p>Browse 18+ UIUC courses across CS, MATH, PHYS, ECE, STAT, and ENG departments</p>
          </div>
          <div className="feature-card">
            <h3>Semester Planning</h3>
            <p>Create and manage multiple semester plans to organize your academic schedule</p>
          </div>
          <div className="feature-card">
            <h3>Prerequisite Tracking</h3>
            <p>Automatic prerequisite checking with warnings for missing requirements</p>
          </div>
          <div className="feature-card">
            <h3>Credit Calculation</h3>
            <p>Real-time credit totals for each semester to help you plan your workload</p>
          </div>
          <div className="feature-card">
            <h3>Smart Filtering</h3>
            <p>Search and filter courses by department, level, and keywords</p>
          </div>
          <div className="feature-card">
            <h3>Visual Organization</h3>
            <p>Department-based color coding for easy visual identification</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Technology Stack</h2>
        <div className="tech-stack">
          <div className="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li><strong>React 19</strong> - Modern UI library</li>
              <li><strong>TypeScript</strong> - Type-safe JavaScript</li>
              <li><strong>Vite</strong> - Fast build tool and dev server</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Backend</h3>
            <ul>
              <li><strong>FastAPI</strong> - Modern Python web framework</li>
              <li><strong>SQLAlchemy</strong> - ORM for database management</li>
              <li><strong>SQLite</strong> - Lightweight database</li>
              <li><strong>Pydantic</strong> - Data validation and serialization</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>How to Use</h2>
        <div className="usage-steps">
          <div className="usage-step">
            <span className="step-number">1</span>
            <div className="step-content">
              <h4>View Dashboard</h4>
              <p>See all your planned semesters at a glance</p>
            </div>
          </div>
          <div className="usage-step">
            <span className="step-number">2</span>
            <div className="step-content">
              <h4>Create Semesters</h4>
              <p>Click "+ New Semester" and enter a name (e.g., "Fall 2025")</p>
            </div>
          </div>
          <div className="usage-step">
            <span className="step-number">3</span>
            <div className="step-content">
              <h4>Browse Catalog</h4>
              <p>Switch to "Course Catalog" view to explore available courses</p>
            </div>
          </div>
          <div className="usage-step">
            <span className="step-number">4</span>
            <div className="step-content">
              <h4>Add Courses</h4>
              <p>Use the dropdown in semester cards or click "Add to Semester" in the catalog</p>
            </div>
          </div>
          <div className="usage-step">
            <span className="step-number">5</span>
            <div className="step-content">
              <h4>Track Progress</h4>
              <p>Monitor credit totals and prerequisite requirements automatically</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Future Enhancements</h2>
        <p>We're continuously working to improve the Course Planner. Planned features include:</p>
        <ul className="enhancements-list">
          <li>User authentication and multi-user support</li>
          <li>Drag-and-drop course reordering</li>
          <li>Schedule conflict detection</li>
          <li>Export semester plans to PDF</li>
          <li>Course recommendations based on completed courses</li>
          <li>GPA tracking</li>
          <li>Degree requirement progress tracking</li>
        </ul>
      </section>

      <section className="about-section about-footer">
        <p>
          Built with care for UIUC students to make academic planning easier and more efficient.
        </p>
      </section>
    </div>
  );
}

export default About;
