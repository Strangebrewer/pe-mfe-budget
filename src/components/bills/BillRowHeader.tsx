import { ActionButton } from "@bka-stuff/pe-mfe-utils";
import { useBillMonthStore } from "../../state/useBillMonth";
import { format, subMonths, addMonths } from 'date-fns';
import { useTransferStaleStore } from "../../state/useTransferStale";

const BillRowHeader = () => {
  const { month, year, setBillMonth } = useBillMonthStore();
  const { markTransferStale } = useTransferStaleStore();

  function getDisplayMonth(ago?: 1 | 2) {
    const base = new Date(year, month - 1);
    const date = ago ? subMonths(base, ago) : base;
    return format(date, 'MMM');
  }

  function moveDisplayWindow(sub: boolean = false) {
    const currentDisplayDate = new Date(year, month - 1);
    let newDate = addMonths(currentDisplayDate, 1);
    if (sub) newDate = subMonths(currentDisplayDate, 1);
    setBillMonth(newDate);
    markTransferStale();
  }

  return (
    <div className="tw:w-[850px] tw:flex">
      <div className="tw:w-[300px] tw:pl-[4px]">Name</div>

      <div className="tw:w-[80px] tw:text-center tw:relative">
        <span className="tw:absolute tw:left-0">
          <ActionButton color="blue" onClick={() => moveDisplayWindow(true)} iconClass="fas fa-arrow-left" />
        </span>
        {getDisplayMonth(2)}
      </div>

      <div className="tw:w-[80px] tw:text-center">{getDisplayMonth(1)}</div>

      <div className="tw:w-[80px] tw:text-center tw:relative">
        {getDisplayMonth()}
        <span className="tw:absolute tw:right-0">
          <ActionButton color="blue" onClick={() => moveDisplayWindow()} iconClass="fas fa-arrow-right" />
        </span>
      </div>
    </div>
  );
};

export default BillRowHeader;
