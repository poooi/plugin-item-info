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

const getLevelsFromKey = key => ({
  alv: Math.floor(key / 11),
  level: key % 11,
})

const getLevelKey = (alv, level) =>
  ((alv || 0) * 11) + (level || 0)

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

export default class ItemInfoArea extends Component {
  constructor(props) {
    super(props)
    const itemTypeChecked = new Array(maxSlotType + 1).fill(true)
    // 0b10: locked, 0b01: unlocked
    this.lockFilter = config.get('plugin.ItemInfo.lockedFilter', 0b11)
    this.state = {
      itemTypeChecked,
      rows: [],
    }
  }
  changeCheckbox = (callback) => {
    callback(this.state.itemTypeChecked)
    this.forceUpdate()
  }
  changeLockFilter = () => {
    this.lockFilter ^= 0b10
    this.updateAfterChangeLockFilter()
  }
  changeUnlockFilter = () => {
    this.lockFilter ^= 0b01
    this.updateAfterChangeLockFilter()
  }
  slotShouldDisplay = locked => (
    (locked ? 0b10 : 0b01) & this.lockFilter
  )
  updateAfterChangeLockFilter = () => {
    config.set('plugin.ItemInfo.lockedFilter', this.lockFilter)
    this.updateAll()
  }
  updateSlot = (slot) => {
    if (!this.slotShouldDisplay(slot.api_locked)) return
    const slotItemId = slot.api_slotitem_id
    if (this.rows[slotItemId] != null) {
      this.rows[slotItemId].updateSlot(slot)
    } else {
      this.rows[slotItemId] = new TableRow(slot)
    }
  }
  updateShips = () => {
    if (!window._ships != null || this.state.rows.length === 0) {
      for (const row of this.state.rows) {
        if (row != null) {
          row.clearShips()
        }
      }
    }
    const _ships = []
    for (const _id in _ships) {
      const ship = _ships[_id]
      this.addShip(ship)
    }
    // addLandBase
  }
  addShip = (ship) => {
    const _slotitems = []
    for (const slotId of ship.api_slot.concat(ship.api_slot_ex)) {
      if (!slotId > 0) continue
      const slot = _slotitems[slotId]
      if (slot == null) continue
      if (!slotShouldDisplay(slot.api_locked)) continue
      if (this.rows[slot.api_slotitem_id] !== null) {
        this.rows[slot.api_slotitem_id].updateShip(ship, slot)
      }
    }
  }
  updateAll = () => {
    this.setState({ rows: [] })
    const _slotitems = []
    let slot
    if (typeof _slotitems !== 'undefined' && _slotitems !== null) {
      for (const _slotId of _slotitems) {
        slot = _slotitems[_slotId]
        this.updateSlot(slot)
      }

      // Not required currently
      // @updateUnsetslot()

      // Always call '@updateAll()' to update data
      this.setState({ rows: this.state.rows })
  // updateUnsetslot: ->
  //   return if !_unsetslot?

  //   // index: slotItemId, element: {levelKey: count}
  //   unsetCount = []

  //   for _key, list of _unsetslot when list isnt -1
  //     for slotId in list when (slot = _slotitems[slotId])?
  //       slotItemId = slot.api_slotitem_id
  //       key = getLevelKey(slot.api_alv, slot.api_level)
  //       levelCount = unsetCount[slotItemId] ?= {}
  //       levelCount[key] ?= 0
  //       levelCount[key]++

  //   for row, slotItemId in @rows when row
  //     levelCount = unsetCount[slotItemId]
  //     unsetTotal = 0
  //     for key, count of row.levelCount
  //       unset = levelCount?[key] ? 0
  //       unsetTotal += unset
  //       diff = count - unset
  //       if row.ships[key]?
  //         for ship in row.ships[key]
  //           diff -= ship.count
  //       if diff > 0
  //         (row.ships[key] ?= []).push new UnknownShip(diff)
  //     row.unset = unsetTotal
    }
  }
  handleResponse = (e) => {
    const { path, body } = e.detail
    switch (path) {
      case '/kcsapi/api_port/port':
      case '/kcsapi/api_get_member/slot_item':
      case '/kcsapi/api_req_kousyou/destroyitem2':
      case '/kcsapi/api_req_kousyou/destroyship':
      case '/kcsapi/api_req_kousyou/remodel_slot':
      case '/kcsapi/api_req_kaisou/powerup':
      case '/kcsapi/api_req_kaisou/slot_deprive':
      case '/kcsapi/api_req_kousyou/getship':
      case '/kcsapi/api_get_member/ship3':
        this.updateAll()
      // when '/kcsapi/api_get_member/ship3'
        // _unsetslot = body.api_slot_data
        // @updateAll()
      // when '/kcsapi/api_get_member/require_info'
      //   _unsetslot = body.api_unsetslot
      // when '/kcsapi/api_get_member/unsetslot'
      //   _unsetslot = body
      //   @updateAll()
      case '/kcsapi/api_req_kousyou/createitem':
        if (body.api_create_flag === 1) {
          // _unsetslot = body.api_unsetslot
          this.updateAll()
        }
        break
      case '/kcsapi/api_req_kaisou/lock':
        if (this.lockFilter === 0b10 || this.lockFilter === 0b01) {
          this.updateAll()
        }
    }
      // when '/kcsapi/api_req_air_corps/set_plane'
      //   Not Implemented as land base status is not yet saved in env
  }
  componentDidMount = () => (
    window.addEventListener('game.response', this.handleResponse)
  )
  componentWillUnmount = () => (
    window.removeEventListener('game.response', this.handleResponse)
  )
  render() {
    const { itemTypeChecked } = this.props
    return (
      <div>
        <ItemInfoCheckboxArea
          changeCheckbox={this.changeCheckbox}
          changeLockFilter={this.changeLockFilter}
          changeUnlockFilter={this.changeUnlockFilter}
          itemTypeChecked={this.state.itemTypeChecked}
          lockFilter={this.slotShouldDisplay(true)}
          unlockFilter={this.slotShouldDisplay(false)}
        />
        <ItemInfoTableArea
          itemTypeChecked={this.state.itemTypeChecked}
          rows={this.state.rows}
          getLevelsFromKey={getLevelsFromKey}
        />
      </div>
    )
  }
}

ReactDOM.render(<Provider store={store}><ItemInfoArea /></Provider>, $('item-info'))
