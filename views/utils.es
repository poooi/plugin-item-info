// following function is used to convert betweern array of booleans and int
// leading true value is to ensure the bit length
// 12 => '1100' => [true, true, false, false] => [true, false, false]
// [true, false, false] => [true, true, false, false] => '1100' => 12
export const int2BoolArray = (int = 0) => {
  const boolArray = int
    .toString(2)
    .split('')
    .map(s => !!+s)
  boolArray.shift()
  return boolArray
}

export const boolArray2Int = (boolArray = []) => {
  const arr = boolArray.slice()
  arr.unshift(true)
  const str = arr.map(bool => +bool).join('')
  return parseInt(str, 2)
}

export const getLevelsFromKey = key => ({
  alv: Math.floor(key / 11),
  level: key % 11,
})

export const getLevelKey = (alv = 0, level = 0) => alv * 11 + level
