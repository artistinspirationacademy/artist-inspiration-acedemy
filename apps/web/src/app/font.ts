import { Geist_Mono, Nunito_Sans } from "next/font/google";

export const nunitoSans = Nunito_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
    weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
});

export const fontMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
