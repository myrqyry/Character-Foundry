import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Oops, something went wrong!</h2>
            <p className="text-gray-300 mb-4">
              The application encountered an unexpected error.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-indigo-300">Error Details</summary>
                <pre className="mt-2 p-2 bg-gray-800 rounded text-sm overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;