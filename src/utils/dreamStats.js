function normalizeTag(tag) {
  return tag.trim().toLowerCase()
}

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(date.getDate()).padStart(
    2,
    '0',
  )

  return `${year}-${month}-${day}`
}

function parseDreamDate(dream) {
  return new Date(
    `${dream.date}T${dream.time || '00:00'}`,
  )
}

/* =========================
   STATISTIQUES GÉNÉRALES
========================= */

export function getDreamStats(dreams) {
  const total = dreams.length

  const lucid = dreams.filter(
    (dream) => dream.lucid,
  ).length

  const recurring = dreams.filter(
    (dream) => dream.recurring,
  ).length

  const nightmares = dreams.filter(
    (dream) => dream.nightmare,
  ).length

  const sleepParalysis = dreams.filter(
    (dream) => dream.sleepParalysis,
  ).length

  const falseAwakenings = dreams.filter(
    (dream) => dream.falseAwakening,
  ).length

  const averageMood = total
    ? Math.round(
        dreams.reduce(
          (sum, dream) =>
            sum + Number(dream.mood || 0),
          0,
        ) / total,
      )
    : 0

  return {
    total,
    lucid,
    recurring,
    nightmares,
    sleepParalysis,
    falseAwakenings,
    averageMood,
  }
}

/* =========================
   SÉRIES DE RÊVES
========================= */

export function getCurrentStreak(dreams) {
  if (!dreams.length) return 0

  const uniqueDates = new Set(
    dreams.map((dream) => dream.date),
  )

  let streak = 0

  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  while (true) {
    const dateString = formatDateKey(currentDate)

    if (!uniqueDates.has(dateString)) {
      break
    }

    streak++

    currentDate.setDate(
      currentDate.getDate() - 1,
    )
  }

  return streak
}

export function getLongestStreak(dreams) {
  if (!dreams.length) return 0

  const uniqueDates = [
    ...new Set(
      dreams.map((dream) => dream.date),
    ),
  ].sort()

  let longest = 1
  let current = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const previous = new Date(
      `${uniqueDates[i - 1]}T00:00:00`,
    )

    const currentDate = new Date(
      `${uniqueDates[i]}T00:00:00`,
    )

    const difference =
      (currentDate - previous) /
      (1000 * 60 * 60 * 24)

    if (difference === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }

  return longest
}

/* =========================
   ACTIVITÉ PAR JOUR
========================= */

export function getDailyActivity(
  dreams,
  numberOfDays = 30,
) {
  const activity = []

  for (
    let i = numberOfDays - 1;
    i >= 0;
    i--
  ) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)

    date.setDate(date.getDate() - i)

    const dateKey = formatDateKey(date)

    const count = dreams.filter(
      (dream) => dream.date === dateKey,
    ).length

    activity.push({
      date: dateKey,
      label: new Intl.DateTimeFormat(
        'fr-FR',
        {
          day: 'numeric',
          month: 'short',
        },
      ).format(date),
      count,
    })
  }

  return activity
}

/* =========================
   ACTIVITÉ PAR MOIS
========================= */

export function getMonthlyActivity(
  dreams,
  numberOfMonths = 12,
) {
  const activity = []

  for (
    let i = numberOfMonths - 1;
    i >= 0;
    i--
  ) {
    const date = new Date()

    date.setDate(1)
    date.setHours(0, 0, 0, 0)

    date.setMonth(date.getMonth() - i)

    const year = date.getFullYear()
    const month = date.getMonth()

    const count = dreams.filter((dream) => {
      const dreamDate = parseDreamDate(dream)

      return (
        dreamDate.getFullYear() === year &&
        dreamDate.getMonth() === month
      )
    }).length

    activity.push({
      year,
      month,
      label: new Intl.DateTimeFormat(
        'fr-FR',
        {
          month: 'short',
          year: '2-digit',
        },
      )
        .format(date)
        .replace('.', ''),
      count,
    })
  }

  return activity
}

/* =========================
   MOOD DANS LE TEMPS
========================= */

export function getMoodEvolution(dreams) {
  const dreamsByDate = {}

  dreams.forEach((dream) => {
    if (!dreamsByDate[dream.date]) {
      dreamsByDate[dream.date] = []
    }

    dreamsByDate[dream.date].push(
      Number(dream.mood || 0),
    )
  })

  return Object.entries(dreamsByDate)
    .sort(([dateA], [dateB]) =>
      dateA.localeCompare(dateB),
    )
    .map(([date, moods]) => ({
      date,
      mood: Math.round(
        moods.reduce(
          (sum, mood) => sum + mood,
          0,
        ) / moods.length,
      ),
      label: new Intl.DateTimeFormat(
        'fr-FR',
        {
          day: 'numeric',
          month: 'short',
        },
      ).format(
        new Date(`${date}T00:00:00`),
      ),
    }))
}

/* =========================
   RÉPARTITION DES RÊVES
========================= */

export function getDreamTypes(dreams) {
  return [
    {
      name: 'Lucides',
      value: dreams.filter(
        (dream) => dream.lucid,
      ).length,
    },
    {
      name: 'Récurrents',
      value: dreams.filter(
        (dream) => dream.recurring,
      ).length,
    },
    {
      name: 'Cauchemars',
      value: dreams.filter(
        (dream) => dream.nightmare,
      ).length,
    },
    {
      name: 'Paralysies',
      value: dreams.filter(
        (dream) => dream.sleepParalysis,
      ).length,
    },
    {
      name: 'Faux éveils',
      value: dreams.filter(
        (dream) => dream.falseAwakening,
      ).length,
    },
  ]
}

/* =========================
   TAGS LES PLUS FRÉQUENTS
========================= */

export function getMostFrequentTags(
  dreams,
  category,
  limit = 10,
) {
  const counts = {}

  dreams.forEach((dream) => {
    const tags = dream[category] || []

    tags.forEach((tag) => {
      const cleanTag = tag.trim()

      if (!cleanTag) return

      const normalized = normalizeTag(cleanTag)

      if (!counts[normalized]) {
        counts[normalized] = {
          name: cleanTag,
          count: 0,
        }
      }

      counts[normalized].count++
    })
  })

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/* =========================
   JOURS DE LA SEMAINE
========================= */

export function getWeekdayActivity(dreams) {
  const weekdays = [
    'Lun',
    'Mar',
    'Mer',
    'Jeu',
    'Ven',
    'Sam',
    'Dim',
  ]

  return weekdays.map((label, index) => ({
    day: label,
    count: dreams.filter((dream) => {
      const date = new Date(
        `${dream.date}T00:00:00`,
      )

      const jsDay = date.getDay()

      const mondayIndex =
        jsDay === 0 ? 6 : jsDay - 1

      return mondayIndex === index
    }).length,
  }))
}

/* =========================
   INFORMATIONS GLOBALES
========================= */

export function getDreamWorldStats(dreams) {
  const allPlaces = new Set()
  const allCharacters = new Set()
  const allObjects = new Set()

  dreams.forEach((dream) => {
    ;(dream.places || []).forEach(
      (tag) => allPlaces.add(normalizeTag(tag)),
    )

    ;(dream.characters || []).forEach(
      (tag) =>
        allCharacters.add(normalizeTag(tag)),
    )

    ;(dream.objects || []).forEach(
      (tag) => allObjects.add(normalizeTag(tag)),
    )
  })

  return {
    uniquePlaces: allPlaces.size,
    uniqueCharacters:
      allCharacters.size,
    uniqueObjects: allObjects.size,
  }
}