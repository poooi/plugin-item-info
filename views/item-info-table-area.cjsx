{React, ReactBootstrap, jQuery, FontAwesome} = window
{Panel, Row, Grid, Col, Table, Button, OverlayTrigger, Tooltip} = ReactBootstrap
Divider = require './divider'

ItemInfoTable = React.createClass
  render: ->
    {$ships, $slotitems} = window
    <tr className="vertical">
      <td style={{paddingLeft: 10+'px'}}>
        {
          <img key={@props.slotItemType} src={
              path = require 'path'
              path.join(ROOT, 'assets', 'img', 'slotitem', "#{@props.itemPngIndex + 33}.png")
            }
            />
        }
        {$slotitems[@props.slotItemType].api_name}
      </td>
      <td className="center">{@props.sumNum}</td>
      <td className="center">{@props.restNum}</td>
      <td>
        <Table style={{backgroundColor: 'transparent';verticalAlign: 'middle';marginBottom:0+'px';}}>
          <tbody>
          {
            if @props.switchShow
              length = 0
              existLevels = []
              for index in [10..0]
                if @props.levelList[index]?
                  existLevels[length] = index
                  length++
              trNum = parseInt(length/5)
              for tmp in [0..trNum]
                <tr key={tmp}>
                {
                  for indexCol in [0..4]
                    index = tmp*5+indexCol
                    if  existLevels[index]?
                      level = existLevels[index]
                      count = @props.levelList[level]
                      <td className="slot-item-table-td" key={index}>
                        {
                          if level == 0
                            " "
                          else
                            if @props.levelEquip? and @props.levelEquip[level]? and @props.levelEquip.length > 0
                              <OverlayTrigger placement='top' overlay={
                                <Tooltip>
                                  <span>{"装备情况"}</span>
                                  {
                                    for shipNameId, index in @props.levelEquip[level]
                                      <span key={index}><br />{$ships[shipNameId].api_name}</span>
                                  }
                                </Tooltip>}>
                                <span>{level + "★" + " × " + count}</span>
                              </OverlayTrigger>
                            else
                              level + "★" + " × " + count
                        }
                      </td>
                    else
                      <td className="slot-item-table-td" key={index}>{" "}</td>
                }
                </tr>
            else
              trNum = parseInt(@props.equipList.length/5)
              for tmp in [0..trNum]
                <tr key={tmp}>
                {
                  for indexCol in [0..4]
                    index = tmp*5+indexCol
                    if @props.equipList[index]?
                      equipShip = @props.equipList[index]
                      <td className="slot-item-table-td" key={index}>
                        {$ships[equipShip.shipNameId].api_name + " × " + equipShip.equipNum}
                      </td>
                    else
                      <td className="slot-item-table-td" key={index}>{" "}</td>
                }
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
              inUseNum: 0
              equipList: []
              levelList: []
              levelEquip: []
            row.levelList[level] = 1
            rows[slotType] = row

      when '/kcsapi/api_req_kousyou/getship'
        for slot in body.api_slotitem
          slotType = slot.api_slotitem_id
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
              inUseNum: 0
              equipList: []
              levelList: []
              levelEquip: []
            row.levelList[level] = 1
            rows[slotType] = row

      when '/kcsapi/api_req_kousyou/createitem'
        if body.api_create_flag == 1
          slot = body.api_slot_item
          slotType = slot.api_slotitem_id
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
              inUseNum: 0
              equipList: []
              levelList: []
              levelEquip: []
            row.levelList[level] = 1
            rows[slotType] = row

      when '/kcsapi/api_port/port' , '/kcsapi/api_req_kaisou/slotset'
        if rows.length > 0
          for row in rows
            if row?
              row.equipList = []
              row.levelEquip = []
              row.inUseNum = 0
          for _shipId, ship of _ships
            for slotId in ship.api_slot
              continue if slotId == -1
              slotType = _slotitems[slotId].api_slotitem_id
              if slotType == -1
                console.log "Error:Cannot find the slotType by searching slotId from ship.api_slot"
                continue
              shipNameIdTmp = ship.api_ship_id
              if rows[slotType]?
                row = rows[slotType]
                row.inUseNum++
                findShip = false
                for equip in row.equipList
                  if equip.shipNameId == shipNameIdTmp
                    equip.equipNum++
                    findShip = true
                    break
                equipAdd = null
                if !findShip
                  equipAdd =
                    shipNameId: shipNameIdTmp
                    equipNum: 1
                  row.equipList.push equipAdd
                if  _slotitems[slotId].api_level > 0
                  level = _slotitems[slotId].api_level
                  if row.levelEquip[level]?
                    row.levelEquip[level].push shipNameIdTmp
                  else
                    row.levelEquip[level] = []
                    row.levelEquip[level].push shipNameIdTmp
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
      <Divider text="装备信息" />
      <Grid id="item-info-area">
        <Table striped condensed hover id="main-table">
          <thead className="slot-item-table-thead">
            <tr>
              <th className="center" style={{width: '23.40%';}}>装备名称</th>
              <th className="center" style={{width: '6.17%';}}>总数量</th>
              <th className="center" style={{width: '6.17%';}}>剩余数</th>
              <th className="center" style={{width: '64.26%';}}>
                <span>{if @props.switchShowTable then "改修情况" else "装备情况"}</span>
                <OverlayTrigger placement='right' overlay={<Tooltip>{if @props.switchShowTable then "切换至装备情况" else "切换至改修情况"}</Tooltip>}>
                  <Button id='switch-btn' bsStyle='default' bsSize='small' onClick={@props.switchShow}>
                    <FontAwesome name='retweet' />
                  </Button>
                </OverlayTrigger>
              </th>
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
                row.equipList = _.sortBy row.equipList, 'equipNum'
                row.equipList.reverse()
                <ItemInfoTable
                  key = {index}
                  index = {index}
                  slotItemType = {row.slotItemType}
                  sumNum = {row.sumNum}
                  restNum = {row.sumNum - row.inUseNum}
                  switchShow = {@props.switchShowTable}
                  equipList = {row.equipList}
                  levelList = {row.levelList}
                  levelEquip = {row.levelEquip}
                  itemPngIndex = {row.itemPngIndex}
                />
          }
          </tbody>
        </Table>
      </Grid>
    </div>

module.exports = ItemInfoTableArea
