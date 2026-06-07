import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview, Font,
} from "@react-email/components";

interface Props {
  hostName: string;
  eventTitle: string;
  eventCode: string;
  galleryUrl: string;
  expiresAt: string;
}

export default function GalleryActivated({
  hostName = "there",
  eventTitle = "Your Event",
  eventCode = "ABC123",
  galleryUrl = "https://vellon.photos/e/ABC123",
  expiresAt = "June 22, 2026",
}: Props) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Georgia"
          fallbackFontFamily="serif"
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>🎉 Your gallery is live — {eventTitle}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Vellon.photos</Heading>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Your gallery is live!</Heading>
            <Text style={text}>
              Hi {hostName}, payment verified. <strong>{eventTitle}</strong> is now active and
              ready for your guests.
            </Text>

            <Section style={codeBox}>
              <Text style={codeLabel}>Gallery Code</Text>
              <Text style={codeText}>{eventCode}</Text>
            </Section>

            <Text style={subtext}>
              Your gallery will stay live until <strong>{expiresAt}</strong>. Share the code or
              link below with your guests — no app required.
            </Text>

            <Button style={btn} href={galleryUrl}>
              View Gallery →
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Vellon.photos · Premium Event Photo Sharing
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: "#020617", fontFamily: "Georgia, serif" };
const container = { maxWidth: "480px", margin: "0 auto", padding: "24px" };
const header = { marginBottom: "32px" };
const logo = { color: "#D4AF37", fontSize: "20px", margin: "0" };
const content = { backgroundColor: "#0f172a", borderRadius: "12px", padding: "32px" };
const heading = { color: "#f1f5f9", fontSize: "22px", marginBottom: "12px", fontWeight: "bold" };
const text = { color: "#94a3b8", fontSize: "15px", lineHeight: "24px", margin: "0 0 20px" };
const subtext = { color: "#64748b", fontSize: "13px", lineHeight: "22px", margin: "16px 0 24px" };
const codeBox = { backgroundColor: "#020617", borderRadius: "8px", padding: "16px", textAlign: "center" as const, margin: "20px 0" };
const codeLabel = { color: "#64748b", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" as const, margin: "0 0 4px" };
const codeText = { color: "#D4AF37", fontSize: "28px", fontWeight: "bold", letterSpacing: "0.3em", margin: "0" };
const btn = { backgroundColor: "#D4AF37", color: "#020617", padding: "12px 24px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", display: "block", textAlign: "center" as const };
const hr = { borderColor: "#1e293b", margin: "24px 0 16px" };
const footer = { color: "#334155", fontSize: "12px", textAlign: "center" as const };
