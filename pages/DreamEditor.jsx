import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, } from 'react-router-dom'
import { addDream, getAllDreams, getDream, updateDream as updateSavedDream,  getAllQuests, getAllCharacters, getAllTechniques, getAllTechniqueAttempts, addTechniqueAttempt, updateTechniqueAttempt } from '../src/db/dreamDatabase'

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
    linkedPRs: [],
    places: [],
    objects: [],
    other: [],
    techniques: [],
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
    'techniques',
  ]

  const library = {
    characters: [],
    places: [],
    objects: [],
    other: [],
    techniques: [],
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

  const [allPRs, setAllPRs] = useState([])
  const [prInput, setPrInput] = useState('')

  useEffect(() => {
  async function loadPRs() {
    const prs = await getAllCharacters()
    setAllPRs(prs)
  }

    loadPRs()
  }, [])
  const [techniques, setTechniques] = useState([])
  const [techniqueAttempts, setTechniqueAttempts] = useState([])
  const [selectedAttemptIds, setSelectedAttemptIds] = useState([])
  const [newTechniqueAttempts, setNewTechniqueAttempts] = useState([])
  const [isTechniqueModalOpen, setIsTechniqueModalOpen] = useState(false)

  const [tagInputs, setTagInputs] = useState({
    characters: '',
    places: '',
    objects: '',
    other: '',
    techniques: '',
  })

  const [tagLibrary, setTagLibrary] = useState({
    characters: [],
    places: [],
    objects: [],
    other: [],
    techniques: [],
  })

  const [attemptDraft, setAttemptDraft] = useState({
    techniqueId: '',
    date: new Date().toISOString().split('T')[0],
    durationMinutes: '',
    conditions: '',
    description: '',
    notes: '',
    techniqueResult: 'completed',
    dreamResult: 'none',
  })

  const [isCreatingAttempt, setIsCreatingAttempt] = useState(false)
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
        const linkedAttempts = await getAllTechniqueAttempts()

        setSelectedAttemptIds(
          linkedAttempts
            .filter(
              (attempt) =>
                Number(attempt.dreamId) === Number(dreamId)
            )
            .map((attempt) => attempt.id)
        )
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
   CHARGEMENT DES TECHNIQUES
   ET DES TENTATIVES
========================= */

  useEffect(() => {
    async function loadTechniqueData() {
      try {
        const savedTechniques = await getAllTechniques()
        const savedAttempts = await getAllTechniqueAttempts()

        setTechniques(savedTechniques)
        setTechniqueAttempts(savedAttempts)
      } catch (error) {
        console.error(
          'Erreur lors du chargement des techniques :',
          error,
        )
      }
    }

    loadTechniqueData()
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
     PR
  ========================= */
function addPR(pr) {
  if (dream.linkedPRs.includes(pr.id)) return

  updateDream('linkedPRs', [
    ...dream.linkedPRs,
    pr.id,
  ])

  setPrInput('')
}

function removePR(prId) {
  updateDream(
    'linkedPRs',
    dream.linkedPRs.filter(
      (id) => id !== prId,
    ),
  )
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

  const reader = new FileReader()

  reader.onload = () => {
    updateDream('image', {
      name: file.name,
      type: file.type,
      data: reader.result,
    })
  }

  reader.readAsDataURL(file)
}

  const removeImage = () => {
     console.log('AVANT', dream.image)
    updateDream('image', null)
    setTimeout(() => {
    console.log('APRÈS')
  }, 100)
  }

  /* =========================
     SAUVEGARDE
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      let savedDreamId

      if (isEditing) {
        await updateSavedDream(dream)
        savedDreamId = Number(dreamId)
      } else {
        savedDreamId = await addDream(dream)
      }

      // Associer les tentatives existantes sélectionnées
      const selectedIds = selectedAttemptIds.map(Number)

      for (const attempt of techniqueAttempts) {
        const isLinkedToThisDream =
          Number(attempt.dreamId) === Number(savedDreamId)
      
        const shouldBeLinked = selectedIds.includes(Number(attempt.id))
      
        if (shouldBeLinked && !isLinkedToThisDream) {
          await updateTechniqueAttempt({
            ...attempt,
            dreamId: savedDreamId,
          })
        } else if (isLinkedToThisDream && !shouldBeLinked) {
          await updateTechniqueAttempt({
            ...attempt,
            dreamId: null,
          })
        }
      }

      // Enregistrer les nouvelles tentatives avec le rêve
      for (const attempt of newTechniqueAttempts) {
        await addTechniqueAttempt({
          ...attempt,
          techniqueId: Number(attempt.techniqueId),
          durationMinutes:
            attempt.durationMinutes === ''
              ? null
              : Number(attempt.durationMinutes),
          dreamId: savedDreamId,
        })
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
const filteredPRs = allPRs.filter((pr) =>
  pr.name
    .toLowerCase()
    .includes(prInput.toLowerCase()),
)
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
            title="PR"
            icon="☾"
            tags={
              dream.linkedPRs
                .map(id =>
                  allPRs.find(pr => pr.id === id)?.name
                )
                .filter(Boolean)
            }
            inputValue={prInput}
            suggestions={allPRs.map(pr => pr.name)}
            onInputChange={setPrInput}
            onAdd={() => {}}
            onSelectSuggestion={(name) => {
              const pr = allPRs.find(
                p => p.name === name,
              )
            
              if (!pr) return
            
              updateDream('linkedPRs', [
                ...dream.linkedPRs,
                pr.id,
              ])
            
              setPrInput('')
            }}
            onRemove={(name) => {
              const pr = allPRs.find(
                p => p.name === name,
              )
            
              if (!pr) return
            
              updateDream(
                'linkedPRs',
                dream.linkedPRs.filter(
                  id => id !== pr.id,
                ),
              )
            }}
            onKeyDown={() => {}}
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
        <section className="form-section">
          <h3 className='form-label'>Techniques</h3>

          <button
            type="button"
            className="primary-button"
            id='tentatives-btn'
            onClick={() => setIsTechniqueModalOpen(true)}
          >
            Gérer les tentatives
          </button>

          {selectedAttemptIds.map((id) => {
  const attempt = techniqueAttempts.find((item) => item.id === id);
  if (!attempt) return null;

  const technique = techniques.find(
    (item) => item.id === Number(attempt.techniqueId)
  );

  return (
    <div key={id} className="selected-technique-card">
      <div className="selected-technique-info">
        <span className="selected-technique-name">
          {technique?.name || 'Technique inconnue'}
        </span>
        <span className="selected-technique-date">{attempt.date}</span>
      </div>

      <button
        type="button"
        className="remove-technique-button"
        onClick={() =>
          setSelectedAttemptIds((current) =>
            current.filter((itemId) => itemId !== id)
          )
        }
      >
        Retirer
      </button>
    </div>
  );
})}

{newTechniqueAttempts.map((attempt, index) => {
  const technique = techniques.find(
    (item) => item.id === Number(attempt.techniqueId)
  );

  return (
    <div key={index} className="selected-technique-card">
      <div className="selected-technique-info">
        <span className="selected-technique-name">
          {technique?.name || 'Nouvelle tentative'}
        </span>
        <span className="selected-technique-date">{attempt.date}</span>
      </div>

      <button
        type="button"
        className="remove-technique-button"
        onClick={() =>
          setNewTechniqueAttempts((current) =>
            current.filter((_, i) => i !== index)
          )
        }
      >
        Retirer
      </button>
    </div>
  );
})}
        </section>
        {/* =========================
            QUÊTES LIÉES
        ========================= */}
        
        <div className="form-section">
          <h3 className='form-label'>Quêtes liées</h3>

          <div className="quest-selector">
            {allQuests.length === 0 ? (
              <p>Aucune quête créée.</p>
            ) : (
              <div className="quest-selector-scroll">
                {allQuests.map((quest) => (
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
                ))}
              </div>
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

          {dream.image?.data ? (
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
      {isTechniqueModalOpen && (
        <div className="technique-modal-backdrop">
          <div
            className="technique-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="technique-modal-title"
          >
            <div className="technique-modal-header">
              <h3 id="technique-modal-title">
                Gérer les tentatives
              </h3>

              <button
                type="button"
                className='add-tag-button'
                onClick={() => setIsTechniqueModalOpen(false)}
              >
                ×
              </button>
            </div>
            <button
              type="button"
              className='primary-button'
              id='tentatives-btn'
              onClick={() => setIsCreatingAttempt((current) => !current)}
            >
              {isCreatingAttempt
                ? 'Annuler la création'
                : '+ Nouvelle tentative'}
            </button>
              
            {isCreatingAttempt && (
              <div className="technique-attempt-form">
                <h4>Nouvelle tentative</h4>
            
                <label>
                  Technique
                  <select
                    value={attemptDraft.techniqueId}
                    onChange={(event) =>
                      setAttemptDraft((current) => ({
                        ...current,
                        techniqueId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Choisir une technique</option>
                  
                    {techniques.map((technique) => (
                      <option
                        key={technique.id}
                        value={technique.id}
                      >
                        {technique.name}
                      </option>
                    ))}
                  </select>
                </label>
                  
                <label>
                  Date
                  <input
                    type="date"
                    value={attemptDraft.date}
                    onChange={(event) =>
                      setAttemptDraft((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                  
                <label>
                  Durée (minutes)
                  <input
                    type="number"
                    min="0"
                    value={attemptDraft.durationMinutes}
                    onChange={(event) =>
                      setAttemptDraft((current) => ({
                        ...current,
                        durationMinutes: event.target.value,
                      }))
                    }
                  />
                </label>
                  
                <label>
                  Conditions
                  <textarea
                    value={attemptDraft.conditions}
                    onChange={(event) =>
                      setAttemptDraft((current) => ({
                        ...current,
                        conditions: event.target.value,
                      }))
                    }
                  />
                </label>
                  
                <label>
                  Description
                  <textarea
                    value={attemptDraft.description}
                    onChange={(event) =>
                      setAttemptDraft((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>
                  
                <label>
                  Notes
                  <textarea
                    value={attemptDraft.notes}
                    onChange={(event) =>
                      setAttemptDraft((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                  />
                </label>
                  
                <label>
                  Résultat de la technique
                  <select
                    value={attemptDraft.techniqueResult}
                    onChange={(event) =>
                      setAttemptDraft((current) => ({
                        ...current,
                        techniqueResult: event.target.value,
                      }))
                    }
                  >
                    <option value="completed">Terminée</option>
                    <option value="partial">Partielle</option>
                    <option value="interrupted">Interrompue</option>
                    <option value="not-done">Non réalisée</option>
                  </select>
                </label>
                  
                <label>
                  Résultat sur le rêve
                  <select
                    value={attemptDraft.dreamResult}
                    onChange={(event) =>
                      setAttemptDraft((current) => ({
                        ...current,
                        dreamResult: event.target.value,
                      }))
                    }
                  >
                    <option value="none">Aucun résultat</option>
                    <option value="rl">Rêve lucide</option>
                    <option value="rn">Rêve non lucide</option>
                    <option value="no-dream">Aucun rêve mémorisé</option>
                    <option value="other">Autre</option>
                  </select>
                </label>
                  
                <button
                  type="button"
                  className='primary-button'
                  onClick={() => {
                    if (!attemptDraft.techniqueId || !attemptDraft.date) {
                      alert('Choisis une technique et une date.')
                      return
                    }
                  
                    setNewTechniqueAttempts((current) => [
                      ...current,
                      { ...attemptDraft },
                    ])
                  
                    setAttemptDraft({
                      techniqueId: '',
                      date: new Date().toISOString().split('T')[0],
                      durationMinutes: '',
                      conditions: '',
                      description: '',
                      notes: '',
                      techniqueResult: 'completed',
                      dreamResult: 'none',
                    })
                  
                    setIsCreatingAttempt(false)
                  }}
                >
                  Ajouter à ce rêve
                </button>
              </div>
            )}
            <h4>Tentatives existantes</h4>

            {(() => {
              const availableAttempts = techniqueAttempts.filter(
                (attempt) =>
                  !attempt.dreamId ||
                  Number(attempt.dreamId) === Number(dreamId)
              );
            
              if (availableAttempts.length === 0) {
                return <p className="no-attempts">Aucune tentative disponible.</p>;
              }
            
              return (
                <div className="technique-attempts-list-dream">
                  {availableAttempts.map((attempt) => {
                    const technique = techniques.find(
                      (item) => item.id === Number(attempt.techniqueId)
                    );
                  
                    return (
                      <label key={attempt.id} className="technique-attempt-item">
                        <input
                          type="checkbox"
                          checked={selectedAttemptIds.includes(attempt.id)}
                          onChange={(event) => {
                            setSelectedAttemptIds((current) =>
                              event.target.checked
                                ? [...current, attempt.id]
                                : current.filter((id) => id !== attempt.id)
                            );
                          }}
                        />
                        <span className="technique-attempt-info">
                          <span className="technique-attempt-name">
                            {technique?.name || 'Technique inconnue'}
                          </span>
                          <span className="technique-attempt-date">
                            {attempt.date}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              );
            })()}

            <div className="technique-modal-actions">
              <button
                type="button"
                className='primary-button'
                id='tentatives-btn'
                onClick={() => setIsTechniqueModalOpen(false)}
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
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
  if (!image?.data) return null

  return (
    <div className="image-preview">
      <img
        src={image.data}
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