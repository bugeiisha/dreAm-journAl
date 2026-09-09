import { Routes, Route } from 'react-router-dom'
import Dreams from '../pages/Dreams'
import DreamEditor from '../pages/DreamEditor'
import Sidebar from './components/Sidebar'
import Dashboard from '../pages/Dashboard'
import Stats from '../pages/Stats'
import DreamMap from '../pages/DreamMap'
import Settings from '../pages/Settings'

function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <h2>{title}</h2>
      <p>Cette page arrive bientôt 🌙</p>
    </div>
  )
}

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reves" element={<Dreams />} />
          <Route path="/reves/nouveau" element={<DreamEditor />} />
          <Route path="/reves/:dreamId" element={<DreamEditor />} />
          <Route path="/carte" element={<DreamMap />} />
          <Route path="/characters" element={<PlaceholderPage title="Characters" />}/>
          <Route path="/places" element={<PlaceholderPage title="Places" />}/>
          <Route path="/objects" element={<PlaceholderPage title="Objects" />}/>
          <Route path="/other" element={<PlaceholderPage title="Other" />}/>
          <Route path="/parametres" element={<Settings />}/>
          <Route path="/statistiques" element={<Stats />}/>
        </Routes>
      </main>
    </div>
  )
}

export default App