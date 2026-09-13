import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../src/components/StatCard'
import DreamCard from '../src/components/DreamCard'
import { getAllDreams } from '../src/db/dreamDatabase'
import { getCurrentStreak, getDreamStats, } from '../src/utils/dreamStats'
import './Dashboard.css'

function formatToday() {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(new Date())
    .toUpperCase()
}

function getRelativeDate(dateString) {
  if (!dateString) return ''

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dreamDate = new Date(
    `${dateString}T00:00:00`,
  )
  dreamDate.setHours(0, 0, 0, 0)

  const difference =
    Math.round(
      (today.getTime() -
        dreamDate.getTime()) /
        (1000 * 60 * 60 * 24),
    )

  if (difference === 0) {
    return "Aujourd’hui"
  }

  if (difference === 1) {
    return 'Hier'
  }

  if (difference === 2) {
    return 'Il y a 2 jours'
  }

  if (difference < 7) {
    return `Il y a ${difference} jours`
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dreamDate)
}

function getMostFrequentPlace(dreams) {
  const places = dreams.flatMap(
    (dream) => dream.places || [],
  )

  if (!places.length) {
    return {
      name: 'Aucun lieu',
      count: 0,
    }
  }

  const counts = {}

  places.forEach((place) => {
    const normalizedPlace =
      place.trim().toLowerCase()

    if (!normalizedPlace) return

    if (!counts[normalizedPlace]) {
      counts[normalizedPlace] = {
        name: place.trim(),
        count: 0,
      }
    }

    counts[normalizedPlace].count++
  })

  return Object.values(counts).sort(
    (a, b) => b.count - a.count,
  )[0]
}

function getMostFrequentElement(dreams) {
  const categories = [
    {
      key: 'places',
      type: 'lieu',
    },
    {
      key: 'characters',
      type: 'personnage',
    },
    {
      key: 'objects',
      type: 'objet',
    },
    {
      key: 'other',
      type: 'élément',
    },
  ]

  const counts = {}

  dreams.forEach((dream) => {
    categories.forEach(({ key, type }) => {
      const elements = dream[key] || []

      elements.forEach((element) => {
        const cleanElement = element.trim()

        if (!cleanElement) return

        const normalized =
          cleanElement.toLowerCase()

        if (!counts[normalized]) {
          counts[normalized] = {
            name: cleanElement,
            count: 0,
            type,
          }
        }

        counts[normalized].count++
      })
    })
  })

  const mostFrequent = Object.values(counts).sort(
    (a, b) => b.count - a.count,
  )[0]

  return mostFrequent || null
}

