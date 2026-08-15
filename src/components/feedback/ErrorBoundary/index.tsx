import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Banner } from '../Banner';
import { Button } from '../../forms/Button';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Route-shell boundary. Render failures must not leave a blank screen, and the
 * underlying message never reaches the user (it can contain technical detail).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[finance-app] Fallo de render:', message, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper} role="alert">
          <Banner
            tone="negative"
            title="No pudimos mostrar esta sección"
            description="Vuelve a intentarlo. Si el problema sigue, recarga la página."
            action={
              <Button variant="secondary" onClick={this.handleRetry}>
                Reintentar
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}
