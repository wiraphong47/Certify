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

export function digitsOf(text = '') {
  let out = String(text)
  out = out.replace(/[๐-๙]/g, (ch) => String(ch.charCodeAt(0) - 3664))
  out = out.replace(/ศูนย์|หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า/g, (word) =>
    String(TH_DIGITS.indexOf(word)),
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
