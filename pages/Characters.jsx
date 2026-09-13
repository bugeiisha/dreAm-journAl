import { useEffect, useState } from 'react'
import {
  addCharacter,
  deleteCharacter,
  getAllCharacters,
} from '../src/db/dreamDatabase'
import './Characters.css'

const emptyCharacter = {
  name: '',
  nickname: '',
  apparentAge: '',
  job: '',
  appearance: '',
  notes: '',
  firstAppearanceDate: '',
  dreamIds: [],
  questIds: [],
}

function formatDate(date) {
  if (!date) return '—'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function Characters() {
  const [characters, setCharacters] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedCharacter, setSelectedCharacter] =
    useState(null)
  const [form, setForm] = useState(emptyCharacter)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadCharacters()
  }, [])

  async function loadCharacters() {
    try {
      const data = await getAllCharacters()
      setCharacters(data)
    } catch (error) {
      console.error(
        'Impossible de charger les personnages :',
        error,
      )
    }
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function openNewCharacter() {
    setForm(emptyCharacter)
    setSelectedCharacter(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setForm(emptyCharacter)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      return
    }

    const character = {
      ...form,
      name: form.name.trim(),
      nickname: form.nickname.trim(),
      apparentAge: form.apparentAge.trim(),
      job: form.job.trim(),
      appearance: form.appearance.trim(),
      notes: form.notes.trim(),
    }

    try {
      const id = await addCharacter(character)

      const savedCharacter = {
        ...character,
        id,
      }

      setCharacters((current) =>
        [...current, savedCharacter].sort((a, b) =>
          a.name.localeCompare(b.name, 'fr'),
        ),
      )

      setSelectedCharacter(savedCharacter)
      closeForm()
    } catch (error) {
      console.error(
        'Impossible de créer le personnage :',
        error,
      )
    }
  }

  async function handleDelete(character) {
    const confirmed = window.confirm(
      `Supprimer définitivement "${
        character.name || 'ce personnage'
      }" ?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteCharacter(character.id)

      setCharacters((current) =>
        current.filter(
          (item) => item.id !== character.id,
        ),
      )

      setSelectedCharacter(null)
    } catch (error) {
      console.error(
        'Impossible de supprimer le personnage :',
        error,
      )
    }
  }

  const filteredCharacters = characters.filter(
    (character) => {
      const query = search.toLowerCase().trim()

      if (!query) {
        return true
      }

      return [
        character.name,
        character.nickname,
        character.job,
        character.appearance,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query),
        )
    },
  )

  if (selectedCharacter) {
    return (
      <main className="characters-page">
        <div className="character-detail-page">
          <button
            type="button"
            className="character-back-button"
            onClick={() =>
              setSelectedCharacter(null)
            }
          >
            ←
            <span>Characters</span>
          </button>

          <div className="character-id-card">
            <div className="character-card-header">
              <div className="character-avatar">
                {selectedCharacter.name
                  ?.charAt(0)
                  .toUpperCase() || '?'}
              </div>

              <div>
                <span className="character-eyebrow">
                  PERSONNAGE DE RÊVE
                </span>

                <h2>{selectedCharacter.name}</h2>

                {selectedCharacter.nickname && (
                  <p>
                    « {selectedCharacter.nickname} »
                  </p>
                )}
              </div>
            </div>

            <div className="character-fields">
              {selectedCharacter.apparentAge && (
                <div className="character-field">
                  <span>Âge apparent</span>
                  <strong>
                    {selectedCharacter.apparentAge}
                  </strong>
                </div>
              )}

              {selectedCharacter.job && (
                <div className="character-field">
                  <span>Métier</span>
                  <strong>
                    {selectedCharacter.job}
                  </strong>
                </div>
              )}

              {selectedCharacter.appearance && (
                <div className="character-field">
                  <span>Apparence</span>
                  <strong>
                    {selectedCharacter.appearance}
                  </strong>
                </div>
              )}
            </div>

            {selectedCharacter.notes && (
              <div className="character-notes">
                <span>Notes</span>
                <p>{selectedCharacter.notes}</p>
              </div>
            )}

            <div className="character-meta">
              <div>
                <span>Première apparition</span>
                <strong>
                  {formatDate(
                    selectedCharacter.firstAppearanceDate,
                  )}
                </strong>
              </div>

              <div>
                <span>Apparitions</span>
                <strong>
                  {selectedCharacter.dreamIds?.length ||
                    0}
                </strong>
              </div>
            </div>

            <div className="character-future-section">
              <span>RÊVES ASSOCIÉS</span>
              <p>
                Les rêves liés à ce personnage
                apparaîtront ici.
              </p>
            </div>

            <div className="character-future-section">
              <span>QUÊTES IKＴOMI</span>
              <p>
                Les quêtes associées à ce personnage
                apparaîtront ici.
              </p>
            </div>

            <div className="character-actions">
              <button
                type="button"
                className="character-delete-button"
                onClick={() =>
                  handleDelete(selectedCharacter)
                }
              >
                🗑 Supprimer
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="characters-page">
      <header className="characters-header">
        <div>
          <span className="characters-eyebrow">
            TROMBINOSCOPE ONIRIQUE
          </span>

          <h2>Characters</h2>

          <p>
            Les personnages rencontrés dans tes rêves.
          </p>
        </div>

        <button
          type="button"
          className="character-add-button"
          onClick={openNewCharacter}
        >
          + <span>Nouveau PR</span>
        </button>
      </header>

      <div className="characters-toolbar">
        <div className="characters-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Rechercher un personnage..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>
      </div>

      <div className="characters-count">
        {filteredCharacters.length}{' '}
        {filteredCharacters.length > 1
          ? 'personnages'
          : 'personnage'}
      </div>

      {filteredCharacters.length === 0 ? (
        <div className="characters-empty">
          <div className="characters-empty-icon">
            ✦
          </div>

          <h3>
            {search
              ? 'Aucun personnage trouvé'
              : 'Aucun PR enregistré'}
          </h3>

          <p>
            {search
              ? 'Essaie avec un autre terme de recherche.'
              : 'Commence à créer ton premier personnage de rêve.'}
          </p>

          {!search && (
            <button
              type="button"
              onClick={openNewCharacter}
            >
              + Créer mon premier PR
            </button>
          )}
        </div>
      ) : (
        <div className="characters-grid">
          {filteredCharacters.map((character) => (
            <button
              type="button"
              className="character-list-card"
              key={character.id}
              onClick={() =>
                setSelectedCharacter(character)
              }
            >
              <div className="character-list-top">
                <div className="character-avatar small">
                  {character.name
                    ?.charAt(0)
                    .toUpperCase() || '?'}
                </div>

                <div className="character-list-title">
                  <h3>{character.name}</h3>

                  {character.nickname && (
                    <span>
                      « {character.nickname} »
                    </span>
                  )}
                </div>

                <span className="character-arrow">
                  →
                </span>
              </div>

              {character.job && (
                <div className="character-list-line">
                  <span>Métier</span>
                  <strong>{character.job}</strong>
                </div>
              )}

              {character.appearance && (
                <div className="character-list-line appearance">
                  <span>Apparence</span>
                  <strong>
                    {character.appearance}
                  </strong>
                </div>
              )}

              <div className="character-list-footer">
                <span>
                  {character.dreamIds?.length || 0}{' '}
                  apparition
                  {(character.dreamIds?.length || 0) !==
                  1
                    ? 's'
                    : ''}
                </span>

                {character.firstAppearanceDate && (
                  <span>
                    {formatDate(
                      character.firstAppearanceDate,
                    )}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="character-form-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm()
            }
          }}
        >
          <form
            className="character-form"
            onSubmit={handleSubmit}
          >
            <div className="character-form-header">
              <div>
                <span className="characters-eyebrow">
                  NOUVEAU PERSONNAGE
                </span>

                <h2>Créer un PR</h2>
              </div>

              <button
                type="button"
                className="character-close-button"
                onClick={closeForm}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="character-form-body">
              <label>
                <span>Prénom / nom *</span>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex. Tony"
                  autoFocus
                  required
                />
              </label>

              <label>
                <span>Surnom</span>

                <input
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  placeholder="Optionnel"
                />
              </label>

              <label>
                <span>Âge apparent</span>

                <input
                  name="apparentAge"
                  value={form.apparentAge}
                  onChange={handleChange}
                  placeholder="Ex. environ 30 ans"
                />
              </label>

              <label>
                <span>Métier</span>

                <input
                  name="job"
                  value={form.job}
                  onChange={handleChange}
                  placeholder="Ex. étudiant"
                />
              </label>

              <label>
                <span>Apparence</span>

                <input
                  name="appearance"
                  value={form.appearance}
                  onChange={handleChange}
                  placeholder="Ex. cheveux bruns, lunettes..."
                />
              </label>

              <label>
                <span>Première apparition</span>

                <input
                  type="date"
                  name="firstAppearanceDate"
                  value={
                    form.firstAppearanceDate
                  }
                  onChange={handleChange}
                />
              </label>

              <label>
                <span>Notes</span>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Informations supplémentaires..."
                  rows="4"
                />
              </label>
            </div>

            <div className="character-form-actions">
              <button
                type="button"
                className="character-cancel-button"
                onClick={closeForm}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="character-save-button"
              >
                Créer le PR
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}