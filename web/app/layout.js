// Clean layout - minimal and simple
import './globals.css'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <title>Syntra – AI-Powered Workflow Automation & Analytics</title>
                <meta name="description" content="Transform your business with AI-driven workflow automation and intelligent analytics. Syntra helps companies optimize processes and understand their data signals." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                {/* Include component CSS */}
                <link rel="stylesheet" href="/styles/components/buttons.css" />
                <link rel="stylesheet" href="/styles/components/cards.css" />
                <link rel="stylesheet" href="/styles/components/forms.css" />
            </head>
            <body>
                {children}
                {/* Include JavaScript for interactive features */}
                <script src="/scripts/navigation.js"></script>
                <script src="/scripts/forms.js"></script>
            </body>
        </html>
    )
}
