export const OWNERS = {
  mine: 'K',
  hers: 'C',
};

export const SHARED_CATEGORY_NAMES = ['Food', 'Gas', 'Other'] as const;
export type CategoryName = typeof SHARED_CATEGORY_NAMES[number];
