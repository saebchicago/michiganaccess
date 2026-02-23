import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  title?: string;
};

type State = {
  hasError: boolean;
};

export default class SectionErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Keep it minimal: console only (no new services required).
    console.error("Section crashed:", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-10">
          <div className="rounded-xl border bg-background p-6 text-center">
            <p className="text-sm font-medium">{this.props.title ?? "This section didn’t load."}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please retry. If the issue persists, refresh the page.
            </p>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={this.handleRetry}>
                Try again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}