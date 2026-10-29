import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center mx-auto" style={{ maxWidth: 540 }}>
            <div className="mb-3">
              <span className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex">
                <i className="bi bi-exclamation-octagon-fill fs-2"></i>
              </span>
            </div>
            <h5 className="fw-bold text-dark mb-2">Something went wrong in this module</h5>
            <p className="text-muted small mb-4">
              {this.state.error?.message || 'An unexpected rendering error occurred while loading this view.'}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm px-4 rounded-pill"
                onClick={this.handleReset}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
