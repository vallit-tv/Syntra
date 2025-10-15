// About page - Clean and simple
export default function AboutPage() {
    return (
        <>
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
                                <li><a href="/about" className="active">About</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/login" className="btn btn-primary">Login</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>

            <main>
                <section className="section hero-section">
                    <div className="container">
                        <div className="text-center">
                            <h1 className="heading-1">About Syntra</h1>
                            <p className="text-large">We're on a mission to democratize AI-powered workflow automation</p>
                            <div className="hero-cta">
                                <a href="/contact" className="btn btn-primary">Get Started</a>
                                <a href="/features" className="btn btn-secondary">Explore Features</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

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
        </>
    )
}
