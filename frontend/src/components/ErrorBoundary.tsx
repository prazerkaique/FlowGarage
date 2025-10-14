import React from 'react';

type ErrorBoundaryState = { hasError: boolean; error?: Error };

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log for debugging during development
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: 'white', background: '#1C1C1F' }}>
          <h2 style={{ marginTop: 0 }}>Algo deu errado</h2>
          <p style={{ opacity: 0.8 }}>A página de configurações encontrou um erro e foi interrompida.</p>
          {this.state.error && (
            <pre style={{ background: '#101012', padding: 12, borderRadius: 8, overflowX: 'auto' }}>
              {String(this.state.error)}
            </pre>
          )}
          <button onClick={this.handleReset} style={{ marginTop: 12 }}>Tentar novamente</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;