function Dashboard() {
  const navigate = useNavigate()

  const [dreams, setDreams] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDreams() {
      try {
        const savedDreams = await getAllDreams()

        const sortedDreams = [...savedDreams].sort(
          (a, b) => {
            const dateA = new Date(
              `${a.date}T${a.time || '00:00'}`,
            )

            const dateB = new Date(
              `${b.date}T${b.time || '00:00'}`,
            )

            return dateB - dateA
          },
        )

        setDreams(sortedDreams)
      } catch (error) {
        console.error(
          'Erreur lors du chargement des rêves :',
          error,
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadDreams()
  }, [])

  const stats = useMemo(
    () => getDreamStats(dreams),
    [dreams],
  )

  const streak = useMemo(
    () => getCurrentStreak(dreams),
    [dreams],
  )

  const mostFrequentPlace = useMemo(
    () => getMostFrequentPlace(dreams),
    [dreams],
  )

  const mostFrequentElement = useMemo(
    () => getMostFrequentElement(dreams),
    [dreams],
  )

  const recentDreams = useMemo(() => {
    return dreams.slice(0, 3).map((dream) => ({
      ...dream,

      date: getRelativeDate(dream.date),

      preview:
        dream.content ||
        'Aucun récit enregistré pour ce rêve.',

      tags: [
        ...(dream.places || []),
        ...(dream.characters || []),
        ...(dream.objects || []),
        ...(dream.other || []),
      ].slice(0, 3),

      mood:
        dream.mood > 0
          ? `+${dream.mood}`
          : `${dream.mood}`,

      moodType:
        dream.mood > 0
          ? 'positive'
          : dream.mood < 0
            ? 'negative'
            : 'neutral',
    }))
  }, [dreams])

  const lucidPercentage = stats.total
    ? (
        (stats.lucid / stats.total) *
        100
      ).toFixed(1)
    : 0

  const moodLabel =
    stats.averageMood > 10
      ? 'Globalement positif'
      : stats.averageMood < -10
        ? 'Globalement négatif'
        : 'Plutôt neutre'

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          Chargement de ton journal...
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-add">
          <div>
            <span className="page-eyebrow">{formatToday()}</span>
            <h2>Bonjour 🌙</h2>
          </div>
          <button className="primary-button" onClick={() => navigate('/reves/nouveau')}>
            <span>+</span>
              Ajouter un rêve
          </button>
        </div>
        <p>
          Voici ce qui s'est passé dans tes rêves.
        </p>
      </header>

      <section className="stats-grid">
        <StatCard
          label="Rêves enregistrés"
          value={stats.total}
          icon="☾"
          detail={
            stats.total === 0
              ? 'Commence ton journal'
              : `${streak} jour${
                  streak > 1 ? 's' : ''
                } de série`
          }
        />

        <StatCard
          label="Rêves lucides"
          value={stats.lucid}
          icon="◉"
          detail={
            stats.total
              ? `${lucidPercentage} % de tes rêves`
              : 'Aucun rêve enregistré'
          }
        />

        <StatCard
          label="Mood moyen"
          value={`${
            stats.averageMood > 0 ? '+' : ''
          }${stats.averageMood}`}
          icon="✦"
          detail={moodLabel}
        />

        <StatCard
          label="Lieu le plus fréquent"
          value={
            mostFrequentPlace.count > 0
              ? `${mostFrequentPlace.count}×`
              : '—'
          }
          icon="⌂"
          detail={mostFrequentPlace.name}
        />
      </section>

      <section className="dashboard-content">
        <div className="recent-dreams">
          <div className="section-header">
            <div>
              <h3>Derniers rêves</h3>

              <p>
                Tes dernières aventures nocturnes.
              </p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                navigate('/reves')
              }
            >
              Voir tous →
            </button>
          </div>

          <div className="dreams-list">
            {recentDreams.length > 0 ? (
              recentDreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  onClick={() =>
                    navigate(
                      `/reves/${dream.id}`,
                    )
                  }
                />
              ))
            ) : (
              <div className="dashboard-empty-dreams">
                <span>☾</span>

                <h3>
                  Ton journal est encore vide
                </h3>

                <p>
                  Ton premier rêve apparaîtra ici.
                </p>

                <button
                  className="text-button"
                  onClick={() =>
                    navigate('/reves/nouveau')
                  }
                >
                  Ajouter un rêve →
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="dashboard-side">
          {mostFrequentElement ? (
            <div className="insight-card">
              <span className="insight-icon">
                ✦
              </span>

              <span className="insight-label">
                DREAM INSIGHT
              </span>

              <h3>
                Un élément revient souvent
              </h3>

              <p>
                « {mostFrequentElement.name} »
                apparaît{' '}
                {mostFrequentElement.count}{' '}
                fois dans tes rêves.
              </p>

              <button
                className="insight-button"
                onClick={() =>
                  navigate('/carte')
                }
              >
                Explorer sur la carte →
              </button>
            </div>
          ) : (
            <div className="insight-card">
              <span className="insight-icon">
                ✦
              </span>

              <span className="insight-label">
                DREAM INSIGHT
              </span>

              <h3>
                Ton monde onirique se construit
              </h3>

              <p>
                Ajoute des lieux, personnages et
                objets à tes rêves pour commencer
                à découvrir les éléments qui
                reviennent.
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}

export default Dashboard