import "../styles/globals.css";

export const metadata = {
    title: "Decision Engine",
    description: "AI-powered strategic decision analysis. Decompose any dilemma into 11 dimensions with probabilistic models, bias detection, and actionable recommendations.",
    keywords: ["decision engine", "AI analysis", "strategic thinking", "decision making", "cognitive bias"],
    authors: [{ name: "Dharshan Sondi" }],
    openGraph: {
        title: "AI Decision Engine",
        description: "Decompose any decision into 11 strategic dimensions with AI-powered analysis, risk modeling, and bias detection.",
        url: "https://ai-decision-engine.vercel.app",
        siteName: "Decision Engine",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Decision Engine",
        description: "AI-powered strategic decision analysis system with probabilistic models and bias detection.",
    },
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Decision Engine",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#ffa116",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/icon-192.png" />
                <meta name="mobile-web-app-capable" content="yes" />
            </head>
            <body>{children}</body>
        </html>
    );
}
