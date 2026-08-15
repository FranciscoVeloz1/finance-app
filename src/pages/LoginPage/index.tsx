import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../../auth/useSession';
import { Banner } from '../../components/feedback/Banner';
import { Button } from '../../components/forms/Button';
import { Field } from '../../components/forms/Field';
import { SessionBootstrap } from '../../components/layout/SessionBootstrap';
import styles from './LoginPage.module.css';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { status, expired, signIn } = useSession();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [credential, setCredential] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'bootstrapping') {
    return <SessionBootstrap />;
  }

  if (status === 'authenticated') {
    const state = location.state as LocationState | null;
    return <Navigate to={state?.from ?? '/'} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signIn(identifier, credential);
    } catch (cause) {
      // Access failures stay generic: never confirm which field was wrong.
      const message =
        cause instanceof Error && cause.message.length > 0
          ? cause.message
          : 'No pudimos iniciar sesión.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <p className={styles.wordmark}>Finanzas</p>
          <p className={styles.tagline}>Tu mes, tus cuentas y tu ahorro en un solo lugar.</p>
        </div>

        {expired ? (
          <Banner
            tone="warning"
            title="Tu sesión expiró"
            description="Vuelve a ingresar para continuar donde te quedaste."
          />
        ) : null}

        {error === null ? null : <Banner tone="negative" title="No pudimos iniciar sesión" description={error} />}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Field label="Correo" required>
            {({ id, describedBy, invalid }) => {
              return (
                <input
                  id={id}
                  className="control"
                  type="email"
                  name="email"
                  autoComplete="username"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  disabled={submitting}
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.currentTarget.value);
                  }}
                />
              );
            }}
          </Field>

          <Field label="Contraseña" required>
            {({ id, describedBy, invalid }) => {
              return (
                <input
                  id={id}
                  className="control"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  disabled={submitting}
                  value={credential}
                  onChange={(event) => {
                    setCredential(event.currentTarget.value);
                  }}
                />
              );
            }}
          </Field>

          <Button type="submit" variant="primary" fullWidth loading={submitting}>
            Entrar
          </Button>
        </form>

        <p className={styles.note}>
          Las cuentas se crean por administración. Si necesitas acceso, solicítalo.
        </p>
      </div>
    </main>
  );
}
