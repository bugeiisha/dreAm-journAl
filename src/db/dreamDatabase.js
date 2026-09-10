import { openDB } from 'idb'

const DB_NAME = 'oneiric-journal'
const DB_VERSION = 2

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