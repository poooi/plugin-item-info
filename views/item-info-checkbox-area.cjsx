{React, ReactBootstrap, jQuery, __} = window
{Panel, Button, Col, Input, Grid, Row} = ReactBootstrap
Divider = require './divider'

ItemInfoCheckboxArea = React.createClass
  handleClickCheckbox: (index) ->
    {itemTypeChecked} = @props
    itemTypeChecked[index] = !itemTypeChecked[index]
    @props.filterRules(itemTypeChecked)
  handleCilckCheckboxAllButton: ->
    {itemTypeChecked} = @props
    itemTypeChecked.fill true
    @props.filterRules(itemTypeChecked)
  handleCilckCheckboxNoneButton: ->
    {itemTypeChecked} = @props
    itemTypeChecked.fill false
    @props.filterRules(itemTypeChecked)
  render: ->
    <div id='item-info-settings'>
      <Divider text={__ 'Filter Setting'} />
      <Grid id='item-info-filter'>
        <Row>
        {
          for itemTypeVal, index in @props.itemTypeChecked
            continue if index is 0
            <Col key={index} xs={1}>
              <input type='checkbox' value={index} onChange={@handleClickCheckbox.bind(@, index)} checked={@props.itemTypeChecked[index]} style={verticalAlign: 'middle'}/>
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
