import { Link } from 'react-router-dom';
import { usePreferences } from '../../hooks/usePreferences';
import { REDUCED_MOTION_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { SegmentedControl } from '../../components/forms/SegmentedControl';
import { Switch } from '../../components/forms/Switch';
import { PageHeader } from '../../components/layout/PageHeader';
import { ChevronRightIcon } from '../../components/icons';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { preferences, update } = usePreferences();
  const systemReducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  return (
    <div className={styles.page}>
      <PageHeader title="Configuración" description="Ajustes de la interfaz y de tu espacio." />

      <section className={styles.card} aria-labelledby="prefs-title">
        <h2 className={styles.cardTitle} id="prefs-title">
          Preferencias de interfaz
        </h2>

        <div className={styles.row}>
          <div className={styles.rowText}>
            <span className={styles.rowLabel}>Densidad de tablas</span>
            <span className={styles.rowHint}>
              Compacta muestra más filas por pantalla; cómoda deja más aire.
            </span>
          </div>
          <SegmentedControl
            legend="Densidad de tablas"
            value={preferences.density}
            options={[
              { value: 'comfortable', label: 'Cómoda' },
              { value: 'compact', label: 'Compacta' },
            ]}
            onChange={(density) => {
              update('density', density);
            }}
          />
        </div>

        <div className={styles.row}>
          <Switch
            className={styles.switch}
            label="Ocultar cancelados por default"
            hint="Los movimientos cancelados siguen disponibles con el filtro."
            checked={preferences.hideCancelledByDefault}
            onChange={(checked) => {
              update('hideCancelledByDefault', checked);
            }}
          />
        </div>

        <div className={styles.row}>
          <Switch
            className={styles.switch}
            label="Ocultar planeados por default"
            hint="Útil cuando solo quieres ver lo que ya ocurrió."
            checked={preferences.hidePlannedByDefault}
            onChange={(checked) => {
              update('hidePlannedByDefault', checked);
            }}
          />
        </div>

        <div className={styles.row}>
          <Switch
            className={styles.switch}
            label="Mostrar clasificador temporal"
            hint="Etiqueta cada periodo como pasado, actual o futuro."
            checked={preferences.showTemporalClassifier}
            onChange={(checked) => {
              update('showTemporalClassifier', checked);
            }}
          />
        </div>

        <div className={styles.row}>
          <Switch
            className={styles.switch}
            label="Animaciones reducidas"
            hint={
              systemReducedMotion
                ? 'Tu sistema ya pide menos movimiento, así que se respeta aunque esté apagado aquí.'
                : 'Quita transiciones y animaciones no esenciales.'
            }
            checked={preferences.reducedMotion || systemReducedMotion}
            disabled={systemReducedMotion}
            onChange={(checked) => {
              update('reducedMotion', checked);
            }}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowText}>
            <span className={styles.rowLabel}>Formato numérico</span>
            <span className={styles.rowHint}>Pesos mexicanos, sin decimales redundantes.</span>
          </div>
          <span className={styles.readonly}>MXN</span>
        </div>
      </section>

      <section className={styles.card} aria-labelledby="admin-title">
        <h2 className={styles.cardTitle} id="admin-title">
          Administración
        </h2>

        <ul className={styles.links}>
          <li>
            <Link className={styles.link} to="/cuentas">
              Cuentas
              <ChevronRightIcon size={16} />
            </Link>
          </li>
          <li>
            <Link className={styles.link} to="/configuracion/categorias">
              Categorías
              <ChevronRightIcon size={16} />
            </Link>
          </li>
          <li>
            <Link className={styles.link} to="/configuracion/reglas">
              Reglas recurrentes
              <ChevronRightIcon size={16} />
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
