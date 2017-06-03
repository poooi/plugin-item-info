import { createSelector } from 'reselect'
import { get, invertBy, mapValues, map, groupBy, countBy, filter, memoize, flatMap, fromPairs } from 'lodash'

import { constSelector, shipsSelector, equipsSelector, shipDataSelectorFactory } from 'views/utils/selectors'

import { getLevelKey, int2BoolArray } from './utils'

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

  const equipShipMap = fromPairs(flatMap(shipEquipsMap, (equips, id) =>
    map(equips, equip => [equip, id])
  ))
  return equipShipMap
})

// we use negative values to store airbase index + 1
const equipAirbaseMapSelector = createSelector(
  [
    state => state.info.airbase,
  ], (airbase = []) => {
  const airbaseEquipsMap = map(airbase, (squad = {}) =>
    map(squad.api_plane_info, plane => plane.api_slotid).filter(id => id > 0)
  )

  const equipAirbaseMap = fromPairs(flatMap(airbaseEquipsMap, (equips, index) =>
    map(equips, equip => [equip, -(index + 1)])
  ))
  return equipAirbaseMap
})

const equipsSelectorMod = createSelector(
  [
    equipsSelector,
    equipShipMapSelector,
    equipAirbaseMapSelector,
  ], (equips, equipShipMap, equipAirbaseMap) =>
  mapValues(equips, equip => ({
    ...equip,
    shipId: equipShipMap[equip.api_id] || equipAirbaseMap[equip.api_id] || 0,
  }))
)

const filterEquipsSelector = createSelector(
  [
    equipsSelectorMod,
    state => int2BoolArray(get(state, 'config.plugin.ItemInfo.lock', 7)),
  ], (equips, lock) => {
  // array position = 0: loced, 1: unclocked
  const arr = []
  if (lock[0]) {
    arr.push(1)
  }
  if (lock[1]) {
    arr.push(0)
  }

  return filter(equips, equip => arr.includes(equip.api_locked || 0))
})

// lvShip {[levelKey]: {[shipId]: [equips on ship]}}
export const rowsSelector = createSelector(
  [
    constSelector,
    filterEquipsSelector,
  ], ({ $equips = {} } = {}, _equips) => map($equips, ($equip) => {
    const equips = filter(_equips, equip => equip.api_slotitem_id === $equip.api_id)
    const hasAlv = equips.some(equip => typeof equip.api_alv !== 'undefined')
    const hasLevel = equips.some(equip => typeof equip.api_level !== 'undefined' && equip.api_level > 0)
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

export const reduceAirbaseSelectorFactory = memoize(airbaseIndex =>
  createSelector(
    [
      state => (state.info.airbase || [])[airbaseIndex],
      state => state.const.$mapareas,
    ], ({ api_name, api_area_id } = {}, mapareas) => ({
      area: get(mapareas, `${api_area_id}.api_name`),
      name: api_name,
    })
  )
)
