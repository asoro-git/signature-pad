import "./styles/globals.css";
import { Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/app/components/theme-provider";
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
});
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full" suppressHydrationWarning>
            <head />
            <body className={`${playfair.variable} font-sans`}>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
