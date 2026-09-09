import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import StatCard from '../src/components/StatCard'
import { getAllDreams } from '../src/db/dreamDatabase'
import { getDreamStats, getCurrentStreak, getLongestStreak, getDailyActivity, getMonthlyActivity, getMoodEvolution, getDreamTypes, getMostFrequentTags, getWeekdayActivity, getDreamWorldStats } from '../src/utils/dreamStats'
import './Stats.css'

const PIE_COLORS = [
  '#8B7DD8',
  '#BFA8E8',
  '#7566C2',
  '#D8C7F2',
  '#55489B',
]

function formatNumber(number) {
  return new Intl.NumberFormat('fr-FR').format(
    number,
  )
}

function Stats() {
  const [dreams, setDreams] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDreams() {
      try {
        const savedDreams = await getAllDreams()
        setDreams(savedDreams)
      } catch (error) {
        console.error(
          'Erreur lors du chargement des statistiques :',
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

  const currentStreak = useMemo(
    () => getCurrentStreak(dreams),
    [dreams],
  )

  const longestStreak = useMemo(
    () => getLongestStreak(dreams),
    [dreams],
  )

  const dailyActivity = useMemo(
    () => getDailyActivity(dreams, 30),
    [dreams],
  )

  const monthlyActivity = useMemo(
    () => getMonthlyActivity(dreams, 12),
    [dreams],
  )

  const moodEvolution = useMemo(
    () => getMoodEvolution(dreams),
    [dreams],
  )

  const dreamTypes = useMemo(
    () =>
      getDreamTypes(dreams).filter(
        (item) => item.value > 0,
      ),
    [dreams],
  )

  const topPlaces = useMemo(
    () =>
      getMostFrequentTags(
        dreams,
        'places',
        5,
      ),
    [dreams],
  )

  const topCharacters = useMemo(
    () =>
      getMostFrequentTags(
        dreams,
        'characters',
        5,
      ),
    [dreams],
  )

  const topObjects = useMemo(
    () =>
      getMostFrequentTags(
        dreams,
        'objects',
        5,
      ),
    [dreams],
  )

  const weekdayActivity = useMemo(
    () => getWeekdayActivity(dreams),
    [dreams],
  )

  const dreamWorldStats = useMemo(
    () => getDreamWorldStats(dreams),
    [dreams],
  )

  const lucidPercentage = stats.total
    ? Math.round(
        (stats.lucid / stats.total) * 100,
      )
    : 0

  if (isLoading) {
    return (
      <div className="stats-page">
        <div className="stats-loading">
          Chargement de tes statistiques...
        </div>
      </div>
    )
  }

  return (
    <div className="stats-page">
      <header className="stats-header">
        <div>
          <span className="page-eyebrow">
            TON MONDE ONIRIQUE
          </span>

          <h2>Statistiques</h2>

          <p>
            Explore les tendances de tes rêves au
            fil du temps.
          </p>
        </div>
      </header>

      {/* VUE GÉNÉRALE */}

      <section className="stats-overview">
        <StatCard
          label="Rêves enregistrés"
          value={formatNumber(stats.total)}
          icon="☾"
          detail="Depuis le début de ton journal"
        />

        <StatCard
          label="Rêves lucides"
          value={stats.lucid}
          icon="◉"
          detail={`${lucidPercentage} % de tes rêves`}
        />

        <StatCard
          label="Mood moyen"
          value={`${
            stats.averageMood > 0 ? '+' : ''
          }${stats.averageMood}`}
          icon="✦"
          detail="Sur une échelle de −100 à +100"
        />

        <StatCard
          label="Plus longue série"
          value={`${longestStreak} j`}
          icon="↻"
          detail={`Série actuelle : ${currentStreak} j`}
        />
      </section>

      {/* ACTIVITÉ */}

      <section className="stats-section">
        <div className="stats-section-header">
          <div>
            <span className="section-eyebrow">
              ACTIVITÉ
            </span>

            <h3>30 derniers jours</h3>

            <p>
              Nombre de rêves enregistrés chaque
              jour.
            </p>
          </div>
        </div>

        <div className="chart-card">
          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <BarChart data={dailyActivity}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip />

              <Bar
                dataKey="count"
                name="Rêves"
                fill="#8B7DD8"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ACTIVITÉ MENSUELLE + MOOD */}

      <section className="stats-chart-grid">
        <div className="stats-section">
          <div className="stats-section-header">
            <div>
              <span className="section-eyebrow">
                ÉVOLUTION
              </span>

              <h3>Activité mensuelle</h3>
            </div>
          </div>

          <div className="chart-card">
            <ResponsiveContainer
              width="100%"
              height={260}
            >
              <BarChart data={monthlyActivity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Rêves"
                  fill="#BFA8E8"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-section-header">
            <div>
              <span className="section-eyebrow">
                MOOD
              </span>

              <h3>Évolution émotionnelle</h3>
            </div>
          </div>

          <div className="chart-card">
            {moodEvolution.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={260}
              >
                <LineChart data={moodEvolution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={[-100, 100]}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="mood"
                    name="Mood"
                    stroke="#8B7DD8"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>
      </section>

      {/* CARACTÉRISTIQUES */}

      <section className="stats-chart-grid">
        <div className="stats-section">
          <div className="stats-section-header">
            <div>
              <span className="section-eyebrow">
                CARACTÉRISTIQUES
              </span>

              <h3>Types de rêves</h3>

              <p>
                Tes expériences oniriques les plus
                fréquentes.
              </p>
            </div>
          </div>

          <div className="chart-card pie-chart-card">
            {dreamTypes.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <PieChart>
                  <Pie
                    data={dreamTypes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {dreamTypes.map(
                      (entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            PIE_COLORS[
                              index %
                                PIE_COLORS.length
                            ]
                          }
                        />
                      ),
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-section-header">
            <div>
              <span className="section-eyebrow">
                RYTHME
              </span>

              <h3>Jours où tu rêves le plus</h3>

              <p>
                Répartition selon le jour de la
                semaine.
              </p>
            </div>
          </div>

          <div className="chart-card">
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart data={weekdayActivity}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Rêves"
                  fill="#7566C2"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* MONDE ONIRIQUE */}

      <section className="stats-section dream-world-section">
        <div className="stats-section-header">
          <div>
            <span className="section-eyebrow">
              MON MONDE ONIRIQUE
            </span>

            <h3>Les éléments qui reviennent</h3>

            <p>
              Ton univers commence à se dessiner.
            </p>
          </div>
        </div>

        <div className="dream-world-summary">
          <div>
            <span>
              {dreamWorldStats.uniquePlaces}
            </span>

            <p>Lieux uniques</p>
          </div>

          <div>
            <span>
              {
                dreamWorldStats.uniqueCharacters
              }
            </span>

            <p>Personnages uniques</p>
          </div>

          <div>
            <span>
              {dreamWorldStats.uniqueObjects}
            </span>

            <p>Objets uniques</p>
          </div>
        </div>

        <div className="tag-stats-grid">
          <TagStatsCard
            title="⌂ Lieux les plus fréquents"
            tags={topPlaces}
          />

          <TagStatsCard
            title="◉ Personnages les plus fréquents"
            tags={topCharacters}
          />

          <TagStatsCard
            title="◇ Objets les plus fréquents"
            tags={topObjects}
          />
        </div>
      </section>
    </div>
  )
}

function TagStatsCard({ title, tags }) {
  return (
    <div className="tag-stats-card">
      <h4>{title}</h4>

      {tags.length > 0 ? (
        <div className="tag-ranking">
          {tags.map((tag, index) => (
            <div
              className="tag-ranking-row"
              key={tag.name}
            >
              <span className="tag-rank">
                {index + 1}
              </span>

              <span className="tag-name">
                {tag.name}
              </span>

              <span className="tag-count">
                {tag.count}×
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-stats-data">
          Pas encore de données.
        </p>
      )}
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="empty-chart">
      <span>☾</span>

      <p>
        Pas encore assez de données pour afficher
        ce graphique.
      </p>
    </div>
  )
}

export default Stats