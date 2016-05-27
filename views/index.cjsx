
ItemInfoTableArea = require './item-info-table-area'
ItemInfoCheckboxArea = require './item-info-checkbox-area'

_unsetslot = null
maxSlotType = 38

class Ship
  constructor: (ship) ->
    if ship?
      @id = ship.api_id
      @level = ship.api_lv
      @name = window.i18n.resources.__ ship.api_name
      @count = 1
    else
      @id = "Unknown"
      @level = null
      @name = __ "Unknown"
      @count = 1

ItemInfoArea = React.createClass
  getInitialState: ->
    itemTypeChecked = new Array(maxSlotType + 1)
    itemTypeChecked.fill true
    # 0b10: locked, 0b01: unlocked
    @lockFilter = config.get 'plugin.ItemInfo.lockedFilter', 0b11
    itemTypeChecked: itemTypeChecked
    rows: []

  changeCheckbox: (callback) ->
    callback @state.itemTypeChecked
    @forceUpdate()
  changeLockFilter: ->
    @lockFilter ^= 0b10
    @updateAfterChangeLockFilter()
  changeUnlockFilter: ->
    @lockFilter ^= 0b01
    @updateAfterChangeLockFilter()
  slotShouldDisplay: (locked) ->
    (if locked then 0b10 else 0b01) & @lockFilter
  updateAfterChangeLockFilter: ->
    config.set 'plugin.ItemInfo.lockedFilter', @lockFilter
    @updateAll()
    @setState
      rows: @rows

  getLevelKey: (alv, level) ->
    alv * 11 + level
  getLevelsFromKey: (key) ->
    alv: key // 11
    level: key % 11

  updateSlot: (slot) ->
    return unless @slotShouldDisplay slot.api_locked
    slotItemId = slot.api_slotitem_id
    alv = slot.api_alv || 0
    level = slot.api_level || 0
    key = @getLevelKey alv, level
    if @rows[slotItemId]?
      row = @rows[slotItemId]
      row.total++
      if level
        row.hasNoLevel = false
      if alv
        row.hasNoAlv = false
      if row.levelCount[key]?
        row.levelCount[key]++
      else
        row.levelCount[key] = 1
    else
      itemInfo = $slotitems[slotItemId]
      row =
        slotItemId: slotItemId
        typeId: itemInfo.api_type[2]
        iconIndex: itemInfo.api_type[3]
        name: window.i18n.resources.__(itemInfo.api_name)
        total: 1
        used: 0
        unset: null  # have not read unsetslot yet
        ships: {}
        levelCount: {}
        hasNoLevel: !level
        hasNoAlv: !alv
      row.levelCount[key] = 1
      @rows[slotItemId] = row
  updateShips: ->
    return if !window._ships? or @rows.length == 0
    for row in @rows
      if row?
        row.ships = {}
        row.used = 0
    @addShip ship for _id, ship of _ships
  addShip: (ship) ->
    shipId = ship.api_id
    for slotId in ship.api_slot.concat ship.api_slot_ex when slotId > 0
      slot = _slotitems[slotId]
      continue unless slot?
      continue unless @slotShouldDisplay slot.api_locked
      row = @rows[slot.api_slotitem_id]
      continue unless row?
      row.used++
      key = @getLevelKey(slot.api_alv || 0, slot.api_level || 0)
      row.ships[key] ?= []
      shipInfo = row.ships[key].find (shipInfo) -> shipInfo.id is shipId
      if shipInfo
        shipInfo.count++
      else
        row.ships[key].push new Ship(ship)
  updateAll: ->
    @rows = []
    if _slotitems?
      @updateSlot slot for _slotId, slot of _slotitems
      @updateShips()
      @updateUnsetslot()
  updateUnsetslot: ->
    return if !_unsetslot? or !_slotitems? or @rows.length == 0

    unsetCount = []

    for _key, list of _unsetslot when list isnt -1
      for slotId in list
        slot = _slotitems[slotId]
        slotItemId = slot.api_slotitem_id
        key = @getLevelKey(slot.api_alv || 0, slot.api_level || 0)
        levelCount = unsetCount[slotItemId] ?= {}
        levelCount[key] ?= 0
        levelCount[key]++

    for row, slotItemId in @rows when row
      levelCount = unsetCount[slotItemId]
      unsetTotal = 0
      for key, count of row.levelCount
        unset = levelCount?[key] ? 0
        unsetTotal += unset
        # diff = count - unset
        # if row.ships[key]?
        #   for ship in row.ships[key]
        #     diff -= ship.count
        # if diff > 0
        #   unknownShip = new Ship
        #   unknownShip.count = diff
        #   (row.ships[key] ?= []).push unknownShip
      row.unset = unsetTotal

  handleResponse: (e) ->
    {method, path, body, postBody} = e.detail
    @rows = @state.rows
    shouldUpdate = false
    switch path
      when '/kcsapi/api_port/port', '/kcsapi/api_get_member/slot_item', '/kcsapi/api_get_member/ship3', '/kcsapi/api_req_kousyou/destroyitem2', '/kcsapi/api_req_kousyou/destroyship', '/kcsapi/api_req_kousyou/remodel_slot', '/kcsapi/api_req_kaisou/powerup'
        shouldUpdate = true
        if path is '/kcsapi/api_get_member/ship3'
          _unsetslot = body.api_slot_data
        @updateAll()
      when '/kcsapi/api_get_member/require_info'
        # do not need to update
        _unsetslot = body.api_unsetslot
      when '/kcsapi/api_get_member/unsetslot'
        shouldUpdate = true
        _unsetslot = body
        @updateUnsetslot()
      when '/kcsapi/api_req_kousyou/getship'
        shouldUpdate = true
        @updateSlot slot for slot in body.api_slotitem
        @addShip body.api_ship
      when '/kcsapi/api_req_kousyou/createitem'
        if body.api_create_flag == 1
          shouldUpdate = true
          _unsetslot = body.api_unsetslot
          @updateSlot body.api_slot_item
          @updateUnsetslot()
      when '/kcsapi/api_req_kaisou/lock'
        if @lockFilter in [0b10, 0b01]
          shouldUpdate = true
          @updateAll()

      # when '/kcsapi/api_req_air_corps/set_plane'
      #   Not Implemented as land base status is not yet saved in env

    if shouldUpdate
      @setState
        rows: @rows
  componentDidMount: ->
    window.addEventListener 'game.response', @handleResponse
  componentWillUnmount: ->
    window.removeEventListener 'game.response', @handleResponse

  render: ->
    <div>
      <ItemInfoCheckboxArea
        changeCheckbox={@changeCheckbox}
        changeLockFilter={@changeLockFilter}
        changeUnlockFilter={@changeUnlockFilter}
        itemTypeChecked={@state.itemTypeChecked}
        lockFilter={@slotShouldDisplay true}
        unlockFilter={@slotShouldDisplay false}
      />
      <ItemInfoTableArea
        itemTypeChecked={@state.itemTypeChecked}
        rows={@state.rows}
        getLevelsFromKey={@getLevelsFromKey}
      />
    </div>

ReactDOM.render <ItemInfoArea />, $('item-info')
