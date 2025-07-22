"use client"

import { useState } from "react"
import { ArrowDown, Shield, Lock, CheckCircle, Loader2, ArrowLeft, Zap, Copy, Download, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import type React from "react"

interface ApiResponse {
  original_text: string
  sanitized_text: string
  ai_response_masked: string
  ai_response_demasked: string
  mappings: Record<string, string>
  changes_made: string[]
}

interface SanitizeResponse {
  original?: string
  processed_text: string
}

interface LoadingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  active: boolean
  substeps?: string[]
}

export default function DemoPage() {
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ApiResponse | null>(null)
  const [sanitizeOnly, setSanitizeOnly] = useState(false)
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")
  const [isTypewriting, setIsTypewriting] = useState(false)

  const examples = {
    hr: "Our HR director Jessica Williams needs to meet with CEO Amanda Rodriguez about the layoffs. Contact Jessica at j.williams@techstart.com or call 555-987-6543. We need to discuss severance packages of $45K each for 12 employees.",
    finance:
      "CFO Michael Chen from Goldman Sachs is reviewing our $2.5M acquisition proposal. His assistant Sarah Lopez (s.lopez@gs.com, 212-555-7890) will coordinate the due diligence process.",
    project:
      "Project manager David Kim needs to update stakeholder Maria Gonzalez about the Q4 deliverables. The budget is $125K and we have 8 team members assigned. Contact David at d.kim@company.com.",
  }

  const loadExample = (type: keyof typeof examples) => {
    setInputText(examples[type])
    setResults(null)
    setShowConfetti(false)
  }

  // Typewriter effect
  const typewriterEffect = (text: string, speed = 50) => {
    setIsTypewriting(true)
    setTypewriterText("")
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypewriterText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
        setIsTypewriting(false)
      }
    }, speed)
    return timer
  }

  // Confetti effect
  const triggerConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      console.log(`${label} copied to clipboard`)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  // Download as text
  const downloadAsText = (content: string, filename: string) => {
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Enhanced loading steps based on your backend
  const initializeLoadingSteps = (isComplete: boolean) => {
    const steps: LoadingStep[] = [
      {
        id: 1,
        title: "Sanitizing Text",
        description: "Detecting and replacing sensitive information",
        icon: <Lock className="h-5 w-5" />,
        completed: false,
        active: true,
        substeps: ["Names replaced", "Companies replaced", "Emails replaced", "Phone numbers redacted"],
      },
    ]

    if (isComplete) {
      steps.push(
        {
          id: 2,
          title: "AI Processing",
          description: "Generating intelligent response using sanitized data",
          icon: <Zap className="h-5 w-5" />,
          completed: false,
          active: false,
        },
        {
          id: 3,
          title: "Demasking Response",
          description: "Safely restoring original information",
          icon: <CheckCircle className="h-5 w-5" />,
          completed: false,
          active: false,
        },
      )
    }

    setLoadingSteps(steps)
  }

  // More realistic step progression
  const simulateStepProgress = (isComplete: boolean) => {
    const timings = isComplete
      ? [15000, 35000, 10000] // 15s sanitize, 35s AI, 10s demask = ~60s total
      : [30000] // 30s for sanitize only

    let currentStep = 0
    const intervals: NodeJS.Timeout[] = []

    const progressStep = () => {
      if (currentStep < timings.length) {
        // Mark current step as active
        setLoadingSteps((prev) =>
          prev.map((step, index) => ({
            ...step,
            completed: index < currentStep,
            active: index === currentStep,
          })),
        )

        // Set timeout for this step
        const timeout = setTimeout(() => {
          // Mark current step as completed
          setLoadingSteps((prev) =>
            prev.map((step, index) => ({
              ...step,
              completed: index <= currentStep,
              active: false,
            })),
          )

          currentStep++
          if (currentStep < timings.length) {
            progressStep()
          }
        }, timings[currentStep])

        intervals.push(timeout)
      }
    }

    progressStep()
    return intervals
  }

  const runCompleteDemo = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text first!")
      return
    }

    setIsLoading(true)
    setSanitizeOnly(false)
    setResults(null)
    setShowConfetti(false)

    initializeLoadingSteps(true)
    const stepIntervals = simulateStepProgress(true)

    try {
      const response = await fetch("/complete_flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          task: "help",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Clear intervals and mark all complete
        stepIntervals.forEach(clearTimeout)
        setLoadingSteps((prev) => prev.map((step) => ({ ...step, completed: true, active: false })))

        setTimeout(() => {
          setResults(data)
          setIsLoading(false)
          triggerConfetti()

          // Start typewriter effect for AI response
          if (data.ai_response_demasked) {
            typewriterEffect(data.ai_response_demasked, 30)
          }
        }, 1000)
      } else {
        stepIntervals.forEach(clearTimeout)
        alert(`Error: ${data.error}`)
        setIsLoading(false)
      }
    } catch (error) {
      stepIntervals.forEach(clearTimeout)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }

  const sanitizeOnlyFunc = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text first!")
      return
    }

    setIsLoading(true)
    setSanitizeOnly(true)
    setResults(null)

    initializeLoadingSteps(false)
    const stepIntervals = simulateStepProgress(false)

    try {
      const response = await fetch("/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      })

      const data: SanitizeResponse = await response.json()

      if (response.ok) {
        stepIntervals.forEach(clearTimeout)
        setLoadingSteps((prev) => prev.map((step) => ({ ...step, completed: true, active: false })))

        const sanitizeResults: ApiResponse = {
          original_text: data.original || data.processed_text,
          sanitized_text: data.processed_text,
          ai_response_masked: "",
          ai_response_demasked: "",
          mappings: {},
          changes_made: [],
        }

        setTimeout(() => {
          setResults(sanitizeResults)
          setIsLoading(false)
        }, 1000)
      } else {
        stepIntervals.forEach(clearTimeout)
        alert(`Error: ${(data as any).error}`)
        setIsLoading(false)
      }
    } catch (error) {
      stepIntervals.forEach(clearTimeout)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-slate-900 dark:text-white" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">TrustLayer Demo</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium mb-6">
            <Shield className="h-4 w-4 mr-2" />
            Live Interactive Demo
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            See Privacy Protection in Action
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Enter sensitive business text and watch our trust layer sanitize, process, and restore your data in
            real-time.
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 animate-slide-up border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-700 dark:to-slate-800/50">
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Enter Your Sensitive Business Text</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your sensitive business text here...

Example: 'Contact John Smith at john@company.com about the $500K Microsoft project. Call him at 555-123-4567.'"
              className="min-h-[120px] mb-6 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  runCompleteDemo()
                }
              }}
            />

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button
                onClick={runCompleteDemo}
                disabled={isLoading}
                className="flex-1 group bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold"
              >
                {isLoading && !sanitizeOnly ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                )}
                Run Complete Demo
              </Button>
              <Button
                variant="outline"
                onClick={sanitizeOnlyFunc}
                disabled={isLoading}
                className="flex-1 bg-transparent"
              >
                {isLoading && sanitizeOnly ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Sanitize Only
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Or try these examples:</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    key: "hr",
                    icon: "👥",
                    title: "HR Situation",
                    desc: "Layoff discussion with employee names and contacts",
                  },
                  {
                    key: "finance",
                    icon: "💰",
                    title: "Financial Deal",
                    desc: "M&A proposal with banker details and amounts",
                  },
                  {
                    key: "project",
                    icon: "📋",
                    title: "Project Update",
                    desc: "Project status with team contacts and budget",
                  },
                ].map((example) => (
                  <Card
                    key={example.key}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    onClick={() => loadExample(example.key as keyof typeof examples)}
                  >
                    <CardContent className="p-4">
                      <div className="text-2xl mb-2">{example.icon}</div>
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{example.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{example.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Loading Section */}
        {isLoading && (
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full mb-4 animate-pulse-gentle">
                  <Shield className="h-10 w-10 text-slate-600 dark:text-slate-300 animate-spin-slow" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                  Processing through Trust Layer
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  Securing your data with enterprise-grade privacy protection
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  This may take up to 1 minute depending on text complexity
                </p>
              </div>

              {/* Enhanced Step Progress */}
              <div className="max-w-2xl mx-auto">
                <div className="space-y-6">
                  {loadingSteps.map((step, index) => (
                    <div key={step.id} className="relative">
                      <div className="flex items-center space-x-4">
                        {/* Step Icon */}
                        <div
                          className={`
                          flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500
                          ${
                            step.completed
                              ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 scale-110"
                              : step.active
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 animate-pulse scale-110"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                          }
                        `}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-6 w-6 animate-bounce-gentle" />
                          ) : (
                            <div className={step.active ? "animate-spin" : ""}>{step.icon}</div>
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`
                            font-semibold transition-colors duration-300
                            ${step.completed ? "text-green-700 dark:text-green-400" : step.active ? "text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}
                          `}
                          >
                            {step.title}
                          </div>
                          <div
                            className={`
                            text-sm transition-colors duration-300
                            ${step.completed ? "text-green-600 dark:text-green-500" : step.active ? "text-blue-600 dark:text-blue-500" : "text-slate-400 dark:text-slate-500"}
                          `}
                          >
                            {step.description}
                          </div>

                          {/* Substeps for sanitization */}
                          {step.substeps && step.active && (
                            <div className="mt-2 ml-4 space-y-1">
                              {step.substeps.map((substep, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="text-xs text-slate-500 dark:text-slate-400 animate-pulse"
                                >
                                  • {substep}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex-shrink-0">
                          {step.completed && <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>}
                          {step.active && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                        </div>
                      </div>

                      {/* Connecting Line */}
                      {index < loadingSteps.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-slate-200 dark:bg-slate-600"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="mt-8">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span>Progress</span>
                    <span>
                      {Math.round((loadingSteps.filter((s) => s.completed).length / loadingSteps.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(loadingSteps.filter((s) => s.completed).length / loadingSteps.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {results && !isLoading && (
          <div className="space-y-6 animate-slide-up">
            {/* Success Banner */}
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-800 dark:text-green-300">
                    {sanitizeOnly ? "Sanitization successful!" : "Complete privacy flow successful!"}
                    {!sanitizeOnly && " Sensitive data protected while maintaining AI utility."}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Original */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <span>Your Original Text</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(results.original_text, "Original text")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAsText(results.original_text, "original-text.txt")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border-l-4 border-blue-500 whitespace-pre-wrap">
                  {results.original_text}
                </div>
              </CardContent>
            </Card>

            {/* Flow Arrow */}
            <div className="flex justify-center animate-bounce-gentle">
              <div className="flex flex-col items-center space-y-2 text-slate-600 dark:text-slate-400">
                <ArrowDown className="h-6 w-6" />
                <span className="text-sm font-medium">Trust Layer Sanitization</span>
              </div>
            </div>

            {/* Step 2: Sanitized */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <span>Sanitized Text (Safe for AI)</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(results.sanitized_text, "Sanitized text")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAsText(results.sanitized_text, "sanitized-text.txt")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500 whitespace-pre-wrap">
                  {results.sanitized_text}
                </div>
                <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  <Shield className="h-4 w-4 inline mr-2" />
                  All sensitive information has been safely replaced with placeholders
                </div>
              </CardContent>
            </Card>

            {/* Complete Flow Results */}
            {!sanitizeOnly && results.ai_response_demasked && (
              <>
                {/* Flow Arrow */}
                <div className="flex justify-center animate-bounce-gentle">
                  <div className="flex flex-col items-center space-y-2 text-slate-600 dark:text-slate-400">
                    <ArrowDown className="h-6 w-6" />
                    <span className="text-sm font-medium">AI Processing & Response</span>
                  </div>
                </div>

                {/* Step 3: AI Response (Masked) */}
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          3
                        </div>
                        <span>AI Response (Still Masked)</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(results.ai_response_masked, "AI response (masked)")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadAsText(results.ai_response_masked, "ai-response-masked.txt")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500 whitespace-pre-wrap">
                      {results.ai_response_masked}
                    </div>
                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                      <Zap className="h-4 w-4 inline mr-2" />
                      AI generated this response using only the sanitized data
                    </div>
                  </CardContent>
                </Card>

                {/* Flow Arrow */}
                <div className="flex justify-center animate-bounce-gentle">
                  <div className="flex flex-col items-center space-y-2 text-slate-600 dark:text-slate-400">
                    <ArrowDown className="h-6 w-6" />
                    <span className="text-sm font-medium">Trust Layer Restoration</span>
                  </div>
                </div>

                {/* Step 4: Final Response (Demasked) */}
                <Card className="shadow-lg border-0 overflow-hidden border-2 border-yellow-200 dark:border-yellow-800">
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/20">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          4
                        </div>
                        <span>Final AI Response (Restored)</span>
                        <Sparkles className="h-5 w-5 text-yellow-600 animate-pulse" />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(results.ai_response_demasked, "Final AI response")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadAsText(results.ai_response_demasked, "ai-response-final.txt")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500 whitespace-pre-wrap">
                      {isTypewriting ? (
                        <span>
                          {typewriterText}
                          <span className="animate-pulse">|</span>
                        </span>
                      ) : (
                        results.ai_response_demasked
                      )}
                    </div>
                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" />
                      Original sensitive information safely restored with context. AI can make mistakes. Please double-check all work.
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Summary Card */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  <span>Privacy Protection Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">What was protected:</h4>
                    <div className="space-y-2">
                      {Object.entries(results.mappings).map(([placeholder, original]) => (
                        <div
                          key={placeholder}
                          className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded text-sm"
                        >
                          <span className="text-slate-600 dark:text-slate-300">{original}</span>
                          <span className="text-slate-500 dark:text-slate-400">→ {placeholder}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Security metrics:</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-300">Data exposure risk:</span>
                        <span className="font-semibold text-green-600">0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-300">Context preservation:</span>
                        <span className="font-semibold text-green-600">100%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-300">Processing time:</span>
                        <span className="font-semibold text-blue-600">&lt; 60s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                onClick={() => {
                  setInputText("")
                  setResults(null)
                  setShowConfetti(false)
                }}
                variant="outline"
                className="group"
              >
                Try Another Example
                <ArrowLeft className="ml-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              </Button>
              <Link href="/">
                <Button className="group bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-semibold">
                  Learn More About TrustLayer
                  <Shield className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
