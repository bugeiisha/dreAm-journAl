import { useEffect, useState } from 'react'
import {
  getAllTechniques,
  addTechnique,
  updateTechnique,
  deleteTechnique
} from '../src/db/dreamDatabase'
import './Techniques.css'

const emptyTechnique = {
  name: '',
  category: '',
  description: '',
  notes: '',
}

function Techniques() {
  const [techniques, setTechniques] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTechnique, setEditingTechnique] = useState(null)
  const [selectedTechnique, setSelectedTechnique] = useState(null)
  const [form, setForm] = useState(emptyTechnique)
  const [search, setSearch] = useState('')

  async function loadTechniques() {
    const data = await getAllTechniques()
    setTechniques(data)
  }

  useEffect(() => {
    loadTechniques()
  }, [])

  function openNewTechnique() {
    setEditingTechnique(null)
    setForm(emptyTechnique)
    setShowForm(true)
  }

  function openEditTechnique(technique) {
    setEditingTechnique(technique)
    setForm({
      ...emptyTechnique,
      ...technique,
    })
    setSelectedTechnique(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingTechnique(null)
    setForm(emptyTechnique)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const name = form.name.trim()

    if (!name) return

    const technique = {
      ...form,
      name,
      category: form.category.trim(),
      description: form.description.trim(),
      notes: form.notes.trim(),
    }

    if (editingTechnique) {
      await updateTechnique({
        ...technique,
        id: editingTechnique.id,
      })
    } else {
      await addTechnique(technique)
    }

    await loadTechniques()
    closeForm()
  }
  async function handleDelete() {
      if (!selectedTechnique) return

      const confirmed = window.confirm(
        `Supprimer la technique « ${selectedTechnique.name} » ?`
      )

      if (!confirmed) return

      await deleteTechnique(selectedTechnique.id)
      setSelectedTechnique(null)
      await loadTechniques()
    }

  const filteredTechniques = techniques.filter((technique) =>
    `${technique.name} ${technique.category} ${technique.description}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  )

  return (
    <div className="techniques-page">
      <div className="techniques-layout">
          <div className="techniques-left">
              <div className="techniques-header">
                <span className="techniques-eyebrow">
                  JOURNAL ONIRIQUE
                </span>
                <h2>Techniques</h2>
                <p>
                  Recense tes techniques et observe ce que tu apprends
                  au fil de tes expériences.
                </p>
                <div className="techniques-toolbar">
                  <input
                    type="text"
                    placeholder="Rechercher une technique..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="technique-search"
                  />
                  <button
                    className="techniques-primary-button"
                    onClick={openNewTechnique}
                  >
                    + Nouvelle technique
                  </button>
                </div>
              </div>
              <h2 className="techniques-count">
                Techniques ({filteredTechniques.length})
              </h2>
              {filteredTechniques.length === 0 ? (
                <div className="techniques-empty">
                  <h3>
                    {search
                      ? 'Aucune technique trouvée'
                      : 'Ton catalogue est vide'}
                  </h3>
                  <p>
                    {search
                      ? 'Essaie un autre terme de recherche.'
                      : 'Ajoute une technique pour commencer à suivre tes expériences.'}
                  </p>
                </div>
              ) : (
                <div className="techniques-grid">
                  {filteredTechniques.map((technique) => (
                    <button
                      type="button"
                      key={technique.id}
                      className="technique-card"
                      onClick={() => setSelectedTechnique(technique)}
                    >
                      {technique.category && (
                        <span className="technique-category">
                          {technique.category}
                        </span>
                      )}
                      <h3>{technique.name}</h3>
                      <p>
                        {technique.description ||
                          'Aucune description pour le moment.'}
                      </p>
                      <span className="technique-card-action">
                        Voir la fiche →
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {selectedTechnique && (
                <div
                  className="technique-overlay"
                  onClick={() => setSelectedTechnique(null)}
                >
                  <div
                    className="technique-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="technique-modal-header">
                      <div>
                        <span className="techniques-eyebrow">
                          FICHE TECHNIQUE
                        </span>
                        <h2>{selectedTechnique.name}</h2>
                      </div>
                      <button
                        type="button"
                        className="technique-close"
                        onClick={() => setSelectedTechnique(null)}
                        aria-label="Fermer"
                      >
                        ×
                      </button>
                    </div>
                    {selectedTechnique.category && (
                      <p>
                        <strong>Catégorie :</strong>{' '}
                        {selectedTechnique.category}
                      </p>
                    )}
                    <h3>Description</h3>
                    <p>
                      {selectedTechnique.description ||
                        'Aucune description enregistrée.'}
                    </p>
                    <h3>Mes notes</h3>
                    <p>
                      {selectedTechnique.notes ||
                        'Aucune note pour le moment.'}
                    </p>
                    <div className="techniques-preview-actions">
                      <button
                        className="techniques-edit-button"
                        onClick={() => {
                          setEditingTechnique(selectedTechnique)
                          setForm({
                            name: selectedTechnique.name || '',
                            category: selectedTechnique.category || '',
                            description: selectedTechnique.description || '',
                            notes: selectedTechnique.notes || ''
                          })
                          setSelectedTechnique(null)
                          setShowForm(true)
                        }}
                        aria-label="Modifier cette technique"
                        title="Modifier cette technique"
                      >
                        ✎
                      </button>
                    
                      <button
                        className="techniques-delete-button"
                        onClick={handleDelete}
                        aria-label="Supprimer cette technique"
                        title="Supprimer cette technique"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showForm && (
                <div
                  className="technique-overlay"
                  onClick={closeForm}
                >
                  <form
                    className="technique-modal technique-form"
                    onClick={(e) => e.stopPropagation()}
                    onSubmit={handleSubmit}
                  >
                    <div className="technique-modal-header">
                      <h2>
                        {editingTechnique
                          ? 'Modifier la technique'
                          : 'Nouvelle technique'}
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
                    <label>
                      Nom *
                      <input
                        required
                        autoFocus
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Ex. SSILD"
                      />
                    </label>
                    <label>
                      Catégorie
                      <input
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                        placeholder="Ex. Induction"
                      />
                    </label>
                    <label>
                      Description
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            description: e.target.value,
                          })
                        }
                        placeholder="Comment fonctionne cette technique ?"
                      />
                    </label>
                    <label>
                      Mes notes
                      <textarea
                        value={form.notes}
                        onChange={(e) =>
                          setForm({ ...form, notes: e.target.value })
                        }
                        placeholder="Mes observations, adaptations..."
                      />
                    </label>
                    
                      <button
                        type="submit"
                        className="technique-save-button"
                      >
                        Enregistrer
                      </button>
                    
                  </form>
                </div>
              )}
          </div>
      </div>
    </div>
  )
}

export default Techniques