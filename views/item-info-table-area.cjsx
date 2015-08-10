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
                <tr key={level}>
                  <td style={width: '13%'}>{level + '★' + ' × ' + @props.levelList[level]}</td>
                  <td>
                  {
                    if @props.equipList[level]?
                      for ship, index in @props.equipList[level]
                        <div key={index} className='equip-list-div'>
                          <span className='equip-list-div-span' >{'Lv.' + ship.shipLv}</span>
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
    rows:[]
  handleResponse:  (e) ->
    {method, path, body, postBody} = e.detail
    {$ships, _ships, _slotitems, $slotitems, _} = window
    {rows} = @state
    switch path
      when '/kcsapi/api_get_member/slot_item' , '/kcsapi/api_req_kousyou/destroyitem2' , '/kcsapi/api_req_kousyou/destroyship' , '/kcsapi/api_req_kousyou/remodel_slot' , '/kcsapi/api_req_kaisou/powerup'
        rows = []
        for _slotId, slot of _slotitems
          slotType = slot.api_slotitem_id
          level = slot.api_level
          if rows[slotType]?
            rows[slotType].sumNum++
            if rows[slotType].levelList[level]?
              rows[slotType].levelList[level]++
            else
              rows[slotType].levelList[level] = 1
          else
            row =
              slotItemType: slotType
              sumNum: 1
              useNum: 0
              equipList: []
              levelList: []
            row.levelList[level] = 1
            rows[slotType] = row

      when '/kcsapi/api_req_kousyou/getship'
        for slot in body.api_slotitem
          slotType = slot.api_slotitem_id
          level = slot.api_level
          if rows[slotType]?
            rows[slotType].sumNum++
            if rows[slotType].levelList[level]?
              rows[slotType].levelList[level]++
            else
              rows[slotType].levelList[level] = 1
          else
            row =
              slotItemType: slotType
              sumNum: 1
              useNum: 0
              equipList: []
              levelList: []
            row.levelList[level] = 1
            rows[slotType] = row

      when '/kcsapi/api_req_kousyou/createitem'
        if body.api_create_flag == 1
          slot = body.api_slot_item
          slotType = slot.api_slotitem_id
          level = slot.api_level
          if rows[slotType]?
            rows[slotType].sumNum++
            if rows[slotType].levelList[level]?
              rows[slotType].levelList[level]++
            else
              rows[slotType].levelList[level] = 1
          else
            row =
              slotItemType: slotType
              sumNum: 1
              useNum: 0
              equipList: []
              levelList: []
            row.levelList[level] = 1
            rows[slotType] = row

      when '/kcsapi/api_port/port' , '/kcsapi/api_req_kaisou/slotset'
        if rows.length > 0
          for row in rows
            if row?
              row.equipList = []
              row.useNum = 0
          for _shipId, ship of _ships
            for slotId in ship.api_slot
              continue if slotId == -1
              slotType = _slotitems[slotId].api_slotitem_id
              if slotType == -1
                console.log "Error:Cannot find the slotType by searching slotId from ship.api_slot"
                continue
              shipIdTmp = ship.api_id
              if rows[slotType]?
                row = rows[slotType]
                row.useNum++
                level = _slotitems[slotId].api_level
                findShip = false
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
                  rows[slotType] = row
              else
                console.log "Error: Not defined row"
    @setState
      rows: rows
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
                  itemPngIndex = {row.itemPngIndex}
                />
          }
          </tbody>
        </Table>
      </Grid>
    </div>

module.exports = ItemInfoTableArea
