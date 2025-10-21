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
                {/* Component CSS is included in globals.css */}

                {/* SEO Meta Tags */}
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow" />
                <link rel="canonical" href="https://syntra.vercel.app" />
            </head>
            <body>
                {/* Navigation */}
                <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <a href="/" className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">S</span>
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Syntra</span>
                                </a>
                            </div>
                            <nav className="hidden md:flex items-center space-x-8">
                                <a href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Home</a>
                                <a href="/features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
                                <a href="/about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About</a>
                                <a href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</a>
                            </nav>
                            <div className="flex items-center space-x-4">
                                <a href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                                    Get Started
                                </a>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main>
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-gray-900 text-white">
                    <div className="container mx-auto px-4 py-12">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div className="md:col-span-2">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">S</span>
                                    </div>
                                    <span className="text-xl font-bold">Syntra</span>
                                </div>
                                <p className="text-gray-400 mb-4 max-w-md">
                                    AI-powered workflow automation and analytics platform that helps businesses optimize processes and make data-driven decisions.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4">Product</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                                    <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                                    <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                                    <li><a href="/api" className="hover:text-white transition-colors">API</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4">Company</h3>
                                <ul className="space-y-2 text-gray-400">
                                    <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                                    <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                                    <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
                                    <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                            <div className="text-gray-400 text-sm">
                                © 2024 Syntra. All rights reserved.
                            </div>
                            <nav className="flex space-x-6 mt-4 md:mt-0">
                                <a href="/impressum" className="text-gray-400 hover:text-white text-sm transition-colors">Impressum</a>
                                <a href="/datenschutz" className="text-gray-400 hover:text-white text-sm transition-colors">Datenschutz</a>
                                <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
                            </nav>
                        </div>
                    </div>
                </footer>

                {/* JavaScript will be added later when needed */}
            </body>
        </html>
    )
}
