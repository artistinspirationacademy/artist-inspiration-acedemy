import { ContactPage } from "@/components/contact";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact",
    description: "Get in touch with Artist Inspiration Academy.",
};

export default function Page() {
    return <ContactPage />;
}
