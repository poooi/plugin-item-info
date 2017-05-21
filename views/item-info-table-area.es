import React, { Component } from 'react'
import { Grid, Table, FormControl, Tooltip, OverlayTrigger } from 'react-bootstrap'
import { connect } from 'react-redux'
import { get, map, flatten, sortBy, toArray, sum, mapValues, pick } from 'lodash'
import path from 'path'

import { SlotitemIcon } from 'views/components/etc/icon'

import { rowsSelector, iconEquipMapSelector, reduceShipDataSelectorFactory, reduceAirbaseSelectorFactory } from './selectors'
import { int2BoolArray, getLevelsFromKey } from './utils'
import Divider from './divider'


const { __, ROOT } = window

const ShipTag = connect(
  (state, { shipId }) => ({
    ship: shipId > 0 ? reduceShipDataSelectorFactory(shipId)(state) : reduceAirbaseSelectorFactory(-shipId - 1)(state),
  })
)(({ ship: { level, name, area }, count }) =>
  <div className="equip-list-div">
    {
      level > 0 &&
        <span className="equip-list-div-span">Lv.{level}</span>
    }
    <span className="known-ship-name">{area && `[${area}]`}{name}</span>
    {
      count > 1 &&
        <span className="equip-list-number">×{count}</span>
    }
  </div>
)

const ItemInfoTable = ({ row }) => {
  const { total, active, lvCount, lvShip, hasAlv, hasLevel } = row

  return (
    <tr className="vertical">
      <td className="item-name-td">
        {
          <SlotitemIcon slotitemId={row.api_type[3]} />
        }
        {row.api_name}
      </td>
      <td className="center">{`${total} `}<span style={{ fontSize: '12px' }}>{`(${total - active})`}</span></td>
      <td>
        <Table id="equip-table">
          <tbody>
            {
            Object.keys(lvCount).map(key => +key).sort((a, b) => a - b).map((key) => {
              const { alv, level } = getLevelsFromKey(key)
              const count = lvCount[key]
              let alvPrefix
              let levelPrefix

              if (!hasAlv) {
                alvPrefix = ''
              } else if (alv === 0) {
                alvPrefix = <span className="item-alv-0">O</span>
              } else if (alv <= 7) {
                alvPrefix = <img className="item-alv-img" src={path.join(ROOT, 'assets', 'img', 'airplane', `alv${alv}.png`)} />
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
                  <td style={{ width: '13%' }}><span className="item-level-span">{alvPrefix} {levelPrefix}</span> × {count}</td>
                  <td>
                    {
                      countByShip &&
                      Object.keys(countByShip).map(id => +id).map(shipId =>
                        shipId !== 0 &&
                          <ShipTag
                            key={shipId}
                            shipId={shipId}
                            count={countByShip[shipId]}
                          />
                      )
                    }
                  </td>
                </tr>
              )
            })
          }
          </tbody>
        </Table>
      </td>
    </tr>
  )
}

const alwaysTrue = () => true

const ItemInfoTableArea = connect(
  (state) => {
    const iconEquipMap = iconEquipMapSelector(state)
    let type = int2BoolArray(get(state, 'config.plugin.ItemInfo.type'))
    if (type.length !== Object.keys(iconEquipMap).length) {
      type = Object.keys(iconEquipMap).fill(true)
    }

    const equips = flatten(map(type, (checked, index) =>
      checked ? iconEquipMap[index + 1] : []))

    return {
      equips,
      lock: int2BoolArray(get(state, 'config.plugin.ItemInfo.lock', 7)),
      rows: rowsSelector(state),
    }
  }
)(class ItemInfoTableArea extends Component {
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
    const rows = this.props.rows.filter(row =>
      (filterName(row.name) && row.total > 0 && equips.includes(row.api_id)))
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
                  <FormControl className="name-filter" type="text" placeholder={__('Name')} onChange={this.handleFilterNameChange} />
                </th>
                <th className="center" style={{ width: '9%' }}>{ __('Total') }<span style={{ fontSize: '11px' }}>{`(${__('rest')})`}</span></th>
                <th className="center" style={{ width: '66%' }}>{ __('State') }</th>
              </tr>
            </thead>
            <tbody>
              {
                this.displayedRows().map(row =>
                  <ItemInfoTable
                    key={row.api_id}
                    row={row}
                  />
                )
              }
            </tbody>
          </Table>
        </Grid>
      </div>
    )
  }
})

export default ItemInfoTableArea
