export const TH_DIGITS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']

export const TH_COUNTDOWN = ['', 'หนึ่ง', 'สอง', 'สาม']

export const CARRIER_SPEECH = {
  AIS: 'เอไอเอส',
  True: 'ทรู',
  dtac: 'ดีแทค',
  'อื่น ๆ': 'เครือข่ายอื่น',
}

export const CARRIER_COLORS = {
  AIS: '#5AA012',
  True: '#E63232',
  dtac: '#00A0DC',
}

export const CARRIER_LIST = ['AIS', 'True', 'dtac', 'อื่น ๆ']

const TH_UNIT_MAP = {
  ศูนย์: '0',
  ศูน: '0',
  ซูน: '0',
  หนึ่ง: '1',
  นึง: '1',
  เอ็ด: '1',
  สอง: '2',
  สาม: '3',
  สี่: '4',
  สี: '4',
  ห้า: '5',
  หก: '6',
  เจ็ด: '7',
  เจ็ต: '7',
  แปด: '8',
  เก้า: '9',
  ก้าว: '9',
}

const TH_TENS_MAP = {
  ยี่: '2',
  สาม: '3',
  สี่: '4',
  ห้า: '5',
  หก: '6',
  เจ็ด: '7',
  แปด: '8',
  เก้า: '9',
}

const EN_DIGIT_MAP = {
  zero: '0',
  oh: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
}

export function digitsOf(text = '') {
  let out = String(text).toLowerCase()
  // Thai numerals ๐-๙ -> 0-9
  out = out.replace(/[๐-๙]/g, (ch) => String(ch.charCodeAt(0) - 3664))

  // Handle Thai tens compounds e.g. "ยี่สิบเจ็ด" -> "27", "เก้าสิบสาม" -> "93", "สามสิบ" -> "30"
  out = out.replace(
    /(ยี่|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)\s*สิบ\s*(เอ็ด|หนึ่ง|นึง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)?/g,
    (_, tens, unit) => `${TH_TENS_MAP[tens]}${unit ? TH_UNIT_MAP[unit] : '0'}`,
  )

  // Handle Thai teens e.g. "สิบห้า" -> "15", "สิบเอ็ด" -> "11", "สิบ" -> "10"
  out = out.replace(
    /สิบ\s*(เอ็ด|หนึ่ง|นึง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า)?/g,
    (_, unit) => `1${unit ? TH_UNIT_MAP[unit] : '0'}`,
  )

  // Handle individual Thai digit words
  out = out.replace(
    /ศูนย์|ศูน|ซูน|หนึ่ง|นึง|เอ็ด|สอง|สาม|สี่|สี|ห้า|หก|เจ็ด|เจ็ต|แปด|เก้า|ก้าว/g,
    (word) => TH_UNIT_MAP[word] ?? '',
  )

  // Handle English spoken digits
  out = out.replace(
    /\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/g,
    (word) => EN_DIGIT_MAP[word] ?? '',
  )

  return out.replace(/\D/g, '')
}

export function spellDigits(digits = '') {
  return String(digits)
    .split('')
    .map((d) => TH_DIGITS[Number(d)] ?? d)
    .join(' ')
}

export function parseCarrierSpeech(text = '') {
  const lower = String(text).toLowerCase()
  if (/เอไอเอส|ais|เอ ไอ เอส/.test(lower)) return 'AIS'
  if (/ทรู|true/.test(lower)) return 'True'
  if (/ดีแทค|ดีแท็ค|dtac/.test(lower)) return 'dtac'
  if (/อื่น/.test(lower)) return 'อื่น ๆ'
  return ''
}
