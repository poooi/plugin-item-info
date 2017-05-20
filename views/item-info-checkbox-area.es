import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Grid, Row, Input, Checkbox } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { get } from 'lodash'
import PropTypes from 'prop-types'

import { SlotitemIcon } from 'views/components/etc/icon'
import Divider from './divider'

import { iconEquipMapSelector } from './selectors'
import { int2BoolArray, boolArray2Int } from './utils'

const { __, config } = window

const ItemInfoCheckboxArea = connect(
  (state) => {
    const iconEquipMap = iconEquipMapSelector(state)
    let type = int2BoolArray(get(state, 'config.plugin.ItemInfo.type'))
    if (type.length !== Object.keys(iconEquipMap).length) {
      type = Object.keys(iconEquipMap).fill(true)
    }

    return {
      iconEquipMap,
      type,
      lock: int2BoolArray(get(state, 'config.plugin.ItemInfo.lock', 7)),
    }
  }
)(class ItemInfoCheckboxArea extends PureComponent {
  static propTypes = {
    iconEquipMap: PropTypes.objectOf(PropTypes.array).isRequired,
    type: PropTypes.arrayOf(PropTypes.bool).isRequired,
    lock: PropTypes.arrayOf(PropTypes.bool).isRequired,
  }


  saveConfig = (name, value) => {
    config.set(`plugin.ItemInfo.${name}`, value)
  }

  handleClickCheck = index => () => {
    const type = this.props.type.slice()
    type[index] = !type[index]

    this.saveConfig('type', boolArray2Int(type))
  }

  handleClickCheckContext = index => () => {
    const type = this.props.type.slice()
    type.fill(false)
    type[index] = true

    this.saveConfig('type', boolArray2Int(type))
  }

  handleClickCheckAll = () => {
    const type = this.props.type.slice()
    type.fill(true)

    this.saveConfig('type', boolArray2Int(type))
  }

  handleClickCheckboxNone = () => {
    const type = this.props.type.slice()
    type.fill(false)

    this.saveConfig('type', boolArray2Int(type))
  }

  handleLockFilter = () => {
    const lock = this.props.lock.slice()
    lock[0] = !lock[0]

    this.saveConfig('lock', boolArray2Int(lock))
  }

  handleUnlockFilter = () => {
    const lock = this.props.lock.slice()
    lock[1] = !lock[1]

    this.saveConfig('lock', boolArray2Int(lock))
  }

  render() {
    const { iconEquipMap, type, lock } = this.props
    return (
      <div id="item-info-settings">
        <Divider text={__('Filter Setting')} />
        <Grid id="item-info-filter">
          <Row>
            {
              Object.keys(iconEquipMap).map(str => +str).map((key, index) =>
                <Col
                  key={key}
                  xs={1}
                  onContextMenu={this.handleClickCheckContext(index)}
                >
                  <Input
                    className="checkbox"
                    type="checkbox"
                    value={index}
                    label={
                      <SlotitemIcon slotitemId={index + 1} />
                    }
                    onChange={this.handleClickCheck(index)}
                    checked={type[index]}
                  />
                </Col>
              )
            }
          </Row>

          <Row>
            <Col xs={2}>
              <Button
                className="filter-button"
                bsStyle="default"
                bsSize="small"
                onClick={this.handleClickCheckAll}
                block
              >
                {__('Select All')}
              </Button>
            </Col>
            <Col xs={2}>
              <Button
                className="filter-button"
                bsStyle="default"
                bsSize="small"
                onClick={this.handleClickCheckboxNone}
                block
              >
                {__('Deselect All')}
              </Button>
            </Col>
            {
              !config.get('plugin.ItemInfo.hideCheckboxHint', false) &&
                <Col xs={8} className="checkbox-right-click-hint">
                  {__('Right click a checkbox to select it only')}
                </Col>
            }
          </Row>
          <Row className="lock-filter">
            <Col xs={1}>
              <Checkbox
                inline
                className="checkbox"
                onChange={this.handleLockFilter}
                checked={lock[0]}
              >
                <FontAwesome name="lock" />
              </Checkbox>
            </Col>
            <Col xs={1}>
              <Checkbox
                inline
                className="checkbox"
                onChange={this.handleUnlockFilter}
                checked={lock[1]}
              >
                <FontAwesome name="unlock" />
              </Checkbox>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
})

export default ItemInfoCheckboxArea
