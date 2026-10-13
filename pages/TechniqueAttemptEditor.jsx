import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getAllTechniqueAttempts,
  getAllTechniques,
  updateTechniqueAttempt,
  deleteTechniqueAttempt,
} from '../src/db/dreamDatabase'
import './TechniqueAttemptEditor.css'

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

function TechniqueAttemptEditor() {
  const { attemptId } = useParams()
  const navigate = useNavigate()

  const [techniques, setTechniques] = useState([])
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [allAttempts, allTechniques] = await Promise.all([
          getAllTechniqueAttempts(),
          getAllTechniques(),
        ])

        const attempt = allAttempts.find(
          (item) => Number(item.id) === Number(attemptId),
        )

        setTechniques(allTechniques)

        if (!attempt) {
          setError('Cette tentative est introuvable.')
          return
        }

        setForm({
          ...attempt,
          techniqueId: String(attempt.techniqueId ?? ''),
          date: attempt.date ?? '',
          durationMinutes: attempt.durationMinutes ?? '',
          conditions: attempt.conditions ?? '',
          description: attempt.description ?? '',
          notes: attempt.notes ?? '',
          techniqueResult: attempt.techniqueResult ?? 'completed',
          dreamResult: attempt.dreamResult ?? 'none',
        })
      } catch (err) {
        console.error('Erreur de chargement :', err)
        setError('Impossible de charger cette tentative.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [attemptId])

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

    if (!form.techniqueId || !form.date) {
      setError('La technique et la date sont obligatoires.')
      return
    }

    setSaving(true)

    try {
      await updateTechniqueAttempt({
        ...form,
        id: Number(attemptId),
        techniqueId: Number(form.techniqueId),
        durationMinutes:
          form.durationMinutes === ''
            ? null
            : Number(form.durationMinutes),
      })

      navigate('/technique-attempts')
    } catch (err) {
      console.error('Erreur de sauvegarde :', err)
      setError('Impossible d’enregistrer les modifications.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Supprimer définitivement cette tentative ? Cette action est irréversible.',
    )

    if (!confirmed) return

    try {
      await deleteTechniqueAttempt(Number(attemptId))
      navigate('/technique-attempts')
    } catch (err) {
      console.error('Erreur de suppression :', err)
      setError('Impossible de supprimer cette tentative.')
    }
  }

  if (loading) {
    return <main className="attempt-editor-page">Chargement...</main>
  }

  if (!form) {
    return (
      <main className="attempt-editor-page">
        <p className="attempt-editor-error">
          {error || 'Tentative introuvable.'}
        </p>
        <button
          type="button"
          className="attempt-editor-secondary"
          onClick={() => navigate('/technique-attempts')}
        >
          Retour au journal
        </button>
      </main>
    )
  }

  return (
    <main className="attempt-editor-page">
      <header className="attempt-editor-header">
        <div>
          <h1>Détail de la tentative</h1>
          <p>Consulte et modifie les informations de cet essai.</p>
        </div>

        <button
          type="button"
          className="attempt-editor-secondary"
          onClick={() => navigate('/technique-attempts')}
        >
          ← Retour au journal
        </button>
      </header>

      {error && (
        <p className="attempt-editor-error" role="alert">
          {error}
        </p>
      )}

      <form className="attempt-editor-card" onSubmit={handleSubmit}>
        <div className="attempt-editor-grid">
          <label className="attempt-editor-field">
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

          <label className="attempt-editor-field">
            Date *
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="attempt-editor-field">
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

          <label className="attempt-editor-field">
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

          <label className="attempt-editor-field attempt-editor-full">
            Conditions de la tentative
            <textarea
              name="conditions"
              value={form.conditions}
              onChange={handleChange}
              rows="3"
            />
          </label>

          <label className="attempt-editor-field attempt-editor-full">
            Déroulement
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
            />
          </label>

          <label className="attempt-editor-field attempt-editor-full">
            Notes libres
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="4"
            />
          </label>

          <label className="attempt-editor-field attempt-editor-full">
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
        </div>

        <div className="attempt-editor-actions">
          <button
            type="button"
            className="attempt-editor-delete"
            onClick={handleDelete}
          >
            Supprimer
          </button>

          <button
            type="submit"
            className="attempt-editor-save"
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default TechniqueAttemptEditor