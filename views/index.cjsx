{React} = window

ItemInfoTableArea = require './item-info-table-area'
ItemInfoCheckboxArea = require './item-info-checkbox-area'

ItemInfoArea = React.createClass
  getInitialState: ->
    itemTypeBoxes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                    14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
                    25, 26, 27, 28, 29, 30, 31, 32, 33]
    switchShowTable: false

  filterRules: (boxes) ->
    @setState
      itemTypeBoxes: boxes

  switchShow: ->
    @setState
      switchShowTable: !@state.switchShowTable

  render: ->
    <div>
      <ItemInfoCheckboxArea filterRules={@filterRules} />
      <ItemInfoTableArea itemTypeBoxes={@state.itemTypeBoxes} switchShowTable={@state.switchShowTable} switchShow={@switchShow}/>
    </div>

React.render <ItemInfoArea />, $('item-info')
