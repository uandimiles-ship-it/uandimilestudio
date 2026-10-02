/** 갤러리 사진 → 썸네일용 JPEG (WebView·localStorage·Storage 업로드) */
export async function compressImageForThumbnail(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const maxEdge = 960
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이미지 처리를 할 수 없습니다.')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  let quality = 0.8
  let blob = await canvasToJpeg(canvas, quality)
  if (blob.size > 380_000) {
    quality = 0.65
    blob = await canvasToJpeg(canvas, quality)
  }
  return blob
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('JPEG 변환 실패'))),
      'image/jpeg',
      quality,
    )
  })
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('이미지 읽기 실패'))
    reader.readAsDataURL(blob)
  })
}
