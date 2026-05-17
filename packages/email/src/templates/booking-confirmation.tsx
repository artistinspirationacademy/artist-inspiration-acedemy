import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from "react-email";

interface BookingConfirmationProps {
    name: string;
    courseTitle: string;
    teacherName?: string | null;
    preferredStart: string;
    siteName: string;
    siteUrl: string;
    contactEmail: string;
}

const COLORS = {
    bg: "#252525",
    card: "#2f2f2c",
    border: "#3a3a36",
    text: "#FAFAF8",
    muted: "#B8B8B0",
    primary: "#5B4EFF",
    highlight: "#E0F04A",
    highlightFg: "#2A2A23",
};

export function BookingConfirmation({
    name,
    courseTitle,
    teacherName,
    preferredStart,
    siteName,
    siteUrl,
    contactEmail,
}: BookingConfirmationProps) {
    return (
        <Html>
            <Head />
            <Preview>
                We&apos;ve received your booking for {courseTitle}
            </Preview>

            <Body
                style={{
                    backgroundColor: COLORS.bg,
                    color: COLORS.text,
                    fontFamily:
                        '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    margin: 0,
                    padding: "40px 0",
                }}
            >
                <Container
                    style={{
                        maxWidth: "560px",
                        margin: "0 auto",
                        padding: "0 24px",
                    }}
                >
                    <Section style={{ paddingBottom: "24px" }}>
                        <Text
                            style={{
                                color: COLORS.highlight,
                                fontSize: "12px",
                                fontWeight: 700,
                                letterSpacing: "0.18em",
                                margin: 0,
                                textTransform: "uppercase",
                            }}
                        >
                            {siteName}
                        </Text>
                    </Section>

                    <Section
                        style={{
                            backgroundColor: COLORS.card,
                            borderRadius: "16px",
                            border: `1px solid ${COLORS.border}`,
                            padding: "40px 32px",
                        }}
                    >
                        <Heading
                            as="h1"
                            style={{
                                color: COLORS.text,
                                fontSize: "28px",
                                fontWeight: 800,
                                lineHeight: 1.15,
                                margin: "0 0 8px 0",
                            }}
                        >
                            You&apos;re in,{" "}
                            <span style={{ color: COLORS.highlight }}>
                                {name.split(" ")[0]}
                            </span>
                            .
                        </Heading>

                        <Text
                            style={{
                                color: COLORS.muted,
                                fontSize: "15px",
                                lineHeight: 1.6,
                                margin: "0 0 28px 0",
                            }}
                        >
                            Thanks for booking with {siteName}. Our team will
                            review your request and reach out shortly to confirm
                            your spot and walk you through next steps.
                        </Text>

                        <Section
                            style={{
                                backgroundColor: COLORS.bg,
                                borderRadius: "12px",
                                border: `1px solid ${COLORS.border}`,
                                padding: "20px 24px",
                                marginBottom: "28px",
                            }}
                        >
                            <DetailRow label="Course" value={courseTitle} />
                            {teacherName && (
                                <DetailRow
                                    label="Instructor"
                                    value={teacherName}
                                />
                            )}
                            <DetailRow
                                label="Preferred start"
                                value={preferredStart}
                            />
                            <DetailRow
                                label="Status"
                                value="Awaiting confirmation"
                                isLast
                            />
                        </Section>

                        <Section style={{ textAlign: "center" }}>
                            <Link
                                href={siteUrl}
                                style={{
                                    backgroundColor: COLORS.highlight,
                                    borderRadius: "999px",
                                    color: COLORS.highlightFg,
                                    display: "inline-block",
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    padding: "12px 28px",
                                    textDecoration: "none",
                                }}
                            >
                                Explore more courses
                            </Link>
                        </Section>
                    </Section>

                    <Section style={{ padding: "24px 8px 0" }}>
                        <Text
                            style={{
                                color: COLORS.muted,
                                fontSize: "13px",
                                lineHeight: 1.6,
                                margin: 0,
                            }}
                        >
                            Questions? Reply to this email or write to us at{" "}
                            <Link
                                href={`mailto:${contactEmail}`}
                                style={{
                                    color: COLORS.highlight,
                                    textDecoration: "none",
                                }}
                            >
                                {contactEmail}
                            </Link>
                            . We typically respond within one business day.
                        </Text>

                        <Hr
                            style={{
                                borderColor: COLORS.border,
                                margin: "24px 0",
                            }}
                        />

                        <Text
                            style={{
                                color: COLORS.muted,
                                fontSize: "11px",
                                lineHeight: 1.6,
                                margin: 0,
                                textAlign: "center",
                            }}
                        >
                            © {new Date().getFullYear()} {siteName}. All rights
                            reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

function DetailRow({
    label,
    value,
    isLast,
}: {
    label: string;
    value: string;
    isLast?: boolean;
}) {
    return (
        <div
            style={{
                borderBottom: isLast ? "none" : `1px solid ${COLORS.border}`,
                paddingBottom: isLast ? 0 : "12px",
                marginBottom: isLast ? 0 : "12px",
            }}
        >
            <Text
                style={{
                    color: COLORS.muted,
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    margin: "0 0 4px 0",
                    textTransform: "uppercase",
                }}
            >
                {label}
            </Text>
            <Text
                style={{
                    color: COLORS.text,
                    fontSize: "15px",
                    fontWeight: 500,
                    margin: 0,
                }}
            >
                {value}
            </Text>
        </div>
    );
}

BookingConfirmation.PreviewProps = {
    name: "Alex Morgan",
    courseTitle: "Music Production Foundations",
    teacherName: "Jordan Lee",
    preferredStart: "March 24, 2026",
    siteName: "Artist Inspiration Academy",
    siteUrl: "https://artistinspiration.academy",
    contactEmail: "contact@artistinspiration.academy",
} satisfies BookingConfirmationProps;

export default BookingConfirmation;
