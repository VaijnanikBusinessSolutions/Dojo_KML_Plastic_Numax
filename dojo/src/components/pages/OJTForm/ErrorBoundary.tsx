
import React, { Component, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-600">
          Something went wrong while loading this section.
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;