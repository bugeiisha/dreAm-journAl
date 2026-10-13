import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAllTechniqueAttempts,
  getAllTechniques,
  getAllDreams,
  addTechniqueAttempt,
  updateTechniqueAttempt,
  deleteTechniqueAttempt,
} from '../src/db/dreamDatabase'
import './TechniqueAttempts.css'
import './Techniques.css'

function getToday() {
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  return today.toISOString().slice(0, 10)
}

const emptyForm = {
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
  const [dreams, setDreams] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [editingAttempt, setEditingAttempt] = useState(null)
  const [selectedAttempt, setSelectedAttempt] = useState(null)

  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    try {
      const [
        allAttempts,
        allTechniques,
        allDreams,
      ] = await Promise.all([
        getAllTechniqueAttempts(),
        getAllTechniques(),
        getAllDreams(),
      ])

      setAttempts([...allAttempts].reverse())
      setTechniques(allTechniques)
      setDreams(allDreams)
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

  function getTechniqueName(techniqueId) {
    const technique = techniques.find(
      (item) => Number(item.id) === Number(techniqueId),
    )

    return technique?.name || 'Technique inconnue'
  }

  function getResultLabel(value, options) {
    return (
      options.find((option) => option.value === value)?.label ||
      'Non renseigné'
    )
  }

  function openNewAttempt() {
    setSelectedAttempt(null)
    setEditingAttempt(null)
    setForm({ ...emptyForm, date: getToday() })
    setError('')
    setShowForm(true)
  }

  function openEditAttempt(attempt) {
    setForm({
      ...emptyForm,
      ...attempt,
      techniqueId: String(attempt.techniqueId ?? ''),
      date: attempt.date ?? getToday(),
      durationMinutes: attempt.durationMinutes ?? '',
      conditions: attempt.conditions ?? '',
      description: attempt.description ?? '',
      notes: attempt.notes ?? '',
      techniqueResult: attempt.techniqueResult ?? 'completed',
      dreamResult: attempt.dreamResult ?? 'none',
    })

    setEditingAttempt(attempt)
    setSelectedAttempt(null)
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingAttempt(null)
    setForm({ ...emptyForm, date: getToday() })
    setError('')
  }

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
      const attemptData = {
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
        dreamId: editingAttempt?.dreamId ?? null,
      }

      if (editingAttempt) {
        await updateTechniqueAttempt({
          ...attemptData,
          id: editingAttempt.id,
        })
      } else {
        await addTechniqueAttempt(attemptData)
      }

      closeForm()
      await loadData()
    } catch (err) {
      console.error('Erreur d’enregistrement :', err)
      setError('La tentative n’a pas pu être enregistrée.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedAttempt) return

    const confirmed = window.confirm(
      'Supprimer définitivement cette tentative ?',
    )

    if (!confirmed) return

    try {
      await deleteTechniqueAttempt(selectedAttempt.id)
      setSelectedAttempt(null)
      await loadData()
    } catch (err) {
      console.error('Erreur de suppression :', err)
      setError('Impossible de supprimer cette tentative.')
    }
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
            onClick={openNewAttempt}
          >
            + Nouvelle tentative
          </button>
        </div>
      </header>

      {error && !showForm && (
        <p className="attempt-error" role="alert">
          {error}
        </p>
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
            <article
              className="technique-attempt-card"
              key={attempt.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedAttempt(attempt)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedAttempt(attempt)
                }
              }}
            >
              <div className="attempt-card-header">
                <h2>{getTechniqueName(attempt.techniqueId)}</h2>

                <span className="attempt-date">
                  {attempt.date
                    ? new Date(
                        `${attempt.date}T12:00:00`,
                      ).toLocaleDateString('fr-FR')
                    : 'Date non renseignée'}
                </span>
              </div>

              <div className="attempt-card-results">
                <p>
                  <span>Technique :</span>{' '}
                  {getResultLabel(
                    attempt.techniqueResult,
                    techniqueResults,
                  )}
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

              <span className="attempt-card-open">
                Voir la fiche →
              </span>
            </article>
          ))
        )}
      </section>

      {selectedAttempt && (
        <div
          className="technique-overlay"
          onClick={() => setSelectedAttempt(null)}
        >
          <section
            className="technique-modal attempt-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="technique-modal-header">
              <div>
                <span className="techniques-eyebrow">
                  JOURNAL ONIRIQUE
                </span>
                <h2>
                  {getTechniqueName(selectedAttempt.techniqueId)}
                </h2>
                <p className="attempt-detail-date">
                  {selectedAttempt.date
                    ? new Date(
                        `${selectedAttempt.date}T12:00:00`,
                      ).toLocaleDateString('fr-FR')
                    : 'Date non renseignée'}
                </p>
              </div>

              <button
                type="button"
                className="technique-close"
                onClick={() => setSelectedAttempt(null)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="attempt-detail-content">
              <div className="attempt-detail-container">
                <div className="attempt-detail-item">
                  <h3>Technique</h3>
                  <p>
                    {getResultLabel(
                      selectedAttempt.techniqueResult,
                      techniqueResults,
                    )}
                  </p>
                </div>
                  
                <div className="attempt-detail-item">
                  <h3>Rêve</h3>
                  <p>
                    {getResultLabel(
                      selectedAttempt.dreamResult,
                      dreamResults,
                    )}
                  </p>
                </div>
                  
                <div className="attempt-detail-item">
                  <h3>Durée</h3>
                  <p>
                    {selectedAttempt.durationMinutes != null
                      ? `${selectedAttempt.durationMinutes} min`
                      : 'Non renseignée'}
                  </p>
                </div>
              </div>


              <div className="attempt-detail-sections">
                <section className="attempt-detail-section">
                  <h3>Conditions</h3>
                  <p>
                    {selectedAttempt.conditions || 'Aucune condition renseignée.'}
                  </p>
                </section>

                <section className="attempt-detail-section">
                  <h3>Déroulement</h3>
                  <p>
                    {selectedAttempt.description || 'Aucun déroulement renseigné.'}
                  </p>
                </section>

                <section className="attempt-detail-section">
                  <h3>Mes notes</h3>
                  <p>
                    {selectedAttempt.notes || 'Aucune note enregistrée.'}
                  </p>
                </section>

                <section className="attempt-detail-section attempt-dream-link">
                  <h3>Rêves reliés</h3>
                                    
                  {selectedAttempt.dreamId ? (
                    (() => {
                      const linkedDream = dreams.find(
                        (dream) =>
                          Number(dream.id) === Number(selectedAttempt.dreamId)
                      )
                    
                      return linkedDream ? (
                        <div>
                          <p>
                            <strong>{linkedDream.title || 'Rêve sans titre'}</strong>
                          </p>
                      
                          <p>
                            {linkedDream.date
                              ? new Date(
                                  `${linkedDream.date}T12:00:00`
                                ).toLocaleDateString('fr-FR')
                              : 'Date non renseignée'}
                          </p>
                              
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => {
                              setSelectedAttempt(null)
                              navigate(`/reves/${linkedDream.id}`)
                            }}
                          >
                            Voir le rêve →
                          </button>
                        </div>
                      ) : (
                        <p className="attempt-detail-muted">
                          Le rêve associé n'a pas été retrouvé.
                        </p>
                      )
                    })()
                  ) : (
                    <p className="attempt-detail-muted">
                      Cette tentative n'est associée à aucun rêve.
                    </p>
                  )}
                </section>
              </div>
            </div>

            <div className="techniques-preview-actions">
              <button
                type="button"
                className="techniques-edit-button"
                onClick={() => openEditAttempt(selectedAttempt)}
                title="Modifier cette tentative"
                aria-label="Modifier cette tentative"
              >
                ✎
              </button>

              <button
                type="button"
                className="techniques-delete-button"
                onClick={handleDelete}
                title="Supprimer cette tentative"
                aria-label="Supprimer cette tentative"
              >
                🗑
              </button>
            </div>
          </section>
        </div>
      )}

      {showForm && (
        <div className="technique-overlay" onClick={closeForm}>
          <form
            className="technique-modal technique-form attempt-edit-form"
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <div className="technique-modal-header">
              <h2>
                {editingAttempt
                  ? 'Modifier la tentative'
                  : 'Nouvelle tentative'}
              </h2>

              <button
                type="button"
                className="technique-close"
                onClick={closeForm}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {error && (
              <p className="attempt-error" role="alert">
                {error}
              </p>
            )}

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
                  rows="3"
                />
              </label>

              <label className="attempt-field attempt-field-full">
                Déroulement
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
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
                  rows="3"
                />
              </label>
            </div>

            <div className="attempt-form-actions">
              <button
                type="submit"
                className="attempt-primary-button"
                disabled={saving || techniques.length === 0}
              >
                {saving
                  ? 'Enregistrement...'
                  : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}

export default TechniqueAttempts