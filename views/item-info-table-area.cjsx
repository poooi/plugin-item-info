{React, ReactBootstrap} = window
{Grid, Table, Input} = ReactBootstrap
Divider = require './divider'

ItemInfoTable = React.createClass
  shouldComponentUpdate: (nextProps) ->
    !_.isEqual(@props, nextProps)
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
  alwaysTrue: -> true
  getInitialState: ->
    rows: []
    filterName: @alwaysTrue
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
  displayedRows: ->
    {filterName} = @state
    {rows, itemTypeChecked} = @props
    rows = rows.filter (row) =>
      row? and filterName(row.name) and itemTypeChecked[row.iconIndex]
    rows.sort (a, b) -> a.iconIndex - b.iconIndex || a.slotItemId - b.slotItemId
    for row in rows
      for shipsInLevel in row.ships
        shipsInLevel?.sort (a, b) -> b.level - a.level || a.id - b.id
    rows
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
