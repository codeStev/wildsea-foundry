import { WILDSEA } from './config.js'

// Shared behaviour for editable Resource tag pills, used by the player,
// adversary and resource-item sheets.

const tagsOf = (item) => [...(item.system.tags ?? [])]

const addTagFromInput = async (item, input) => {
  // Read and clear synchronously so a follow-up blur (after the re-render)
  // can't add the same tag twice.
  const label = input.value.trim()
  input.value = ''
  if (!label || !item) return

  const tags = tagsOf(item)
  tags.push({ label, color: WILDSEA.tagColors[0] })
  await item.update({ 'system.tags': tags })
}

const removeTag = async (item, index) => {
  const tags = tagsOf(item)
  tags.splice(index, 1)
  await item.update({ 'system.tags': tags })
}

const cycleTagColor = async (item, index) => {
  const tags = tagsOf(item)
  const palette = WILDSEA.tagColors
  const next = (palette.indexOf(tags[index].color) + 1) % palette.length
  tags[index] = { ...tags[index], color: palette[next] }
  await item.update({ 'system.tags': tags })
}

// Wire add (Enter or blur) / remove / recolour listeners within `html`.
// `resolveItem(element)` returns the Resource Item the element belongs to.
export const activateTagListeners = (html, resolveItem) => {
  const root = html[0] ?? html
  const tagIndex = (el) => Number(el.closest('.tag').dataset.tagIndex)

  for (const input of root.querySelectorAll('.tag-input')) {
    const commit = () => addTagFromInput(resolveItem(input), input)
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      commit()
    })
    input.addEventListener('blur', commit)
  }

  for (const el of root.querySelectorAll('.tag-remove')) {
    el.addEventListener('click', (event) => {
      event.preventDefault()
      removeTag(resolveItem(el), tagIndex(el))
    })
  }

  for (const el of root.querySelectorAll('.tag-color')) {
    el.addEventListener('click', (event) => {
      event.preventDefault()
      cycleTagColor(resolveItem(el), tagIndex(el))
    })
  }
}
