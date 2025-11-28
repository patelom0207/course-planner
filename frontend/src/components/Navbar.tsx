import './Navbar.css';

interface NavbarProps {
  activeView: 'dashboard' | 'catalog';
  onNavigate: (view: 'dashboard' | 'catalog') => void;
  onLogin: () => void;
}

function Navbar({ activeView, onNavigate, onLogin }: NavbarProps) {
  return (
    <header>
      <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }} className="logo-link">
        <div className="logo">
          <span className="logo-text">UIUC</span>
          <span className="logo-subtext">Course Planner</span>
        </div>
      </a>
      <nav>
        <ul className="nav_links">
          <li>
            <a
              href="#"
              className={activeView === 'dashboard' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className={activeView === 'catalog' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }}
            >
              Course Catalog
            </a>
          </li>
          <li><a href="#">My Schedule</a></li>
          <li><a href="#">About</a></li>
        </ul>
      </nav>
      <button onClick={onLogin}>
        <a className="cta">Log In</a>
      </button>
    </header>
  );
}

export default Navbar;
