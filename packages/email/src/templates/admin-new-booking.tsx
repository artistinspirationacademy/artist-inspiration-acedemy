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

interface AdminNewBookingProps {
    bookingId: string;
    name: string;
    email: string | null;
    phone: string;
    age: number;
    gender: string;
    country: string;
    experienceLevel: string;
    courseTitle: string;
    teacherName?: string | null;
    preferredStart: string;
    bookedAt: string;
    bookingUrl: string;
    siteName: string;
}

const COLORS = {
    bg: "#f7f7f5",
    card: "#ffffff",
    border: "#e6e6e1",
    text: "#1a1a1a",
    muted: "#6b6b62",
    primary: "#5B4EFF",
    primaryFg: "#ffffff",
    pillBg: "#eef0ff",
    pillFg: "#3327c4",
};

export function AdminNewBooking({
    bookingId,
    name,
    email,
    phone,
    age,
    gender,
    country,
    experienceLevel,
    courseTitle,
    teacherName,
    preferredStart,
    bookedAt,
    bookingUrl,
    siteName,
}: AdminNewBookingProps) {
    return (
        <Html>
            <Head />
            <Preview>
                New booking from {name} for {courseTitle}
            </Preview>

            <Body
                style={{
                    backgroundColor: COLORS.bg,
                    color: COLORS.text,
                    fontFamily:
                        '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    margin: 0,
                    padding: "32px 0",
                }}
            >
                <Container
                    style={{
                        maxWidth: "600px",
                        margin: "0 auto",
                        padding: "0 24px",
                    }}
                >
                    <Section style={{ paddingBottom: "16px" }}>
                        <Text
                            style={{
                                color: COLORS.muted,
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.18em",
                                margin: 0,
                                textTransform: "uppercase",
                            }}
                        >
                            {siteName} · Admin
                        </Text>
                    </Section>

                    <Section
                        style={{
                            backgroundColor: COLORS.card,
                            borderRadius: "12px",
                            border: `1px solid ${COLORS.border}`,
                            overflow: "hidden",
                        }}
                    >
                        <Section
                            style={{
                                padding: "24px 28px 0",
                            }}
                        >
                            <span
                                style={{
                                    backgroundColor: COLORS.pillBg,
                                    borderRadius: "999px",
                                    color: COLORS.pillFg,
                                    display: "inline-block",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    padding: "4px 10px",
                                    textTransform: "uppercase",
                                }}
                            >
                                New booking
                            </span>

                            <Heading
                                as="h1"
                                style={{
                                    color: COLORS.text,
                                    fontSize: "22px",
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    margin: "12px 0 4px 0",
                                }}
                            >
                                {name} booked {courseTitle}
                            </Heading>

                            <Text
                                style={{
                                    color: COLORS.muted,
                                    fontSize: "13px",
                                    margin: "0 0 20px 0",
                                }}
                            >
                                Received {bookedAt}
                            </Text>

                            <Section style={{ textAlign: "left" }}>
                                <Link
                                    href={bookingUrl}
                                    style={{
                                        backgroundColor: COLORS.primary,
                                        borderRadius: "8px",
                                        color: COLORS.primaryFg,
                                        display: "inline-block",
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        padding: "10px 20px",
                                        textDecoration: "none",
                                    }}
                                >
                                    Open booking in dashboard →
                                </Link>
                            </Section>
                        </Section>

                        <Hr
                            style={{
                                borderColor: COLORS.border,
                                margin: "24px 0 0 0",
                            }}
                        />

                        <Section style={{ padding: "20px 28px 8px" }}>
                            <Text
                                style={{
                                    color: COLORS.muted,
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    margin: "0 0 12px 0",
                                    textTransform: "uppercase",
                                }}
                            >
                                Contact
                            </Text>
                            <Field label="Name" value={name} />
                            <Field label="Email" value={email ?? "—"} />
                            <Field label="Phone" value={phone} />
                            <Field label="Country" value={country} />
                        </Section>

                        <Hr
                            style={{
                                borderColor: COLORS.border,
                                margin: 0,
                            }}
                        />

                        <Section style={{ padding: "20px 28px 8px" }}>
                            <Text
                                style={{
                                    color: COLORS.muted,
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    margin: "0 0 12px 0",
                                    textTransform: "uppercase",
                                }}
                            >
                                Booking
                            </Text>
                            <Field label="Course" value={courseTitle} />
                            {teacherName && (
                                <Field
                                    label="Requested teacher"
                                    value={teacherName}
                                />
                            )}
                            <Field
                                label="Preferred start"
                                value={preferredStart}
                            />
                            <Field
                                label="Experience"
                                value={experienceLevel}
                            />
                            <Field label="Age" value={String(age)} />
                            <Field label="Gender" value={gender} />
                        </Section>

                        <Section
                            style={{
                                backgroundColor: COLORS.bg,
                                borderTop: `1px solid ${COLORS.border}`,
                                padding: "12px 28px",
                            }}
                        >
                            <Text
                                style={{
                                    color: COLORS.muted,
                                    fontFamily:
                                        '"Geist Mono", ui-monospace, SFMono-Regular, monospace',
                                    fontSize: "11px",
                                    margin: 0,
                                }}
                            >
                                ID: {bookingId}
                            </Text>
                        </Section>
                    </Section>

                    <Section style={{ padding: "16px 8px 0" }}>
                        <Text
                            style={{
                                color: COLORS.muted,
                                fontSize: "11px",
                                margin: 0,
                                textAlign: "center",
                            }}
                        >
                            This is an automated alert from {siteName}.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ marginBottom: "10px" }}>
            <Text
                style={{
                    color: COLORS.muted,
                    fontSize: "11px",
                    fontWeight: 600,
                    margin: "0 0 2px 0",
                }}
            >
                {label}
            </Text>
            <Text
                style={{
                    color: COLORS.text,
                    fontSize: "14px",
                    margin: 0,
                }}
            >
                {value}
            </Text>
        </div>
    );
}

AdminNewBooking.PreviewProps = {
    bookingId: "8c1d3f4a-9b1e-4c5b-8b2f-1f2e3d4c5b6a",
    name: "Alex Morgan",
    email: "alex@example.com",
    phone: "+14155550123",
    age: 27,
    gender: "Female",
    country: "United States",
    experienceLevel: "Beginner",
    courseTitle: "Music Production Foundations",
    teacherName: "Jordan Lee",
    preferredStart: "March 24, 2026",
    bookedAt: "Mar 17, 2026 · 2:14 PM",
    bookingUrl: "https://admin.example.com/bookings?bookingId=8c1d3f4a",
    siteName: "Artist Inspiration Academy",
} satisfies AdminNewBookingProps;

export default AdminNewBooking;
