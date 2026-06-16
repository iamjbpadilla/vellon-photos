import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Preview, Font,
} from "@react-email/components";

interface Props {
  hostName: string;
  eventTitle: string;
  adminNotes: string;
  dashboardUrl: string;
}

export default function PaymentRejected({
  hostName = "there",
  eventTitle = "Your Event",
  adminNotes = "",
  dashboardUrl = "https://vellon.photos/dashboard",
}: Props) {
  return (
    <Html lang="en">
      <Head>
        <Font fontFamily="Georgia" fallbackFontFamily="serif" fontWeight={400} fontStyle="normal" />
      </Head>
      <Preview>Payment submission update for {eventTitle}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Vellon.photos</Heading>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Payment Update</Heading>
            <Text style={text}>
              Hi {hostName}, unfortunately we couldn&apos;t verify your payment for{" "}
              <strong>{eventTitle}</strong>.
            </Text>

            {adminNotes && (
              <Section style={notesBox}>
                <Text style={notesText}>{adminNotes}</Text>
              </Section>
            )}

            <Text style={subtext}>
              Please resubmit your GCash receipt with the correct reference number from your
              dashboard.
            </Text>

            <Button style={btn} href={dashboardUrl}>
              Go to Dashboard →
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>Vellon.photos · Premium Event Photo Sharing</Text>
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
const text = { color: "#94a3b8", fontSize: "15px", lineHeight: "24px", margin: "0 0 16px" };
const subtext = { color: "#64748b", fontSize: "13px", lineHeight: "22px", margin: "16px 0 24px" };
const notesBox = { backgroundColor: "#1e0a0a", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "12px", margin: "0 0 16px" };
const notesText = { color: "#fca5a5", fontSize: "13px", margin: "0" };
const btn = { backgroundColor: "#D4AF37", color: "#020617", padding: "12px 24px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", display: "block", textAlign: "center" as const };
const hr = { borderColor: "#1e293b", margin: "24px 0 16px" };
const footer = { color: "#334155", fontSize: "12px", textAlign: "center" as const };
