{Button, Col, Grid, Row, Checkbox} = ReactBootstrap
{SlotitemIcon} = require "#{ROOT}/views/components/etc/icon"
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
            <Col key={index} xs={1} onContextMenu={@handleClickCheckboxRightClick.bind(@, index)}>
              <Checkbox
                className='checkbox'
                onChange={@handleClickCheckbox.bind(@, index)}
                checked={isChecked}
              >
                <SlotitemIcon slotitemId={index} />
              </Checkbox>
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
          <Col xs={1}>
            <Checkbox
              className='checkbox'
              onChange={@props.changeLockFilter}
              checked={@props.lockFilter}
            >
              <FontAwesome name='lock' />
            </Checkbox>
          </Col>
          <Col xs={1}>
            <Checkbox
              className='checkbox'
              onChange={@props.changeUnlockFilter}
              checked={@props.unlockFilter}
            >
              <FontAwesome name='unlock' />
            </Checkbox>
          </Col>
        </Row>
      </Grid>
    </div>

module.exports = ItemInfoCheckboxArea
