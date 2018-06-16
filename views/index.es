import React from 'react'
import { join } from 'path-extra'

import CheckboxArea from './checkbox-area'
import TableArea from './table-area'

export default () => (
  <div className="item-info">
    <link rel="stylesheet" href={join(__dirname, '..', 'assets', 'main.css')} />
    <CheckboxArea />
    <TableArea />
  </div>
)
