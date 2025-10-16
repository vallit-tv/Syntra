// Syntra Layout - Complete with navigation and footer
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

                {/* SEO Meta Tags */}
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow" />
                <link rel="canonical" href="https://syntra.vercel.app" />
            </head>
            <body>
                {/* Navigation */}
                <header className="navbar">
                    <div className="container">
                        <div className="nav-content">
                            <div className="nav-brand">
                                <a href="/" className="brand-link">Syntra</a>
                            </div>
                            <nav>
                                <ul className="nav-links">
                                    <li><a href="/">Home</a></li>
                                    <li><a href="/features">Features</a></li>
                                    <li><a href="/about">About</a></li>
                                    <li><a href="/contact">Contact</a></li>
                                    <li><a href="/login" className="btn btn-primary">Login</a></li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main>
                    {children}
                </main>

                {/* Footer */}
                <footer className="footer">
                    <div className="container">
                        <div className="footer-content">
                            <div className="copyright">© 2024 Syntra</div>
                            <nav className="footer-links">
                                <a href="/impressum">Impressum</a>
                                <a href="/datenschutz">Datenschutz</a>
                            </nav>
                        </div>
                    </div>
                </footer>

                {/* Include JavaScript for interactive features */}
                <script src="/scripts/navigation.js"></script>
                <script src="/scripts/forms.js"></script>
            </body>
        </html>
    )
}
