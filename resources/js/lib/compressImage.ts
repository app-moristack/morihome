const OUTPUT_TYPE = 'image/webp'
const OUTPUT_QUALITY = 0.82
const MIN_DIMENSION = 200

/**
 * Downscales on the device before upload: it saves mobile data, and the server
 * has no image extension available to generate variants itself.
 * Returns the original file when the browser cannot decode or encode it.
 */
export async function compressImage(file: File, maxDimension: number): Promise<File> {
  if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') {
    return file
  }

  let bitmap: ImageBitmap

  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  const largestSide = Math.max(bitmap.width, bitmap.height)

  if (largestSide < MIN_DIMENSION) {
    bitmap.close()

    return file
  }

  const scale = Math.min(1, maxDimension / largestSide)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  if (!context) {
    bitmap.close()

    return file
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY),
  )

  if (!blob || blob.size >= file.size) {
    return file
  }

  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'

  return new File([blob], name, { type: OUTPUT_TYPE, lastModified: Date.now() })
}
