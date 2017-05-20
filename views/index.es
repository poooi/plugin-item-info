import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from 'views/create-store'

import ItemInfoTableArea from './item-info-table-area'
import ItemInfoCheckboxArea from './item-info-checkbox-area'


// _unsetslot = null

const maxSlotType = 40

class Ship {
  constructor(ship) {
    this.id = ship.api_id
    this.level = ship.api_lv
    this.name = window.i18n.resources.__(ship.api_name)
    this.count = 1
  }

// The class for landbase. Waiting for the new API
// class UnknownShip
//   id: 'Unknown'
//   level: -1
//  name: null
//  constructor: (@count) ->
}

class TableRow {
  constructor(slot) {
    this.slotItemId = slot.api_slotitem_id
    const itemInfo = $slotitems[this.slotItemId]
    this.typeId = itemInfo.api_type[2]
    this.iconIndex = itemInfo.api_type[3]
    this.name = window.i18n.resources.__(itemInfo.api_name)
    this.total = 0
    this.used = 0
    // @unset = null       null or Integer, set when `unsetslot' is read
    this.ships = {}        // @ships = {levelKey: [Ship1, Ship2, ...]}
    this.levelCount = {}   // @levelCount = {levelKey: count}
    this.hasNoLevel = true
    this.hasNoAlv = true
    this.updateSlot(slot)
  }
  getUnset = () => (
     this.total - this.used
  )
    // @unset ? @total - @used
  updateSlot = (slot) => {
    const alv = slot.api_alv
    const level = slot.api_level
    this.total++
    if (level) {
      this.hasNoLevel = false
    }
    if (alv) {
      this.hasNoAlv = false
    }
    const key = getLevelKey(alv, level)
    if (levelCount[key] != null) {
      this.levelCount[key]++
    } else {
      this.levelCount[key] = 1
    }
  }
  clearShips = () => {
    this.used = 0
    this.ships = {}
  }
  updateShip = (ship, slot) => {
    this.used += 1
    const key = getLevelKey(slot.api_alv, slot.api_level)
    if (typeof this.ships[key] === 'undefined') {
      this.ships[key] = []
    }
    const shipInfo = this.ships[key].find(s => (s.id === ship.api_id))
    if (shipInfo) {
      shipInfo.count += 1
    } else {
      this.ships[key].push(new Ship(ship))
    }
  }
}

const ItemInfoArea = () =>
  <div>
    <ItemInfoCheckboxArea />
    <ItemInfoTableArea />
  </div>

ReactDOM.render(<Provider store={store}><ItemInfoArea /></Provider>, $('item-info'))
