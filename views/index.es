import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from 'views/create-store'

import ItemInfoTableArea from './item-info-table-area'
import ItemInfoCheckboxArea from './item-info-checkbox-area'

const ItemInfoArea = () =>
  <div>
    <ItemInfoCheckboxArea />
    <ItemInfoTableArea />
  </div>

ReactDOM.render(<Provider store={store}><ItemInfoArea /></Provider>, $('item-info'))
