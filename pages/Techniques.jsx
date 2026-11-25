import { useEffect, useMemo, useState } from 'react'
import { getAllDreams } from '../src/db/dreamDatabase'
import './Techniques.css'

const START_DATE = '2026-07-01'

function StatCard({ label, value, description }) {
  return (
    <div className="technique-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {description && <p>{description}</p>}
    </div>
  )
}

function Techniques() {
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTechnique, setActiveTechnique] = useState('ssild')

  useEffect(() => {
    async function loadDreams() {
      try {
        const data = await getAllDreams()
        setDreams(data)
      } catch (error) {
        console.error(
          'Erreur lors du chargement des rêves :',
          error,
        )
      } finally {
        setLoading(false)
      }
    }

    loadDreams()
  }, [])

  const recentDreams = useMemo(
    () =>
      dreams.filter(
        (dream) =>
          dream.date >= START_DATE &&
          dream.date <= new Date().toISOString().slice(0, 10),
      ),
    [dreams],
  )

  const generalStats = useMemo(() => {
    const lucidDreams = recentDreams.filter(
      (dream) => dream.lucid,
    )

    const falseAwakenings = lucidDreams.filter(
      (dream) => dream.falseAwakening,
    )

    return {
      lucid: lucidDreams.length,
      falseAwakenings: falseAwakenings.length,
      lucidWithoutFE:
        lucidDreams.length - falseAwakenings.length,
    }
  }, [recentDreams])

  const monthlyStats = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const months = []
    const start = new Date(2026, 6, 1)

    for (
      let date = new Date(start);
      date.getFullYear() < currentYear ||
      (date.getFullYear() === currentYear &&
        date.getMonth() <= currentMonth);
      date.setMonth(date.getMonth() + 1)
    ) {
      const year = date.getFullYear()
      const month = date.getMonth()

      const monthDreams = recentDreams.filter((dream) => {
        const dreamDate = new Date(`${dream.date}T00:00:00`)

        return (
          dreamDate.getFullYear() === year &&
          dreamDate.getMonth() === month
        )
      })

      const lucid = monthDreams.filter(
        (dream) => dream.lucid,
      )

      const fe = lucid.filter(
        (dream) => dream.falseAwakening,
      )

      months.push({
        key: `${year}-${month}`,
        label: new Intl.DateTimeFormat('fr-FR', {
          month: 'long',
          year: 'numeric',
        }).format(date),
        rlWithoutFE: lucid.length - fe.length,
        rlWithFE: fe.length,
        total: lucid.length,
      })
    }

    return months
  }, [recentDreams])

  const ssildStats = useMemo(() => {
  const attempts = dreams.flatMap((dream) => {
    const tracking = dream.techniqueTracking

    if (Array.isArray(tracking?.ssildAttempts)) {
      return tracking.ssildAttempts
    }

    // Compatibilité avec les anciens rêves
    return tracking?.ssild ? [tracking.ssild] : []
  })

  const resultCounts = {
    rl: 0,
    fe: 0,
    falseSleep: 0,
    rn: 0,
  }

  attempts.forEach((attempt) => {
    const results = attempt.results || (
      attempt.result ? [attempt.result] : []
    )

    if (results.includes('rl')) resultCounts.rl++
    if (results.includes('fe')) resultCounts.fe++
    if (results.includes('false-sleep')) resultCounts.falseSleep++
    if (results.includes('rn')) resultCounts.rn++
  })

  const completed = attempts.filter(
    (attempt) => attempt.completed === true
  )

  const notCompleted = attempts.filter(
    (attempt) => attempt.completed === false
  )

  const withAS = attempts.filter(
    (attempt) => attempt.preparations?.as
  )

  const withWBTB = attempts.filter(
    (attempt) => attempt.preparations?.wbtb
  )

  // Une tentative compte une seule fois, même avec plusieurs résultats
  const successfulAttempts = attempts.filter((attempt) => {
    const results = attempt.results || [attempt.result]

    return results.some((result) =>
      ['rl', 'fe', 'false-sleep'].includes(result)
    )
  })

  const cycleStats = {}

  successfulAttempts.forEach((attempt) => {
    const key = `${attempt.fastCycles ?? 0}-${attempt.slowCycles ?? 0}`
    cycleStats[key] = (cycleStats[key] || 0) + 1
  })

  const cycles = Object.entries(cycleStats)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      const [aFast, aSlow] = a.label.split('-').map(Number)
      const [bFast, bSlow] = b.label.split('-').map(Number)

      return aFast - bFast || aSlow - bSlow
    })

  return {
    total: attempts.length,
    rl: resultCounts.rl,
    fe: resultCounts.fe,
    falseSleep: resultCounts.falseSleep,
    rn: resultCounts.rn,
    completed: completed.length,
    notCompleted: notCompleted.length,
    successful: successfulAttempts.length,
    withAS: withAS.length,
    withWBTB: withWBTB.length,
    cycles,
  }
}, [dreams])

  if (loading) {
    return (
      <div className="techniques-page">
        Chargement des statistiques...
      </div>
    )
  }

  return (
    <div className="techniques-page">
      <div className="techniques-layout">
        <div className="techniques-left">

          <div className="techniques-header">
            <span className="techniques-eyebrow">
              JOURNAL ONIRIQUE
            </span>

            <h2>Techniques & statistiques</h2>

            <p>
              Observe tes rêves lucides et l'évolution de tes expériences.
            </p>
          </div>

          {/* STATISTIQUES GÉNÉRALES */}

          <h3 className="techniques-section-title">
            Rêves lucides depuis juillet 2026
          </h3>

          <div className="techniques-stats-grid">
            <StatCard
              label="Rêves lucides"
              value={generalStats.lucid}
              description="FE compris"
            />

            <StatCard
              label="Faux éveils"
              value={generalStats.falseAwakenings}
              description="Parmi les rêves lucides"
            />

            <StatCard
              label="RL sans FE"
              value={generalStats.lucidWithoutFE}
              description="Autres rêves lucides"
            />
          </div>

          {/* ÉVOLUTION MENSUELLE */}

          <h3 className="techniques-section-title">
            Évolution mensuelle
          </h3>

          <div className="techniques-table-wrapper">
            <table className="techniques-table">
              <thead>
                <tr>
                  <th>Mois</th>
                  <th>RL</th>
                  <th>RL (FE)</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {monthlyStats.map((month) => (
                  <tr key={month.key}>
                    <td>{month.label}</td>
                    <td>{month.rlWithoutFE}</td>
                    <td>{month.rlWithFE}</td>
                    <td>{month.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TECHNIQUES */}

          <h3 className="techniques-section-title">
            Suivi des techniques
          </h3>

          <div className="techniques-tabs">
            <button
              type="button"
              className={activeTechnique === 'ssild' ? 'active' : ''}
              onClick={() => setActiveTechnique('ssild')}
            >
              SSILD
            </button>

            <button
              type="button"
              className={activeTechnique === 'wild' ? 'active' : ''}
              onClick={() => setActiveTechnique('wild')}
            >
              WILD
            </button>
          </div>

          {activeTechnique === 'ssild' ? (
            <>
              <h3 className="techniques-section-title">
                Vue d'ensemble
              </h3>

              <div className="ssild-overview">
                <div className="ssild-activity">
                  <span className="ssild-label">ACTIVITÉ</span>
                  <div className="ssild-activity-number">
                    <strong>{ssildStats.total}</strong>
                    <span>tentatives enregistrées</span>
                  </div>

                  <div className="ssild-activity-details">
                    <span>{ssildStats.completed} terminées</span>
                    <span>{ssildStats.notCompleted} non terminées</span>
                  </div>

                  <div className="ssild-progress">
                    <div
                      className="ssild-progress-completed"
                      style={{
                        width: `${
                          ssildStats.total
                            ? (ssildStats.completed / ssildStats.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                    
                <div className="ssild-results">
                  <h4>Résultats obtenus</h4>
                  {[
                    { label: 'Rêves lucides', value: ssildStats.rl || 0 },
                    { label: 'Faux éveils', value: ssildStats.fe || 0 },
                    { label: 'Faux endormissements', value: ssildStats.falseSleep || 0 },
                    { label: 'Rêves non lucides', value: ssildStats.rn || 0 },
                  ].map((item) => (
                    <div className="ssild-stat-line" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
                
                <div className="ssild-preparations-summary">
                  <h4>Préparations</h4>
                  <div className="ssild-stat-line">
                    <span>Avec AS</span>
                    <strong>{ssildStats.withAS} tentatives</strong>
                  </div>
                  <div className="ssild-stat-line">
                    <span>Avec WBTB</span>
                    <strong>{ssildStats.withWBTB} tentatives</strong>
                  </div>
                </div>
              </div>

              <h3 className="techniques-section-title">
                Préparations
              </h3>

              <div className="techniques-stats-grid">
                <StatCard
                  label="Avec AS"
                  value={ssildStats.withAS}
                />

                <StatCard
                  label="Avec WBTB"
                  value={ssildStats.withWBTB}
                />
              </div>

              <h3 className="techniques-section-title">
                Cycles ayant abouti à un RL, FE, FNE
              </h3>

              <div className="techniques-results-list">
                {ssildStats.cycles.length > 0 ? (
                  ssildStats.cycles.map((cycle) => (
                    <div
                      className="techniques-result-row"
                      key={cycle.label}
                    >
                      <span>
                        {cycle.label.replace('-', ' rapides / ')} lents
                      </span>
                      <strong>{cycle.count}</strong>
                    </div>
                  ))
                ) : (
                  <p className="techniques-empty">
                    Aucun RL obtenu avec SSILD pour le moment.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="techniques-empty">
              <h3>WILD</h3>
              <p>
                Le suivi statistique de cette technique sera ajouté
                lorsque son formulaire sera mis en place.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default Techniques