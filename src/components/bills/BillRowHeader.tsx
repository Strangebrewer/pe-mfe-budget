import { useBillMonthStore } from '../../state/useBillMonth';
import { format, subMonths } from 'date-fns';

const BillRowHeader = () => {
  const { month, year } = useBillMonthStore();

  function getDisplayMonth(ago?: 1 | 2) {
    const base = new Date(year, month - 1);
    const date = ago ? subMonths(base, ago) : base;
    return format(date, 'MMM');
  }

  return (
    <div className="tw:w-[542px] tw:ml-[48px] tw:flex tw:bg-surface tw:text-primary tw:py-[2px]">
      <div className="tw:w-[300px] tw:pl-[4px] tw:text-muted">Name</div>
      <div className="tw:w-[80px] tw:text-center tw:text-muted">
        {getDisplayMonth(2)}
      </div>
      <div className="tw:w-[80px] tw:text-center tw:text-muted">
        {getDisplayMonth(1)}
      </div>
      <div className="tw:w-[80px] tw:text-center tw:text-muted">
        {getDisplayMonth()}
      </div>
    </div>
  );
};

export default BillRowHeader;
