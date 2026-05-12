import { FC } from 'react';
import { toDisplayAmount } from '../../utils/billUtils';
import { OWNERS } from '../../config';

type TransferRowProps = {
  transfers: (number | null)[];
  isStale: boolean;
};

const TransferRow: FC<TransferRowProps> = ({ transfers, isStale }) => {
  function getDisplay(transfer: number | null): string {
    if (transfer === null) return '';
    return toDisplayAmount(Math.abs(transfer));
  }

  function getDirection(transfer: number | null): string {
    if (transfer === null || transfer === 0) return '';
    return transfer > 0
      ? `${OWNERS.mine} → ${OWNERS.hers}`
      : `${OWNERS.hers} → ${OWNERS.mine}`;
  }

  return (
    <div className="tw:w-[540px] tw:flex tw:bg-surface tw:text-primary">
      <div className="tw:w-[300px] tw:border tw:border-cellBorder tw:pl-[4px]">Transfer</div>
      {[0, 1, 2].map((colIndex) => (
        <div
          key={colIndex}
          className={`tw:w-[80px] tw:pr-[4px] tw:border tw:border-cellBorder tw:text-right${isStale ? ' tw:outline tw:outline-red' : ''}`}
        >
          <div>{getDisplay(transfers[colIndex])}</div>
          <div className="tw:text-xs tw:text-purple">
            {getDirection(transfers[colIndex])}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransferRow;
