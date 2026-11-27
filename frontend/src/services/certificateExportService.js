async function captureElementPngDataUrl(element) {
  if (!element) {
    throw new Error('ไม่พบองค์ประกอบสำหรับบันทึกรูปภาพ')
  }
  const { toPng } = await import('html-to-image')
  const baseOptions = {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#FFFFFF',
  }

  try {
    return await toPng(element, baseOptions)
  } catch {
    // Fallback when cross-origin Google Fonts stylesheet blocks font embedding
    return toPng(element, {
      ...baseOptions,
      skipFonts: true,
    })
  }
}

function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',')
  const mimeMatch = parts[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const binary = atob(parts[1])
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

function triggerDownload(dataUrl, filename) {
  let href = dataUrl
  let objectUrl = ''

  try {
    if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      const blob = dataUrlToBlob(dataUrl)
      objectUrl = URL.createObjectURL(blob)
      href = objectUrl
    }
  } catch {
    href = dataUrl
  }

  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()

  if (objectUrl) {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000)
  }
}

export async function downloadElementPng(element, filename = 'certify-image.png') {
  const dataUrl = await captureElementPngDataUrl(element)
  triggerDownload(dataUrl, filename)
  return true
}

export async function downloadCertificatePng(element, filename = 'certify-certificate.png') {
  return downloadElementPng(element, filename)
}

export async function downloadNetGuidePng(element, filename = 'certify-net-guide.png') {
  return downloadElementPng(element, filename)
}

export async function downloadCertificatePdf(element, filename = 'certify-certificate.pdf') {
  const [dataUrl, { jsPDF }] = await Promise.all([
    captureElementPngDataUrl(element),
    import('jspdf'),
  ])
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })
  pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 210)
  pdf.save(filename)
  return true
}
