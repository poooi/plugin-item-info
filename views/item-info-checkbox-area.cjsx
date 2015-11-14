{React, ReactBootstrap} = window
{Button, Col, Grid, Row} = ReactBootstrap
Divider = require './divider'

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
              <input
                className='checkbox'
                type='checkbox'
                value={index}
                onChange={@handleClickCheckbox.bind(@, index)}
                onContextMenu={@handleClickCheckboxRightClick.bind(@, index)}
                checked={isChecked}
                />
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
            <Button className="filter-button" bsStyle='default' bsSize='small' onClick={@handleClickCheckboxAllButton} block>{__ 'Select All'}</Button>
          </Col>
          <Col xs={2}>
            <Button className="filter-button" bsStyle='default' bsSize='small' onClick={@handleClickCheckboxNoneButton} block>{__ 'Deselect All'}</Button>
          </Col>
        </Row>
      </Grid>
    </div>

module.exports = ItemInfoCheckboxArea
