import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Grid, Row, Checkbox } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { get, map, keys, max } from 'lodash'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'

import { SlotitemIcon } from 'views/components/etc/icon'
import Divider from './divider'

import { iconEquipMapSelector } from './selectors'
import { int2BoolArray, boolArray2Int } from './utils'

const { config } = window

@translate(['poi-plugin-item-info'])
@connect(state => {
  const iconEquipMap = iconEquipMapSelector(state)
  let type = get(
    state,
    'config.plugin.ItemInfo.typeV2',
    int2BoolArray(get(state, 'config.plugin.ItemInfo.type')),
  )

  const expectedLength = max(map(keys(iconEquipMap), id => +id)) + 1
  if (type.length !== expectedLength) {
    type = Array.from({ length: expectedLength }).fill(true)
  }

  return {
    iconEquipMap,
    type,
    lock: int2BoolArray(get(state, 'config.plugin.ItemInfo.lock', 7)),
  }
})
class ItemInfoCheckboxArea extends PureComponent {
  static propTypes = {
    iconEquipMap: PropTypes.objectOf(PropTypes.array).isRequired,
    type: PropTypes.arrayOf(PropTypes.bool).isRequired,
    lock: PropTypes.arrayOf(PropTypes.bool).isRequired,
    t: PropTypes.func.isRequired,
  }

  saveConfig = (name, value) => {
    config.set(`plugin.ItemInfo.${name}`, value)
  }

  handleClickCheck = index => () => {
    const type = this.props.type.slice()
    type[index] = !type[index]

    this.saveConfig('typeV2', type)
  }

  handleClickCheckContext = index => () => {
    const type = this.props.type.slice()
    type.fill(false)
    type[index] = true

    this.saveConfig('typeV2', type)
  }

  handleClickCheckAll = () => {
    const type = this.props.type.slice()
    type.fill(true)

    this.saveConfig('typeV2', type)
  }

  handleClickCheckboxNone = () => {
    const type = this.props.type.slice()
    type.fill(false)

    this.saveConfig('typeV2', type)
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
    const { iconEquipMap, type, lock, t } = this.props
    return (
      <div id="item-info-settings">
        <Divider text={t('Filter Setting')} />
        <Grid id="item-info-filter">
          <Row className="type-check-area">
            {map(iconEquipMap, (_, id) => (
              <div
                key={id}
                className="type-check-entry"
                onContextMenu={this.handleClickCheckContext(id)}
              >
                <Checkbox
                  className="checkbox"
                  type="checkbox"
                  value={id}
                  onChange={this.handleClickCheck(id)}
                  checked={type[id]}
                >
                  <SlotitemIcon slotitemId={+id} />
                </Checkbox>
              </div>
            ))}
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
                {t('Select All')}
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
                {t('Deselect All')}
              </Button>
            </Col>
            {!config.get('plugin.ItemInfo.hideCheckboxHint', false) && (
              <Col xs={8} className="checkbox-right-click-hint">
                {t('Right click a checkbox to select it only')}
              </Col>
            )}
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
}

export default ItemInfoCheckboxArea
