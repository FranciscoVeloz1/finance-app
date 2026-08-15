import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { BudgetGroupId, Category } from '../../types/finance';
import { classNames } from '../../utils/classNames';
import { BUDGET_GROUP_LABEL } from '../../utils/labels';
import { useToast } from '../../hooks/useToast';
import { PlainBadge } from '../../components/finance/StatusBadge';
import { EmptyState } from '../../components/feedback/EmptyState';
import { Button } from '../../components/forms/Button';
import { ConfirmDialog } from '../../components/forms/ConfirmDialog';
import { Dialog } from '../../components/forms/Dialog';
import { Field } from '../../components/forms/Field';
import { RowMenu } from '../../components/forms/RowMenu';
import { PageHeader } from '../../components/layout/PageHeader';
import { ChevronLeftIcon, PlusIcon } from '../../components/icons';
import { PLACEHOLDER_CATEGORIES } from '../../data/placeholder';
import styles from './CategoriesPage.module.css';

const GROUPS = Object.entries(BUDGET_GROUP_LABEL).map(([id, label]) => {
  return { id: id as BudgetGroupId, label };
});

export function CategoriesPage() {
  const { notify } = useToast();
  const [categories, setCategories] = useState<Category[]>(PLACEHOLDER_CATEGORIES);
  const [groupFilter, setGroupFilter] = useState<BudgetGroupId | 'all'>('all');
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftGroup, setDraftGroup] = useState<BudgetGroupId>('extras');
  const [pending, setPending] = useState<Category | null>(null);

  const visibleGroups = groupFilter === 'all' ? GROUPS : GROUPS.filter((group) => {
    return group.id === groupFilter;
  });

  const inactive = categories.filter((category) => {
    return !category.active;
  });

  const openForm = (category: Category | null) => {
    setEditing(category);
    setDraftLabel(category?.label ?? '');
    setDraftGroup(category?.group ?? 'extras');
    setFormOpen(true);
  };

  const renderRow = (category: Category) => {
    return (
      <li
        key={category.id}
        className={classNames(styles.row, !category.active && styles.inactiveRow)}
      >
        <div className={styles.text}>
          <span className={styles.label}>
            {category.label}
            {category.custom ? <PlainBadge tone="custom">Personalizada</PlainBadge> : null}
            {category.active ? null : <PlainBadge tone="muted">Inactiva</PlainBadge>}
          </span>
          <span className={styles.meta}>
            {GROUPS.find((group) => {
              return group.id === category.group;
            })?.label ?? category.group}
            {category.usageCount === undefined ? '' : ` · ${String(category.usageCount)} usos`}
          </span>
        </div>

        <RowMenu
          label={category.label}
          actions={[
            {
              id: 'edit',
              label: 'Editar',
              onSelect: () => {
                openForm(category);
              },
            },
            ...(category.active
              ? [
                  {
                    id: 'deactivate',
                    label: 'Desactivar',
                    onSelect: () => {
                      setPending(category);
                    },
                  },
                ]
              : []),
          ]}
        />
      </li>
    );
  };

  return (
    <div className={styles.page}>
      <PageHeader
        breadcrumb={
          <Link className={styles.back} to="/configuracion">
            <ChevronLeftIcon size={16} />
            Configuración
          </Link>
        }
        title="Categorías"
        description="Agrupan tus movimientos dentro de cada presupuesto."
        actions={
          <Button
            icon={<PlusIcon size={16} />}
            onClick={() => {
              openForm(null);
            }}
          >
            Agregar categoría
          </Button>
        }
      />

      <div className={styles.filter}>
        <label className={styles.filterLabel} htmlFor="group-filter">
          Grupo
        </label>
        <select
          className="control"
          id="group-filter"
          value={groupFilter}
          onChange={(event) => {
            setGroupFilter(event.target.value as BudgetGroupId | 'all');
          }}
        >
          <option value="all">Todos</option>
          {GROUPS.map((group) => {
            return (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            );
          })}
        </select>
      </div>

      {visibleGroups.map((group) => {
        const groupCategories = categories.filter((category) => {
          return category.group === group.id && category.active;
        });

        return (
          <section key={group.id} className={styles.group} aria-labelledby={`group-${group.id}`}>
            <h2 className={styles.groupTitle} id={`group-${group.id}`}>
              {group.label}
            </h2>

            {groupCategories.length === 0 ? (
              <EmptyState
                compact
                title={`Sin categorías en ${group.label}`}
                description="Agrega una para clasificar los movimientos de este grupo."
                action={
                  <Button
                    variant="secondary"
                    icon={<PlusIcon size={16} />}
                    onClick={() => {
                      openForm(null);
                    }}
                  >
                    Agregar categoría
                  </Button>
                }
              />
            ) : (
              <ul className={styles.list}>{groupCategories.map(renderRow)}</ul>
            )}
          </section>
        );
      })}

      {inactive.length === 0 ? null : (
        <details className={styles.inactiveSection}>
          <summary className={styles.summary}>Categorías inactivas ({inactive.length})</summary>
          <ul className={styles.list}>{inactive.map(renderRow)}</ul>
        </details>
      )}

      <Dialog
        open={formOpen}
        title={editing === null ? 'Agregar categoría' : `Editar ${editing.label}`}
        onClose={() => {
          setFormOpen(false);
        }}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setFormOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" form="category-form">
              Guardar
            </Button>
          </>
        }
      >
        <form
          id="category-form"
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();

            if (draftLabel.trim() === '') {
              return;
            }

            setCategories((current) => {
              if (editing === null) {
                return [
                  ...current,
                  {
                    id: `cat-${String(Date.now())}`,
                    label: draftLabel,
                    group: draftGroup,
                    custom: true,
                    active: true,
                  },
                ];
              }

              return current.map((category) => {
                return category.id === editing.id
                  ? { ...category, label: draftLabel, group: draftGroup }
                  : category;
              });
            });

            setFormOpen(false);
            notify('success', editing === null ? 'Categoría agregada.' : 'Categoría actualizada.');
          }}
        >
          <Field label="Nombre" required>
            {({ id }) => {
              return (
                <input
                  className="control"
                  id={id}
                  value={draftLabel}
                  onChange={(event) => {
                    setDraftLabel(event.target.value);
                  }}
                />
              );
            }}
          </Field>

          <Field label="Grupo padre" required>
            {({ id }) => {
              return (
                <select
                  className="control"
                  id={id}
                  value={draftGroup}
                  onChange={(event) => {
                    setDraftGroup(event.target.value as BudgetGroupId);
                  }}
                >
                  {GROUPS.map((group) => {
                    return (
                      <option key={group.id} value={group.id}>
                        {group.label}
                      </option>
                    );
                  })}
                </select>
              );
            }}
          </Field>
        </form>
      </Dialog>

      <ConfirmDialog
        open={pending !== null}
        title="Desactivar categoría"
        description="Dejará de aparecer al crear movimientos nuevos, pero los periodos que ya la usan la seguirán mostrando con su etiqueta histórica."
        confirmLabel="Desactivar"
        onClose={() => {
          setPending(null);
        }}
        onConfirm={() => {
          const target = pending;
          setPending(null);

          if (target === null) {
            return;
          }

          setCategories((current) => {
            return current.map((category) => {
              return category.id === target.id ? { ...category, active: false } : category;
            });
          });

          notify('success', 'Categoría desactivada.');
        }}
      />
    </div>
  );
}
