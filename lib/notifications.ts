import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface NotificationTemplate {
  subject: string
  html: string
}

export function getNotificationTemplate(
  notificationType: 'day_4' | 'day_8' | 'day_12' | 'day_15' | 'payment_approved' | 'payment_rejected',
  galleryTitle: string,
  galleryUrl: string,
  downloadCode?: string
): NotificationTemplate {
  const templates = {
    day_4: {
      subject: `Your ${galleryTitle} Gallery is Live ✨`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f5f0e8;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2d2d2d; font-size: 32px; margin-bottom: 10px;">Your Memories Await</h1>
            <p style="color: #6b6b6b; font-size: 18px;">${galleryTitle}</p>
          </div>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your gallery is now live and looking absolutely beautiful. The photos tell such a wonderful story, and we're so excited for you to have these memories preserved forever.
          </p>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            You have <strong>15 days</strong> to download your high-resolution master files. Take your time and enjoy the gallery!
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${galleryUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2d2d2d; color: #f5f0e8; text-decoration: none; border-radius: 4px; font-size: 16px;">
              View Your Gallery
            </a>
          </div>
          
          <p style="color: #6b6b6b; font-size: 14px; text-align: center; margin-top: 40px;">
            Powered by Vellon
          </p>
        </div>
      `
    },
    day_8: {
      subject: `Halfway Through: ${galleryTitle} Download Window`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f5f0e8;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2d2d2d; font-size: 32px; margin-bottom: 10px;">Halfway There</h1>
            <p style="color: #6b6b6b; font-size: 18px;">${galleryTitle}</p>
          </div>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Just a friendly reminder that you're now halfway through your 15-day download window. If you haven't downloaded your high-resolution files yet, now's a great time to do it!
          </p>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            The gallery will remain online forever, but the master files (4K quality) will only be available for download for <strong>7 more days</strong>.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${galleryUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2d2d2d; color: #f5f0e8; text-decoration: none; border-radius: 4px; font-size: 16px;">
              Download Your Photos
            </a>
          </div>
          
          <p style="color: #6b6b6b; font-size: 14px; text-align: center; margin-top: 40px;">
            Powered by Vellon
          </p>
        </div>
      `
    },
    day_12: {
      subject: `⚠️ 3 Days Left: ${galleryTitle} Master Download`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f5f0e8;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2d2d2d; font-size: 32px; margin-bottom: 10px;">Time is Running Out</h1>
            <p style="color: #6b6b6b; font-size: 18px;">${galleryTitle}</p>
          </div>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>Only 3 days remain</strong> to download your high-resolution master files. After this period, the archive will be sealed and the 4K quality files will no longer be available for download.
          </p>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Don't risk losing these precious memories. The preview gallery will stay online, but you'll want the full-quality files for printing and archiving.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${galleryUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2d2d2d; color: #f5f0e8; text-decoration: none; border-radius: 4px; font-size: 16px;">
              Download Now Before It's Too Late
            </a>
          </div>
          
          <p style="color: #6b6b6b; font-size: 14px; text-align: center; margin-top: 40px;">
            Powered by Vellon
          </p>
        </div>
      `
    },
    day_15: {
      subject: `FINAL WARNING: ${galleryTitle} Archive Closes Tonight`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f5f0e8;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2d2d2d; font-size: 32px; margin-bottom: 10px;">LAST CHANCE</h1>
            <p style="color: #6b6b6b; font-size: 18px;">${galleryTitle}</p>
          </div>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>THIS IS YOUR FINAL WARNING.</strong> The master vault closes at <strong>11:59 PM tonight</strong>. After that time, your 4K high-resolution files will be permanently purged from our servers.
          </p>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            These are your memories. Don't let them disappear. Download your archive NOW or risk losing the full-quality versions forever.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${galleryUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2d2d2d; color: #f5f0e8; text-decoration: none; border-radius: 4px; font-size: 16px;">
              DOWNLOAD YOUR ARCHIVE IMMEDIATELY
            </a>
          </div>
          
          <p style="color: #6b6b6b; font-size: 14px; text-align: center; margin-top: 40px;">
            Powered by Vellon
          </p>
        </div>
      `
    },
    payment_approved: {
      subject: `Payment Approved: ${galleryTitle} Gallery is Live ✨`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f5f0e8;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2d2d2d; font-size: 32px; margin-bottom: 10px;">Payment Approved</h1>
            <p style="color: #6b6b6b; font-size: 18px;">${galleryTitle}</p>
          </div>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your payment has been verified and your gallery is now live. Your event is ready to receive photo uploads from your guests.
          </p>
          
          ${downloadCode ? `
          <div style="background-color: #2d2d2d; color: #f5f0e8; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">Your Download Code</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 4px;">${downloadCode}</p>
          </div>
          ` : ''}
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Share your gallery link with guests and start collecting memories!
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${galleryUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2d2d2d; color: #f5f0e8; text-decoration: none; border-radius: 4px; font-size: 16px;">
              View Your Gallery
            </a>
          </div>
          
          <p style="color: #6b6b6b; font-size: 14px; text-align: center; margin-top: 40px;">
            Powered by Vellon.photos
          </p>
        </div>
      `
    },
    payment_rejected: {
      subject: `Payment Rejected: ${galleryTitle}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f5f0e8;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2d2d2d; font-size: 32px; margin-bottom: 10px;">Payment Rejected</h1>
            <p style="color: #6b6b6b; font-size: 18px;">${galleryTitle}</p>
          </div>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            We were unable to verify your payment. Please check your payment details and try again.
          </p>
          
          <p style="color: #2d2d2d; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            If you believe this is an error, please contact our support team for assistance.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${galleryUrl}" style="display: inline-block; padding: 16px 32px; background-color: #2d2d2d; color: #f5f0e8; text-decoration: none; border-radius: 4px; font-size: 16px;">
              Try Again
            </a>
          </div>
          
          <p style="color: #6b6b6b; font-size: 14px; text-align: center; margin-top: 40px;">
            Powered by Vellon.photos
          </p>
        </div>
      `
    }
  }

  return templates[notificationType]
}

export async function sendNotification(
  to: string,
  notificationType: 'day_4' | 'day_8' | 'day_12' | 'day_15' | 'payment_approved' | 'payment_rejected',
  galleryTitle: string,
  galleryUrl: string,
  downloadCode?: string
) {
  try {
    const template = getNotificationTemplate(notificationType, galleryTitle, galleryUrl, downloadCode)
    
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Vellon.photos <noreply@vellon.photos>',
      to,
      ...template
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Notification send error:', error)
    return { success: false, error }
  }
}
