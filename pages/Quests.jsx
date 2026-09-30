import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllQuests, getAllDreams, deleteQuest } from '../src/db/dreamDatabase'
import './Quests.css'
import QuestEditor from './QuestEditor'

function Quests() {
  const navigate = useNavigate()
  const [quests, setQuests] = useState([])
  const [dreams, setDreams] = useState([])
  const [search, setSearch] = useState('')
  const [showQuestEditor, setShowQuestEditor] = useState(false)
  const [editingQuest, setEditingQuest] = useState(null)

async function loadData() {
  const questsData = await getAllQuests()
  const dreamsData = await getAllDreams()

  setQuests(questsData)
  setDreams(dreamsData)
}

useEffect(() => {
  loadData()
}, [])

  const [selectedQuestId, setSelectedQuestId] =
    useState(null)

  const selectedQuest =
    quests.find(
      (quest) => quest.id === selectedQuestId,
    ) || null
    const linkedDreams = selectedQuest
  ? dreams.filter((dream) =>
      dream.linkedQuests?.includes(
        selectedQuest.id,
      ),
    )
  : []
  const dreamCount = linkedDreams.length
  const questProgress =
  selectedQuest?.status === 'success'
    ? 'success'
    : dreamCount > 0
    ? 'attempted'
    : 'pending'

    async function handleDelete() {
      if (!selectedQuest) return

      const confirmed = window.confirm(
        `Supprimer "${selectedQuest.title}" ?`
      )
    
      if (!confirmed) return
    
      await deleteQuest(selectedQuest.id)
    
      const updatedQuests = await getAllQuests()
    
      setQuests(updatedQuests)
      setSelectedQuestId(null)
    }
    const filteredQuests = quests.filter((quest) =>
      `${quest.title} ${quest.description} ${quest.numero}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  return (
    <div className="quests-page">
      <div className="quests-layout">
        <div className="quests-left">
          {selectedQuest && (
  <div
    className="quest-detail-overlay"
    onClick={() => setSelectedQuestId(null)}
  >
    <div
      className="quest-detail-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="quest-detail-header">
        <div className='quest-detail-header-infos'>
          <div className="quest-detail-head">
            <h2>{selectedQuest.title}</h2>
            <button
              className="quest-detail-close"
              onClick={() => setSelectedQuestId(null)}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          <span className="quest-id">
            {selectedQuest.source === 'iktomi' &&
              `IK-${selectedQuest.numero}`}

            {selectedQuest.source === 'perso' &&
              `P-${selectedQuest.numero}`}

            {selectedQuest.source === 'monthly' &&
              `M-${selectedQuest.numero}`}
          </span>
        </div>

        <div className="quest-status-badge">
          {questProgress === 'success'
            ? '🟢 Réussie'
            : questProgress === 'attempted'
            ? '🟣 Tentée'
            : '🟡 À tester'}
        </div>
      </div>

      <h3>Description</h3>
      <p>{selectedQuest.description}</p>

      <h3>Rêves liés ({linkedDreams.length})</h3>

      <div className="linked-dreams">
        {linkedDreams.length === 0 ? (
          <p>Aucun rêve lié.</p>
        ) : (
          linkedDreams.map((dream) => (
            <button
              key={dream.id}
              className="linked-dream-button"
              onClick={() =>
                navigate(`/reves/${dream.id}`)
              }
            >
              <div>
                <strong>
                  ☾ {dream.title || 'Rêve sans titre'}
                </strong>

                <div className="linked-dream-date">
                  {dream.date}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="quest-preview-actions">
        <button
          className="quest-edit-button"
          onClick={() =>
            setEditingQuest(selectedQuest)
          }
          aria-label="Modifier cette quête"
          title="Modifier cette quête"
        >
          ✎
        </button>

        <button
          className="quest-delete-button"
          onClick={handleDelete}
          aria-label="Supprimer cette quête"
          title="Supprimer cette quête"
        >
          🗑
        </button>
      </div>
    </div>
  </div>
)}
          <div className="quests-header">
            <span className="quests-eyebrow">
              QUÊTES ONIRIQUE
            </span>
            <h2>Quêtes</h2>
            <p>Commence ton aventure onirique et accomplis tes quêtes.</p>
            <div className="quests-toolbar">
              <input type="text" placeholder="Rechercher une quête..." value={search} onChange={(e) => setSearch(e.target.value)} className="quest-search"/>
              <button
                className="quests-primary-button"
                onClick={() =>
                  setShowQuestEditor(true)
                }
              >
                + Nouvelle quête
              </button>
            </div>
          </div>

          <h2 className='quests-grid-h2'>
            Quêtes ({filteredQuests.length})
          </h2>
          <div className="quests-grid">
            {filteredQuests.map((quest) => {
              const linkedDreamCount = dreams.filter((dream) =>
                dream.linkedQuests?.includes(quest.id)
              ).length
            
              const progress =
                quest.status === 'success'
                  ? 'success'
                  : linkedDreamCount > 0
                  ? 'attempted'
                  : 'pending'
            
              return (
                <div
                  key={quest.id}
                  className={`quest-card ${
                    selectedQuestId === quest.id
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    setSelectedQuestId(quest.id)
                  }
                >
                <div className="quest-number">
                  {quest.source === 'iktomi' &&
                    `IK-${quest.numero}`}
                
                  {quest.source === 'perso' &&
                    `P-${quest.numero}`}
                
                  {quest.source === 'monthly' &&
                    `M-${quest.numero}`}
                </div>

                <h3>{quest.title}</h3>

                <p>{quest.description}</p>

                <div className="quest-footer">
                  {progress === 'success'
                    ? '🟢 Réussie'
                    : progress === 'attempted'
                    ? '🟣 Tentée'
                    : '🟡 À tester'}
                </div>
              </div>
            )})}
          </div>

        </div>

        
          {showQuestEditor && (
            <div
              className="notes-form-overlay"
              onClick={() =>
                setShowQuestEditor(false)
              }
            >
              <div
                className="notes-form"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <QuestEditor
                  onClose={async () => {
                    await loadData()
                    setShowQuestEditor(false)
                  }}
                />
              </div>
            </div>
          )}
          {editingQuest && (
            <div
              className="notes-form-overlay"
              onClick={() =>
                setEditingQuest(null)
              }
            >
              <div
                className="notes-form"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <QuestEditor
                  questId={editingQuest.id}
                  onClose={async () => {
                    await loadData()
                    setEditingQuest(null)
                  }}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

export default Quests