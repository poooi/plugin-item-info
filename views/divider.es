import React from 'react'
import PropTypes from 'prop-types'

const Divider = ({ text = '' }) => (
  <div className="divider">
    <h5>{text}</h5>
    <hr />
  </div>
)

Divider.propTypes = {
  text: PropTypes.string.isRequired,
}

export default Divider
