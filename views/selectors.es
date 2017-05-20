import { createSelector } from 'reselect'
import { get, invertBy, mapValues, map } from 'lodash'

import { constSelector, configSelector } from 'views/utils/selectors'

export const equipIconMapSelector = createSelector(
  [
    constSelector,
  ], ({ $equips = {} } = {}) => mapValues($equips, equip => equip.api_type[3])
)

export const iconEquipMapSelector = createSelector(
  [
    equipIconMapSelector,
  ], equipIconMap => mapValues(invertBy(equipIconMap, icon => icon), arr => map(arr, i => +i))
)
