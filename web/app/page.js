// Syntra Homepage - Beautiful and modern
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <span className="mr-2">🚀</span>
              AI-Powered Automation Platform
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="text-gray-900">Business with AI</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
              Automate workflows, analyze data, and make smarter decisions with Syntra's intelligent AI platform.
              <span className="font-semibold text-gray-800"> No coding required.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Get Started Free
              </a>
              <a href="/features" className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Why Choose Syntra?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Three core capabilities that transform how your business operates</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl mb-6">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Automate Workflows</h3>
              <p className="text-gray-600 leading-relaxed">Reduce manual tasks with intelligent automation that learns from your processes and adapts to your business needs.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-2xl mb-6">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Analyze Signals</h3>
              <p className="text-gray-600 leading-relaxed">Understand your business data with AI-powered pattern recognition that identifies trends and opportunities in real-time.</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-2xl mb-6">⚡</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Optimize Processes</h3>
              <p className="text-gray-600 leading-relaxed">Make data-driven improvements with actionable insights that help you streamline operations and boost efficiency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Three simple steps to transform your business operations</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Systems</h3>
              <p className="text-gray-600 leading-relaxed">Integrate with your existing tools and data sources. Our AI learns your current workflows and processes.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analyzes & Learns</h3>
              <p className="text-gray-600 leading-relaxed">Our intelligent system identifies patterns, bottlenecks, and optimization opportunities in your operations.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Automate & Optimize</h3>
              <p className="text-gray-600 leading-relaxed">Implement intelligent automation and receive actionable insights to continuously improve your business processes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">Join forward-thinking companies that are already using AI to automate workflows and gain valuable insights from their data.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/login" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Get Started Free
            </a>
            <a href="/features" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200">
              Explore Features
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
