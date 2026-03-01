import "../styles/globals.css";

export const metadata = {
    title: "AI Decision Engine",
    description: "Structured strategic thinking system powered by Gemini AI",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>{children}</body>
        </html>
    );
}
