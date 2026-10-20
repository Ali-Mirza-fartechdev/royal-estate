/** Client-side image prep: resize + re-encode so uploads stay web-sized. */
export interface Processed { full: Blob; sm: Blob; w: number; h: number }

const encode = (c: HTMLCanvasElement, q: number) =>
  new Promise<Blob>((res, rej) => {
    c.toBlob((b) => (b ? res(b) : c.toBlob((j) => (j ? res(j) : rej(new Error('Could not encode image'))), 'image/jpeg', q)), 'image/webp', q)
  })

async function draw(bmp: ImageBitmap, max: number) {
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale)
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bmp, 0, 0, w, h)
  return { c, w, h }
}

export async function processImage(file: File, opts: { full: number; sm: number; qFull: number; qSm: number }): Promise<Processed> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file (JPG, PNG or WebP).')
  if (file.size > 25 * 1024 * 1024) throw new Error('That image is over 25 MB. Please choose a smaller file.')
  const bmp = await createImageBitmap(file)
  const big = await draw(bmp, opts.full)
  const small = await draw(bmp, opts.sm)
  bmp.close?.()
  return { full: await encode(big.c, opts.qFull), sm: await encode(small.c, opts.qSm), w: big.w, h: big.h }
}

export const blobToDataURL = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = () => rej(r.error)
    r.readAsDataURL(b)
  })
