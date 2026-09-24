import { readdir, stat } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import sharp from 'sharp'

const root = resolve(import.meta.dirname, '..')
const directory = resolve(root, 'resources/images')
for (const name of await readdir(directory)) {
  if (!/\.(png|jpe?g)$/i.test(name)) continue
  const target = resolve(directory, name.slice(0, -extname(name).length) + '.webp')
  if (await stat(target).then(() => true, () => false)) continue
  await sharp(resolve(directory, name))
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(target)
  console.log(`Created ${target}`)
}
await sharp(resolve(root, 'public/icons/icon-256.png'))
  .webp({ lossless: true })
  .toFile(resolve(root, 'public/icons/app-logo.webp'))
