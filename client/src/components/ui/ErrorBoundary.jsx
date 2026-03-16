import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log to console in development only
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            {/* CartCrew logo */}
            <div className="w-16 h-16 bg-black border-[2.5px] border-black shadow-brut-xl mx-auto flex items-center justify-center mb-6">
              <span className="font-display text-xl font-black text-yellow">C</span>
            </div>

            <h1 className="font-display text-3xl font-black mb-3">
              Something broke.
            </h1>
            <p className="font-body text-muted text-sm mb-2">
              An unexpected error occurred. This has been noted.
            </p>

            {/* Show error message in dev */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-white border-[2.5px] border-coral text-left p-3 mb-6 shadow-brut">
                <p className="font-mono text-[11px] text-coral uppercase tracking-widest mb-1">
                  Dev error:
                </p>
                <p className="font-mono text-xs text-black break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-yellow border-[2.5px] border-black font-body font-semibold text-sm px-6 py-2.5 shadow-brut hover:shadow-brut-lg transition-shadow"
              >
                Refresh page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
                className="border-[2.5px] border-black font-body text-sm px-6 py-2.5 hover:bg-black hover:text-white transition-colors"
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
