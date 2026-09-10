import { openDB } from 'idb'

const DB_NAME = 'oneiric-journal'
const DB_VERSION = 4

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
    if (!db.objectStoreNames.contains('quests')) {
      const store = db.createObjectStore('quests', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('title', 'title')
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
  return dbPromise.then((db) =>
    db.add('quests', quest),
  )
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