async function captureElementPngDataUrl(element) {
  if (!element) {
    throw new Error('ไม่พบองค์ประกอบสำหรับบันทึกรูปภาพ')
  }
  const { toPng } = await import('html-to-image')
  return toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#FFFFFF',
  })
}

function triggerDownload(href, filename) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
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
