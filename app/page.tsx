"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Zap, Brain, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  const [currentStat, setCurrentStat] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const aiStats = [
    { value: "83%", label: "of enterprises worry about AI data privacy", source: "IBM AI Ethics Board 2024" },
    { value: "$15.7T", label: "projected AI contribution to global economy by 2030", source: "PwC Global AI Study" },
    {
      value: "67%",
      label: "of companies have experienced data breaches with AI",
      source: "Cybersecurity Ventures 2024",
    },
    {
      value: "2.5B",
      label: "sensitive records exposed through AI systems annually",
      source: "Privacy Rights Clearinghouse",
    },
  ]

  const interactiveFeatures = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Smart Entity Detection",
      description: "AI-powered recognition of names, emails, phone numbers, and financial data",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Zero-Knowledge Processing",
      description: "Your sensitive data never leaves your infrastructure during AI processing",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Real-time Restoration",
      description: "Instant demasking of AI responses with perfect accuracy and context",
      color: "from-purple-500 to-pink-500",
    },
  ]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % aiStats.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-slate-900 dark:text-white" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">TrustLayer</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/demo"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Live Demo
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium mb-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <Zap className="h-4 w-4 mr-2 animate-pulse" />
              Privacy-first AI for Enterprise
            </div>

            <h1
              className={`text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              AI You Can
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-300 dark:to-white bg-clip-text text-transparent animate-gradient">
                {" "}
                Trust
              </span>
            </h1>

            <p
              className={`text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              Process sensitive business data with AI while maintaining complete privacy. Our trust layer sanitizes,
              processes, and restores your data seamlessly.
            </p>

            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            >
              <Link href="/demo">
                <Button
                  size="lg"
                  className="group bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold"
                >
                  Try Live Demo
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-slate-200/30 dark:bg-slate-700/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-slate-300/20 dark:bg-slate-600/20 rounded-full animate-float-delay"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-slate-200/40 dark:bg-slate-700/40 rounded-full animate-float-delay-2"></div>
      </section>

      {/* Interactive AI Stats with Enhanced Transitions */}
      <section className="py-16 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">The AI Privacy Crisis</h2>
            <p className="text-slate-300 text-lg">Real data from the industry's leading research</p>
          </div>

          <div className="relative">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto transition-all duration-700 ease-in-out">
              <CardContent className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2 transition-all duration-500 ease-in-out transform">
                  {aiStats[currentStat].value}
                </div>
                <div className="text-xl text-slate-200 mb-3 transition-all duration-500 ease-in-out">
                  {aiStats[currentStat].label}
                </div>
                <div className="text-sm text-slate-400 transition-all duration-500 ease-in-out">
                  Source: {aiStats[currentStat].source}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Progress indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {aiStats.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ease-in-out ${
                    index === currentStat
                      ? "bg-white scale-125 shadow-lg shadow-white/50"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full animate-spin-slow"></div>
          <div
            className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full animate-spin-slow"
            style={{ animationDirection: "reverse" }}
          ></div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Enterprise-Grade Privacy Protection
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our trust layer ensures your sensitive data never leaves your control while still getting the AI
              assistance you need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {interactiveFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer dark:bg-slate-800"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>
                <CardContent className="p-8 relative">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-white`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                    <span className="text-sm font-medium">Learn more</span>
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="py-20 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform">
                99.9%
              </div>
              <div className="text-slate-600 dark:text-slate-300">Privacy Protection</div>
              <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mt-2 rounded-full"></div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform">
                &lt;1min
              </div>
              <div className="text-slate-600 dark:text-slate-300">Processing Time</div>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-2 rounded-full"></div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform">
                99%
              </div>
              <div className="text-slate-600 dark:text-slate-300">Data Accuracy</div>
              <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-purple-600 mx-auto mt-2 rounded-full"></div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 group-hover:scale-110 transition-transform">
                0
              </div>
              <div className="text-slate-600 dark:text-slate-300">Data Breaches</div>
              <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-red-600 mx-auto mt-2 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Trust AI with Your Data?</h2>
          <p className="text-lg text-slate-300 mb-8">
            Join forward-thinking enterprises who trust TrustLayer to protect their sensitive information.
          </p>
          <Link href="/demo">
            <Button size="lg" className="group bg-white text-slate-900 hover:bg-slate-100 font-semibold">
              Start Free Demo
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6" />
              <span className="text-lg font-semibold">TrustLayer</span>
            </div>
            <div className="text-slate-400 text-sm">© 2024 TrustLayer. Privacy-first AI for Enterprise.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
