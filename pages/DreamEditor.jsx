import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, } from 'react-router-dom'
import { addDream, getAllDreams, getDream, updateDream as updateSavedDream,  getAllQuests } from '../src/db/dreamDatabase'

import './DreamEditor.css'

function createInitialDream() {
  return {
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    content: '',
    mood: 0,
    lucid: false,
    lucidityLevel: 0,
    recurring: false,
    sleepParalysis: false,
    falseAwakening: false,
    nightmare: false,
    characters: [],
    places: [],
    objects: [],
    other: [],
    linkedQuests: [],
    notes: '',
    image: null,
  }
}

/* =========================
   CONSTRUCTION DE LA
   BIBLIOTHÈQUE DE TAGS
========================= */

function getTagLibrary(dreams) {
  const categories = [
    'characters',
    'places',
    'objects',
    'other',
  ]

  const library = {
    characters: [],
    places: [],
    objects: [],
    other: [],
  }

  categories.forEach((category) => {
    const uniqueTags = new Map()

    dreams.forEach((dream) => {
      const tags = dream[category] || []

      tags.forEach((tag) => {
        const cleanTag = tag.trim()

        if (!cleanTag) return

        const normalized =
          cleanTag.toLowerCase()

        if (!uniqueTags.has(normalized)) {
          uniqueTags.set(
            normalized,
            cleanTag,
          )
        }
      })
    })

    library[category] = Array.from(
      uniqueTags.values(),
    ).sort((a, b) =>
      a.localeCompare(b, 'fr'),
    )
  })

  return library
}

