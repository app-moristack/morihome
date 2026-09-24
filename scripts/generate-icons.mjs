import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, 'resources/images/morihome-house-services-logo.png')
const outputDirectory = resolve(root, 'public/icons')

const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 }
const STANDARD_SIZES = [64, 96, 128, 192, 256, 384, 512]
const MASKABLE_SIZES = [192, 512]
const APPLE_TOUCH_SIZE = 180
const MASKABLE_SAFE_RATIO = 0.62
const STANDARD_SAFE_RATIO = 0.86

async function renderSquare(size, safeRatio, fileName) {
  const inner = Math.round(size * safeRatio)

  const mark = await sharp(source)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  const offset = Math.round((size - inner) / 2)

  await sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
    .composite([{ input: mark, top: offset, left: offset }])
    .png()
    .toFile(resolve(outputDirectory, fileName))

  return fileName
}

async function main() {
  await mkdir(outputDirectory, { recursive: true })

  const written = []

  for (const size of STANDARD_SIZES) {
    written.push(await renderSquare(size, STANDARD_SAFE_RATIO, `icon-${size}.png`))
  }

  for (const size of MASKABLE_SIZES) {
    written.push(await renderSquare(size, MASKABLE_SAFE_RATIO, `maskable-${size}.png`))
  }

  written.push(await renderSquare(APPLE_TOUCH_SIZE, STANDARD_SAFE_RATIO, 'apple-touch-icon.png'))
  await sharp(resolve(outputDirectory, 'icon-256.png'))
    .webp({ lossless: true })
    .toFile(resolve(outputDirectory, 'app-logo.webp'))

  const favicon = await sharp(resolve(outputDirectory, 'icon-64.png')).resize(48, 48).png().toBuffer()
  await writeFile(resolve(root, 'public/favicon.ico'), favicon)

  const wordmark = resolve(root, 'resources/images/morihome-wordmark.png')
  await sharp(wordmark)
    .resize({ width: 720 })
    .webp({ quality: 90 })
    .toFile(resolve(root, 'public/icons/wordmark.webp'))

  const social = await sharp({
    create: { width: 1200, height: 630, channels: 4, background: BACKGROUND },
  })
    .composite([
      {
        input: await sharp(resolve(root, 'resources/images/morihome-local-professionals-brand.png'))
          .resize(540, 540, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .toBuffer(),
        top: 45,
        left: 330,
      },
    ])
    .png()
    .toBuffer()

  await writeFile(resolve(root, 'public/icons/social-card.png'), social)

  console.log(`Generated ${written.length + 3} brand assets in public/icons`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
