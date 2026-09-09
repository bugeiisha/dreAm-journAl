import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const mainNavigation = [
  { icon: '⌂', label: 'Tableau de bord', path: '/' },
  { icon: '☾', label: 'Mes rêves', path: '/reves' },
  { icon: '◈', label: 'Carte onirique', path: '/carte' },
  { icon: '◌', label: 'Statistiques', path: '/statistiques' },
]

const tagsNavigation = [
  { icon: '◉', label: 'Characters', path: '/characters' },
  { icon: '◈', label: 'Places', path: '/places' },
  { icon: '◇', label: 'Objects', path: '/objects' },
  { icon: '✦', label: 'Other', path: '/other' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="moon-icon">☾</div>

        <div>
          <h1>Dream Journal</h1>
          <p>Mon univers onirique</p>
        </div>
      </div>

      <nav className="navigation">
        <div className="navigation-section">
          <p className="section-title">NAVIGATION</p>

          {mainNavigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar-divider" />

        <div className="navigation-section">
          <p className="section-title">EXPLORER</p>

          {tagsNavigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/parametres" className="settings-button">
          <span className="nav-icon">⚙</span>
          Paramètres
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar