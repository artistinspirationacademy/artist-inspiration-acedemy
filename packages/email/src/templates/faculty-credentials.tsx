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

interface FacultyCredentialsProps {
    teacherName: string;
    email: string;
    password: string;
    loginUrl: string;
    siteName: string;
    contactEmail: string;
}

const COLORS = {
    bg: "#252525",
    card: "#2f2f2c",
    border: "#3a3a36",
    text: "#FAFAF8",
    muted: "#B8B8B0",
    highlight: "#E0F04A",
    highlightFg: "#2A2A23",
};

export function FacultyCredentials({
    teacherName,
    email,
    password,
    loginUrl,
    siteName,
    contactEmail,
}: FacultyCredentialsProps) {
    return (
        <Html>
            <Head />
            <Preview>Your {siteName} faculty portal credentials</Preview>

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
                            Welcome aboard,{" "}
                            <span style={{ color: COLORS.highlight }}>
                                {teacherName.split(" ")[0]}
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
                            Here are your credentials for the {siteName} faculty
                            portal, where you manage your students and their
                            monthly attendance. Keep them safe — only the
                            academy team can change your password.
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
                                Email
                            </Text>
                            <Text
                                style={{
                                    color: COLORS.text,
                                    fontSize: "15px",
                                    fontWeight: 500,
                                    margin: "0 0 16px 0",
                                }}
                            >
                                {email}
                            </Text>

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
                                Password
                            </Text>
                            <Text
                                style={{
                                    color: COLORS.text,
                                    fontFamily:
                                        'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
                                    fontSize: "15px",
                                    fontWeight: 500,
                                    margin: 0,
                                }}
                            >
                                {password}
                            </Text>
                        </Section>

                        <Section style={{ textAlign: "center" }}>
                            <Link
                                href={loginUrl}
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
                                Sign in
                            </Link>
                        </Section>

                        <Text
                            style={{
                                color: COLORS.muted,
                                fontSize: "12px",
                                lineHeight: 1.6,
                                margin: "24px 0 0 0",
                                textAlign: "center",
                            }}
                        >
                            Forgot your password? Ask the academy team — they
                            can set a new one for you anytime.
                        </Text>
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
                            You can sign in anytime at{" "}
                            <Link
                                href={loginUrl}
                                style={{
                                    color: COLORS.highlight,
                                    textDecoration: "none",
                                }}
                            >
                                {loginUrl.replace(/^https?:\/\//, "")}
                            </Link>
                            . Questions? Write to{" "}
                            <Link
                                href={`mailto:${contactEmail}`}
                                style={{
                                    color: COLORS.highlight,
                                    textDecoration: "none",
                                }}
                            >
                                {contactEmail}
                            </Link>
                            .
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

FacultyCredentials.PreviewProps = {
    teacherName: "Jordan Lee",
    email: "jordan@artistinspiration.academy",
    password: "kT7#mWq2!xPn",
    loginUrl: "https://faculty.artistinspiration.academy",
    siteName: "Artist Inspiration Academy",
    contactEmail: "contact@artistinspiration.academy",
} satisfies FacultyCredentialsProps;

export default FacultyCredentials;
