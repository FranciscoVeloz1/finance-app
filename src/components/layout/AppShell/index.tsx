import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../../../auth/useSession';
import { classNames } from '../../../utils/classNames';
import { ErrorBoundary } from '../../feedback/ErrorBoundary';
import { DashboardIcon, LedgerIcon, SettingsIcon, WalletIcon } from '../../icons';
import { PeriodSelector } from '../PeriodSelector';
import { SkipLink, MAIN_CONTENT_ID } from '../SkipLink';
import { UserMenu } from '../UserMenu';
import styles from './AppShell.module.css';

const DESTINATIONS = [
  { to: '/resumen', label: 'Resumen', short: 'Resumen', Icon: DashboardIcon },
  { to: '/mes', label: 'Detalle de mes', short: 'Detalle', Icon: LedgerIcon },
  { to: '/cuentas', label: 'Cuentas', short: 'Cuentas', Icon: WalletIcon },
  { to: '/configuracion', label: 'Configuración', short: 'Config', Icon: SettingsIcon },
] as const;

export function AppShell() {
  const { expired } = useSession();
  const location = useLocation();

  return (
    <div className={styles.shell}>
      <SkipLink />

      <header className={styles.header}>
        <span className={styles.brand}>Finanzas</span>
        <PeriodSelector />
        <UserMenu />
      </header>

      {expired ? (
        <output className={styles.expired}>
          Tu sesión anterior expiró. Vuelve a iniciar sesión para continuar.
        </output>
      ) : null}

      <div className={styles.body}>
        <nav className={styles.sidebar} aria-label="Navegación principal">
          {DESTINATIONS.map(({ to, label, Icon }) => {
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => {
                  return classNames(styles.navItem, isActive && styles.navItemActive);
                }}
              >
                <Icon size={20} />
                <span className={styles.navLabel}>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <main className={styles.content} id={MAIN_CONTENT_ID} tabIndex={-1}>
          {/* Remounting on navigation clears a stale failure from the previous route. */}
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <nav className={styles.bottomNav} aria-label="Navegación principal">
        {DESTINATIONS.map(({ to, label, short, Icon }) => {
          return (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) => {
                return classNames(styles.bottomItem, isActive && styles.bottomItemActive);
              }}
            >
              <Icon size={20} />
              <span className={styles.bottomLabel}>{short}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
