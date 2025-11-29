import './Navbar.css';

interface NavbarProps {
  activeView: 'dashboard' | 'catalog' | 'planner';
  onNavigate: (view: 'dashboard' | 'catalog' | 'planner') => void;
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
          <li>
            <a
              href="#"
              className={activeView === 'planner' ? 'active' : ''}
              onClick={(e) => { e.preventDefault(); onNavigate('planner'); }}
            >
              Degree Planner
            </a>
          </li>
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
