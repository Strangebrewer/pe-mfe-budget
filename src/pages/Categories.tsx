import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useGetCategories } from '../hooks/categoryHooks';
import { useGetTransactions } from '../hooks/transactionHooks';
import { useBillMonthStore } from '../state/useBillMonth';
import { CategoryName, SHARED_CATEGORY_NAMES } from '../config';
import CategoryBlock from '../components/category/CategoryBlock';
import MonthNav from '../components/MonthNav';

const Categories: FC = () => {
  const { owner } = useParams<{ owner: string }>();
  const { month, year } = useBillMonthStore();
  const { data: categories } = useGetCategories();

  const sharedCategoryIds = useMemo(
    () =>
      categories
        ?.filter((c: any) => SHARED_CATEGORY_NAMES.includes(c.name))
        .map((c: any) => c.id),
    [categories],
  );

  const { data: transactions } = useGetTransactions({
    category: sharedCategoryIds?.join(),
  });

  const transactionsByCategory = useMemo(() => {
    const result: Record<CategoryName, any[]> = {
      Food: [],
      Gas: [],
      Other: [],
    };
    if (!transactions || !categories) return result;
    for (const name of SHARED_CATEGORY_NAMES) {
      const catId = categories.find((c: any) => c.name === name)?.id;
      result[name] = transactions.filter(
        (t: any) => t.owner === owner && t.categoryId === catId,
      );
    }
    return result;
  }, [transactions, categories, owner]);

  const ownerLabel = owner === 'mine' ? 'Mine' : 'Theirs';

  return (
    <div className="tw:pb-8">
      <h2 className="tw:my-4 tw:text-3xl tw:font-bold tw:text-center">
        Categories — {ownerLabel}
      </h2>
      <MonthNav />
      <div className="tw:flex tw:justify-center tw:gap-8">
        {SHARED_CATEGORY_NAMES.map((name) => {
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
