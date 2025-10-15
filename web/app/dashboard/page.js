// Dashboard page - Clean and simple
export default function DashboardPage() {
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
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/login" className="btn btn-primary">Login</a></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </header>

            <main>
                <section className="section dashboard-header">
                    <div className="container">
                        <div className="dashboard-header-content">
                            <div className="welcome-section">
                                <h1 className="heading-1">Dashboard</h1>
                                <p className="text-large">Welcome to your Syntra control center</p>
                            </div>
                            <div className="user-info">
                                <div className="user-avatar">👤</div>
                                <span className="user-name">Demo User</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="heading-2">Dashboard Coming Soon</h2>
                            <p className="text-large">Full dashboard functionality will be available soon</p>
                            <div className="cta-buttons">
                                <a href="/contact" className="btn btn-primary">Get Early Access</a>
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
