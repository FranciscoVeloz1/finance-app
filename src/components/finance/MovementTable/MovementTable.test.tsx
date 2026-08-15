import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Movement } from '../../../types/finance';
import { MovementTable } from './index';

const MOVEMENTS: Movement[] = [
  {
    id: 'm1',
    date: '2026-01-05',
    concept: 'Renta',
    kind: 'expense',
    status: 'realized',
    amount: -8000,
    accountId: 'acc-debit',
    accountLabel: 'Débito',
    categoryId: 'services',
    categoryLabel: 'Servicios',
  },
  {
    id: 'm2',
    date: '2026-01-20',
    concept: 'Internet',
    kind: 'expense',
    status: 'planned',
    amount: -600,
    accountId: 'acc-debit',
    accountLabel: 'Débito',
    categoryId: 'services',
    categoryLabel: 'Servicios',
  },
  {
    id: 'm3',
    date: '2026-01-12',
    concept: 'Cine',
    kind: 'expense',
    status: 'cancelled',
    amount: -300,
    accountId: 'acc-cash',
    accountLabel: 'Efectivo',
    categoryId: 'outings',
    categoryLabel: 'Salidas',
  },
];

function renderTable(overrides: Partial<Parameters<typeof MovementTable>[0]> = {}) {
  return render(
    <MovementTable
      movements={MOVEMENTS}
      status="ready"
      density="comfortable"
      hidePlannedDefault={false}
      hideCancelledDefault={false}
      onRetry={vi.fn()}
      onAdd={vi.fn()}
      onEdit={vi.fn()}
      {...overrides}
    />,
  );
}

describe('MovementTable', () => {
  it('applies the stored visibility defaults on first render', () => {
    renderTable({ hidePlannedDefault: true, hideCancelledDefault: true });

    expect(screen.getByText('Renta')).toBeInTheDocument();
    expect(screen.queryByText('Internet')).not.toBeInTheDocument();
    expect(screen.queryByText('Cine')).not.toBeInTheDocument();
  });

  it('filters by account and reports the active filter as a chip', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole('button', { name: /filtros/i }));
    await user.selectOptions(screen.getByLabelText('Cuenta'), 'acc-cash');

    expect(screen.getByText('Cine')).toBeInTheDocument();
    expect(screen.queryByText('Renta')).not.toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveTextContent('Efectivo');
  });

  it('explains the empty result instead of looking broken', async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole('button', { name: /filtros/i }));
    await user.selectOptions(screen.getByLabelText('Estado'), 'planned');
    await user.selectOptions(screen.getByLabelText('Cuenta'), 'acc-cash');

    expect(screen.getByText('Ningún movimiento coincide')).toBeInTheDocument();
  });
});
