{React, ReactDOM} = window

$('#font-awesome')?.setAttribute 'href', "#{ROOT}/components/font-awesome/css/font-awesome.min.css"

ItemInfoTableArea = require './item-info-table-area'
ItemInfoCheckboxArea = require './item-info-checkbox-area'

maxSlotType = 35

ItemInfoArea = React.createClass
  getInitialState: ->
    itemTypeChecked = new Array(maxSlotType + 1)
    itemTypeChecked.fill true
    {itemTypeChecked}

  changeCheckbox: (callback) ->
    callback @state.itemTypeChecked
    @forceUpdate()

  render: ->
    <div>
      <ItemInfoCheckboxArea changeCheckbox={@changeCheckbox} itemTypeChecked={@state.itemTypeChecked} />
      <ItemInfoTableArea itemTypeChecked={@state.itemTypeChecked} />
    </div>

ReactDOM.render <ItemInfoArea />, $('item-info')
