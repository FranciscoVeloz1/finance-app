import { Button } from '../Button';
import { Dialog } from '../Dialog';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant={destructive ? 'destructive' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{description}</p>
    </Dialog>
  );
}
