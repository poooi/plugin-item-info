{React} = window

ItemInfoTableArea = require './item-info-table-area'
ItemInfoCheckboxArea = require './item-info-checkbox-area'

maxSlotType = 35

ItemInfoArea = React.createClass
  getInitialState: ->
    itemTypeChecked = new Array(maxSlotType + 1)
    itemTypeChecked.fill true
    itemTypeChecked: itemTypeChecked

  changeCheckbox: (callback) ->
    callback @state.itemTypeChecked
    @forceUpdate()

  render: ->
    <div>
      <ItemInfoCheckboxArea changeCheckbox={@changeCheckbox} itemTypeChecked={@state.itemTypeChecked} />
      <ItemInfoTableArea itemTypeChecked={@state.itemTypeChecked} />
    </div>

React.render <ItemInfoArea />, $('item-info')
