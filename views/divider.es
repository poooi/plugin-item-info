import React, { Component } from 'react'

export default class Divider extends Component {
  render() {
    const text = this.props.text || ''
    return (
      <div className="divider">
        <h5>{text}</h5>
        <hr />
      </div>
    )
  }
}
