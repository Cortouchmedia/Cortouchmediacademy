"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Render a custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-brand-bg text-center p-4">
          <Icon name="alertTriangle" className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Oops! Something went wrong.</h1>
          <p className="text-brand-muted mb-6 max-w-md">
            We've encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;