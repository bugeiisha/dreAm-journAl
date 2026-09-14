import { useEffect, useMemo, useState } from 'react'
import { addNote, deleteNote, getAllNotes, updateNote } from '../src/db/dreamDatabase'
import './Notes.css'

const CATEGORIES = [
  'Recherches',
  'Objectifs',
  'Idées / envies',
  'Techniques',
  'Ressources',
  'À tester',
]

const emptyNote = {
  title: '',
  content: '',
  category: 'Recherches',
  pinned: false,
}

function formatDate(date) {
  if (!date) return ''

  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getPreview(content) {
  if (!content) return 'Aucun contenu'

  const clean = content.replace(/\s+/g, ' ').trim()

  return clean.length > 120
    ? `${clean.slice(0, 120)}…`
    : clean
}

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Toutes')

  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  const [form, setForm] = useState(emptyNote)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [mobilePreview, setMobilePreview] = useState(false)

  // =========================
  // CHARGEMENT
  // =========================

  async function loadNotes() {
    try {
      setLoading(true)

      const data = await getAllNotes()

      const sorted = [...data].sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1
        }

        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })

      setNotes(sorted)

      // Si une note était sélectionnée, on la remet à jour
      if (selectedNote) {
        const updatedSelected = sorted.find(
          (note) => note.id === selectedNote.id,
        )

        setSelectedNote(updatedSelected || null)
      }
    } catch (err) {
      console.error(err)
      setError('Impossible de charger les notes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [])

  // =========================
  // FILTRES
  // =========================

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase()

    return notes.filter((note) => {
      const matchesCategory =
        categoryFilter === 'Toutes' ||
        note.category === categoryFilter

      const matchesSearch =
        !query ||
        note.title?.toLowerCase().includes(query) ||
        note.content?.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [notes, search, categoryFilter])

  // =========================
  // NOUVELLE NOTE
  // =========================

  function openNewNote() {
    setEditingNote(null)

    setForm({
      ...emptyNote,
      category:
        categoryFilter !== 'Toutes'
          ? categoryFilter
          : 'Recherches',
    })

    setShowForm(true)
    setError('')
  }

  // =========================
  // MODIFICATION
  // =========================

  function openEditNote(note) {
    setEditingNote(note)

    setForm({
      title: note.title || '',
      content: note.content || '',
      category: note.category || 'Recherches',
      pinned: Boolean(note.pinned),
    })

    setShowForm(true)
    setError('')
  }

  // =========================
  // FORMULAIRE
  // =========================

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Le titre est obligatoire.')
      return
    }

    try {
      setError('')

      const now = new Date().toISOString()

      if (editingNote) {
        const updated = {
          ...editingNote,
          ...form,
          title: form.title.trim(),
          content: form.content.trim(),
          updatedAt: now,
        }

        await updateNote(updated)
      } else {
        const newNote = {
          ...form,
          title: form.title.trim(),
          content: form.content.trim(),
          createdAt: now,
          updatedAt: now,
        }

        const id = await addNote(newNote)

        setSelectedNote({
          ...newNote,
          id,
        })
      }

      setShowForm(false)
      setEditingNote(null)

      await loadNotes()
    } catch (err) {
      console.error(err)
      setError('Impossible d’enregistrer la note.')
    }
  }

  // =========================
  // SUPPRESSION
  // =========================

  async function handleDelete(note) {
    const confirmed = window.confirm(
      `Supprimer la note « ${note.title} » ?`,
    )

    if (!confirmed) return

    try {
      await deleteNote(note.id)

      if (selectedNote?.id === note.id) {
        setSelectedNote(null)
      }

      await loadNotes()
    } catch (err) {
      console.error(err)
      setError('Impossible de supprimer la note.')
    }
  }

  // =========================
  // EPINGLER
  // =========================

  async function togglePinned(note) {
    try {
      const updated = {
        ...note,
        pinned: !note.pinned,
        updatedAt: new Date().toISOString(),
      }

      await updateNote(updated)

      setSelectedNote(updated)

      await loadNotes()
    } catch (err) {
      console.error(err)
      setError('Impossible de modifier la note.')
    }
  }

  return (
    <div className="notes-page">
      {/* =========================
          HEADER
      ========================= */}

      <header className="notes-header">
        <div>
          <h1>Notes</h1>
          <p>
            Tes recherches, objectifs, idées et réflexions.
          </p>
        </div>

        <button
          className="notes-add-button"
          onClick={openNewNote}
        >
          <span>＋</span>
          Nouvelle note
        </button>
        <button
          className="notes-add-button"
          id='notes-add-btn'
          onClick={openNewNote}
        >
          <span>＋</span>
        </button>
      </header>

      {/* =========================
          BARRE DE RECHERCHE
      ========================= */}

      <div className="notes-toolbar">
        <div className="notes-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Rechercher dans tes notes..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="notes-category-filter">
          <button
            className={
              categoryFilter === 'Toutes'
                ? 'active'
                : ''
            }
            onClick={() =>
              setCategoryFilter('Toutes')
            }
          >
            Toutes
          </button>

          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={
                categoryFilter === category
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setCategoryFilter(category)
              }
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="notes-error">
          {error}
        </div>
      )}

      {/* =========================
          CONTENU
      ========================= */}

      <div className="notes-content">
        {/* LISTE */}

        <section className="notes-list-panel">
          <div className="notes-list-header">
            <span>
              {filteredNotes.length}{' '}
              {filteredNotes.length > 1
                ? 'notes'
                : 'note'}
            </span>
          </div>

          {loading ? (
            <div className="notes-empty">
              Chargement...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="notes-empty">
              <div className="notes-empty-icon">
                ✦
              </div>

              <h3>
                {notes.length === 0
                  ? 'Aucune note'
                  : 'Aucun résultat'}
              </h3>

              <p>
                {notes.length === 0
                  ? 'Commence à noter tes recherches, objectifs ou idées.'
                  : 'Essaie une autre recherche ou catégorie.'}
              </p>

              {notes.length === 0 && (
                <button
                  onClick={openNewNote}
                  className="notes-empty-button"
                >
                  Créer ma première note
                </button>
              )}
            </div>
          ) : (
            <div className="notes-list">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  className={`note-card ${
                    selectedNote?.id === note.id
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedNote(note)
                    setMobilePreview(true)
                  }}
                >
                  <div className="note-card-top">
                    <span className="note-category">
                      {note.category}
                    </span>

                    {note.pinned && (
                      <span
                        className="note-pin"
                        title="Note épinglée"
                      >
                        📌
                      </span>
                    )}
                  </div>

                  <h3>{note.title}</h3>

                  <p>
                    {getPreview(note.content)}
                  </p>

                  <span className="note-date">
                    Modifiée le{' '}
                    {formatDate(note.updatedAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* APERÇU */}

        <section className={`notes-preview-panel ${
            mobilePreview ? 'mobile-preview-open' : ''
        }`}>
        {!selectedNote ? (
            <div className="notes-preview-empty">
              <div className="notes-preview-icon">
                ✦
              </div>

              <h2>Sélectionne une note</h2>

              <p>
                Choisis une note dans la liste pour
                afficher son contenu.
              </p>
            </div>
          ) : (
            <>
            <button className="mobile-note-back" onClick={() => setMobilePreview(false)}>
                ← Retour aux notes
            </button>
            <article className="note-preview">
              <div className="note-preview-header">
                <div>
                  <span className="note-preview-category">
                    {selectedNote.category}
                  </span>

                  <h2>{selectedNote.title}</h2>

                  <span className="note-preview-date">
                    Modifiée le{' '}
                    {formatDate(
                      selectedNote.updatedAt,
                    )}
                  </span>
                </div>

                <div className="note-preview-actions">
                  <button
                    onClick={() =>
                      togglePinned(selectedNote)
                    }
                    title={
                      selectedNote.pinned
                        ? 'Désépingler'
                        : 'Épingler'
                    }
                  >
                    {selectedNote.pinned
                      ? '📌'
                      : '☆'}
                  </button>

                  <button
                    onClick={() =>
                      openEditNote(selectedNote)
                    }
                    title="Modifier"
                  >
                    ✎
                  </button>

                  <button
                    className="delete"
                    onClick={() =>
                      handleDelete(selectedNote)
                    }
                    title="Supprimer"
                  >
                    🗑
                  </button>
                </div>
              </div>

              <div className="note-preview-content">
                {selectedNote.content ? (
                  selectedNote.content
                    .split('\n')
                    .map((paragraph, index) => (
                      <p key={index}>
                        {paragraph || '\u00A0'}
                      </p>
                    ))
                ) : (
                  <p className="empty-content">
                    Cette note ne contient encore
                    aucun texte.
                  </p>
                )}
              </div>
            </article>
            </>
          )}
        </section>
      </div>

      {/* =========================
          FORMULAIRE
      ========================= */}

      {showForm && (
        <div
          className="notes-form-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setShowForm(false)
            }
          }}
        >
          <form
            className="notes-form"
            onSubmit={handleSubmit}
          >
            <div className="notes-form-header">
              <div>
                <span>
                  {editingNote
                    ? 'MODIFIER'
                    : 'NOUVELLE NOTE'}
                </span>

                <h2>
                  {editingNote
                    ? 'Modifier la note'
                    : 'Créer une note'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>
            </div>

            <label>
              Titre
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex. Technique MILD"
                autoFocus
              />
            </label>

            <label>
              Catégorie
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Contenu
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Écris tes recherches, idées, objectifs..."
                rows="12"
              />
            </label>

            <label className="notes-pin-checkbox">
              <input
                type="checkbox"
                name="pinned"
                checked={form.pinned}
                onChange={handleChange}
              />

              <span>
                Épingler cette note
              </span>
            </label>

            {error && (
              <div className="notes-form-error">
                {error}
              </div>
            )}

            <div className="notes-form-actions">
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Annuler
              </button>

              <button
                type="submit"
                className="primary"
              >
                {editingNote
                  ? 'Enregistrer'
                  : 'Créer la note'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}