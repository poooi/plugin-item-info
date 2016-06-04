
ItemInfoTableArea = require './item-info-table-area'
ItemInfoCheckboxArea = require './item-info-checkbox-area'

# _unsetslot = null
maxSlotType = 38

class Ship
  constructor: (ship) ->
    @id = ship.api_id
    @level = ship.api_lv
    @name = window.i18n.resources.__ ship.api_name
    @count = 1

# The class for landbase. Waiting for the new API
# class UnknownShip
#   id: 'Unknown'
#   level: -1
#   name: null
#   constructor: (@count) ->

getLevelsFromKey = (key) ->
  alv: key // 11
  level: key % 11
getLevelKey = (alv, level) ->
  (alv ? 0) * 11 + (level ? 0)

class TableRow
  constructor: (slot) ->
    @slotItemId = slot.api_slotitem_id
    itemInfo = $slotitems[@slotItemId]
    @typeId = itemInfo.api_type[2]
    @iconIndex = itemInfo.api_type[3]
    @name = window.i18n.resources.__ itemInfo.api_name
    @total = 0
    @used = 0
    # @unset = null      # null or Integer, set when `unsetslot' is read
    @ships = {}        # @ships = {levelKey: [Ship1, Ship2, ...]}
    @levelCount = {}   # @levelCount = {levelKey: count}
    @hasNoLevel = true
    @hasNoAlv = true
    @updateSlot slot
  getUnset: ->
    # @unset ? @total - @used
    @total - @used
  updateSlot: (slot) ->
    alv = slot.api_alv
    level = slot.api_level
    @total++
    if level
      @hasNoLevel = false
    if alv
      @hasNoAlv = false
    key = getLevelKey alv, level
    if @levelCount[key]?
      @levelCount[key]++
    else
      @levelCount[key] = 1
  clearShips: ->
    @used = 0
    @ships = {}
  updateShip: (ship, slot) ->
    @used++
    key = getLevelKey slot.api_alv, slot.api_level
    @ships[key] ?= []
    shipInfo = @ships[key].find (shipInfo) -> shipInfo.id is ship.api_id
    if shipInfo
      shipInfo.count++
    else
      @ships[key].push new Ship(ship)


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
  updateSlot: (slot) ->
    return unless @slotShouldDisplay slot.api_locked
    slotItemId = slot.api_slotitem_id
    if @rows[slotItemId]?
      @rows[slotItemId].updateSlot slot
    else
      @rows[slotItemId] = new TableRow(slot)
  updateShips: ->
    return if !window._ships? or @rows.length == 0
    row.clearShips() for row in @rows when row?
    @addShip ship for _id, ship of _ships
    # addLandBase
  addShip: (ship) ->
    for slotId in ship.api_slot.concat ship.api_slot_ex when slotId > 0
      slot = _slotitems[slotId]
      continue unless slot?
      continue unless @slotShouldDisplay slot.api_locked
      @rows[slot.api_slotitem_id]?.updateShip ship, slot
  updateAll: ->
    @rows = []
    if _slotitems?
      @updateSlot slot for _slotId, slot of _slotitems
      @updateShips()

      # Not required currently
      # @updateUnsetslot()

      # Always call '@updateAll()' to update data
      @setState {rows: @rows}
  # updateUnsetslot: ->
  #   return if !_unsetslot?

  #   # index: slotItemId, element: {levelKey: count}
  #   unsetCount = []

  #   for _key, list of _unsetslot when list isnt -1
  #     for slotId in list when (slot = _slotitems[slotId])?
  #       slotItemId = slot.api_slotitem_id
  #       key = getLevelKey(slot.api_alv, slot.api_level)
  #       levelCount = unsetCount[slotItemId] ?= {}
  #       levelCount[key] ?= 0
  #       levelCount[key]++

  #   for row, slotItemId in @rows when row
  #     levelCount = unsetCount[slotItemId]
  #     unsetTotal = 0
  #     for key, count of row.levelCount
  #       unset = levelCount?[key] ? 0
  #       unsetTotal += unset
  #       diff = count - unset
  #       if row.ships[key]?
  #         for ship in row.ships[key]
  #           diff -= ship.count
  #       if diff > 0
  #         (row.ships[key] ?= []).push new UnknownShip(diff)
  #     row.unset = unsetTotal

  handleResponse: (e) ->
    {method, path, body, postBody} = e.detail
    switch path
      when '/kcsapi/api_port/port'
      , '/kcsapi/api_get_member/slot_item'
      , '/kcsapi/api_req_kousyou/destroyitem2'
      , '/kcsapi/api_req_kousyou/destroyship'
      , '/kcsapi/api_req_kousyou/remodel_slot'
      , '/kcsapi/api_req_kaisou/powerup'
      , '/kcsapi/api_req_kaisou/slot_deprive'
      , '/kcsapi/api_req_kousyou/getship'
      , '/kcsapi/api_get_member/ship3'
        @updateAll()
      # when '/kcsapi/api_get_member/ship3'
        # _unsetslot = body.api_slot_data
        # @updateAll()
      # when '/kcsapi/api_get_member/require_info'
      #   _unsetslot = body.api_unsetslot
      # when '/kcsapi/api_get_member/unsetslot'
      #   _unsetslot = body
      #   @updateAll()
      when '/kcsapi/api_req_kousyou/createitem'
        if body.api_create_flag == 1
          # _unsetslot = body.api_unsetslot
          @updateAll()
      when '/kcsapi/api_req_kaisou/lock'
        if @lockFilter in [0b10, 0b01]
          @updateAll()
      # when '/kcsapi/api_req_air_corps/set_plane'
      #   Not Implemented as land base status is not yet saved in env

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
        getLevelsFromKey={getLevelsFromKey}
      />
    </div>

ReactDOM.render <ItemInfoArea />, $('item-info')
