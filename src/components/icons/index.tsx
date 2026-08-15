import type { SVGProps } from 'react';
import type { AccountType } from '../../types/finance';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Icons are decorative by default: every call site pairs them with a text label,
 * so exposing them to the accessibility tree would only add noise.
 */
function Icon({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 18 9 12l6-6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Icon>
  );
}

export function LedgerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </Icon>
  );
}

export function TransferIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" />
    </Icon>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4 2.6 20h18.8Z" />
      <path d="M12 10v4M12 17.2v.1" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.8v.1" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 6.3A9 9 0 0 1 12 6.2c5 0 9 5.8 9 5.8a16 16 0 0 1-3.1 3.6M6.5 8A16 16 0 0 0 3 12s4 5.8 9 5.8a8.7 8.7 0 0 0 3.4-.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </Icon>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5h18l-7 8v6l-4 2v-8Z" />
    </Icon>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8 6 12l4 4M6 12h9" />
    </Icon>
  );
}

export function WalletIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 13.5h2" />
    </Icon>
  );
}

export function CashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.1M18 12h.1" />
    </Icon>
  );
}

export function CreditCardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 10h19M6 15h4" />
    </Icon>
  );
}

export function PiggyBankIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12a6 6 0 0 1 6-6h3a6 6 0 0 1 5.7 4.1l1.8.9v3.5l-2 .5A6 6 0 0 1 16 18v2h-3v-1.4h-2V20H8v-2.4A6 6 0 0 1 4 12Z" />
      <path d="M15.5 11.5h.1M8.5 6.2 7 3.6" />
    </Icon>
  );
}

export function BankIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 9.5 12 4l9 5.5" />
      <path d="M5 10v8M10 10v8M14 10v8M19 10v8M3 20h18" />
    </Icon>
  );
}

const ACCOUNT_ICONS: Record<AccountType, (props: IconProps) => React.ReactElement> = {
  debit: BankIcon,
  cash: CashIcon,
  credit: CreditCardIcon,
  'savings-fund': PiggyBankIcon,
  other: WalletIcon,
};

/** One icon per account type, defined once and reused across every screen. */
export function AccountTypeIcon({ type, ...props }: IconProps & { type: AccountType }) {
  const Resolved = ACCOUNT_ICONS[type];
  return <Resolved {...props} />;
}
