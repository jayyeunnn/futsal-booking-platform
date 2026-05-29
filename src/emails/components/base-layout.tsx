import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type Props = {
  preview: string;
  children: React.ReactNode;
};

/**
 * Shared layout for all JayField transactional emails.
 * Provides consistent header/footer + brand colors.
 */
export function BaseLayout({ preview, children }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>JayField</Text>
            <Text style={tagline}>Booking Lapangan Futsal</Text>
          </Section>
          <Section style={content}>{children}</Section>
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              Email ini dikirim otomatis. Jangan balas ke alamat ini.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} JayField. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#FAFAFA",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E0E0E0",
  borderRadius: "12px",
  margin: "32px auto",
  maxWidth: "560px",
  padding: "32px",
};

const header: React.CSSProperties = {
  borderBottom: "2px solid #1B5E20",
  marginBottom: "24px",
  paddingBottom: "16px",
};

const brand: React.CSSProperties = {
  color: "#1B5E20",
  fontSize: "24px",
  fontWeight: 700,
  margin: 0,
};

const tagline: React.CSSProperties = {
  color: "#616161",
  fontSize: "12px",
  margin: "4px 0 0 0",
};

const content: React.CSSProperties = {
  color: "#1A1A1A",
  fontSize: "16px",
  lineHeight: "24px",
};

const divider: React.CSSProperties = {
  borderColor: "#E0E0E0",
  margin: "32px 0 16px 0",
};

const footer: React.CSSProperties = {
  textAlign: "center" as const,
};

const footerText: React.CSSProperties = {
  color: "#616161",
  fontSize: "12px",
  margin: "4px 0",
};
