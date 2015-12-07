{React, ReactBootstrap} = window
{Button, Col, Grid, Row, Input} = ReactBootstrap
Divider = require './divider'
path = require 'path'

ItemInfoCheckboxArea = React.createClass
  handleClickCheckbox: (index) ->
    @props.changeCheckbox (box) -> box[index] = !box[index]
  handleClickCheckboxRightClick: (index) ->
    @props.changeCheckbox (box) ->
      box.fill false
      box[index] = true
  handleClickCheckboxAllButton: ->
    @props.changeCheckbox (box) -> box.fill true
  handleClickCheckboxNoneButton: ->
    @props.changeCheckbox (box) -> box.fill false
  render: ->
    <div id='item-info-settings'>
      <Divider text={__ 'Filter Setting'} />
      <Grid id='item-info-filter'>
        <Row>
        {
          for isChecked, index in @props.itemTypeChecked
            continue if index is 0
            <Col key={index} xs={1}>
              <Input
                className='checkbox'
                type='checkbox'
                value={index}
                label={
                  <img src={path.join(ROOT, 'assets', 'img', 'slotitem', "#{index + 100}.png")} />
                }
                onChange={@handleClickCheckbox.bind(@, index)}
                onContextMenu={@handleClickCheckboxRightClick.bind(@, index)}
                checked={isChecked}
              />
            </Col>
        }
        </Row>
        <Row>
          <Col xs={2}>
            <Button className="filter-button" bsStyle='default' bsSize='small' onClick={@handleClickCheckboxAllButton} block>{__ 'Select All'}</Button>
          </Col>
          <Col xs={2}>
            <Button className="filter-button" bsStyle='default' bsSize='small' onClick={@handleClickCheckboxNoneButton} block>{__ 'Deselect All'}</Button>
          </Col>
          {
            if not config.get('plugin.ItemInfo.hideCheckboxHint', false)
              <Col xs={8} className='checkbox-right-click-hint'>{__ 'Right click a checkbox to select it only'}</Col>
          }
        </Row>
        <Row className='lock-filter'>
          <Col xs={4}>
            <Input
              className='checkbox'
              type='checkbox'
              value='lock'
              label={__ 'Display only locked equipment'}
              onChange={@props.changeLockFilter}
              checked={@props.lockFilter}
            />
          </Col>
        </Row>
      </Grid>
    </div>

module.exports = ItemInfoCheckboxArea
