import { remote } from 'electron'
import ItemInfoArea from './views'

const { screen } = remote
const { workArea } = screen.getPrimaryDisplay()
const bounds = config.get('plugin.ItemInfo.bounds', workArea)

let { x, y } = bounds
const { width = workArea.width, height = workArea.height } = bounds

const validate = (n, min, range) => n != null && n >= min && n < min + range
const withinDisplay = d => {
  const wa = d.workArea
  return validate(x, wa.x, wa.width) && validate(y, wa.y, wa.height)
}

if (!screen.getAllDisplays().some(withinDisplay)) {
  ;({ x, y } = workArea)
}

export const windowOptions = {
  x,
  y,
  width,
  height,
}

export const reactClass = ItemInfoArea
export const windowMode = true
