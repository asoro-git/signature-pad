// app/layout.tsx
import "./styles/globals.css";
import { Playfair_Display } from "next/font/google";
import Providers from "./Providers";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full" suppressHydrationWarning>
            <head />
            <body className={`${playfair.variable} font-sans`}>
                {/* Now all client-only context lives inside Providers */}
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
