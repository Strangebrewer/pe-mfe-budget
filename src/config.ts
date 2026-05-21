export const OWNERS = {
  mine: 'Me',
  hers: 'Her',
};

export const SHARED_CATEGORY_NAMES = ['Food', 'Gas', 'Other'] as const;
export type CategoryName = typeof SHARED_CATEGORY_NAMES[number];
