import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  Fallback?: (props: { error: Error; errorInfo: ErrorInfo }) => ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state: {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
  }
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    const { Fallback, fallback } = this.props
    if (this.state.hasError) {
      document.body.classList.toggle('error', true)
      if (Fallback) {
        return <Fallback error={this.state.error!} errorInfo={this.state.errorInfo!} />
      }
      if (fallback) {
        return fallback
      }
      return null
    }
    document.body.classList.toggle('error', false)
    return this.props.children
  }
}
