import { screen } from 'electron'
import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from 'react-bootstrap'

const __ = window.i18n['poi-plugin-item-info'].__.bind(window.i18n['poi-plugin-item-info'])

const { workArea } = screen.getPrimaryDisplay()
let { x, y, width, height } = config.get('plugin.ItemInfo.bounds', workArea)
const validate = (n, min, range) => (n != null && n >= min && n < min + range)
const withinDisplay = (d) => {
  const wa = d.workArea
  return validate(x, wa.x, wa.width) && validate(y, wa.y, wa.height)
}
if (!screen.getAllDisplays().some(withinDisplay)) {
  x = workArea.x
  y = workArea.y
}
if (width == null) {
  width = workArea.width
}
if (height == null) {
  height = workArea.height
}

export const windowOptions = {
  x,
  y,
  width,
  height,
  realClose: !config.get('plugin.ItemInfo.persist', true),
}

export const windowURL = `file://${__dirname}/index.html`
export const useEnv = true

class CheckboxLabelConfig extends PureComponent {
  static propTypes = {
    label: PropTypes.string.isRequired,
    configName: PropTypes.string.isRequired,
    undecided: PropTypes.bool,
    defaultVal: PropTypes.any,
  }

  static defaultProps = {
    undecided: false,
    defaultVal: undefined,
  }

  constructor(props) {
    super(props)
    this.state = {
      value: config.get(`plugin.ItemInfo.${this.props.configName}`, props.defaultVal),
    }
  }

  handleChange = () => {
    this.setState({
      value: !this.state.value,
    })
    config.set(`plugin.ItemInfo.${this.props.configName}`, !this.state.value)
  }

  render() {
    return (
      <div className={this.props.undecided ? 'undecided-checkbox-inside' : ''} >
        <Checkbox
          disabled={this.props.undecided}
          checked={this.props.undecided ? false : this.state.value}
          onChange={this.props.undecided ? null : this.handleChange}
        >
          {this.props.label}
        </Checkbox>
      </div>
    )
  }
}

export const settingsClass = () => (
  <div id="item-info-config">
    <CheckboxLabelConfig
      label={__('Keep running at backend (takes effect after restart)')}
      configName="persist"
      defaultVal={false}
    />
  </div>
)
