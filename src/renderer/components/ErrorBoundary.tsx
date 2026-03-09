/**
 * React Error Boundary
 *
 * Wraps a subtree and catches any uncaught errors thrown during rendering,
 * lifecycle methods, or event handlers of descendant components.  Without an
 * Error Boundary a single component crash takes down the entire window.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
 *     <RiskyComponent />
 *   </ErrorBoundary>
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Custom fallback UI. Defaults to a generic error card. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console so the DevTools / log files pick it up.
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '1rem',
            color: 'var(--text-primary, #fff)',
            background: 'var(--bg-secondary, #1a1a2e)',
            borderRadius: '8px',
            border: '1px solid var(--accent-red, #e74c3c)',
          }}
        >
          <h3 style={{ margin: 0, color: 'var(--accent-red, #e74c3c)' }}>
            ⚠️ Something went wrong
          </h3>
          {this.state.error && (
            <p
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'var(--text-secondary, #aaa)',
                textAlign: 'center',
                maxWidth: '400px',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.4rem 1.2rem',
              background: 'var(--accent-primary, #7c3aed)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
