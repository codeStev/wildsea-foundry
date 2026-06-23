import { WILDSEA, registerSystemSettings } from './system/config.js'
import {
  loadHandlebarsHelpers,
  loadHandlebarsPartials,
} from './system/preload.js'
import WildseaActor from './system/actor.js'
import { addDiceColor } from './system/dice.js'
import WildseaAspectSheet from './system/sheets/aspect.js'
import WildseaAttributeSheet from './system/sheets/attribute.js'
import WildseaDicePool from './system/applications/dice_pool.js'
import WildseaItem from './system/item.js'
import WildseaJournalSheet from './system/sheets/journal.js'
import WildseaPlayerSheet from './system/sheets/player.js'
import WildseaResourceSheet from './system/sheets/resource.js'
import WildseaShipSheet from './system/sheets/ship.js'
import WildseaShipItemSheet from './system/sheets/ship_item.js'
import WildseaAdversarySheet from './system/sheets/adversary.js'
import { setupEnrichers } from './system/enrichers.js'
import { runMigrations } from './system/migrations.js'

import * as WildseaTracks from './system/applications/tracks/index.js'

Hooks.once('init', () => {
  console.log('wildsea | Initializing')

  // v13+ namespaced these; the bare globals are removed in v14/v15.
  const { Actors, Items, Journal } = foundry.documents.collections
  const { ActorSheet, ItemSheet, JournalSheet } = foundry.appv1.sheets

  registerSystemSettings()

  if (game.settings.get('wildsea', 'showDepth'))
    WILDSEA.shipRatings.push('depth')

  CONFIG.wildsea = WILDSEA
  CONFIG.ActiveEffect.legacyTransferral = false
  game.wildsea = {}

  WildseaTracks.setup()

  loadHandlebarsPartials()
  loadHandlebarsHelpers()
  setupEnrichers()

  CONFIG.Actor.documentClass = WildseaActor
  CONFIG.Item.documentClass = WildseaItem

  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('wildsea', WildseaPlayerSheet, { types: ['player'] })
  Actors.registerSheet('wildsea', WildseaShipSheet, { types: ['ship'] })
  Actors.registerSheet('wildsea', WildseaAdversarySheet, { types: ['hazard'] })

  Items.unregisterSheet('core', ItemSheet)
  Items.registerSheet('wildsea', WildseaAspectSheet, {
    types: ['aspect', 'temporaryTrack'],
  })
  Items.registerSheet('wildsea', WildseaResourceSheet, { types: ['resource'] })
  Items.registerSheet('wildsea', WildseaShipItemSheet, {
    types: ['design', 'fitting', 'undercrew'],
  })
  Items.registerSheet('wildsea', WildseaAttributeSheet, {
    types: ['attribute'],
  })

  Journal.unregisterSheet('core', JournalSheet)
  Journal.registerSheet('wildsea', WildseaJournalSheet)
})

Hooks.once('ready', () => {
  runMigrations()
})

Hooks.on('ready', async () => {
  game.wildsea.dicePool = new WildseaDicePool()
})

Hooks.on('renderJournalPageSheet', (_obj, html) => {
  html = $(html)
  if (game.user.isGM) {
    html.on('click', '.track', async (event) => {
      const data = event.currentTarget.dataset
      console.log(data)

      const result = await game.wildsea.trackDatabase.showTrackDialog(
        'wildsea.TRACKS.addTrack',
        data,
      )
      if (result.cancelled) return
      game.wildsea.trackDatabase.addTrack({ ...result })
    })
  }
})

Hooks.on('getSceneControlButtons', (controls) => {
  // v13+ replaced DOM injection (renderSceneControls) with this data-driven
  // hook: add a tool object to a control group and core renders it.
  const tokenTools = controls.tokens?.tools
  if (!tokenTools) return

  tokenTools.dicePool = {
    name: 'dicePool',
    title: 'wildsea.dicePoolTitle',
    icon: 'fas fa-dice',
    order: Object.keys(tokenTools).length,
    button: true,
    onChange: () => game.wildsea.dicePool.toggle(),
  }
})

Hooks.once('diceSoNiceReady', (dice3d) => {
  const dark = '#2e2c20'
  const mid = '#626256'
  const light = '#858778'

  addDiceColor(dice3d, 'wildsea-dark', 'Dark', dark)
  addDiceColor(dice3d, 'wildsea-mid', 'Mid', mid)
  addDiceColor(dice3d, 'wildsea-light', 'Light', light)
})
