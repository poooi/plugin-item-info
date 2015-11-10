{React, ReactBootstrap, jQuery, __} = window
{Panel, Button, Col, Input, Grid, Row} = ReactBootstrap
Divider = require './divider'

ItemInfoCheckboxArea = React.createClass
  getInitialState: ->
    itemTypeChecked: [false, true, true, true, true, true, true, true, true, true, true, true,
                      true, true, true, true, true, true, true, true, true, true, true,
                      true, true, true, true, true, true, true, true, true, true, true, true, true]
  handleClickCheckbox: (index) ->
    checkboxes = []
    {itemTypeChecked} = @state
    itemTypeChecked[index] = !itemTypeChecked[index]
    for itemTypeVal, i in itemTypeChecked
      checkboxes.push i if itemTypeChecked[i]
    @setState {itemTypeChecked}
    @props.filterRules(checkboxes)
  handleCilckCheckboxAllButton: ->
    checkboxes = []
    {itemTypeChecked} = @state
    for itemTypeVal, i in itemTypeChecked
      if i
        itemTypeChecked[i] = true
        checkboxes.push i
    @setState {itemTypeChecked}
    @props.filterRules(checkboxes)
  handleCilckCheckboxNoneButton: ->
    checkboxes = []
    {itemTypeChecked} = @state
    for itemTypeVal, i in itemTypeChecked
     itemTypeChecked[i] = false
    @setState {itemTypeChecked}
    @props.filterRules(checkboxes)
  render: ->
    <div id='item-info-settings'>
      <Divider text={__ 'Filter Setting'} />
      <Grid id='item-info-filter'>
        <Row>
        {
          for itemTypeVal, index in @state.itemTypeChecked
            continue if !index
            <Col key={index} xs={1}>
              <input type='checkbox' value={index} onChange={@handleClickCheckbox.bind(@, index)} checked={@state.itemTypeChecked[index]} style={verticalAlign: 'middle'}/>
              <img src={
                  path = require 'path'
                  path.join(ROOT, 'assets', 'img', 'slotitem', "#{index + 100}.png")
                }
                />
            </Col>
        }
        </Row>
        <Row>
          <Col xs={2}>
            <Button className="filter-button" bsStyle='default' bsSize='small' onClick={@handleCilckCheckboxAllButton} block>{__ 'Select All'}</Button>
          </Col>
          <Col xs={2}>
            <Button className="filter-button" bsStyle='default' bsSize='small' onClick={@handleCilckCheckboxNoneButton} block>{__ 'Deselect All'}</Button>
          </Col>
        </Row>
      </Grid>
    </div>

module.exports = ItemInfoCheckboxArea
