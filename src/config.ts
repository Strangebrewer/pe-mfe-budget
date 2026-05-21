export const OWNERS = {
  mine: 'Me',
  theirs: 'Them',
};

export const SHARED_CATEGORY_NAMES = ['Food', 'Gas', 'Other'] as const;
export type CategoryName = typeof SHARED_CATEGORY_NAMES[number];
