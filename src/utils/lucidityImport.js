function parseLucidityDate(dateText) {
  const months = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  }

  const match = dateText.match(
    /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
  )

  if (!match) return null

  const day = Number(match[1])
  const monthName = match[2].toLowerCase()
  const year = Number(match[3])
  const month = months[monthName]

  if (month === undefined) return null

  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')

  return `${year}-${mm}-${dd}`
}

export function parseLucidityDreams(text) {
  const blocks = text
    .split(/-{10,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  const dreams = []

  for (const block of blocks) {
    const lines = block
      .split(/\r?\n/)
      .map((line) => line.trim())

    const firstNonEmptyIndex = lines.findIndex(
      (line) => line !== '',
    )

    if (firstNonEmptyIndex === -1) {
      continue
    }

    const dateText = lines[firstNonEmptyIndex]

    const date = parseLucidityDate(dateText)

    if (!date) {
      continue
    }

    const lucid = lines.some(
      (line) =>
        line.toLowerCase() === '(lucid)',
    )

    let mood = 0

    const contentLines = []

    for (
      let i = firstNonEmptyIndex + 1;
      i < lines.length;
      i += 1
    ) {
      const line = lines[i]

      if (
        line.toLowerCase() === '(lucid)'
      ) {
        continue
      }

      const moodMatch = line.match(
        /^Mood:\s*(-?\d+)$/i,
      )

      if (moodMatch) {
        mood = Number(moodMatch[1])
        continue
      }

      contentLines.push(line)
    }

    const content = contentLines
      .join('\n')
      .trim()

    if (!content) {
      continue
    }

    dreams.push({
      title: 'Rêve sans titre',
      date,
      time: '',
      content,
      mood,
      lucid,
      lucidityLevel: lucid ? 2 : 0,
      recurring: false,
      nightmare: false,
      falseAwakening: false,
      sleepParalysis: false,
      characters: [],
      places: [],
      objects: [],
      other: [],
      notes: '',
      image: null,
    })
  }

  return dreams
}