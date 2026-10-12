import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAllTechniqueAttempts,
  getAllTechniques,
  addTechniqueAttempt,
} from '../src/db/dreamDatabase'
import './TechniqueAttempts.css'

function getToday() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

const initialForm = {
  techniqueId: '',
  date: getToday(),
  durationMinutes: '',
  conditions: '',
  description: '',
  notes: '',
  techniqueResult: 'completed',
  dreamResult: 'none',
}

const techniqueResults = [
  { value: 'completed', label: 'Tentative menée à terme' },
  { value: 'partial', label: 'Partiellement réalisée' },
  { value: 'interrupted', label: 'Interrompue' },
  { value: 'not-done', label: 'Non réalisée' },
]

const dreamResults = [
  { value: 'rl', label: 'Rêve lucide (RL)' },
  { value: 'rn', label: 'Rêve non lucide (RN)' },
  { value: 'none', label: 'Aucun rêve mémorisé' },
  { value: 'no-dream', label: 'Pas de rêve après la tentative' },
  { value: 'other', label: 'Autre / résultat incertain' },
]

function TechniqueAttempts() {
  const navigate = useNavigate()

  const [attempts, setAttempts] = useState([])
  const [techniques, setTechniques] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    try {
      const [allAttempts, allTechniques] = await Promise.all([
        getAllTechniqueAttempts(),
        getAllTechniques(),
      ])

      setAttempts([...allAttempts].reverse())
      setTechniques(allTechniques)
    } catch (err) {
      console.error('Erreur de chargement :', err)
      setError('Impossible de charger les données.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.techniqueId) {
      setError('Choisis une technique pour cette tentative.')
      return
    }

    if (!form.date) {
      setError('Indique la date de la tentative.')
      return
    }

    setSaving(true)

    try {
      await addTechniqueAttempt({
        techniqueId: Number(form.techniqueId),
        date: form.date,
        durationMinutes:
          form.durationMinutes === ''
            ? null
            : Number(form.durationMinutes),
        conditions: form.conditions.trim(),
        description: form.description.trim(),
        notes: form.notes.trim(),
        techniqueResult: form.techniqueResult,
        dreamResult: form.dreamResult,
        dreamId: null,
      })

      setForm({ ...initialForm, date: getToday() })
      setShowForm(false)
      await loadData()
    } catch (err) {
      console.error('Erreur lors de l’enregistrement :', err)
      setError('La tentative n’a pas pu être enregistrée.')
    } finally {
      setSaving(false)
    }
  }

  function getTechniqueName(techniqueId) {
    const technique = techniques.find(
      (item) => Number(item.id) === Number(techniqueId),
    )

    return technique?.name || 'Technique inconnue'
  }

  function getResultLabel(value, options) {
    return options.find((option) => option.value === value)?.label
      || 'Non renseigné'
  }

  if (loading) {
    return (
      <div className="technique-attempts-page">
        Chargement du journal...
      </div>
    )
  }

  return (
    <main className="technique-attempts-page">
      <header className="technique-attempts-header">
        <div>
          <h1>Journal des tentatives</h1>
          <p>Note tes essais et observe ce qui fonctionne pour toi.</p>
        </div>

        <div className="technique-attempts-actions">
          <button
            type="button"
            className="attempt-secondary-button"
            onClick={() => navigate('/techniques')}
          >
            Catalogue
          </button>

          <button
            type="button"
            className="attempt-primary-button"
            onClick={() => {
              setShowForm((current) => !current)
              setError('')
            }}
          >
            {showForm ? 'Annuler' : '+ Nouvelle tentative'}
          </button>
        </div>
      </header>

      {error && (
        <p className="attempt-error" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <section className="attempt-form-card">
          <h2>Nouvelle tentative</h2>
          <p className="attempt-form-intro">
            Note ce que tu as essayé, indépendamment du résultat obtenu.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="attempt-form-grid">
              <label className="attempt-field">
                Technique *
                <select
                  name="techniqueId"
                  value={form.techniqueId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choisir une technique</option>
                  {techniques.map((technique) => (
                    <option key={technique.id} value={technique.id}>
                      {technique.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="attempt-field">
                Date *
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="attempt-field">
                Durée (minutes)
                <input
                  type="number"
                  name="durationMinutes"
                  min="0"
                  step="1"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  placeholder="Ex. : 15"
                />
              </label>

              <label className="attempt-field">
                Résultat de la technique
                <select
                  name="techniqueResult"
                  value={form.techniqueResult}
                  onChange={handleChange}
                >
                  {techniqueResults.map((result) => (
                    <option key={result.value} value={result.value}>
                      {result.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="attempt-field attempt-field-full">
                Conditions de la tentative
                <textarea
                  name="conditions"
                  value={form.conditions}
                  onChange={handleChange}
                  placeholder="Ex. : après un réveil naturel, fatigue, heure, environnement..."
                  rows="3"
                />
              </label>

              <label className="attempt-field attempt-field-full">
                Déroulement
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Comment s'est passée la tentative ? Qu'as-tu ressenti ou observé ?"
                  rows="4"
                />
              </label>

              <label className="attempt-field">
                Résultat du rêve
                <select
                  name="dreamResult"
                  value={form.dreamResult}
                  onChange={handleChange}
                >
                  {dreamResults.map((result) => (
                    <option key={result.value} value={result.value}>
                      {result.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="attempt-field attempt-field-full">
                Notes libres
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Observations, idées à tester la prochaine fois..."
                  rows="3"
                />
              </label>
            </div>

            <div className="attempt-form-actions">
              <button
                type="button"
                className="attempt-secondary-button"
                onClick={() => {
                  setShowForm(false)
                  setForm({ ...initialForm, date: getToday() })
                  setError('')
                }}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="attempt-primary-button"
                disabled={saving || techniques.length === 0}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer la tentative'}
              </button>
            </div>

            {techniques.length === 0 && (
              <p className="attempt-help">
                Ajoute d'abord une technique dans le catalogue pour pouvoir
                enregistrer une tentative.
              </p>
            )}
          </form>
        </section>
      )}

      <section className="technique-attempts-list">
        {attempts.length === 0 ? (
          <div className="technique-attempts-empty">
            <h2>Aucune tentative pour le moment</h2>
            <p>
              Enregistre ton premier essai pour commencer ton suivi.
            </p>
          </div>
        ) : (
          attempts.map((attempt) => (
            <article className="technique-attempt-card" key={attempt.id}>
              <div className="attempt-card-header">
                <h2>{getTechniqueName(attempt.techniqueId)}</h2>
                <span className="attempt-date">
                  {attempt.date
                    ? new Date(`${attempt.date}T12:00:00`).toLocaleDateString(
                        'fr-FR',
                      )
                    : 'Date non renseignée'}
                </span>
              </div>

              <div className="attempt-card-results">
                <p>
                  <span>Technique :</span>{' '}
                  {getResultLabel(attempt.techniqueResult, techniqueResults)}
                </p>
                <p>
                  <span>Rêve :</span>{' '}
                  {getResultLabel(attempt.dreamResult, dreamResults)}
                </p>
                {attempt.durationMinutes != null && (
                  <p>
                    <span>Durée :</span> {attempt.durationMinutes} min
                  </p>
                )}
              </div>

              {attempt.description && (
                <p className="attempt-card-description">
                  {attempt.description}
                </p>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  )
}

export default TechniqueAttempts