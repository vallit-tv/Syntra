// Clean Next.js Homepage - Simple and clean
export default function HomePage() {
  return (
    <>
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

      <main>
        {/* Hero Section */}
        <section className="section hero-section">
          <div className="container">
            <div className="text-center">
              <h1 className="heading-1">AI-Powered Workflow Automation & Analytics</h1>
              <p className="text-large">Transform your business with intelligent automation and data-driven insights. Syntra helps companies optimize processes, understand their signals, and make smarter decisions.</p>
              <div className="hero-cta">
                <a href="/contact" className="btn btn-primary">Request Demo</a>
                <a href="/features" className="btn btn-secondary">Learn More</a>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="section">
          <div className="container">
            <div className="text-center">
              <h2 className="heading-2">Why Choose Syntra?</h2>
              <p className="text-large">Three core capabilities that transform how your business operates</p>
            </div>
            <div className="grid-3">
              <div className="card">
                <div className="card-icon">🤖</div>
                <h3 className="heading-3">Automate Workflows</h3>
                <p>Reduce manual tasks with intelligent automation that learns from your processes and adapts to your business needs.</p>
              </div>
              <div className="card">
                <div className="card-icon">📊</div>
                <h3 className="heading-3">Analyze Signals</h3>
                <p>Understand your business data with AI-powered pattern recognition that identifies trends and opportunities in real-time.</p>
              </div>
              <div className="card">
                <div className="card-icon">⚡</div>
                <h3 className="heading-3">Optimize Processes</h3>
                <p>Make data-driven improvements with actionable insights that help you streamline operations and boost efficiency.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section">
          <div className="container">
            <div className="text-center">
              <h2 className="heading-2">How It Works</h2>
              <p className="text-large">Three simple steps to transform your business operations</p>
            </div>
            <div className="grid-3">
              <div className="card step-card">
                <div className="step-number">1</div>
                <h3 className="heading-3">Connect Your Systems</h3>
                <p>Integrate with your existing tools and data sources. Our AI learns your current workflows and processes.</p>
              </div>
              <div className="card step-card">
                <div className="step-number">2</div>
                <h3 className="heading-3">AI Analyzes & Learns</h3>
                <p>Our intelligent system identifies patterns, bottlenecks, and optimization opportunities in your operations.</p>
              </div>
              <div className="card step-card">
                <div className="step-number">3</div>
                <h3 className="heading-3">Automate & Optimize</h3>
                <p>Implement intelligent automation and receive actionable insights to continuously improve your business processes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section cta-section">
          <div className="container">
            <div className="text-center">
              <h2 className="heading-2">Ready to Transform Your Business?</h2>
              <p className="text-large">Join forward-thinking companies that are already using AI to automate workflows and gain valuable insights from their data.</p>
              <div className="cta-buttons">
                <a href="/contact" className="btn btn-primary">Request Demo</a>
                <a href="/features" className="btn btn-secondary">Explore Features</a>
              </div>
            </div>
          </div>
        </section>
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
    </>
  )
}

// Alternative: Component-based approach (cleaner)
export function ComponentBasedHomePage() {
    return (
        <>
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

            <main>
                {/* Hero Section */}
                <section className="section hero-section">
                    <div className="container">
                        <div className="text-center">
                            <h1 className="heading-1">AI-Powered Workflow Automation & Analytics</h1>
                            <p className="text-large">Transform your business with intelligent automation and data-driven insights. Syntra helps companies optimize processes, understand their signals, and make smarter decisions.</p>
                            <div className="hero-cta">
                                <a href="/contact" className="btn btn-primary">Request Demo</a>
                                <a href="/features" className="btn btn-secondary">Learn More</a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Value Proposition Section */}
                <section className="section">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="heading-2">Why Choose Syntra?</h2>
                            <p className="text-large">Three core capabilities that transform how your business operates</p>
                        </div>
                        <div className="grid-3">
                            <div className="card">
                                <div className="card-icon">🤖</div>
                                <h3 className="heading-3">Automate Workflows</h3>
                                <p>Reduce manual tasks with intelligent automation that learns from your processes and adapts to your business needs.</p>
                            </div>
                            <div className="card">
                                <div className="card-icon">📊</div>
                                <h3 className="heading-3">Analyze Signals</h3>
                                <p>Understand your business data with AI-powered pattern recognition that identifies trends and opportunities in real-time.</p>
                            </div>
                            <div className="card">
                                <div className="card-icon">⚡</div>
                                <h3 className="heading-3">Optimize Processes</h3>
                                <p>Make data-driven improvements with actionable insights that help you streamline operations and boost efficiency.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="section">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="heading-2">How It Works</h2>
                            <p className="text-large">Three simple steps to transform your business operations</p>
                        </div>
                        <div className="grid-3">
                            <div className="card step-card">
                                <div className="step-number">1</div>
                                <h3 className="heading-3">Connect Your Systems</h3>
                                <p>Integrate with your existing tools and data sources. Our AI learns your current workflows and processes.</p>
                            </div>
                            <div className="card step-card">
                                <div className="step-number">2</div>
                                <h3 className="heading-3">AI Analyzes & Learns</h3>
                                <p>Our intelligent system identifies patterns, bottlenecks, and optimization opportunities in your operations.</p>
                            </div>
                            <div className="card step-card">
                                <div className="step-number">3</div>
                                <h3 className="heading-3">Automate & Optimize</h3>
                                <p>Implement intelligent automation and receive actionable insights to continuously improve your business processes.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section cta-section">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="heading-2">Ready to Transform Your Business?</h2>
                            <p className="text-large">Join forward-thinking companies that are already using AI to automate workflows and gain valuable insights from their data.</p>
                            <div className="cta-buttons">
                                <a href="/contact" className="btn btn-primary">Request Demo</a>
                                <a href="/features" className="btn btn-secondary">Explore Features</a>
                            </div>
                        </div>
                    </div>
                </section>
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
        </>
    )
}
