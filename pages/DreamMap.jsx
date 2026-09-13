import { useEffect, useMemo, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { getAllDreams, getAllMapPositions, saveMapPosition,} from '../src/db/dreamDatabase'
import { useNavigate } from 'react-router-dom'
import './DreamMap.css'

function getPlaceCount(dreams) {
  const counts = {}

  dreams.forEach((dream) => {
    ;(dream.places || []).forEach((place) => {
      const normalizedPlace = place.trim()

      if (!normalizedPlace) return

      if (!counts[normalizedPlace]) {
        counts[normalizedPlace] = 0
      }

      counts[normalizedPlace] += 1
    })
  })

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
}

function DraggablePlace({
  place,
  index,
  selected,
  onSelect,
  onDragStop,
  savedPosition,
}) {
  const nodeRef = useRef(null)

  const size =
    Math.min(130, 70 + place.count * 12)

  const defaultX =
    80 + ((index * 190) % 650)

  const defaultY =
    80 + ((index * 150) % 450)

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={{
        x: savedPosition?.x ?? defaultX,
        y: savedPosition?.y ?? defaultY,
      }}
      onStop={(event, data) =>
        onDragStop(place, data)
      }
    >
      <button
        ref={nodeRef}
        type="button"
        className={`map-place-node ${
          selected ? 'selected' : ''
        }`}
        style={{
          width: size,
          height: size,
        }}
        onClick={() => onSelect(place)}
      >
        <span className="map-place-icon">
          ⌂
        </span>

        <strong>{place.name}</strong>

        <small>
          {place.count} rêve
          {place.count > 1 ? 's' : ''}
        </small>
      </button>
    </Draggable>
  )
}

function DreamMap() {
  const [dreams, setDreams] = useState([])
  const [positions, setPositions] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const isMobile = window.innerWidth <= 768

  useEffect(() => {
    async function loadMapData() {
      try {
        const [savedDreams, savedPositions] =
          await Promise.all([
            getAllDreams(),
            getAllMapPositions(),
          ])

        setDreams(savedDreams)

        const positionsObject = {}

        savedPositions.forEach((position) => {
          positionsObject[position.name] = position
        })

        setPositions(positionsObject)
      } catch (error) {
        console.error(
          'Impossible de charger la carte :',
          error,
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadMapData()
  }, [])

  
  const places = useMemo(() => {
    return getPlaceCount(dreams)
  }, [dreams])
  
  const filteredPlaces = places.filter((place) =>
  place.name
    .toLowerCase()
    .includes(search.trim().toLowerCase())
)
  const selectedPlaceDreams = useMemo(() => {
    if (!selectedPlace) return []

    return dreams.filter((dream) =>
      (dream.places || []).some(
        (place) =>
          place.trim() === selectedPlace.name,
      ),
    )
  }, [dreams, selectedPlace])

  async function handleDragStop(place, data) {
    const newPosition = {
      name: place.name,
      x: data.x,
      y: data.y,
    }

    // Mise à jour immédiate de l'affichage
    setPositions((current) => ({
      ...current,
      [place.name]: newPosition,
    }))

    try {
      // Sauvegarde dans IndexedDB
      await saveMapPosition(newPosition)
    } catch (error) {
      console.error(
        'Impossible de sauvegarder la position :',
        error,
      )
    }
  }

  /* MOBILE */
  if (isMobile) {
  return (
    <div className="dream-map-page">
      <header className="dream-map-header">
        <div>
          <span className="page-eyebrow">
            EXPLORATION ONIRIQUE
          </span>

          <h2>Carte onirique</h2>
           <span>
            {places.length} lieu
            {places.length > 1 ? 'x' : ''}
          </span>
        </div>
        <input
          className="mobile-place-search"
          type="text"
          placeholder="🔍 Rechercher un lieu..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </header>

      <div className="mobile-places-list">
        {filteredPlaces.map((place) => {
          const placeDreams = dreams.filter(
            (dream) =>
              (dream.places || []).includes(
                place.name,
              ),
          )

          return (
            <div
              key={place.name}
              className="mobile-place-card"
            >
              <div className="mobile-place-header" onClick={() => setSelectedPlace( selectedPlace?.name === place.name ? null : place,)}>
                <div className="mobile-place-info">
                  <span className="mobile-place-icon">
                    ⌂
                  </span>
                  <div>
                    <h3>{place.name}</h3>
              
                    <p>
                      {place.count} apparition
                      {place.count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              
                <div className="mobile-place-right">
                  <span className="mobile-place-arrow">
                    {selectedPlace?.name === place.name
                      ? '▲'
                      : '▼'}
                  </span>
                </div>
              </div>

              {selectedPlace?.name ===
                place.name && (
                <div className="mobile-place-dreams">
                  {placeDreams.map((dream) => (
                    <div key={dream.id} className="mobile-dream-item" onClick={() => navigate(`/reves/${dream.id}`)}>
                      ☾{' '}
                      {dream.title ||
                        'Rêve sans titre'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
  return (
    <div className="dream-map-page">
      <header className="dream-map-header">
        <div>
          <span className="page-eyebrow">
            EXPLORATION ONIRIQUE
          </span>

          <h2>Carte onirique</h2>

          <p>
            Explore les lieux qui composent ton univers de rêve.
          </p>
        </div>
      </header>

      <div className="dream-map-layout">
        <section className="dream-map-canvas">
          {isLoading ? (
            <div className="map-empty-state">
              <span>☾</span>

              <h3>Création de ta carte...</h3>
            </div>
          ) : places.length === 0 ? (
            <div className="map-empty-state">
              <span>✦</span>

              <h3>Ta carte est encore vide</h3>

              <p>
                Ajoute des tags dans la catégorie Places
                pour faire apparaître tes lieux ici.
              </p>
            </div>
          ) : (
            places.map((place, index) => (
                <DraggablePlace
                  key={place.name}
                  place={place}
                  index={index}
                  savedPosition={positions[place.name]}
                  selected={
                    selectedPlace?.name === place.name
                  }
                  onSelect={setSelectedPlace}
                  onDragStop={handleDragStop}
                />
            ))
        )}
        </section>

        <aside className="map-sidebar">
          {selectedPlace ? (
            <>
              <div className="map-sidebar-heading">
                <span className="map-sidebar-eyebrow">
                  LIEU ONIRIQUE
                </span>

                <h3>
                  {selectedPlace.name}
                </h3>

                <p>
                  Apparu dans{' '}
                  <strong>
                    {selectedPlace.count} rêve
                    {selectedPlace.count > 1
                      ? 's'
                      : ''}
                  </strong>
                </p>
              </div>

              <div className="map-related-dreams">
                <span className="map-section-label">
                  RÊVES ASSOCIÉS
                </span>

                {selectedPlaceDreams.map((dream) => (
                  <div
                    className="map-dream-item"
                    key={dream.id}
                  >
                    <span>☾</span>

                    <div>
                      <strong>
                        {dream.title ||
                          'Rêve sans titre'}
                      </strong>

                      <small>
                        {dream.date}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="map-sidebar-empty">
              <span>✦</span>

              <h3>Choisis un lieu</h3>

              <p>
                Clique sur un point de la carte
                pour explorer les rêves associés.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default DreamMap