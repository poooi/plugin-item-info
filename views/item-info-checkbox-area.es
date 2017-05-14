import React, { Component } from 'react'
import { Button, Col, Grid, Row, Input } from 'react-bootstrap'
import { SlotitemIcon } from 'views/components/etc/icon'
import Divider from './divider'
import FontAwesome from 'react-fontawesome'

export default class ItemInfoCheckboxArea extends Component {
  handleClickCheckbox = (index) => () => {
    this.props.changeCheckbox(
      (box) => box[index] = !box[index]
    )
  }

  handleClickCheckboxRightClick = (index) => () => {
    this.props.changeCheckbox(
      (box) => {
        box.fill(false)
        box[index] = true
      }
    )
  }

  handleClickCheckboxAllButton = () => {
    this.props.changeCheckbox(
      (box) => box.fill(true)
    )
  }

  handleClickCheckboxNoneButton = () => {
    this.props.changeCheckbox(
      (box) => box.fill(false)
    )
  }

  render(){
    const {itemTypeChecked} = this.props
    return(
      <div id='item-info-settings'>
        <Divider text={__('Filter Setting')} />
        <Grid id='item-info-filter'>
          <Row>
            {
              itemTypeChecked.map((isChecked, index) => {
                if (index > 0) {
                  return(
                    <Col
                      key={index}
                      xs={1}
                      onContextMenu={this.handleClickCheckboxRightClick(index)}
                    >
                      <Input
                        className='checkbox'
                        type='checkbox'
                        value={index}
                        label={
                          <SlotitemIcon slotitemId={index} />
                        }
                        onChange={this.handleClickCheckbox(index)}
                        checked={isChecked}
                      />
                    </Col>
                  )
                }
              }
              )
            }
          </Row>

          <Row>
            <Col xs={2}>
              <Button
                className="filter-button"
                bsStyle='default'
                bsSize='small'
                onClick={this.handleClickCheckboxAllButton}
                block
              >
                {__('Select All')}
              </Button>
            </Col>
            <Col xs={2}>
              <Button
                className="filter-button"
                bsStyle='default'
                bsSize='small'
                onClick={this.handleClickCheckboxNoneButton}
                block
              >
                {__('Deselect All')}
              </Button>
            </Col>
            {
              !config.get('plugin.ItemInfo.hideCheckboxHint', false) &&
                <Col xs={8} className='checkbox-right-click-hint'>
                  {__('Right click a checkbox to select it only')}
                </Col>
            }
          </Row>
          <Row className='lock-filter'>
            <Col xs={1}>
              <Input
                className='checkbox'
                type='checkbox'
                value='lock'
                label={<FontAwesome name='lock' />}
                onChange={this.props.changeLockFilter}
                checked={this.props.lockFilter}
              />
            </Col>
            <Col xs={1}>
              <Input
                className='checkbox'
                type='checkbox'
                value='unlock'
                label={<FontAwesome name='unlock' />}
                onChange={this.props.changeUnlockFilter}
                checked={this.props.unlockFilter}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
