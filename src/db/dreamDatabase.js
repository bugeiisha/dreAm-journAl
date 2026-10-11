import { openDB } from 'idb'

const DB_NAME = 'oneiric-journal'
const DB_VERSION = 7

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('dreams')) {
      const store = db.createObjectStore('dreams', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('date', 'date')
    }

    if (!db.objectStoreNames.contains('mapPositions')) {
      db.createObjectStore('mapPositions', {
        keyPath: 'name',
      })
    }
    
    if (!db.objectStoreNames.contains('characters')) {
      const store = db.createObjectStore('characters', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('name', 'name')
    }

    if (!db.objectStoreNames.contains('quests')) {
      const store = db.createObjectStore('quests', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('title', 'title')
    }
    if (!db.objectStoreNames.contains('notes')) {
      const store = db.createObjectStore('notes', {
        keyPath: 'id',
        autoIncrement: true,
      })
    
      store.createIndex('updatedAt', 'updatedAt')
      store.createIndex('category', 'category')
    }
     if (!db.objectStoreNames.contains('techniques')) {
      const store = db.createObjectStore('techniques', {
        keyPath: 'id',
        autoIncrement: true,
      })

      store.createIndex('name', 'name')
    }

    if (!db.objectStoreNames.contains('techniqueAttempts')) {
      const store = db.createObjectStore('techniqueAttempts', {
        keyPath: 'id',
        autoIncrement: true,
      })

      store.createIndex('techniqueId', 'techniqueId')
      store.createIndex('date', 'date')
      store.createIndex('dreamId', 'dreamId')
    }
  },
})

export async function getAllDreams() {
  return dbPromise.then((db) =>
    db.getAllFromIndex('dreams', 'date'),
  )
}

export async function getDream(id) {
  return dbPromise.then((db) =>
    db.get('dreams', Number(id)),
  )
}

export async function addDream(dream) {
  return dbPromise.then((db) =>
    db.add('dreams', dream),
  )
}

export async function updateDream(dream) {
  return dbPromise.then((db) =>
    db.put('dreams', dream),
  )
}

export async function deleteDream(id) {
  return dbPromise.then((db) =>
    db.delete('dreams', Number(id)),
  )
}

export async function addDreams(dreams) {
  return dbPromise.then(async (db) => {
    const transaction = db.transaction(
      'dreams',
      'readwrite',
    )

    await Promise.all([
      ...dreams.map((dream) =>
        transaction.store.add(dream),
      ),
      transaction.done,
    ])
  })
}

// =========================
// CARTE ONIRIQUE
// =========================

export async function getAllMapPositions() {
  return dbPromise.then((db) =>
    db.getAll('mapPositions'),
  )
}

export async function saveMapPosition(position) {
  return dbPromise.then((db) =>
    db.put('mapPositions', position),
  )
}

// =========================
// PERSONNAGES / PR
// =========================

export async function getAllCharacters() {
  return dbPromise.then((db) =>
    db.getAllFromIndex('characters', 'name'),
  )
}

export async function getCharacter(id) {
  return dbPromise.then((db) =>
    db.get('characters', Number(id)),
  )
}

export async function addCharacter(character) {
  return dbPromise.then((db) =>
    db.add('characters', character),
  )
}

export async function updateCharacter(character) {
  return dbPromise.then((db) =>
    db.put('characters', character),
  )
}

export async function deleteCharacter(id) {
  return dbPromise.then((db) =>
    db.delete('characters', Number(id)),
  )
}
// =========================
// QUÊTES
// =========================

export async function getAllQuests() {
  return dbPromise.then((db) =>
    db.getAll('quests'),
  )
}

export async function getQuest(id) {
  return dbPromise.then((db) =>
    db.get('quests', Number(id)),
  )
}

export async function addQuest(quest) {
  const db = await dbPromise

  if (quest.source === 'perso') {
    const quests = await db.getAll('quests')

    quest.numero =
      Math.max(
        0,
        ...quests
          .filter(q => q.source === 'perso')
          .map(q => Number(q.numero) || 0)
      ) + 1
  }

  return db.add('quests', quest)
}

export async function updateQuest(quest) {
  return dbPromise.then((db) =>
    db.put('quests', quest),
  )
}

export async function deleteQuest(id) {
  return dbPromise.then((db) =>
    db.delete('quests', Number(id)),
  )
}

// =========================
// NOTES
// =========================

export async function getAllNotes() {
  return dbPromise.then((db) =>
    db.getAllFromIndex('notes', 'updatedAt'),
  )
}

export async function getNote(id) {
  return dbPromise.then((db) =>
    db.get('notes', Number(id)),
  )
}

export async function addNote(note) {
  return dbPromise.then((db) =>
    db.add('notes', note),
  )
}

export async function updateNote(note) {
  return dbPromise.then((db) =>
    db.put('notes', note),
  )
}

export async function deleteNote(id) {
  return dbPromise.then((db) =>
    db.delete('notes', Number(id)),
  )
}
/* =========================
   TECHNIQUES
========================= */

export async function getAllTechniques() {
  return dbPromise.then((db) =>
    db.getAllFromIndex('techniques', 'name'),
  )
}

export async function addTechnique(technique) {
  return dbPromise.then((db) =>
    db.add('techniques', technique),
  )
}

export async function updateTechnique(technique) {
  return dbPromise.then((db) =>
    db.put('techniques', technique),
  )
}

export async function deleteTechnique(id) {
  return dbPromise.then((db) =>
    db.delete('techniques', Number(id)),
  )
}

/* =========================
   TENTATIVES DE TECHNIQUES
========================= */

export async function getAllTechniqueAttempts() {
  return dbPromise.then((db) =>
    db.getAllFromIndex('techniqueAttempts', 'date'),
  )
}

export async function getTechniqueAttempts(techniqueId) {
  return dbPromise.then((db) =>
    db.getAllFromIndex(
      'techniqueAttempts',
      'techniqueId',
      Number(techniqueId),
    ),
  )
}

export async function addTechniqueAttempt(attempt) {
  return dbPromise.then((db) =>
    db.add('techniqueAttempts', attempt),
  )
}

export async function updateTechniqueAttempt(attempt) {
  return dbPromise.then((db) =>
    db.put('techniqueAttempts', attempt),
  )
}

export async function deleteTechniqueAttempt(id) {
  return dbPromise.then((db) =>
    db.delete('techniqueAttempts', Number(id)),
  )
}