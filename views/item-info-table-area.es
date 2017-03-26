import {Grid, Table, FormControl, Tooltip, OverlayTrigger} from 'react-bootstrap'
import React, {Component} from 'react'
import _ from 'lodash'
import {SlotitemIcon} from "views/components/etc/icon"
import Divider from './divider'
import path from 'path'

const {ROOT} = window

class ItemInfoTable extends React.Component {
  shouldComponentUpdate = (nextProps) => {
    !_.isEqual(this.props, nextProps)
  }
  render(){
    return (
      <tr className='vertical'>
        <td className='item-name-td'>
          {
            <SlotitemIcon slotitemId={this.props.iconIndex} />
          }
          {this.props.name}
        </td>
        <td className='center'>{this.props.total + ' '}<span style={{fontSize: '12px'}}>{'(' + this.props.unset + ')'}</span></td>
        <td>
          <Table id='equip-table'>
            <tbody>
              {
              Object.keys(this.props.levelCount).map((key) => parseInt(key)).sort((a, b) => a - b).map(key => {
                const {alv, level} = this.props.getLevelsFromKey(key)
                let count = this.props.levelCount[key]
                let alvPrefix
                let levelPrefix
                if (this.props.hasNoAlv) {
                  alvPrefix = ''
                }
                else if (alv === 0) {
                  alvPrefix = <span className='item-alv-0'>O</span>
                }
                else if (alv <= 7) {
                  alvPrefix = <img className='item-alv-img' src={path.join(ROOT, 'assets', 'img', 'airplane', "alv#{alv}.png")}/>
                }
                if (this.props.hasNoLevel) {
                  levelPrefix = ''
                }
                else if (level === 10) {
                  levelPrefix = '★max'
                }
                else {
                  levelPrefix = '★' + level
                }
                count = this.props.levelCount[key]
                return (
                  <tr key={key}>
                    <td style={{width: '13%'}}><span className='item-level-span'>{alvPrefix} {levelPrefix}</span> × {count}</td>
                    <td>
                      {
                        this.props.ships[key] &&
                        this.props.ships[key].map(ship =>
                      // unknown = ship.level > 0
                          <div key={ship.id} className='equip-list-div'>
                            {
                              ship.level > 0 &&
                                <span className='equip-list-div-span'>Lv.{ship.level}</span>
                            }
                            <span className='known-ship-name'>{ship.name}</span>
                            {
                              ship.count > 1 && // || unknown
                                <span className='equip-list-number'>×{ship.count}</span>
                            }
                          </div>)
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
}

const alwaysTrue = () => true

export default class ItemInfoTableArea extends Component{
  constructor(props) {
    super(props)
    this.state = {
      rows: [],
      filterName: alwaysTrue,
    }
  }
  handleFilterNameChange = (e) => {
    let key = e.target.value
    let filterName
    if (key) {
      filterName = null
      let match = key.match(/^\/(.+)\/([gim]*)$/)
      if (match != null) {
        try{
          let re = new RegExp(match[1], match[2])
          filterName = re.test.bind(re)
        }
        catch(e){}
      }
      if (filterName === null) {
        filterName = (name) => name.indexOf(key) >= 0
      }
    }
    else {
      filterName = alwaysTrue
    }
    this.setState({filterName})
  }
  displayedRows = () => {
    const {filterName} = this.state
    let {rows, itemTypeChecked} = this.props
    rows = rows.filter((row) => {
      return ((row != null) && filterName(row.name) && itemTypeChecked[row.iconIndex])
    })
    rows.sort((a, b) => ((a.typeId - b.typeId) || (a.slotItemId - b.slotItemId)))
    for (let row of rows) {
      for (let shipsInLevel in row.ships) {
        if (shipsInLevel != null) {
          shipsInLevel.sort((a, b) => ((b.level - a.level) || (a.id - b.id)))
        }
      }
    }
    return(rows)
  }
  render(){
    return(
      <div id='item-info-show'>
        <Divider text={window.__('Equipment Info')} />
        <Grid id="item-info-area">
          <Table striped condensed hover id="main-table">
            <thead className="slot-item-table-thead">
              <tr>
                <th className="center" style={{width: '25%'}}>
                  <FormControl className='name-filter' type='text' placeholder={window.__('Name')} onChange={this.handleFilterNameChange}/>
                </th>
                <th className="center" style={{width: '9%'}}>{window.__('Total')}<span style={{fontSize: '11px'}}>{'(' + window.__('rest') + ')'}</span></th>
                <th className="center" style={{width: '66%'}}>{window.__('State')}</th>
              </tr>
            </thead>
            <tbody>
              {
                this.displayedRows().map(row => {
                  <ItemInfoTable
                    key = {row.slotItemId}
                    slotItemId = {row.slotItemId}
                    name = {row.name}
                    total = {row.total}
                    unset = {row.getUnset()}
                    ships = {row.ships}
                    levelCount = {row.levelCount}
                    hasNoLevel = {row.hasNoLevel}
                    hasNoAlv = {row.hasNoAlv}
                    iconIndex = {row.iconIndex}
                    getLevelsFromKey = {this.props.getLevelsFromKey}
                  />
                })
              }
            </tbody>
          </Table>
        </Grid>
      </div>
    )
  }
}
