import QRCode from 'qrcode'
import jsPDF from 'jspdf'

export interface QRKitOptions {
  galleryTitle: string
  gallerySlug: string
  themePreset: 'heritage' | 'contemporary'
  canvasTone: 'linen' | 'sepia' | 'obsidian'
  heroImageUrl?: string
}

export async function generateQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
  } catch (error) {
    console.error('QR code generation error:', error)
    throw new Error('Failed to generate QR code')
  }
}

export async function generateQRKitPDF(options: QRKitOptions): Promise<Blob> {
  const { galleryTitle, gallerySlug, themePreset, canvasTone, heroImageUrl } = options
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [127, 177.8], // 5x7 inches
  })

  // Background color based on canvas tone
  const colors = {
    linen: '#f5f0e8',
    sepia: '#e8dcc8',
    obsidian: '#1a1a1a',
  }
  
  const textColor = canvasTone === 'obsidian' ? '#f5f0e8' : '#2d2d2d'
  
  // Set background
  pdf.setFillColor(colors[canvasTone])
  pdf.rect(0, 0, 127, 177.8, 'F')

  // Add hero image if provided
  if (heroImageUrl) {
    try {
      pdf.addImage(heroImageUrl, 'JPEG', 10, 10, 107, 60)
    } catch (error) {
      console.error('Failed to add hero image:', error)
    }
  }

  // Add title
  pdf.setFontSize(24)
  pdf.setTextColor(textColor)
  pdf.setFont(themePreset === 'heritage' ? 'serif' : 'sans')
  pdf.text(galleryTitle, 63.5, 85, { align: 'center' })

  // Add subtitle
  pdf.setFontSize(12)
  pdf.setTextColor(canvasTone === 'obsidian' ? '#a0a0a0' : '#6b6b6b')
  pdf.text('Scan to view your gallery', 63.5, 95, { align: 'center' })

  // Generate QR code
  const galleryUrl = `https://vellon.photos/gallery/${gallerySlug}`
  const qrCodeDataUrl = await generateQRCode(galleryUrl)

  // Add QR code centered
  const qrSize = 50
  const qrX = (127 - qrSize) / 2
  const qrY = 105
  pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

  // Add URL text below QR
  pdf.setFontSize(10)
  pdf.setTextColor(canvasTone === 'obsidian' ? '#a0a0a0' : '#6b6b6b')
  pdf.text(galleryUrl, 63.5, qrY + qrSize + 10, { align: 'center' })

  // Add footer
  pdf.setFontSize(8)
  pdf.setTextColor(canvasTone === 'obsidian' ? '#707070' : '#999999')
  pdf.text('Powered by Vellon.photos', 63.5, 170, { align: 'center' })

  return pdf.output('blob')
}

export async function generateQRKitPNG(options: QRKitOptions): Promise<Blob> {
  // For PNG generation, we'd need a canvas-based approach
  // This is a simplified version that returns the PDF as a placeholder
  // In production, you'd use canvas or a library like html2canvas
  return await generateQRKitPDF(options)
}