function DreamEditor() {
  const navigate = useNavigate()
  const { dreamId } = useParams()

  const isEditing = Boolean(dreamId)

  const [dream, setDream] = useState(
    createInitialDream(),
  )
  const [allQuests, setAllQuests] = useState([])
  useEffect(() => {
  async function loadQuests() {
    const quests = await getAllQuests()
    setAllQuests(quests)
  }

  loadQuests()
}, [])


  const [isLoading, setIsLoading] = useState(
    isEditing,
  )

  const [isSaving, setIsSaving] = useState(false)

  const [tagInputs, setTagInputs] = useState({
    characters: '',
    places: '',
    objects: '',
    other: '',
  })

  const [tagLibrary, setTagLibrary] = useState({
    characters: [],
    places: [],
    objects: [],
    other: [],
  })

  /* =========================
     CHARGEMENT DU RÊVE
  ========================= */

  useEffect(() => {
    if (!dreamId) return

    async function loadDream() {
      try {
        const savedDream = await getDream(dreamId)

        if (!savedDream) {
          navigate('/reves')
          return
        }

        setDream({
          ...createInitialDream(),
          ...savedDream,
        })
      } catch (error) {
        console.error(
          'Erreur lors du chargement du rêve :',
          error,
        )

        navigate('/reves')
      } finally {
        setIsLoading(false)
      }
    }

    loadDream()
  }, [dreamId, navigate])

  /* =========================
     CHARGEMENT DES TAGS
  ========================= */

  useEffect(() => {
    async function loadTagLibrary() {
      try {
        const savedDreams =
          await getAllDreams()

        setTagLibrary(
          getTagLibrary(savedDreams),
        )
      } catch (error) {
        console.error(
          'Erreur lors du chargement des tags :',
          error,
        )
      }
    }

    loadTagLibrary()
  }, [])

  /* =========================
     MODIFICATION DES DONNÉES
  ========================= */

  const updateDream = (field, value) => {
    setDream((currentDream) => ({
      ...currentDream,
      [field]: value,
    }))
  }

  const toggleLucid = () => {
  setDream((currentDream) => {
    const nextLucid = !currentDream.lucid

    return {
      ...currentDream,
      lucid: nextLucid,
      lucidityLevel: nextLucid
        ? currentDream.lucidityLevel || 1
        : 0,
    }
  })
}
  /* =========================
     QUEST
  ========================= */
function toggleQuest(questId) {
  setDream((prev) => ({
    ...prev,
    linkedQuests: prev.linkedQuests.includes(questId)
      ? prev.linkedQuests.filter(id => id !== questId)
      : [...prev.linkedQuests, questId]
  }))
}

  /* =========================
     TAGS
  ========================= */

  const addTag = (category, tagValue) => {
    const value = (
      tagValue ??
      tagInputs[category]
    ).trim()

    if (!value) return

    const currentTags =
      dream[category] || []

    const tagAlreadyExists =
      currentTags.some(
        (tag) =>
          tag.toLowerCase() ===
          value.toLowerCase(),
      )

    if (tagAlreadyExists) {
      setTagInputs((current) => ({
        ...current,
        [category]: '',
      }))

      return
    }

    updateDream(category, [
      ...currentTags,
      value,
    ])

    setTagInputs((current) => ({
      ...current,
      [category]: '',
    }))
  }

  const removeTag = (
    category,
    tagToRemove,
  ) => {
    const currentTags =
      dream[category] || []

    updateDream(
      category,
      currentTags.filter(
        (tag) => tag !== tagToRemove,
      ),
    )
  }

  const handleTagKeyDown = (
    event,
    category,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault()

      addTag(category)
    }
  }

  /* =========================
     IMAGE
  ========================= */

  const handleImage = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    updateDream('image', {
      name: file.name,
      type: file.type,
      file,
    })
  }

  const removeImage = () => {
    updateDream('image', null)
  }

  /* =========================
     SAUVEGARDE
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault()

    setIsSaving(true)

    try {
      if (isEditing) {
        await updateSavedDream(dream)
      } else {
        await addDream(dream)
      }

      navigate('/reves')
    } catch (error) {
      console.error(
        'Erreur lors de la sauvegarde du rêve :',
        error,
      )

      alert(
        'Une erreur est survenue pendant la sauvegarde du rêve.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  /* =========================
     CHARGEMENT
  ========================= */

  if (isLoading) {
    return (
      <div className="editor-loading">
        Chargement du rêve...
      </div>
    )
  }

  return (
    <div className="dream-editor-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate('/reves')}
      >
        ← Retour aux rêves
      </button>

      <header className="editor-header">
        <div>
          <span className="page-eyebrow">
            {isEditing
              ? 'MODIFICATION'
              : 'NOUVEAU RÊVE'}
          </span>

          <h2>
            {isEditing
              ? 'Modifier le rêve'
              : 'Ajouter un rêve'}
          </h2>

          <p>
            {isEditing
              ? 'Modifie les détails de ton aventure nocturne.'
              : 'Garde une trace de ton aventure avant que les détails ne disparaissent.'}
          </p>
        </div>
      </header>

      <form
        className="dream-form"
        onSubmit={handleSubmit}
      >
        {/* =========================
            INFORMATIONS PRINCIPALES
        ========================= */}

        <section className="form-section">
          <label
            className="form-label"
            htmlFor="dream-title"
          >
            Titre
          </label>

          <input
            id="dream-title"
            className="form-input dream-title-input"
            type="text"
            placeholder="Donne un titre à ton rêve..."
            value={dream.title}
            onChange={(event) =>
              updateDream(
                'title',
                event.target.value,
              )
            }
          />

          <div className="date-time-grid">
            <div>
              <label
                className="form-label"
                htmlFor="dream-date"
              >
                Date
              </label>

              <input
                id="dream-date"
                className="form-input"
                type="date"
                value={dream.date}
                onChange={(event) =>
                  updateDream(
                    'date',
                    event.target.value,
                  )
                }
              />
            </div>

            <div>
              <label
                className="form-label"
                htmlFor="dream-time"
              >
                Heure approximative
              </label>

              <input
                id="dream-time"
                className="form-input"
                type="time"
                value={dream.time || ''}
                onChange={(event) =>
                  updateDream(
                    'time',
                    event.target.value,
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* =========================
            RÉCIT
        ========================= */}

        <section className="form-section">
          <label
            className="form-label"
            htmlFor="dream-content"
          >
            Récit du rêve
          </label>

          <textarea
            id="dream-content"
            className="form-textarea"
            placeholder="Raconte tout ce dont tu te souviens..."
            value={dream.content}
            onChange={(event) =>
              updateDream(
                'content',
                event.target.value,
              )
            }
          />
        </section>

        {/* =========================
            MOOD
        ========================= */}

        <section className="form-section mood-section">
          <div className="form-section-header">
            <div>
              <span className="form-label">
                Mood
              </span>

              <p>
                Comment t'es-tu sentie pendant ou
                après ce rêve ?
              </p>
            </div>

            <span
              className={`mood-value ${
                dream.mood > 0
                  ? 'positive'
                  : dream.mood < 0
                    ? 'negative'
                    : ''
              }`}
            >
              {dream.mood > 0 ? '+' : ''}
              {dream.mood}
            </span>
          </div>

          <div className="mood-slider-container">
            <span>−100</span>

            <input
              className="mood-slider"
              type="range"
              min="-100"
              max="100"
              value={dream.mood}
              onChange={(event) =>
                updateDream(
                  'mood',
                  Number(event.target.value),
                )
              }
            />

            <span>+100</span>
          </div>
        </section>

        {/* =========================
            CARACTÉRISTIQUES
        ========================= */}

        <section className="form-section">
          <span className="form-label">
            Caractéristiques
          </span>

          <p className="section-description">
            Sélectionne tout ce qui correspond
            à ce rêve.
          </p>

          <div className="characteristics-grid">
            <ToggleButton
              icon="☾"
              label="Lucide"
              active={dream.lucid}
              onClick={toggleLucid}
            />
            {dream.lucid && (
              <div className="lucidity-levels">
                <div className="lucidity-levels-header">
                  <span className="lucidity-levels-title">
                    Degré de lucidité
                  </span>

                  <span className="lucidity-level-value">
                    Niveau {dream.lucidityLevel || 1}
                  </span>
                </div>

                <div className="lucidity-level-options">
                  <LucidityLevelButton
                    level={1}
                    title="Conscience"
                    description="Je sais que je rêve, mais je ne peux pas vraiment agir sur le déroulement du rêve."
                    active={dream.lucidityLevel === 1}
                    onClick={() =>
                      updateDream(
                        'lucidityLevel',
                        1,
                      )
                    }
                  />

                  <LucidityLevelButton
                    level={2}
                    title="Contrôle partiel"
                    description="Je peux influencer certaines choses, mais une partie du rêve reste automatique."
                    active={dream.lucidityLevel === 2}
                    onClick={() =>
                      updateDream(
                        'lucidityLevel',
                        2,
                      )
                    }
                  />

                  <LucidityLevelButton
                    level={3}
                    title="Pleins pouvoirs"
                    description="Je contrôle librement mes actions et le déroulement du rêve."
                    active={dream.lucidityLevel === 3}
                    onClick={() =>
                      updateDream(
                        'lucidityLevel',
                        3,
                      )
                    }
                  />
                </div>
              </div>
            )}

            <ToggleButton
              icon="↻"
              label="Récurrent"
              active={dream.recurring}
              onClick={() =>
                updateDream(
                  'recurring',
                  !dream.recurring,
                )
              }
            />

            <ToggleButton
              icon="◉"
              label="Paralysie du sommeil"
              active={dream.sleepParalysis}
              onClick={() =>
                updateDream(
                  'sleepParalysis',
                  !dream.sleepParalysis,
                )
              }
            />

            <ToggleButton
              icon="◌"
              label="Faux éveil"
              active={dream.falseAwakening}
              onClick={() =>
                updateDream(
                  'falseAwakening',
                  !dream.falseAwakening,
                )
              }
            />

            <ToggleButton
              icon="⚠"
              label="Cauchemar"
              active={dream.nightmare}
              onClick={() =>
                updateDream(
                  'nightmare',
                  !dream.nightmare,
                )
              }
            />
          </div>
        </section>

        {/* =========================
            TAGS
        ========================= */}

        <section className="form-section">
          <div className="tags-section-header">
            <div>
              <span className="form-label">
                Tags
              </span>

              <p className="section-description">
                Ajoute les éléments importants
                de ton rêve.
              </p>
            </div>
          </div>

          
          <TagCategory
            title="Characters"
            icon="◉"
            tags={dream.characters || []}
            inputValue={tagInputs.characters}
            suggestions={
              tagLibrary.characters
            }
            onInputChange={(value) =>
              setTagInputs((current) => ({
                ...current,
                characters: value,
              }))
            }
            onAdd={() =>
              addTag('characters')
            }
            onSelectSuggestion={(tag) =>
              addTag('characters', tag)
            }
            onRemove={(tag) =>
              removeTag('characters', tag)
            }
            onKeyDown={(event) =>
              handleTagKeyDown(
                event,
                'characters',
              )
            }
          />

          <TagCategory
            title="Places"
            icon="⌂"
            tags={dream.places || []}
            inputValue={tagInputs.places}
            suggestions={tagLibrary.places}
            onInputChange={(value) =>
              setTagInputs((current) => ({
                ...current,
                places: value,
              }))
            }
            onAdd={() =>
              addTag('places')
            }
            onSelectSuggestion={(tag) =>
              addTag('places', tag)
            }
            onRemove={(tag) =>
              removeTag('places', tag)
            }
            onKeyDown={(event) =>
              handleTagKeyDown(
                event,
                'places',
              )
            }
          />

          <TagCategory
            title="Objects"
            icon="◇"
            tags={dream.objects || []}
            inputValue={tagInputs.objects}
            suggestions={tagLibrary.objects}
            onInputChange={(value) =>
              setTagInputs((current) => ({
                ...current,
                objects: value,
              }))
            }
            onAdd={() =>
              addTag('objects')
            }
            onSelectSuggestion={(tag) =>
              addTag('objects', tag)
            }
            onRemove={(tag) =>
              removeTag('objects', tag)
            }
            onKeyDown={(event) =>
              handleTagKeyDown(
                event,
                'objects',
              )
            }
          />

          <TagCategory
            title="Other"
            icon="✦"
            tags={dream.other || []}
            inputValue={tagInputs.other}
            suggestions={tagLibrary.other}
            onInputChange={(value) =>
              setTagInputs((current) => ({
                ...current,
                other: value,
              }))
            }
            onAdd={() => addTag('other')}
            onSelectSuggestion={(tag) =>
              addTag('other', tag)
            }
            onRemove={(tag) =>
              removeTag('other', tag)
            }
            onKeyDown={(event) =>
              handleTagKeyDown(
                event,
                'other',
              )
            }
          />
        </section>
        {/* =========================
            QUÊTES LIÉES
        ========================= */}
        
        <div className="form-section">
          <h3>⚑ Quêtes liées</h3>
                
          <div className="quest-selector">
            {allQuests.length === 0 ? (
              <p>Aucune quête créée.</p>
            ) : (
              allQuests.map((quest) => (
                <label
                  key={quest.id}
                  className="quest-checkbox"
                >
                  <input
                    type="checkbox"
                    checked={
                      dream.linkedQuests?.includes(
                        quest.id,
                      ) || false
                    }
                    onChange={() =>
                      toggleQuest(quest.id)
                    }
                  />
        
                  <span>
                    {quest.source === 'iktomi'
                      ? `IK-${quest.numero}`
                      : `P-${quest.id}`}
        
                    {' - '}
                    {quest.title}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* =========================
            NOTES
        ========================= */}

        <section className="form-section">
          <label
            className="form-label"
            htmlFor="dream-notes"
          >
            Notes personnelles
          </label>

          <textarea
            id="dream-notes"
            className="form-textarea notes-textarea"
            placeholder="Ajoute des détails, réflexions ou notes..."
            value={dream.notes}
            onChange={(event) =>
              updateDream(
                'notes',
                event.target.value,
              )
            }
          />
        </section>

        {/* =========================
            IMAGE
        ========================= */}

        <section className="form-section">
          <div className="form-section-header">
            <div>
              <span className="form-label">
                Illustration
              </span>

              <p>
                Facultatif — pour les rêves que tu
                souhaites visualiser.
              </p>
            </div>
          </div>

          {dream.image ? (
            <ImagePreview
              image={dream.image}
              onRemove={removeImage}
            />
          ) : (
            <label className="image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
              />

              <span className="upload-icon">
                +
              </span>

              <div>
                <strong>
                  Ajouter une illustration
                </strong>

                <span>
                  JPG, PNG, WEBP...
                </span>
              </div>
            </label>
          )}
        </section>

        {/* =========================
            ACTIONS
        ========================= */}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate('/reves')
            }
            disabled={isSaving}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={isSaving}
          >
            {isSaving
              ? 'Enregistrement...'
              : isEditing
                ? 'Enregistrer les modifications'
                : 'Enregistrer le rêve'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* =========================
   BOUTON CARACTÉRISTIQUE
========================= */

function ToggleButton({
  icon,
  label,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`characteristic-button ${
        active ? 'active' : ''
      }`}
      onClick={onClick}
    >
      <span className="characteristic-icon">
        {icon}
      </span>

      <span>{label}</span>

      <span className="toggle-indicator">
        {active ? '✓' : ''}
      </span>
    </button>
  )
}
function LucidityLevelButton({
  level,
  title,
  description,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`lucidity-level-button ${
        active ? 'active' : ''
      }`}
      onClick={onClick}
    >
      <span className="lucidity-level-number">
        {level}
      </span>

      <span className="lucidity-level-content">
        <strong>{title}</strong>

        <small>{description}</small>
      </span>

      <span className="lucidity-level-check">
        {active ? '✓' : ''}
      </span>
    </button>
  )
}
/* =========================
   CATÉGORIE DE TAGS
========================= */

function TagCategory({
  title,
  icon,
  tags,
  inputValue,
  suggestions,
  onInputChange,
  onAdd,
  onSelectSuggestion,
  onRemove,
  onKeyDown,
}) {
  const availableSuggestions = useMemo(() => {
    const search = inputValue
      .trim()
      .toLowerCase()

    if (!search) return []

    return suggestions
      .filter((suggestion) => {
        const isAlreadyAdded = tags.some(
          (tag) =>
            tag.toLowerCase() ===
            suggestion.toLowerCase(),
        )

        return (
          !isAlreadyAdded &&
          suggestion
            .toLowerCase()
            .includes(search)
        )
      })
      .slice(0, 5)
  }, [inputValue, suggestions, tags])

  return (
    <div className="tag-category">
      <div className="tag-category-title">
        <span>{icon}</span>
        {title}
      </div>

      <div className="tag-input-container">
        <div className="tag-input-wrapper">
          {tags.map((tag) => (
            <span
              className="editable-tag"
              key={tag}
            >
              {tag}

              <button
                type="button"
                onClick={() => onRemove(tag)}
              >
                ×
              </button>
            </span>
          ))}

          <input
            type="text"
            placeholder="Ajouter..."
            value={inputValue}
            onChange={(event) =>
              onInputChange(
                event.target.value,
              )
            }
            onKeyDown={onKeyDown}
          />
        </div>

        <button
          type="button"
          className="add-tag-button"
          onClick={onAdd}
        >
          +
        </button>
      </div>

      {availableSuggestions.length > 0 && (
        <div className="tag-suggestions">
          {availableSuggestions.map(
            (suggestion) => (
              <button
                type="button"
                className="tag-suggestion"
                key={suggestion}
                onClick={() =>
                  onSelectSuggestion(
                    suggestion,
                  )
                }
              >
                {suggestion}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}

/* =========================
   PRÉVISUALISATION IMAGE
========================= */

function ImagePreview({
  image,
  onRemove,
}) {
  const [imageUrl, setImageUrl] =
    useState(null)

  useEffect(() => {
    if (!image?.file) {
      setImageUrl(null)
      return undefined
    }

    const url = URL.createObjectURL(
      image.file,
    )

    setImageUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [image])

  if (!imageUrl) return null

  return (
    <div className="image-preview">
      <img
        src={imageUrl}
        alt="Illustration du rêve"
      />

      <div className="image-preview-overlay">
        <span>{image.name}</span>

        <button
          type="button"
          onClick={onRemove}
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}

export default DreamEditor