import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Grid, Row, Input, Checkbox } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

import { SlotitemIcon } from 'views/components/etc/icon'
import Divider from './divider'

import { iconEquipMapSelector } from './selectors'

const ItemInfoCheckboxArea = connect(
  (state) => ({
    iconEquipMap: iconEquipMapSelector(state),
  })
)(class ItemInfoCheckboxArea extends PureComponent {
  handleClickCheckbox = index => () => {
    this.props.changeCheckbox(
      box => box[index] = !box[index]
    )
  }

  handleClickCheckboxRightClick = index => () => {
    this.props.changeCheckbox(
      (box) => {
        box.fill(false)
        box[index] = true
      }
    )
  }

  handleClickCheckboxAllButton = () => {
    this.props.changeCheckbox(
      box => box.fill(true)
    )
  }

  handleClickCheckboxNoneButton = () => {
    this.props.changeCheckbox(
      box => box.fill(false)
    )
  }

  render() {
    const { iconEquipMap } = this.props
    return (
      <div id="item-info-settings">
        <Divider text={__('Filter Setting')} />
        <Grid id="item-info-filter">
          <Row>
            {
              Object.keys(iconEquipMap).map(str => +str).map(index =>
                <Col
                  key={index}
                  xs={1}
                  onContextMenu={this.handleClickCheckboxRightClick(index)}
                >
                  <Input
                    className="checkbox"
                    type="checkbox"
                    value={index}
                    label={
                      <SlotitemIcon slotitemId={index} />
                    }
                    onChange={this.handleClickCheckbox(index)}
                    // checked={isChecked}
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
                onClick={this.handleClickCheckboxAllButton}
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
                onClick={this.handleClickCheckboxNoneButton}
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
                onChange={this.props.changeLockFilter}
                checked={this.props.lockFilter}
              >
                <FontAwesome name="lock" />
              </Checkbox>
            </Col>
            <Col xs={1}>
              <Checkbox
                inline
                className="checkbox"
                onChange={this.props.changeUnlockFilter}
                checked={this.props.unlockFilter}
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
