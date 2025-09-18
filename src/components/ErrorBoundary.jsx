import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Defer to rum reporter if available
    import('../rum').then(mod => {
      mod.reportError?.(error, errorInfo);
    }).catch(() => {});
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Attempt soft reload of current route
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>We have been notified. You can try reloading the page.</p>
          <button className="btn" onClick={this.handleRetry}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
