import React from 'react'
import { join } from 'path-extra'

import ItemInfoTableArea from './item-info-table-area'
import ItemInfoCheckboxArea from './item-info-checkbox-area'

export default () => (
  <div className="item-info">
    <link rel="stylesheet" href={join(__dirname, '..', 'assets', 'main.css')} />
    <ItemInfoCheckboxArea />
    <ItemInfoTableArea />
  </div>
)
