import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllQuests, getAllDreams, deleteQuest } from '../src/db/dreamDatabase'
import './Quests.css'

function Quests() {
  const navigate = useNavigate()
  const [quests, setQuests] = useState([])
  const [dreams, setDreams] = useState([])
  const [search, setSearch] = useState('')

useEffect(() => {
  async function loadData() {
    const questsData = await getAllQuests()
    const dreamsData = await getAllDreams()

    setQuests(questsData)
    setDreams(dreamsData)
  }

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
    dreamCount === 0
      ? 'never'
      : selectedQuest?.status === 'success'
      ? 'success'
      : 'attempted'

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
          <div className="quests-header">
            <span className="quests-eyebrow">
              QUÊTES ONIRIQUE
            </span>
            <h2>Quêtes</h2>
            <p>Commence ton aventure onirique et accomplis tes quêtes.</p>
            <div className="quests-toolbar">
              <button className="quests-primary-button" onClick={() => navigate('/quetes/nouvelle')}>
                + Nouvelle quête
              </button>
              <input type="text" placeholder="Rechercher une quête..." value={search} onChange={(e) => setSearch(e.target.value)} className="quest-search"/>
            </div>
          </div>

          <h2 className='quests-grid-h2'>
            Quêtes ({filteredQuests.length})
          </h2>
          <div className="quests-grid">
            {filteredQuests.map((quest) => (
              <div
                key={quest.id}
                className={`quest-card ${
                  quest.status
                } ${
                  selectedQuestId === quest.id
                    ? 'selected'
                    : ''
                }`}
                onClick={() =>
                  setSelectedQuestId(quest.id)
                }
              >
                <div className="quest-number">
                  {quest.source === 'iktomi'
                    ? `IK-${quest.numero}`
                    : `P-${quest.id}`}
                </div>

                <h3>{quest.title}</h3>

                <p>{quest.description}</p>

                <div className="quest-footer">
                  {quest.status === 'success'
                    ? '🟢 Réussie'
                    : quest.status === 'failed'
                    ? '🔴 Échouée'
                    : '🟡 À tester'}
                </div>
              </div>
            ))}
          </div>

        </div>

        <aside className="quests-right">
          {selectedQuest ? (
            <>
              <div className="quest-detail-header">
                <div>
                  <h2>{selectedQuest.title}</h2>

                  <span className="quest-id">
                    {selectedQuest.source === 'iktomi'
                      ? `IK-${selectedQuest.numero}`
                      : `P-${selectedQuest.id}`}
                  </span>
                </div>
                    
                <div className="quest-status-badge">
                  {selectedQuest.status === 'success'
                    ? '🟢 Réussie'
                    : selectedQuest.status === 'failed'
                    ? '🔴 Échouée'
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
                  navigate(`/quetes/${selectedQuest.id}`)
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
            </>
          ) : (
            <div className="no-quest-selected">
              <h3>Sélectionne une quête</h3>

              <p>
                Clique sur une carte pour afficher
                les détails.
              </p>
            </div>
          )}
        </aside>

      </div>
    </div>
  )
}

export default Quests