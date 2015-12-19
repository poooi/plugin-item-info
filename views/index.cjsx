
$('#font-awesome')?.setAttribute 'href', "#{ROOT}/components/font-awesome/css/font-awesome.min.css"

ItemInfoTableArea = require './item-info-table-area'
ItemInfoCheckboxArea = require './item-info-checkbox-area'

maxSlotType = 35

ItemInfoArea = React.createClass
  getInitialState: ->
    itemTypeChecked = new Array(maxSlotType + 1)
    itemTypeChecked.fill true
    @lockFilter = config.get 'plugin.ItemInfo.lockFilter', false

    itemTypeChecked: itemTypeChecked
    rows: []

  changeCheckbox: (callback) ->
    callback @state.itemTypeChecked
    @forceUpdate()
  changeLockFilter: ->
    @lockFilter = !@lockFilter
    config.set 'plugin.ItemInfo.lockFilter', @lockFilter
    @updateAll()
    @setState
      rows: @rows

  updateSlot: (slot) ->
    return if !slot.api_locked && @lockFilter
    slotItemId = slot.api_slotitem_id
    isAlv = slot.api_alv
    level = isAlv || slot.api_level || 0
    if @rows[slotItemId]?
      row = @rows[slotItemId]
      row.total++
      if isAlv
        row.isAlv = true
      if row.levelCount[level]?
        row.levelCount[level]++
      else
        row.levelCount[level] = 1
    else
      itemInfo = $slotitems[slotItemId]
      row =
        slotItemId: slotItemId
        iconIndex: itemInfo.api_type[3]
        name: window.i18n.resources.__(itemInfo.api_name)
        total: 1
        used: 0
        ships: []
        levelCount: []
        isAlv: isAlv
      row.levelCount[level] = 1
      @rows[slotItemId] = row
  updateShips: ->
    return if !window._ships? or @rows.length == 0
    for row in @rows
      if row?
        row.ships = []
        row.used = 0
    @addShip ship for _id, ship of _ships
  addShip: (ship) ->
    shipId = ship.api_id
    for slotId in ship.api_slot.concat ship.api_slot_ex
      continue if slotId <= 0
      slot = _slotitems[slotId]
      continue unless slot?
      continue if !slot.api_locked && @lockFilter
      row = @rows[slot.api_slotitem_id]
      continue unless row?
      row.used++
      level = slot.api_alv || slot.api_level || 0
      row.ships[level] ?= []
      shipInfo = row.ships[level].find (shipInfo) -> shipInfo.id is shipId
      if shipInfo
        shipInfo.count++
      else
        shipInfo =
          id: shipId
          level: ship.api_lv
          name: window.i18n.resources.__(ship.api_name)
          count: 1
        row.ships[level].push shipInfo
  updateAll: ->
    @rows = []
    if _slotitems?
      @updateSlot slot for _slotId, slot of _slotitems
      @updateShips()
      true
    else
      false

  handleResponse: (e) ->
    {method, path, body, postBody} = e.detail
    {$ships, _ships, _slotitems, $slotitems, _} = window
    @rows = @state.rows
    shouldUpdate = false
    switch path
      when '/kcsapi/api_port/port', '/kcsapi/api_get_member/slot_item', '/kcsapi/api_get_member/ship3', '/kcsapi/api_req_kousyou/destroyitem2', '/kcsapi/api_req_kousyou/destroyship', '/kcsapi/api_req_kousyou/remodel_slot', '/kcsapi/api_req_kaisou/powerup'
        shouldUpdate = @updateAll()
      when '/kcsapi/api_req_kousyou/getship'
        shouldUpdate = true
        @updateSlot slot for slot in body.api_slotitem
        @addShip body.api_ship
      when '/kcsapi/api_req_kousyou/createitem'
        if body.api_create_flag == 1
          shouldUpdate = true
          @updateSlot body.api_slot_item
      when '/kcsapi/api_req_kaisou/lock'
        if @lockFilter
          shouldUpdate = @updateAll()
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
        itemTypeChecked={@state.itemTypeChecked}
        lockFilter={@lockFilter}
      />
      <ItemInfoTableArea
        itemTypeChecked={@state.itemTypeChecked}
        rows={@state.rows}
      />
    </div>

ReactDOM.render <ItemInfoArea />, $('item-info')
