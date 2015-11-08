{React, ReactBootstrap, jQuery, FontAwesome, __} = window
{Panel, Row, Grid, Col, Table, Button, OverlayTrigger, Tooltip} = ReactBootstrap
Divider = require './divider'

ItemInfoTable = React.createClass
  render: ->
    {$ships, $slotitems, _ships} = window
    <tr className="vertical">
      <td style={paddingLeft: 10}>
        {
          <img key={@props.slotItemType} src={
              path = require 'path'
              path.join(ROOT, 'assets', 'img', 'slotitem', "#{@props.itemPngIndex + 100}.png")
            }
          />
        }
        {$slotitems[@props.slotItemType].api_name}
      </td>
      <td className='center'>{@props.sumNum + ' '}<span style={fontSize: '12px'}>{'(' + @props.restNum + ')'}</span></td>
      <td>
        <Table id='equip-table'>
          <tbody>
          {
            for level in [0..10]
              if @props.levelList[level]?
                number = ' × ' + @props.levelList[level]
                <tr key={level}>
                  {
                    if level is 0 and @props.levelList[level] is @props.sumNum
                      <td style={width: '13%'}></td>
                    else if !@props.isAlv
                      if level is 10
                        prefix = '★max'
                      else
                        prefix = '★+' + level
                      <td style={width: '13%'}><span className='item-level-span'>{prefix}</span>{number}</td>
                    else if level is 0
                      <td style={width: '13%'}>0{number}</td>
                    else if level >= 1 and level <= 3
                      <td style={width: '13%'}>
                        {
                          for j in [1..level]
                            <strong key={j} style={color: '#3EAEFF'}>|</strong>
                        }
                        {number}
                      </td>
                    else if level >= 4 and level <= 6
                      <td style={width: '13%'}>
                        {
                          for j in [1..level - 3]
                            <strong key={j} style={color: '#F9C62F'}>\</strong>
                        }
                        {number}
                      </td>
                    else if level >= 7 and level <= 9
                      <td style={width: '13%'}>
                        <strong key={j} style={color: '#F9C62F'}><FontAwesome key={0} name='angle-double-right'/></strong>{number}
                      </td>
                    else if level >= 9
                      <td style={width: '13%'}>
                        <strong key={j} style={color: '#F94D2F'}>★</strong>{number}
                      </td>
                    else
                      <td></td>
                  }
                  <td>
                  {
                    if @props.equipList[level]?
                      for ship, index in @props.equipList[level]
                        <div key={index} className='equip-list-div'>
                          <span className='equip-list-div-span'>{'Lv.' + ship.shipLv}</span>
                          {_ships[ship.shipId].api_name}
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
  updateSlot: (slot) ->
    slotType = slot.api_slotitem_id
    isAlv = slot.api_alv
    level = isAlv || slot.api_level
    if @rows[slotType]?
      row = @rows[slotType]
      row.sumNum++
      if isAlv
        row.isAlv  = true
      if row.levelList[level]?
        row.levelList[level]++
      else
        row.levelList[level] = 1
    else
      row =
        slotItemType: slotType
        sumNum: 1
        useNum: 0
        equipList: []
        levelList: []
        isAlv: isAlv
      row.levelList[level] = 1
      @rows[slotType] = row

  handleResponse:  (e) ->
    {method, path, body, postBody} = e.detail
    {$ships, _ships, _slotitems, $slotitems, _} = window
    @rows = @state.rows
    switch path
      when '/kcsapi/api_get_member/slot_item' , '/kcsapi/api_req_kousyou/destroyitem2' , '/kcsapi/api_req_kousyou/destroyship' , '/kcsapi/api_req_kousyou/remodel_slot' , '/kcsapi/api_req_kaisou/powerup'
        @rows = []
        for _slotId, slot of _slotitems
          @updateSlot slot

      when '/kcsapi/api_req_kousyou/getship'
        for slot in body.api_slotitem
          @updateSlot slot

      when '/kcsapi/api_req_kousyou/createitem'
        if body.api_create_flag == 1
          slot = body.api_slot_item
          @updateSlot slot

      when '/kcsapi/api_port/port' , '/kcsapi/api_req_kaisou/slotset'
        if @rows.length > 0
          for row in @rows
            if row?
              row.equipList = []
              row.useNum = 0
          for _shipId, ship of _ships
            for slotId in ship.api_slot.concat ship.api_slot_ex
              continue if slotId <= 0
              continue if !_slotitems[slotId]?
              slotType = _slotitems[slotId].api_slotitem_id
              if slotType == -1
                console.log "Error:Cannot find the slotType by searching slotId from ship.api_slot"
                continue
              shipIdTmp = ship.api_id
              if @rows[slotType]?
                row = @rows[slotType]
                row.useNum++
                findShip = false
                level = _slotitems[slotId].api_alv || _slotitems[slotId].api_level
                if row.equipList[level]?
                  for equip in row.equipList[level]
                    if equip.shipId == shipIdTmp
                      findShip = true
                      break
                else
                  row.equipList[level] = []
                equipAdd = null
                if !findShip
                  equipAdd =
                    shipId: shipIdTmp
                    shipLv: ship.api_lv
                  row.equipList[level].push equipAdd
                  @rows[slotType] = row
              else
                console.log "Error: Not defined row"
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
              <th className="center" style={width: '25%'}>{__ 'Name'}</th>
              <th className="center" style={width: '9%'}>{__ 'Total'}<span style={fontSize: '11px'}>{'(' + __('rest') + ')'}</span></th>
              <th className="center" style={width: '66%'}>{__ 'State'}</th>
            </tr>
          </thead>
          <tbody>
          {
            {_, $slotitems} = window
            if @state.rows?
              itemPngIndex = null
              printRows = []
              for row in @state.rows
                if row?
                  itemInfo = $slotitems[row.slotItemType]
                  itemPngIndex = itemInfo.api_type[3]
                  row.itemPngIndex = itemPngIndex
                  if row.itemPngIndex in @props.itemTypeBoxes
                    printRows.push row
              printRows = _.sortBy printRows, 'itemPngIndex'
              for row, index in printRows
                for level in [0..10]
                  if row.equipList[level]?
                    row.equipList[level] = _.sortBy row.equipList[level], 'shipLv'
                    row.equipList[level]  .reverse()
                <ItemInfoTable
                  key = {index}
                  slotItemType = {row.slotItemType}
                  sumNum = {row.sumNum}
                  restNum = {row.sumNum - row.useNum}
                  equipList = {row.equipList}
                  levelList = {row.levelList}
                  isAlv = {row.isAlv}
                  itemPngIndex = {row.itemPngIndex}
                />
          }
          </tbody>
        </Table>
      </Grid>
    </div>

module.exports = ItemInfoTableArea
