import React, { Component } from 'react'
import { FormControl, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import { get, map, flatten, sortBy, max, keys } from 'lodash'
import path from 'path'
import PropTypes from 'prop-types'
import { translate } from 'react-i18next'
import { compose } from 'redux'
import { HTMLTable } from '@blueprintjs/core'
import styled from 'styled-components'
import { rgba } from 'polished'

import { getItemData } from 'views/components/ship/slotitems-data'

import { ItemIcon } from './common-styled'
import {
  rowsSelector,
  iconEquipMapSelector,
  reduceShipDataSelectorFactory,
  reduceAirbaseSelectorFactory,
} from './selectors'
import { int2BoolArray, getLevelsFromKey } from './utils'

const { ROOT } = window

const ItemCount = styled.div`
  min-width: 3em;
`

const ItemSubCategory = styled.div`
  display: flex;
  align-items: center;

  & + & {
    margin-top: 1em;
  }
`

const ItemSubCategoryCount = styled.div`
  min-width: 5em;

  img {
    width: 16px;
    height: 16px;
  }
`

const ShipTags = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const ShipTagContainer = styled.div`
  margin: 0.5ex;
  padding: 0.5ex;
  border-radius: 4px;
  background-color: ${rgba('black', 0.5)};
`

const ShipEquipCount = styled.span`
  color: ${({ theme = {} }) => theme.BLUE4};
  font-weight: bold;
`

const ShipTag = compose(
  translate(['resources']),
  connect((state, { shipId }) => ({
    ship:
      shipId > 0
        ? reduceShipDataSelectorFactory(shipId)(state)
        : reduceAirbaseSelectorFactory(-shipId - 1)(state),
  })),
)(({ ship: { level, name, area }, count, t }) => (
  <ShipTagContainer>
    {level > 0 && <span className="equip-list-div-span">Lv.{level}</span>}{' '}
    <span className="known-ship-name">
      {area && `[${area}]`}
      {t(name)}
    </span>
    {count > 1 && <ShipEquipCount>×{count}</ShipEquipCount>}
  </ShipTagContainer>
))

ShipTag.propTypes = {
  shipId: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
}

// ShipTag.WrappedComponent.propTypes = {
//   ship: PropTypes.shape({
//     level: PropTypes.number,
//     name: PropTypes.string.isRequired,
//     area: PropTypes.string,
//   }).isRequired,
//   count: PropTypes.number.isRequired,
// }

const ItemInfoTable = ({ row, t, compact }) => {
  const { total, active, lvCount, lvShip, hasAlv, hasLevel } = row

  const itemData = getItemData(row).map(
    (data, index) => <div key={index}>{data}</div>, // eslint-disable-line react/no-array-index-key
  )
  const itemOverlay = itemData.length && (
    <Tooltip id={`$equip-${row.api_id}`}>
      <div> {itemData} </div>
    </Tooltip>
  )
  const slotItemIconSpan = (
    <span>
      <ItemIcon slotitemId={row.api_type[3]} />
    </span>
  )

  return (
    <>
      {compact && (
        <tr>
          <td>
            {itemOverlay ? (
              <OverlayTrigger placement="top" overlay={itemOverlay}>
                {slotItemIconSpan}
              </OverlayTrigger>
            ) : (
              slotItemIconSpan
            )}
            {t(row.api_name, { keySeparator: 'chiba' })}
          </td>
          <td className="item-count-cell">
            <ItemCount>
              {`${total} `}
              <span>{`(${total - active})`}</span>
            </ItemCount>
          </td>
        </tr>
      )}
      <tr className="vertical">
        {!compact && (
          <>
            <td className="item-name-cell">
              {itemOverlay ? (
                <OverlayTrigger placement="top" overlay={itemOverlay}>
                  {slotItemIconSpan}
                </OverlayTrigger>
              ) : (
                slotItemIconSpan
              )}
              {t(row.api_name, { keySeparator: 'chiba' })}
            </td>
            <td className="item-count-cell">
              <ItemCount>
                {`${total} `}
                <span>{`(${total - active})`}</span>
              </ItemCount>
            </td>
          </>
        )}
        <td>
          <div className="equip-table">
            {Object.keys(lvCount)
              .map((key) => +key)
              .sort((a, b) => a - b)
              .map((key) => {
                const { alv, level } = getLevelsFromKey(key)
                const count = lvCount[key]
                let alvPrefix
                let levelPrefix

                if (!hasAlv) {
                  alvPrefix = ''
                } else if (alv === 0) {
                  alvPrefix = <span className="item-alv-0">O</span>
                } else if (alv <= 7) {
                  alvPrefix = (
                    <img
                      alt={`alv-${alv}`}
                      className="item-alv-img"
                      src={path.join(
                        ROOT,
                        'assets',
                        'img',
                        'airplane',
                        `alv${alv}.png`,
                      )}
                    />
                  )
                }

                if (!hasLevel) {
                  levelPrefix = ''
                } else if (level === 10) {
                  levelPrefix = '★max'
                } else {
                  levelPrefix = `★${level}`
                }

                const countByShip = lvShip[key]
                return (
                  <ItemSubCategory key={key}>
                    <ItemSubCategoryCount>
                      <span className="item-level-span">
                        {alvPrefix} {levelPrefix}
                      </span>{' '}
                      × {count}
                    </ItemSubCategoryCount>
                    <ShipTags>
                      {countByShip &&
                        Object.keys(countByShip)
                          .map((id) => +id)
                          .map(
                            (shipId) =>
                              shipId !== 0 && (
                                <ShipTag
                                  key={shipId}
                                  shipId={shipId}
                                  count={countByShip[shipId]}
                                />
                              ),
                          )}
                    </ShipTags>
                  </ItemSubCategory>
                )
              })}
          </div>
        </td>
      </tr>
    </>
  )
}

const rowShape = PropTypes.shape({
  total: PropTypes.number.isRequired,
  active: PropTypes.number.isRequired,
  lvCount: PropTypes.objectOf(PropTypes.number).isRequired,
  lvShip: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)).isRequired,
  hasAlv: PropTypes.bool.isRequired,
  hasLevel: PropTypes.bool.isRequired,
  api_id: PropTypes.number.isRequired,
  api_name: PropTypes.string.isRequired,
  api_type: PropTypes.arrayOf(PropTypes.number).isRequired,
})

