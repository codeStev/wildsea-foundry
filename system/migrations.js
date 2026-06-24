import { WILDSEA } from './config.js'

// Each migration runs once, when the stored migration version is older than
// the migration's version. After all run, the stored version is set to the
// current system version.
const MIGRATIONS = [
  { version: '0.0.8', up: migrateTrackVisibility },
  { version: '0.3.1', up: migrateResourceTags },
]

export const runMigrations = async () => {
  if (!game.user.isGM) return

  const current = game.settings.get('wildsea', 'systemMigrationVersion')

  for (const { version, up } of MIGRATIONS) {
    if (!current || foundry.utils.isNewerVersion(version, current)) {
      await up()
    }
  }

  await game.settings.set(
    'wildsea',
    'systemMigrationVersion',
    game.system.version,
  )
}

// v0.0.8: derive track visibility from the legacy `firefly` flag.
async function migrateTrackVisibility() {
  const tracks = game.settings.get('wildsea', 'activeTracks') ?? {}
  for (const track of Object.values(tracks)) {
    track.visibility = track.firefly ? 'secret' : 'open'
    tracks[track.id] = track
  }
  await game.settings.set('wildsea', 'activeTracks', tracks)
}

// v0.3.1: Resource tags went from a single string to an array of
// { label, color } objects. Normalise any legacy data.
async function migrateResourceTags() {
  const defaultColor = WILDSEA.tagColors[0]
  const resources = [
    ...game.items.filter((i) => i.type === 'resource'),
    ...game.actors.contents.flatMap((a) =>
      a.items.filter((i) => i.type === 'resource'),
    ),
  ]

  for (const item of resources) {
    const current = item.system.tags

    // Already an array of objects: nothing to do.
    if (
      Array.isArray(current) &&
      current.every((t) => t && typeof t === 'object')
    )
      continue

    let tags = []
    if (Array.isArray(current)) {
      tags = current.map((t) =>
        typeof t === 'string' ? { label: t, color: defaultColor } : t,
      )
    } else if (typeof current === 'string') {
      tags = current
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label) => ({ label, color: defaultColor }))
    }

    await item.update({ 'system.tags': tags })
  }
}
