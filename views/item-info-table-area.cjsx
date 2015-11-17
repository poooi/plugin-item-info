{React, ReactBootstrap} = window
{Grid, Table, Input} = ReactBootstrap
Divider = require './divider'

ItemInfoTable = React.createClass
  render: ->
    <tr className="vertical">
      <td className='item-name-td'>
        {
          <img src={
              path = require 'path'
              path.join(ROOT, 'assets', 'img', 'slotitem', "#{@props.iconIndex + 100}.png")
            }
          />
        }
        {@props.name}
      </td>
      <td className='center'>{@props.total + ' '}<span style={fontSize: '12px'}>{'(' + @props.rest + ')'}</span></td>
      <td>
        <Table id='equip-table'>
          <tbody>
          {
            for count, level in @props.levelCount
              if count?
                number = ' × ' + count
                <tr key={level}>
                  {
                    if level is 0 and count is @props.total
                      <td style={width: '13%'}></td>
                    else if !@props.isAlv
                      if level is 10
                        prefix = '★max'
                      else
                        prefix = '★' + level
                      <td style={width: '13%'}><span className='item-level-span'>{prefix}</span>{number}</td>
                    else if level is 0
                      <td style={width: '13%'}><span className='item-alv-0 item-level-span'>O</span>{number}</td>
                    else if level <= 7
                      <td style={width: '13%'}>
                        <span className='item-level-span'>
                          <img className='item-alv-img' src={
                              path = require 'path'
                              path.join(ROOT, 'assets', 'img', 'airplane', "alv#{level}.png")
                            }
                          />
                        </span>
                        {number}
                      </td>
                    else # unreachable
                      <td style={width: '13%'}></td>
                  }
                  <td>
                  {
                    if @props.ships[level]?
                      for ship in @props.ships[level]
                        <div key={ship.id} className='equip-list-div'>
                          <span className='equip-list-div-span'>{'Lv.' + ship.level}</span>
                          {ship.name}
                          {
                            if ship.count > 1
                              <span className='equip-list-number'>{'×' + ship.count}</span>
                          }
                        </div>
                  }
                  </td>
                </tr>
          }
          </tbody>
        </Table>
      </td>
    </tr>

ItemInfoTableArea = React.createClass
  getInitialState: ->
    rows: []
    filterName: @alwaysTrue
  updateSlot: (slot) ->
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
        name: itemInfo.api_name
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
      continue if slotId <= 0 or !_slotitems[slotId]?
      slotType = _slotitems[slotId].api_slotitem_id
      continue if slotType == -1
      row = @rows[slotType]
      continue if !row?
      row.used++
      level = _slotitems[slotId].api_alv || _slotitems[slotId].api_level
      row.ships[level] ?= []
      shipInfo = row.ships[level].find (shipInfo) -> shipInfo.id is shipId
      if shipInfo
        shipInfo.count++
      else
        shipInfo =
          id: shipId
          level: ship.api_lv
          name: ship.api_name
          count: 1
        row.ships[level].push shipInfo
  displayedRows: ->
    {rows, filterName} = @state
    rows = rows.filter (row) =>
      row? and filterName(row.name) and @props.itemTypeChecked[row.iconIndex]
    rows.sort (a, b) -> a.iconIndex - b.iconIndex
    for row in rows
      for shipsInLevel in row.ships
        shipsInLevel?.sort (a, b) -> b.level - a.level || a.id - b.id
    rows
  handleFilterNameChange: ->
    key = @refs.input.getValue()
    if key
      filterName = null
      match = key.match /^\/(.+)\/([gim]*)$/
      if match?
        try
          re = new RegExp match[1], match[2]
          filterName = re.test.bind(re)
      filterName ?= (name) -> name.indexOf(key) >= 0
    else
      filterName = @alwaysTrue
    @setState {filterName}
  alwaysTrue: -> true
  handleResponse: (e) ->
    {method, path, body, postBody} = e.detail
    {$ships, _ships, _slotitems, $slotitems, _} = window
    @rows = @state.rows
    shouldUpdate = false
    switch path
      when '/kcsapi/api_port/port', '/kcsapi/api_get_member/slot_item', '/kcsapi/api_get_member/ship3', '/kcsapi/api_req_kousyou/destroyitem2', '/kcsapi/api_req_kousyou/destroyship', '/kcsapi/api_req_kousyou/remodel_slot', '/kcsapi/api_req_kaisou/powerup'
        shouldUpdate = true
        @rows = []
        @updateSlot slot for _slotId, slot of _slotitems
        @updateShips()
      when '/kcsapi/api_req_kousyou/getship'
        shouldUpdate = true
        @updateSlot slot for slot in body.api_slotitem
        @addShip body.api_ship
      when '/kcsapi/api_req_kousyou/createitem'
        if body.api_create_flag == 1
          shouldUpdate = true
          @updateSlot body.api_slot_item
    if shouldUpdate
      @setState
        rows: @rows
  componentDidMount: ->
    window.addEventListener 'game.response', @handleResponse
  componentWillUnmount: ->
    window.removeEventListener 'game.response', @handleResponse
  render: ->
    <div id='item-info-show'>
      <Divider text={__ 'Equipment Info'} />
      <Grid id="item-info-area">
        <Table striped condensed hover id="main-table">
          <thead className="slot-item-table-thead">
            <tr>
              <th className="center" style={width: '25%'}>
                <Input className='name-filter' type='text' ref='input' placeholder={__ 'Name'} onChange={@handleFilterNameChange}/>
              </th>
              <th className="center" style={width: '9%'}>{__ 'Total'}<span style={fontSize: '11px'}>{'(' + __('rest') + ')'}</span></th>
              <th className="center" style={width: '66%'}>{__ 'State'}</th>
            </tr>
          </thead>
          <tbody>
          {
            for row in @displayedRows()
              <ItemInfoTable
                key = {row.slotItemId}
                slotItemId = {row.slotItemId}
                name = {row.name}
                total = {row.total}
                rest = {row.total - row.used}
                ships = {row.ships}
                levelCount = {row.levelCount}
                isAlv = {row.isAlv}
                iconIndex = {row.iconIndex}
              />
          }
          </tbody>
        </Table>
      </Grid>
    </div>

module.exports = ItemInfoTableArea
