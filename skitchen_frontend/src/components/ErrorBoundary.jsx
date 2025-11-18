import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // You can log to an external service here if desired
    console.error("ErrorBoundary caught an error", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white px-4">
          <div className="w-full max-w-md bg-slate-900/80 border border-slate-700 rounded-2xl p-6 text-center shadow-xl">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-300 mb-4">
              An unexpected error occurred. You can try again.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-emerald-400 to-orange-400 text-black hover:from-emerald-300 hover:to-orange-300"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

