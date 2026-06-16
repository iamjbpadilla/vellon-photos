export interface Guide {
  slug: string;
  title: string;
  description: string;
  headline: string;
  intro: string;
  sections: { heading: string; body: string }[];
}

export const guides: Guide[] = [
  {
    slug: "event-photo-sharing",
    title: "Event Photo Sharing — Vellon.photos Guide",
    description: "Learn how app-free event photo sharing works and why it's the best way to collect guest photos at any celebration.",
    headline: "The Modern Guide to Event Photo Sharing",
    intro: "Gone are the days of emailing yourself photos after a party. Modern event photo sharing means your guests contribute in real-time, and you walk away with every angle of your celebration — automatically organized in one place.",
    sections: [
      { heading: "What is Event Photo Sharing?", body: "Event photo sharing is a system that lets all of your guests contribute their photos to a single, private gallery using nothing more than their phone camera. No app download, no login, no friction." },
      { heading: "Why Browser-Based is Better", body: "Apps have install rates below 30% at events. Browser-based tools like Vellon work for 100% of guests — all they need is a QR code scan. Photos appear in the gallery instantly." },
      { heading: "How Vellon Works at Your Event", body: "Print or display your Vellon QR code. Guests scan it, take up to 4 photos, type their name, and submit. Your gallery fills in real-time, visible to you and your guests immediately." },
      { heading: "Who Uses Event Photo Sharing?", body: "Wedding planners, birthday hosts, corporate event managers, debut organizers, and anyone who wants to capture more than just one photographer's perspective." },
    ],
  },
  {
    slug: "qr-photo-sharing",
    title: "QR Photo Sharing — Vellon.photos Guide",
    description: "How QR codes revolutionized event photo collection. A complete guide to QR-based photo sharing for events.",
    headline: "QR Photo Sharing: The Smartest Way to Collect Event Photos",
    intro: "A single printed QR code on your table can replace the need for a second photographer, a shared album, or a social media hashtag. Here's how it works and why it's becoming the standard.",
    sections: [
      { heading: "How QR Photo Sharing Works", body: "A QR code encodes a unique URL for your private gallery. Guests scan it with their phone camera — it opens directly in the browser. No app. No password. Just upload." },
      { heading: "Where to Place Your QR Code", body: "Table cards, entrance signage, the photo wall, the bar, reception desks — anywhere guests naturally have their phones out. Multiple placements mean more contributions." },
      { heading: "QR Codes vs. Hashtags", body: "Social media hashtags are public, unorganized, and require guests to post publicly. QR galleries are private, curated, and available only to your event community." },
      { heading: "Getting Your QR Code with Vellon", body: "Your event QR code is generated instantly when you create a Vellon gallery. Download it as a PNG and print it at any size — it's included at no extra cost." },
    ],
  },
  {
    slug: "wedding-photo-sharing",
    title: "Wedding Photo Sharing — Vellon.photos Guide",
    description: "How to collect every guest photo at your wedding without an app. The complete guide to wedding photo sharing.",
    headline: "Wedding Photo Sharing: Capture Every Angle of Your Big Day",
    intro: "Your photographer captures the formal moments. But your Tita's candid of your first look, your best man's video of the speech, and your flower girl's selfie — those are irreplaceable. Vellon makes sure you get all of them.",
    sections: [
      { heading: "Why Weddings Need Crowd-Sourced Photos", body: "A single photographer can only be in one place at a time. With 100+ guests each holding a phone, you have 100 potential perspectives. A QR gallery lets you collect them all without any coordination." },
      { heading: "Setting Up for Your Wedding", body: "Create your Vellon event before the wedding. Print the QR code on your table cards and place it at the reception entrance. Your gallery goes live the moment guests start uploading." },
      { heading: "Reception vs. Church Photos", body: "Many couples use separate events for the ceremony and reception, or a single gallery for the whole day. Vellon's 15-day window covers your entire honeymoon period for late submissions." },
      { heading: "Sharing with Family Abroad", body: "After the wedding, the gallery link can be shared with family who couldn't attend. They can view all photos in the private gallery using your event code." },
    ],
  },
  {
    slug: "wedding-photo-sharing-philippines",
    title: "Wedding Photo Sharing Philippines — Vellon.photos Guide",
    description: "The best app-free wedding photo sharing tool in the Philippines. Collect tito and tita photos with a single QR code.",
    headline: "Wedding Photo Sharing in the Philippines",
    intro: "Filipino weddings are big, warm, and loud — in the best way. With 200+ guests and every single one holding a camera, Vellon was built specifically to handle the beautiful chaos of a Philippine celebration.",
    sections: [
      { heading: "The Philippine Wedding Challenge", body: "Philippine weddings often have 200–500 guests, three or four photographers, and family flying in from abroad. Coordinating everyone's photos is nearly impossible without a system. Vellon solves this with a single QR code." },
      { heading: "GCash Payments Accepted", body: "Vellon is built for the Philippines. We accept GCash payments — no credit card required. Pay ₱699 per event, verified manually by our local team." },
      { heading: "Works on All Filipino Phones", body: "From the latest iPhone to affordable Android units running GCash, Vellon is a progressive web app that runs smoothly on any phone with a browser — no storage space needed." },
      { heading: "Affordable for Every Budget", body: "At ₱699 per event, Vellon is a fraction of the cost of a second photographer. Include it in your wedding package as a standard offering or keep it as your secret weapon." },
    ],
  },
  {
    slug: "debut-photo-sharing",
    title: "Debut Photo Sharing — Vellon.photos Guide",
    description: "Capture every moment of a debutante's 18th birthday celebration. App-free photo sharing for debut parties in the Philippines.",
    headline: "Debut Photo Sharing: Every Candle, Court, and Candid",
    intro: "A debut is one of the most photographed events in Filipino culture. 18 roses, 18 candles, the cotillion — each moment is sacred. Vellon makes sure every guest's shot of those moments ends up in one beautiful gallery.",
    sections: [
      { heading: "Why Debuts Need a Photo Gallery", body: "A debut typically has 150–300 guests, multiple program segments, and family flying in from all over. Every phone at your debut is a potential camera — Vellon captures all of them." },
      { heading: "18 Roses, 18 Photos", body: "Ask each rose and candle bearer to upload their photo right after their presentation. Your gallery becomes a living record of every meaningful moment, from the people who mattered most." },
      { heading: "Sharing After the Event", body: "The gallery stays live for 15 days after activation. Share the link in your family group chat so everyone can download their favorites, even if they upload a few days later." },
      { heading: "Setting Up Before Your Debut", body: "Create your Vellon event a few days before. Test the QR code with a family member. Print it for table cards and the photo wall. The debutante shouldn't have to think about tech on her big night." },
    ],
  },
  {
    slug: "birthday-photo-sharing",
    title: "Birthday Photo Sharing — Vellon.photos Guide",
    description: "Collect all your guest photos at any birthday celebration. Simple, app-free birthday photo sharing with a QR code.",
    headline: "Birthday Photo Sharing Made Simple",
    intro: "Whether it's a first birthday, a 50th milestone, or an intimate dinner party, Vellon collects every guest's best shots in one place — no hashtag, no app, no asking everyone to send photos afterward.",
    sections: [
      { heading: "For Every Kind of Birthday", body: "From a child's party with lolo and lola to a milestone 50th with 200 guests, Vellon scales to any birthday size. One QR code. One gallery. Every photo." },
      { heading: "The 'Please Send Photos' Problem", body: "After every party, someone posts 'please send your photos!' in the group chat. It works for 20% of guests. Vellon works for all of them — they upload on the spot while the memory is fresh." },
      { heading: "Fun Ways to Use the Gallery", body: "Create a slideshow from the gallery photos during the party. Project the live gallery on a TV screen as photos come in. Give guests a reason to upload by making it part of the experience." },
      { heading: "Pricing for Birthdays", body: "At ₱699, Vellon costs less than a birthday cake. It's the most affordable way to professionally document any birthday with your guests' own perspective." },
    ],
  },
  {
    slug: "corporate-event-photo-sharing",
    title: "Corporate Event Photo Sharing Philippines — Vellon.photos Guide",
    description: "Professional, app-free photo sharing for corporate events, team buildings, and company launches in the Philippines.",
    headline: "Corporate Event Photo Sharing: Professional, Private, and Instant",
    intro: "Your company's product launch, annual party, or team building day produces hundreds of photos across dozens of employee phones. Vellon centralizes them all in a private, branded gallery — no public social media required.",
    sections: [
      { heading: "Why Corporate Events Need Private Galleries", body: "Social media hashtags are public. Shared drives require login. Vellon galleries are private by default, accessible only via your event code — ideal for internal events and confidential product launches." },
      { heading: "Team Building and Company Parties", body: "Place the QR code on the registration table and throughout the venue. Employees contribute photos naturally as the event unfolds. HR and marketing get a full photo archive without chasing anyone." },
      { heading: "Product Launches and Brand Events", body: "For client-facing events, Vellon creates a polished, curated gallery experience. Every stakeholder who attended can access the gallery with the event code — a premium deliverable at a fraction of the cost." },
      { heading: "Bulk Events and Recurring Use", body: "Companies running quarterly events or monthly socials can create a new Vellon gallery for each — each at ₱699. There are no subscription tiers or enterprise contracts required." },
    ],
  },
  {
    slug: "qr-photo-sharing-app",
    title: "QR Photo Sharing App — Vellon.photos Guide",
    description: "Why the best QR photo sharing 'app' is actually a web app. No download required.",
    headline: "QR Photo Sharing Without an App Download",
    intro: "Traditional photo sharing apps require guests to download, install, and create accounts. Vellon is a progressive web app — it runs entirely in the browser. Guests scan, upload, and leave. That's it.",
    sections: [
      { heading: "Why We Don't Make Guests Download Anything", body: "App install rates at events are typically under 30%. Asking 200 guests to download an app before they can share photos means 140 of them won't. A browser-based experience captures everyone." },
      { heading: "How a Web App Differs from a Native App", body: "A web app runs in any mobile browser — Safari, Chrome, Samsung Internet. It uses the phone's native camera picker for uploads. It's faster to access than opening the App Store and just as capable." },
      { heading: "Is It Reliable on Slow Event Wi-Fi?", body: "Vellon compresses photos before upload to ensure reliability even on shared event Wi-Fi. Guests can also upload on mobile data if Wi-Fi is congested." },
      { heading: "Security and Privacy", body: "Your gallery is private. Only people with your event code can access it. There are no public feeds, no social sharing by default, and all data is deleted after 15 days." },
    ],
  },
  {
    slug: "no-download-photo-sharing-app",
    title: "No-Download Photo Sharing — Vellon.photos Guide",
    description: "Share photos at your event with zero app downloads. Vellon works entirely in the browser for every guest.",
    headline: "No-Download Photo Sharing: Zero Friction for Every Guest",
    intro: "The best experience for your guests is one that requires nothing from them except their phone camera. Vellon's no-download approach means 100% of your guests can contribute — not just the tech-savvy ones.",
    sections: [
      { heading: "The Problem with App-Based Sharing", body: "Every app download at an event is a potential dropout. Storage space, App Store accounts, update prompts — they all create friction. Vellon eliminates every barrier." },
      { heading: "How Zero-Download Works", body: "Your guest scans the QR code with their camera app. Their browser opens automatically. They choose a photo, type their name, and tap upload. Total time: under 60 seconds. No account needed." },
      { heading: "Accessibility for All Ages", body: "Lolo and lola can use Vellon. Kids can use Vellon. Anyone who can take a photo and open a link can contribute to your gallery. It's designed for everyone at the table, not just digital natives." },
      { heading: "Works Offline for Upload?", body: "Photos require an internet connection to upload. However, guests can take photos offline and upload them later by scanning the QR code again before the gallery expires." },
    ],
  },
  {
    slug: "affordable-event-photo-sharing",
    title: "Affordable Event Photo Sharing — Vellon.photos Guide",
    description: "Professional-quality event photo sharing at ₱699 per event. The most affordable way to collect every guest photo.",
    headline: "Affordable Event Photo Sharing: Professional Results, One-Time Price",
    intro: "Hiring a second photographer costs thousands. A social media hashtag is free but chaotic. Vellon sits in the sweet spot — professional, private, and organized at ₱699 per event.",
    sections: [
      { heading: "What ₱699 Gets You", body: "A private gallery, a branded QR code, 15 days of cloud hosting, unlimited guest uploads, guest name tagging, and high-resolution downloads. Everything included, nothing extra." },
      { heading: "Compared to Alternatives", body: "Second photographer: ₱5,000–₱15,000. Photo booth rental: ₱8,000–₱20,000. Shared Google Drive: free but disorganized, no privacy, manual coordination. Vellon: ₱699, zero coordination required." },
      { heading: "Who Is It For?", body: "Vellon is built for personal event hosts who want a professional result without a professional budget. It's also used by event coordinators and photographers as a standard add-on service." },
      { heading: "Free Trial First", body: "Every account starts with a free 48-hour trial. Test the full platform, generate your QR code, and verify it works for your setup — before paying a single peso." },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
