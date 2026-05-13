import { FC } from 'react';
import { ActionButton } from '@bka-stuff/pe-mfe-utils';
import { format, addMonths, subMonths } from 'date-fns';
import { useBillMonthStore } from '../state/useBillMonth';

type Props = {
  onNavigate?: () => void;
};

const MonthNav: FC<Props> = ({ onNavigate }) => {
  const { month, year, setBillMonth } = useBillMonthStore();

  function getDisplayMonth(colIdx: number): string {
    const base = new Date(year, month - 1);
    const date = colIdx === 2 ? base : subMonths(base, 2 - colIdx);
    return format(date, 'MMMM');
  }

  function moveDisplayWindow(sub = false) {
    const base = new Date(year, month - 1);
    setBillMonth(sub ? subMonths(base, 1) : addMonths(base, 1));
    onNavigate?.();
  }

  return (
    <div className="tw:flex tw:items-center tw:justify-center tw:gap-3 tw:mb-6">
      <ActionButton color="blue" onClick={() => moveDisplayWindow(true)} iconClass="fas fa-arrow-left" />
      <span className="tw:text-sm tw:font-medium tw:text-muted">{getDisplayMonth(0)}</span>
      <span className="tw:text-sm tw:font-medium tw:mx-2 tw:text-muted">·</span>
      <span className="tw:text-sm tw:font-medium tw:text-muted">{getDisplayMonth(1)}</span>
      <span className="tw:text-sm tw:font-medium tw:mx-2 tw:text-muted">·</span>
      <span className="tw:text-sm tw:font-medium tw:text-muted">{getDisplayMonth(2)}</span>
      <ActionButton color="blue" onClick={() => moveDisplayWindow()} iconClass="fas fa-arrow-right" />
    </div>
  );
};

export default MonthNav;
