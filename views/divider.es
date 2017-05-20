import React from 'react'

const Divider = ({ text = '' }) => (
  <div className="divider">
    <h5>{text}</h5>
    <hr />
  </div>
)

export default Divider
