import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Button } from '@blueprintjs/core'
import FontAwesome from 'react-fontawesome'
import { get, map, keys, max } from 'lodash'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import styled from 'styled-components'
import { rgba } from 'polished'

import { ItemIcon } from './common-styled'

import { iconEquipMapSelector } from './selectors'
import { int2BoolArray, boolArray2Int } from './utils'

const { config } = window

const ItemList = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const ItemEntry = styled.div`
  img {
    cursor: pointer;
  }
  width: 36px;
  height: 36px;
  margin: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  background-color: ${({ checked, theme = {} }) =>
    checked ? rgba(theme.GREEN1, 0.7) : rgba('black', 0.3)};
`

const FilterEntry = styled(ItemEntry)`
  background-color: ${({ checked, theme = {} }) =>
    checked ? rgba(theme.BLUE1, 0.7) : rgba('black', 0.3)};
`

const ControlArea = styled.div`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;

  button {
    margin-left: 1rem;
    margin-right: 1rem;
  }
`

const HR = styled.hr`
  display: block;
`

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
        <div id="item-info-filter">
          <ItemList className="type-check-area">
            {map(iconEquipMap, (_, id) => (
              <ItemEntry
                key={id}
                className="type-check-entry"
                onContextMenu={this.handleClickCheckContext(id)}
                onClick={this.handleClickCheck(id)}
                checked={type[id]}
              >
                <ItemIcon slotitemId={+id} />
              </ItemEntry>
            ))}
          </ItemList>

          <HR />

          <ControlArea>
            <FilterEntry onClick={this.handleLockFilter} checked={lock[0]}>
              <FontAwesome name="lock" />
            </FilterEntry>
            <FilterEntry onClick={this.handleUnlockFilter} checked={lock[1]}>
              <FontAwesome name="unlock" />
            </FilterEntry>
            <Button
              className="filter-button"
              onClick={this.handleClickCheckAll}
              minimal
            >
              {t('Select All')}
            </Button>

            <Button
              className="filter-button"
              onClick={this.handleClickCheckboxNone}
              minimal
            >
              {t('Deselect All')}
            </Button>

            {!config.get('plugin.ItemInfo.hideCheckboxHint', false) && (
              <div xs={8} className="checkbox-right-click-hint">
                {t('Right click a checkbox to select it only')}
              </div>
            )}
          </ControlArea>
        </div>
      </div>
    )
  }
}

export default ItemInfoCheckboxArea
