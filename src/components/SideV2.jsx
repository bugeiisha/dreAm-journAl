import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './SideV2.css'

import { FaHome, FaStar, FaPen, FaAward } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { GiCharacter } from "react-icons/gi";
import { BsCloudMoonFill } from "react-icons/bs";

const mainNavigation = [
  { icon: '', label: 'Tableau de bord', path: '/' },
  { icon: '', label: 'Mes rêves', path: '/reves' },
  { icon: '', label: 'Quêtes', path: '/quetes' },
  { icon: '', label: 'PR', path: '/characters' },
  { icon: '', label: 'Notes', path: '/notes' },
  { icon: '', label: 'Statistiques', path: '/statistiques' },
]

const tagsNavigation = [
  { icon: '', label: 'Carte onirique', path: '/carte' },
  { icon: '', label: 'Places', path: '/places' },
  { icon: '', label: 'Objects', path: '/objects' },
  { icon: '', label: 'Other', path: '/other' },
  { label: 'Paramètres', path: '/parametres' },
]
const mobileNavigation = [
  { icon: <FaHome />, label: 'Tableau de bord', path: '/' },
  { icon: <BsCloudMoonFill />, label: 'Rêves', path: '/reves' },
  { icon: <FaAward />, label: 'Quêtes', path: '/quetes' },
  { icon: <GiCharacter />, label: 'Characters', path: '/characters' },
  { icon: <FaPen />, label: 'Notes', path: '/notes' },
]
const mobileMoreNavigation = [
  { label: 'Statistiques', path: '/statistiques' },
  { label: 'Carte onirique', path: '/carte' },
  { label: 'Places', path: '/places' },
  { label: 'Objects', path: '/objects' },
  { label: 'Other', path: '/other' },
  { label: 'Paramètres', path: '/parametres' },
]

function SideV2() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

return (
  <>
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="moon-icon">☾</div>

        <div>
          <h1>Dream Journal</h1>
          <p>Mon univers onirique</p>
        </div>
      </div>

      <nav className="navigation">
        <div className="navigation-main">
          {mainNavigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="navigation-explorer">
          {tagsNavigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <nav className="mobile-navigation">
          {mobileNavigation.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={closeMenu}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
            </NavLink>
          ))}

          <button
            className={`mobile-nav-item mobile-more-button ${
              isOpen ? 'active' : ''
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="mobile-nav-icon"><IoMdSettings /></span>
          </button>
        
        </nav>
        {isOpen && (
          <div className="mobile-more-menu">
            {mobileMoreNavigation.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className="mobile-more-item"
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}

      <div className="sidebar-footer">
        <NavLink
          to="/parametres"
          className="settings-button"
        >
          <span className="nav-icon">⚙</span>
          Paramètres
        </NavLink>
      </div>
    </aside>
  </>
)

}

export default SideV2