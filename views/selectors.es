import { createSelector } from 'reselect'
import { get, invertBy, mapValues, map, transform, each, groupBy, countBy, filter, memoize } from 'lodash'

import { constSelector, configSelector, shipsSelector, equipsSelector, shipDataSelectorFactory } from 'views/utils/selectors'

import { getLevelKey } from './utils'

// [$equip.api_id]: $equip.api_type[3]
export const equipIconMapSelector = createSelector(
  [
    constSelector,
  ], ({ $equips = {} } = {}) => mapValues($equips, equip => equip.api_type[3])
)

// $equip.api_type[3]: [$equip.api_id with same api_type[3]]
export const iconEquipMapSelector = createSelector(
  [
    equipIconMapSelector,
  ], equipIconMap => mapValues(invertBy(equipIconMap, icon => icon), arr => map(arr, i => +i))
)

// for equips on kanmusus
// equip.api_id: ship.api_id
const equipShipMapSelector = createSelector(
  [
    shipsSelector,
  ], (_ships) => {
  const shipEquipsMap = mapValues(_ships, ship =>
    ship.api_slot.concat(ship.api_slot_ex).filter(id => id > 0)
  )
  return transform(shipEquipsMap, (result, value, key) => {
    each(value, (id) => {
      result[id] = (+key)
    })
  }, {})
})

const equipsSelectorMod = createSelector(
  [
    equipsSelector,
    equipShipMapSelector,
  ], (equips, equipShipMap) =>
  mapValues(equips, equip => ({ ...equip, shipId: equipShipMap[equip.api_id] || 0 }))
)

// lvShip {[levelKey]: {[shipId]: [equips on ship]}}
export const rowsSelector = createSelector(
  [
    constSelector,
    equipsSelectorMod,
  ], ({ $equips = {} } = {}, _equips) => map($equips, ($equip) => {
    const equips = filter(_equips, equip => equip.api_slotitem_id === $equip.api_id)
    const hasAlv = equips.some(equip => typeof equip.api_alv !== 'undefined')
    const hasLevel = equips.some(equip => typeof equip.api_level !== 'undefined')
    const total = equips.length
    const active = filter(equips, equip => equip.shipId !== 0).length
    const lvGroup = groupBy(equips, ({ api_alv, api_level }) => getLevelKey(api_alv, api_level))
    const lvShip = mapValues(lvGroup, group => countBy(group, 'shipId'))
    const lvCount = mapValues(lvGroup, group => group.length)

    return {
      ...$equip,
      hasAlv,
      hasLevel,
      total,
      active,
      lvShip,
      lvCount,
    }
  })
)

export const reduceShipDataSelectorFactory = memoize(shipId =>
  createSelector(
    [
      shipDataSelectorFactory(shipId),
    ], ([ship = {}, $ship = {}] = []) => ({
      level: ship.api_lv,
      name: $ship.api_name,
    })
  )
)
