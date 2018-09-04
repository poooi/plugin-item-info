import React, { Component } from 'react'
import {
  Grid,
  Table,
  FormControl,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap'
import { connect } from 'react-redux'
import { get, map, flatten, sortBy } from 'lodash'
import path from 'path'
import PropTypes from 'prop-types'

import { SlotitemIcon } from 'views/components/etc/icon'
import { getItemData } from 'views/components/ship/slotitems-data'

import {
  rowsSelector,
  iconEquipMapSelector,
  reduceShipDataSelectorFactory,
  reduceAirbaseSelectorFactory,
} from './selectors'
import { int2BoolArray, getLevelsFromKey } from './utils'
import Divider from './divider'

const { ROOT, i18n } = window
const { __ } = window.i18n['poi-plugin-item-info']

const ShipTag = connect((state, { shipId }) => ({
  ship:
    shipId > 0
      ? reduceShipDataSelectorFactory(shipId)(state)
      : reduceAirbaseSelectorFactory(-shipId - 1)(state),
}))(({ ship: { level, name, area }, count }) => (
  <div className="equip-list-div">
    {level > 0 && <span className="equip-list-div-span">Lv.{level}</span>}
    <span className="known-ship-name">
      {area && `[${area}]`}
      {i18n.resources.__(name)}
    </span>
    {count > 1 && <span className="equip-list-number">×{count}</span>}
  </div>
))

ShipTag.propTypes = {
  shipId: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
}

ShipTag.WrappedComponent.propTypes = {
  ship: PropTypes.shape({
    level: PropTypes.number,
    name: PropTypes.string.isRequired,
    area: PropTypes.string,
  }).isRequired,
  count: PropTypes.number.isRequired,
}

const ItemInfoTable = ({ row }) => {
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
      <SlotitemIcon slotitemId={row.api_type[3]} />
    </span>
  )

  return (
    <tr className="vertical">
      <td className="item-name-cell">
        {itemOverlay ? (
          <OverlayTrigger placement="top" overlay={itemOverlay}>
            {slotItemIconSpan}
          </OverlayTrigger>
        ) : (
          slotItemIconSpan
        )}
        {i18n.resources.__(row.api_name)}
      </td>
      <td className="item-count-cell">
        {`${total} `}
        <span style={{ fontSize: '12px' }}>{`(${total - active})`}</span>
      </td>
      <td>
        <Table className="equip-table">
          <tbody>
            {Object.keys(lvCount)
              .map(key => +key)
              .sort((a, b) => a - b)
              .map(key => {
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
                  <tr key={key}>
                    <td className="item-level-cell">
                      <span className="item-level-span">
                        {alvPrefix} {levelPrefix}
                      </span>{' '}
                      × {count}
                    </td>
                    <td>
                      {countByShip &&
                        Object.keys(countByShip)
                          .map(id => +id)
                          .map(
                            shipId =>
                              shipId !== 0 && (
                                <ShipTag
                                  key={shipId}
                                  shipId={shipId}
                                  count={countByShip[shipId]}
                                />
                              ),
                          )}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </Table>
      </td>
    </tr>
  )
}

const rowShape = PropTypes.shape({
  total: PropTypes.number.isRequired,
  active: PropTypes.number.isRequired,
  lvCount: PropTypes.objectOf(PropTypes.number).isRequired,
  lvShip: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)).isRequired,
  hasAlv: PropTypes.bool.isRequired,
  hasLevel: PropTypes.bool.isRequired,
})

ItemInfoTable.propTypes = {
  row: rowShape.isRequired,
}

const alwaysTrue = () => true

const ItemInfoTableArea = connect(state => {
  const iconEquipMap = iconEquipMapSelector(state)
  let type = int2BoolArray(get(state, 'config.plugin.ItemInfo.type'))
  if (type.length !== Object.keys(iconEquipMap).length) {
    type = Object.keys(iconEquipMap).fill(true)
  }

  const equips = flatten(
    map(type, (checked, index) => (checked ? iconEquipMap[index + 1] : [])),
  )

  return {
    equips,
    rows: rowsSelector(state),
  }
})(
  class ItemInfoTableArea extends Component {
    static propTypes = {
      equips: PropTypes.arrayOf(PropTypes.number).isRequired,
      rows: PropTypes.arrayOf(rowShape).isRequired,
    }

    constructor(props) {
      super(props)
      this.state = {
        filterName: alwaysTrue,
      }
    }
    handleFilterNameChange = e => {
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
          filterName = name => name.indexOf(key) >= 0
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
        row =>
          filterName(row.api_name) &&
          row.total > 0 &&
          equips.includes(row.api_id),
      )
      return sortBy(rows, ['api_type.3', 'api_id'])
    }
    render() {
      return (
        <div id="item-info-show">
          <Divider text={__('Equipment Info')} />
          <Grid id="item-info-area">
            <Table striped condensed hover id="main-table">
              <thead className="slot-item-table-thead">
                <tr>
                  <th className="center" style={{ width: '25%' }}>
                    <FormControl
                      className="name-filter"
                      type="text"
                      placeholder={__('Name')}
                      onChange={this.handleFilterNameChange}
                    />
                  </th>
                  <th className="center" style={{ width: '9%' }}>
                    {__('Total')}
                    <span style={{ fontSize: '11px' }}>{`(${__(
                      'rest',
                    )})`}</span>
                  </th>
                  <th className="center" style={{ width: '66%' }}>
                    {__('State')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.displayedRows().map(row => (
                  <ItemInfoTable key={row.api_id} row={row} />
                ))}
              </tbody>
            </Table>
          </Grid>
        </div>
      )
    }
  },
)

export default ItemInfoTableArea
