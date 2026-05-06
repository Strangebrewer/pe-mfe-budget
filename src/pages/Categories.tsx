import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ActionButton } from '@bka-stuff/pe-mfe-utils';
import { format, addMonths, subMonths } from 'date-fns';
import { useGetCategories } from '../hooks/categoryHooks';
import { useGetTransactions } from '../hooks/transactionHooks';
import { useBillMonthStore } from '../state/useBillMonth';
import { CategoryName, SHARED_CATEGORY_NAMES } from '../config';
import CategoryBlock from '../components/category/CategoryBlock';

const Categories: FC = () => {
  const { owner } = useParams<{ owner: string }>();
  const { month, year, setBillMonth } = useBillMonthStore();
  const { data: categories } = useGetCategories();

  const sharedCategoryIds = useMemo(() =>
    categories
      ?.filter((c: any) => SHARED_CATEGORY_NAMES.includes(c.name))
      .map((c: any) => c.id),
    [categories]
  );

  const { data: transactions } = useGetTransactions({
    category: sharedCategoryIds?.join(),
  });

  const transactionsByCategory = useMemo(() => {
    const result: Record<CategoryName, any[]> = { Food: [], Gas: [], Other: [] };
    if (!transactions || !categories) return result;
    for (const name of SHARED_CATEGORY_NAMES) {
      const catId = categories.find((c: any) => c.name === name)?.id;
      result[name] = transactions.filter(
        (t: any) => t.owner === owner && t.categoryId === catId
      );
    }
    return result;
  }, [transactions, categories, owner]);

  function getDisplayMonth(colIdx: number): string {
    const base = new Date(year, month - 1);
    const date = colIdx === 2 ? base : subMonths(base, 2 - colIdx);
    return format(date, 'MMMM');
  }

  function moveDisplayWindow(sub = false) {
    const base = new Date(year, month - 1);
    setBillMonth(sub ? subMonths(base, 1) : addMonths(base, 1));
  }

  const ownerLabel = owner === 'mine' ? 'Mine' : 'Hers';

  return (
    <div>
      <h2 className="tw:mb-4">Categories — {ownerLabel}</h2>
      <div className="tw:flex tw:items-center tw:gap-3 tw:mb-6">
        <ActionButton color="nCyan" onClick={() => moveDisplayWindow(true)} iconClass="fas fa-arrow-left" />
        <span className="tw:text-sm tw:font-medium tw:text-[#c4b5fd]">{getDisplayMonth(0)}</span>
        <span className="tw:text-sm tw:font-medium tw:mx-2 tw:text-[#c4b5fd]">·</span>
        <span className="tw:text-sm tw:font-medium tw:text-[#c4b5fd]">{getDisplayMonth(1)}</span>
        <span className="tw:text-sm tw:font-medium tw:mx-2 tw:text-[#c4b5fd]">·</span>
        <span className="tw:text-sm tw:font-medium tw:text-[#c4b5fd]">{getDisplayMonth(2)}</span>
        <ActionButton color="nCyan" onClick={() => moveDisplayWindow()} iconClass="fas fa-arrow-right" />
      </div>
      <div className="tw:flex tw:gap-8">
        {SHARED_CATEGORY_NAMES.map(name => {
          const cat = categories?.find((c: any) => c.name === name);
          return (
            <CategoryBlock
              key={name}
              categoryName={name}
              categoryId={cat?.id}
              owner={owner!}
              transactions={transactionsByCategory[name]}
              month={month}
              year={year}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
