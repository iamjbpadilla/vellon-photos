import sharp from 'sharp'
import { encode } from 'blurhash'

export interface ProcessedImageResult {
  previewBuffer: Buffer
  masterBuffer: Buffer
  blurhash: string
  previewWidth: number
  previewHeight: number
  masterWidth: number
  masterHeight: number
}

export async function processImage(
  inputBuffer: Buffer,
  options: {
    previewMaxDimension?: number
    previewTargetSizeKB?: number
    masterMaxDimension?: number
    masterQuality?: number
    useAVIF?: boolean
  } = {}
): Promise<ProcessedImageResult> {
  const {
    previewMaxDimension = 1200,
    previewTargetSizeKB = 250,
    masterMaxDimension = 3840, // 4K on longest edge
    masterQuality = 95,
    useAVIF = true,
  } = options

  // Get original metadata to determine aspect ratio
  const metadata = await sharp(inputBuffer).metadata()
  const { width, height } = metadata

  if (!width || !height) {
    throw new Error('Invalid image: missing dimensions')
  }

  // Calculate preview dimensions maintaining aspect ratio
  const previewScale = Math.min(previewMaxDimension / width, previewMaxDimension / height, 1)
  const previewWidth = Math.round(width * previewScale)
  const previewHeight = Math.round(height * previewScale)

  // Calculate master dimensions (4K on longest edge)
  const masterScale = Math.min(masterMaxDimension / width, masterMaxDimension / height, 1)
  const masterWidth = Math.round(width * masterScale)
  const masterHeight = Math.round(height * masterScale)

  // Process preview (AVIF/WebP with size targeting)
  let previewBuffer: Buffer | null = null
  let previewQuality = 75
  let iterations = 0
  const maxIterations = 5

  // Binary search for optimal quality to hit target size
  while (iterations < maxIterations) {
    const testImage = sharp(inputBuffer)
      .rotate() // Auto-rotate based on EXIF
      .resize(previewWidth, previewHeight, {
        fit: 'cover',
        withoutEnlargement: true,
      })

    if (useAVIF) {
      testImage.avif({ quality: previewQuality, effort: 6 })
    } else {
      testImage.webp({ quality: previewQuality })
    }

    const testBuffer = await testImage.toBuffer()
    const sizeKB = testBuffer.length / 1024

    if (Math.abs(sizeKB - previewTargetSizeKB) < 30 || iterations === maxIterations - 1) {
      previewBuffer = testBuffer
      break
    }

    // Adjust quality based on size
    if (sizeKB > previewTargetSizeKB) {
      previewQuality -= 10
    } else {
      previewQuality += 10
    }

    previewQuality = Math.max(30, Math.min(100, previewQuality))
    iterations++
  }

  // Fallback if loop didn't produce a buffer
  if (!previewBuffer) {
    const fallbackImage = sharp(inputBuffer)
      .rotate()
      .resize(previewWidth, previewHeight, {
        fit: 'cover',
        withoutEnlargement: true,
      })
      .webp({ quality: 75 })
    previewBuffer = await fallbackImage.toBuffer()
  }

  const previewMetadata = await sharp(previewBuffer).metadata()

  // Process master (normalized sRGB JPEG 4K max)
  const masterImage = sharp(inputBuffer)
    .rotate()
    .resize(masterWidth, masterHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toColourspace('srgb')
    .jpeg({ 
      quality: masterQuality, 
      progressive: true,
      mozjpeg: true // Better compression
    })

  const masterBuffer = await masterImage.toBuffer()
  const masterMetadata = await sharp(masterBuffer).metadata()

  // Generate blurhash from a small thumbnail
  const blurhashImage = sharp(inputBuffer)
    .rotate()
    .resize(64, 64, { fit: 'cover' })
    .raw()
    .ensureAlpha()

  const { data, info } = await blurhashImage.toBuffer({ resolveWithObject: true })
  const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)

  return {
    previewBuffer,
    masterBuffer,
    blurhash,
    previewWidth: previewMetadata.width || 0,
    previewHeight: previewMetadata.height || 0,
    masterWidth: masterMetadata.width || 0,
    masterHeight: masterMetadata.height || 0,
  }
}

export async function validateImageFile(buffer: Buffer, maxSizeMB: number = 5): Promise<boolean> {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  if (buffer.length > maxSizeBytes) {
    return false
  }

  try {
    const metadata = await sharp(buffer).metadata()
    return !!metadata.width && !!metadata.height
  } catch {
    return false
  }
}

export function generateBlurhashPlaceholder(blurhash: string): string {
  return blurhash
}
