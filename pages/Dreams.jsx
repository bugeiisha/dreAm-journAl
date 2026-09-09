import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllDreams, deleteDream, } from '../src/db/dreamDatabase'
import './Dreams.css'

const filters = [
  { id: 'all', label: 'Tous' },
  { id: 'lucid', label: 'Lucides' },
  { id: 'recurring', label: 'Récurrents' },
  { id: 'falseAwakening', label: 'Faux éveil' },
  { id: 'sleepParalysis', label: 'Paralysie' },
  { id: 'nightmare', label: 'Cauchemars' },
  { id: 'image', label: 'Avec image' },
  { id: 'positive', label: 'Mood +' },
  { id: 'negative', label: 'Mood -' },
]

function formatDate(date) {
  if (!date) return 'Date inconnue'

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

function formatShortDate(date) {
  if (!date) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

function getMoodClass(mood) {
  if (mood > 0) return 'positive'
  if (mood < 0) return 'negative'

  return 'neutral'
}

function getMoodLabel(mood) {
  if (mood > 60) return 'Très positif'
  if (mood > 20) return 'Positif'
  if (mood > 0) return 'Légèrement positif'
  if (mood === 0) return 'Neutre'
  if (mood > -20) return 'Légèrement négatif'
  if (mood > -60) return 'Négatif'

  return 'Très négatif'
}

function getDreamTags(dream) {
  return [
    ...(dream.characters || []),
    ...(dream.places || []),
    ...(dream.objects || []),
    ...(dream.other || []),
  ]
}

function Dreams() {
  const [dreams, setDreams] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedDreamId, setSelectedDreamId] = useState(null)

  const navigate = useNavigate()

  async function handleDelete() {
  if (!selectedDream) return

  const confirmed = window.confirm(
    `Supprimer définitivement "${selectedDream.title}" ?`,
  )

  if (!confirmed) return

  try {
    await deleteDream(selectedDream.id)

    setDreams((currentDreams) =>
      currentDreams.filter(
        (dream) => dream.id !== selectedDream.id,
      ),
    )

    setSelectedDream(null)
  } catch (error) {
    console.error(
      'Impossible de supprimer le rêve :',
      error,
    )
  }
}

  useEffect(() => {
    async function loadDreams() {
      try {
        const savedDreams = await getAllDreams()

        const sortedDreams = [...savedDreams].sort((a, b) => {
          const dateA = new Date(
            `${a.date}T${a.time || '00:00'}`,
          )

          const dateB = new Date(
            `${b.date}T${b.time || '00:00'}`,
          )

          return dateB - dateA
        })

        setDreams(sortedDreams)

        if (sortedDreams.length > 0) {
          setSelectedDreamId(sortedDreams[0].id)
        }
      } catch (error) {
        console.error(
          'Impossible de charger les rêves :',
          error,
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadDreams()
  }, [])

  const filteredDreams = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    return dreams.filter((dream) => {
      const tags = getDreamTags(dream)

      const matchesSearch =
        !searchTerm ||
        (dream.title || '')
          .toLowerCase()
          .includes(searchTerm) ||
        (dream.content || '')
          .toLowerCase()
          .includes(searchTerm) ||
        tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm),
        )

      if (!matchesSearch) return false

      switch (activeFilter) {
        case 'lucid':
          return dream.lucid

        case 'recurring':
          return dream.recurring

        case 'falseAwakening':
          return dream.falseAwakening

        case 'sleepParalysis':
          return dream.sleepParalysis

        case 'nightmare':
          return dream.nightmare

        case 'image':
          return Boolean(dream.image)

        case 'positive':
          return dream.mood > 0

        case 'negative':
          return dream.mood < 0

        default:
          return true
      }
    })
  }, [dreams, search, activeFilter])

  const dreamsByDate = useMemo(() => {
    return filteredDreams.reduce((groups, dream) => {
      if (!groups[dream.date]) {
        groups[dream.date] = []
      }

      groups[dream.date].push(dream)

      return groups
    }, {})
  }, [filteredDreams])

  const selectedDream = useMemo(() => {
    return (
      filteredDreams.find(
        (dream) => dream.id === selectedDreamId,
      ) || null
    )
  }, [filteredDreams, selectedDreamId])

  useEffect(() => {
    if (
      filteredDreams.length > 0 &&
      !filteredDreams.some(
        (dream) => dream.id === selectedDreamId,
      )
    ) {
      setSelectedDreamId(filteredDreams[0].id)
    }
  }, [filteredDreams, selectedDreamId])

  return (
    <div className="dreams-page">
      <div className="dreams-main-layout">

        {/* COLONNE DE GAUCHE */}

        <section className="dreams-list-panel">
          <header className="dreams-header">
            <div>
              <span className="page-eyebrow">
                JOURNAL ONIRIQUE
              </span>

              <h2>Mes rêves</h2>

              <p>
                Explore et retrouve toutes tes aventures nocturnes.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                navigate('/reves/nouveau')
              }
            >
              <span>+</span>
              Ajouter un rêve
            </button>
          </header>

          <section className="dreams-toolbar">
            <div className="search-container">
              <span className="search-icon">
                ⌕
              </span>

              <input
                type="search"
                placeholder="Rechercher..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="filters">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className={`filter-button ${
                    activeFilter === filter.id
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setActiveFilter(filter.id)
                  }
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </section>

          <div className="dreams-count">
            {filteredDreams.length} rêve
            {filteredDreams.length !== 1 ? 's' : ''}
          </div>

          <div className="dreams-scroll-area">
            {isLoading ? (
              <div className="empty-dreams">
                <span>☾</span>

                <h3>
                  Chargement de ton journal...
                </h3>
              </div>
            ) : filteredDreams.length > 0 ? (
              <section className="dreams-timeline">
                {Object.entries(dreamsByDate).map(
                  ([date, dreamsForDate]) => (
                    <div
                      className="dream-date-group"
                      key={date}
                    >
                      <div className="dream-date-heading">
                        <span>
                          {formatDate(date)}
                        </span>
                      </div>

                      <div className="dream-list">
                        {dreamsForDate.map(
                          (dream) => (
                            <button
                              className={`dream-row ${
                                selectedDreamId ===
                                dream.id
                                  ? 'selected'
                                  : ''
                              }`}
                              key={dream.id}
                              onClick={() =>
                                setSelectedDreamId(
                                  dream.id,
                                )
                              }
                            >
                              <div className="dream-row-icon">
                                {dream.image
                                  ? '✦'
                                  : '☾'}
                              </div>

                              <div className="dream-row-content">
                                <div className="dream-row-title-line">
                                  <h3>
                                    {dream.title ||
                                      'Rêve sans titre'}
                                  </h3>

                                  {dream.lucid && (
                                    <span className="dream-badge">
                                      Lucide
                                    </span>
                                  )}

                                  {dream.recurring && (
                                    <span className="dream-badge">
                                      Récurrent
                                    </span>
                                  )}

                                  {dream.falseAwakening && (
                                    <span className="dream-badge false-awakening">
                                      Faux éveil
                                    </span>
                                  )}

                                  {dream.sleepParalysis && (
                                    <span className="dream-badge sleep-paralysis">
                                      Paralysie
                                    </span>
                                  )}

                                  {dream.nightmare && (
                                    <span className="dream-badge nightmare">
                                      Cauchemar
                                    </span>
                                  )}
                                </div>

                                <p>
                                  {dream.content}
                                </p>

                                <div className="dream-row-tags">
                                  {getDreamTags(dream)
                                    .slice(0, 4)
                                    .map((tag) => (
                                      <span
                                        key={tag}
                                        className="dream-row-tag"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                </div>
                              </div>

                              <div
                                className={`dream-row-mood ${getMoodClass(
                                  dream.mood,
                                )}`}
                              >
                                {dream.mood > 0
                                  ? '+'
                                  : ''}
                                {dream.mood}
                              </div>
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  ),
                )}
              </section>
            ) : (
              <div className="empty-dreams">
                <span>☾</span>

                <h3>Aucun rêve trouvé</h3>

                <p>
                  Aucun rêve ne correspond à ta
                  recherche.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* PANNEAU DE DROITE */}

        <aside className="dream-preview-panel">
          {selectedDream ? (
            <>
              <div className="dream-preview-top">
                <button
                  className="dream-back-button"
                  onClick={() =>
                    setSelectedDreamId(null)
                  }
                >
                  ←
                  <span>Retour</span>
                </button>
                
                <div className="dream-preview-actions">
                  <button
                    className="dream-edit-button"
                    onClick={() =>
                      navigate(`/reves/${selectedDream.id}`)
                    }
                    aria-label="Modifier ce rêve"
                    title="Modifier ce rêve"
                  >
                    ✎
                  </button>
                  
                  <button
                    className="dream-delete-button"
                    onClick={handleDelete}
                    aria-label="Supprimer ce rêve"
                    title="Supprimer ce rêve"
                  >
                    🗑
                  </button>
                </div>
              </div>
                  
              <div className="dream-preview-scroll">
                <div className="dream-preview-heading">
                  <h2>
                    {selectedDream.title ||
                      'Rêve sans titre'}
                  </h2>

                  <div className="dream-preview-meta">
                    <span>
                      {formatShortDate(
                        selectedDream.date,
                      )}
                    </span>

                    {selectedDream.time && (
                      <>
                        <span>•</span>

                        <span>
                          {selectedDream.time}
                        </span>
                      </>
                    )}

                    <span>•</span>

                    <span
                      className={`preview-mood ${getMoodClass(
                        selectedDream.mood,
                      )}`}
                    >
                      {selectedDream.mood > 0
                        ? '+'
                        : ''}
                      {selectedDream.mood}
                    </span>

                    {selectedDream.lucid && (
                      <>
                        <span>•</span>

                        <span className="preview-lucid">
                          ● Lucide
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {selectedDream.image && (
                  <div className="dream-preview-image">
                    <img
                      src={selectedDream.image}
                      alt={
                        selectedDream.title ||
                        'Illustration du rêve'
                      }
                    />
                  </div>
                )}

                <div className="dream-preview-content">
                  {selectedDream.content
                    ?.split('\n')
                    .filter((paragraph) => paragraph.trim())
                    .map((paragraph, index) => (
                      <p key={index}>
                        {paragraph}
                      </p>
                    ))}
                </div>

                <div className="dream-preview-grid">

                  <div className="preview-details-card">
                    <h3>Détails</h3>

                    <div className="preview-detail-row">
                      <span>Humeur au réveil</span>

                      <strong
                        className={getMoodClass(selectedDream.mood)}
                      >
                        {getMoodLabel(selectedDream.mood)}
                      </strong>
                    </div>

                    <div className="preview-detail-row">
                      <span>Lucidité</span>

                      <strong
                        className={
                          selectedDream.lucid
                            ? 'detail-badge lucid'
                            : 'detail-badge inactive'
                        }
                      >
                        {selectedDream.lucid ? (
                          <>
                            ◉ Lucide
                            {selectedDream.lucidityLevel > 0 &&
                              ` · Niv. ${selectedDream.lucidityLevel}`}
                          </>
                        ) : (
                          '○ Non lucide'
                        )}
                      </strong>
                    </div>
                      
                    <div className="preview-detail-row">
                      <span>Récurrent</span>
                      
                      <strong
                        className={
                          selectedDream.recurring
                            ? 'detail-badge recurring'
                            : 'detail-badge inactive'
                        }
                      >
                        {selectedDream.recurring
                          ? '↻ Récurrent'
                          : '— Non'}
                      </strong>
                    </div>
                        
                    <div className="preview-detail-row">
                      <span>Paralysie du sommeil</span>
                        
                      <strong
                        className={
                          selectedDream.sleepParalysis
                            ? 'detail-badge sleep-paralysis'
                            : 'detail-badge inactive'
                        }
                      >
                        {selectedDream.sleepParalysis
                          ? '◐ Paralysie'
                          : '— Non'}
                      </strong>
                    </div>
                        
                    <div className="preview-detail-row">
                      <span>Faux éveil</span>
                        
                      <strong
                        className={
                          selectedDream.falseAwakening
                            ? 'detail-badge false-awakening'
                            : 'detail-badge inactive'
                        }
                      >
                        {selectedDream.falseAwakening
                          ? '◉ Faux éveil'
                          : '— Non'}
                      </strong>
                    </div>
                        
                    <div className="preview-detail-row">
                      <span>Cauchemar</span>
                        
                      <strong
                        className={
                          selectedDream.nightmare
                            ? 'detail-badge nightmare'
                            : 'detail-badge inactive'
                        }
                      >
                        {selectedDream.nightmare
                          ? '☾ Cauchemar'
                          : '— Non'}
                      </strong>
                    </div>
                  </div>

                  <div className="preview-tags-card">
                    <h3>Tags</h3>

                    <div className="preview-tags">
                      {getDreamTags(
                        selectedDream,
                      ).length > 0 ? (
                        getDreamTags(
                          selectedDream,
                        ).map((tag, index) => (
                          <span
                            className="preview-tag"
                            key={`${tag}-${index}`}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <p>
                          Aucun tag pour ce rêve.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedDream.notes && (
                  <div className="preview-notes-card">
                    <span className="preview-section-label">
                      NOTES PERSONNELLES
                    </span>

                    <p>
                      {selectedDream.notes}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-dream-selected">
              <span>☾</span>

              <h3>Sélectionne un rêve</h3>

              <p>
                Choisis un rêve dans ton journal
                pour l'afficher ici.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Dreams