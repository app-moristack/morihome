import { rename, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const directory = resolve(import.meta.dirname, '../resources/images')
const images = [
  ['mauritius map silhouete for footer.png', 'mauritius-island-map-silhouette', 180],
  ['hero-section-background-image.png', 'le-morne-mauritius-home-services', 1980],
  ['are you a professional background image.png', 'mauritius-home-renovation-living-room', 1600],
  ['phone screen 1.png', 'morihome-mobile-app-welcome', 600],
  ['phone screen 2.png', 'morihome-mobile-app-professional-search', 600],
  ['logo.png', 'morihome-house-services-logo', 180],
  ['logo-alt.png', 'morihome-wordmark', 520],
  ['brand.png', 'morihome-local-professionals-brand', 480],
]

for (const [original, name, width] of images) {
  const source = resolve(directory, `${name}.png`)
  if (
    await stat(resolve(directory, original)).then(
      () => true,
      () => false,
    )
  ) {
    await rename(resolve(directory, original), source)
  }
  await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(resolve(directory, `${name}.webp`))
  if (name === 'le-morne-mauritius-home-services') {
    await sharp(source)
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toFile(resolve(directory, `${name}-mobile.webp`))
  }
}

console.log('Prepared descriptive, optimized homepage image assets.')
