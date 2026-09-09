import { getAllDreams } from '../db/dreamDatabase'

export async function exportDreams() {
  const dreams = await getAllDreams()

  const backup = {
    app: 'Oneiric Journal',
    version: 1,
    exportedAt: new Date().toISOString(),
    dreams,
  }

  const json = JSON.stringify(
    backup,
    null,
    2,
  )

  const blob = new Blob(
    [json],
    {
      type: 'application/json',
    },
  )

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')

  link.href = url

  const date = new Date()
    .toISOString()
    .split('T')[0]

  link.download =
    `oneiric-journal-backup-${date}.json`

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}