ItemInfoTable.propTypes = {
  row: rowShape.isRequired,
  t: PropTypes.func.isRequired,
  compact: PropTypes.bool.isRequired,
}

const TranslatedItemInfoTable = translate(['resources'])(ItemInfoTable)

const alwaysTrue = () => true

@translate(['poi-plugin-item-info'])
@connect((state) => {
  const iconEquipMap = iconEquipMapSelector(state)
  let type = int2BoolArray(get(state, 'config.plugin.ItemInfo.type'))

  const expectedLength = max(map(keys(iconEquipMap), (id) => +id)) + 1
  if (type.length !== expectedLength) {
    type = Array.from({ length: expectedLength }).fill(true)
  }

  const equips = flatten(
    map(type, (checked, index) => (checked ? iconEquipMap[index] || [] : [])),
  )

  return {
    equips,
    rows: rowsSelector(state),
  }
})
class ItemInfoTableArea extends Component {
  static propTypes = {
    equips: PropTypes.arrayOf(PropTypes.number).isRequired,
    rows: PropTypes.arrayOf(rowShape).isRequired,
    t: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      filterName: alwaysTrue,
    }
  }

  handleFilterNameChange = (e) => {
    const key = e.target.value
    let filterName
    if (key) {
      filterName = null
      const match = key.match(/^\/(.+)\/([gim]*)$/)
      if (match != null) {
        try {
          const re = new RegExp(match[1], match[2])
          filterName = re.test.bind(re)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(err)
        }
      }
      if (filterName === null) {
        filterName = (name) => name.indexOf(key) >= 0
      }
    } else {
      filterName = alwaysTrue
    }
    this.setState({
      filterName,
    })
  }

  displayedRows = () => {
    const { filterName } = this.state
    const { equips } = this.props
    const rows = this.props.rows.filter(
      (row) =>
        filterName(row.api_name) &&
        row.total > 0 &&
        equips.includes(row.api_id),
    )
    return sortBy(rows, ['api_type.3', 'api_id'])
  }

  render() {
    const { t } = this.props
    const compact = true
    return (
      <div id="item-info-show">
        <div id="item-info-area">
          <HTMLTable condensed id="main-table">
            {!compact && (
              <thead className="slot-item-table-thead">
                <tr>
                  {!compact && (
                    <th className="center">
                      <FormControl
                        className="name-filter"
                        type="text"
                        placeholder={t('Name')}
                        onChange={this.handleFilterNameChange}
                      />
                    </th>
                  )}
                  <th className="center">
                    {t('Total')}
                    <span style={{ fontSize: '11px' }}>{`(${t('rest')})`}</span>
                  </th>
                  <th className="center">{t('State')}</th>
                </tr>
              </thead>
            )}
            <tbody>
              {this.displayedRows().map((row) => (
                <TranslatedItemInfoTable
                  key={row.api_id}
                  row={row}
                  compact={compact}
                />
              ))}
            </tbody>
          </HTMLTable>
        </div>
      </div>
    )
  }
}

export default ItemInfoTableArea
