import { WILDSEA } from '../config.js'
import WildseaItemSheet from './item.js'
import { activateTagListeners } from '../tags.js'

export default class WildseaResourceSheet extends WildseaItemSheet {
  get template() {
    return `${WILDSEA.root_path}/templates/sheets/resource.hbs`
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 500,
      height: 'auto',
    })
  }

  activateListeners(html) {
    if (this.isEditable) {
      // resource tags — this sheet is bound to a single item
      activateTagListeners(html, () => this.item)
    }
    super.activateListeners(html)
  }
}
