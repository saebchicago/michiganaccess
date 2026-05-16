import React from "react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
  title?: string;
};

type State = {
  hasError: boolean;
  retries: number;
};

const MAX_RETRIES = 2;

export default class SectionErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, retries: 0 };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Section crashed:", error);
  }

  handleRetry = () => {
    this.setState((s) => ({ hasError: false, retries: s.retries + 1 }));
  };

  render() {
    if (this.state.hasError) {
      const exhausted = this.state.retries >= MAX_RETRIES;
      return (
        <div className="container py-10">
          <div className="rounded-xl border bg-background p-6 text-center">
            <p className="text-sm font-medium">{this.props.title ?? "This section didn’t load."}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {exhausted
                ? "This section is unavailable. Please refresh the page."
                : "Please retry. If the issue persists, refresh the page."}
            </p>
            <div className="mt-4 flex justify-center">
              {exhausted ? (
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh page
                </Button>
              ) : (
                <Button variant="outline" onClick={this.handleRetry}>
                  Try again
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}