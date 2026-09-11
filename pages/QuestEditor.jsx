import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addQuest } from '../src/db/dreamDatabase'
import './QuestEditor.css'
import { useParams } from 'react-router-dom'
import { getQuest, updateQuest } from '../src/db/dreamDatabase'

function QuestEditor() {
  const navigate = useNavigate()
  const { questId } = useParams()
  const isEditing = Boolean(questId)
  const [source, setSource] = useState('iktomi')
  const [numero, setNumero] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('todo')

  async function handleSubmit(e) {
    e.preventDefault()

    if (isEditing) {
  await updateQuest({
    id: Number(questId),
    source,
    numero:
      source === 'iktomi'
        ? Number(numero)
        : null,
    title,
    description,
    status,
  })
} else {
  await addQuest({
    source,
    numero:
      source === 'iktomi'
        ? Number(numero)
        : null,
    title,
    description,
    status,
    linkedDreams: [],
    createdAt: new Date().toISOString(),
      })
    }navigate('/quetes')
  }
  useEffect(() => {
  async function loadQuest() {
    if (!questId) return

    const quest = await getQuest(questId)

    if (!quest) return

    setSource(quest.source)
    setNumero(quest.numero || '')
    setTitle(quest.title)
    setDescription(quest.description)
    setStatus(quest.status)
  }

  loadQuest()
}, [questId])

  return (
    <div className="quest-editor">
      <div className="quest-editor-header">
  <button
    type="button"
    className="back-button"
    onClick={() => navigate('/quetes')}
  >
    ← Retour
  </button>

  <h1>
    {isEditing
      ? 'Modifier la quête'
      : 'Nouvelle quête'}
  </h1>
</div>
      <h1>Nouvelle quête</h1>

      <form className="quest-form" onSubmit={handleSubmit}>
        <label>Type</label>

        <select
          value={source}
          onChange={(e) =>
            setSource(e.target.value)
          }
        >
          <option value="iktomi">
            Iktomi
          </option>

          <option value="perso">
            Personnelle
          </option>
        </select>

        {source === 'iktomi' && (
          <>
            <label>Numéro</label>

            <input
              type="number"
              value={numero}
              onChange={(e) =>
                setNumero(e.target.value)
              }
            />
          </>
        )}

        <label>Titre</label>

        <input
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <label>Description</label>

        <textarea
          rows="5"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <label>Statut</label>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="todo">
            À tester
          </option>

          <option value="success">
            Réussie
          </option>

          <option value="failed">
            Échouée
          </option>
        </select>

        <button type="submit" className="quest-submit">Créer la quête</button>
      </form>
    </div>
  )
}

export default QuestEditor