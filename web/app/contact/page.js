// Contact page - Clean and simple
export default function ContactPage() {
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
                                <li><a href="/about">About</a></li>
                                <li><a href="/contact" className="active">Contact</a></li>
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
                            <h1 className="heading-1">Contact Us</h1>
                            <p className="text-large">Ready to transform your business with AI-powered automation?</p>
                            <div className="hero-cta">
                                <a href="#contact-form" className="btn btn-primary">Get in Touch</a>
                                <a href="/features" className="btn btn-secondary">Learn More</a>
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
