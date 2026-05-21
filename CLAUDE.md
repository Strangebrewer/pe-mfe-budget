# pe-mfe-budget — Claude Context

## What This Is

The budget MFE. Tracks monthly bills, shared category spending (Food, Gas, Other), and income across two owners (Mine/Hers). The core purpose is calculating a monthly transfer amount so that the shared financial burden or surplus is split equally between the two owners.

---

## Domain Model

### Owners
Two fixed owners defined in `src/config.ts`:
- `mine` → display name "Me"
- `hers` → display name "Her"

The sidebar labels on Bills.tsx use "Mine" / "Hers" (capitalized), not the config names. The config names are used in the transfer direction label (e.g. "Me → Her") and the toggle in NewTransactionWidget.

### Accounts
Checking, savings, and credit card accounts. Each has a `type` field: `"asset"` or `"debt"`. Accounts don't own bills, but bills can have a default source account ID.

### Categories
Three shared categories defined as a const in `src/config.ts`: `SHARED_CATEGORY_NAMES = ['Food', 'Gas', 'Other']`. These are the only categories relevant to Bills — do not hardcode these strings elsewhere, always import from config.

### Bills
Recurring monthly expenses owned by one of the two owners. Each bill has an `owner` field (`'mine'` | `'hers'`). Bills come back from the API with an embedded `transactions` array.

### Transactions
All transactions use a `month` field (`yyyy-mm`) for filtering. Bill transactions and category transactions both expose `t.month` from the API. Income transactions are created with a `billMonth` field which the backend maps to `month` in responses — filter by `t.month` consistently.

Transactions have: `owner`, `categoryId` (optional), `amount` (stored in cents), `month` (`yyyy-mm`), `description` (optional, used by category transactions).

### Income
Fetched as transactions with `income: true` query param. Created with `{ owner, billMonth, amount, income: true, type: 'credit' }`. Filter and display using `t.month` (same as all other transactions). Displayed in `IncomeBlock` on the Bills page — one grid showing both owners across 3 month columns.

---

## Transfer Calculation

The core feature. Calculates how much one owner transfers to the other each month so the net burden or surplus is shared equally.

**Formula:**
```
mineNet = mineIncome - (mineBills + mineCategories)
hersNet = hersIncome - (hersBills + hersCategories)
combined = mineNet + hersNet
transfer = mineNet - combined / 2
```

- Positive transfer → Mine pays Hers
- Negative transfer → Hers pays Mine

Implemented in `calculateTransfer()` in `src/utils/billUtils.ts`. Called per column (per month) in `handleCalculateTransfer` in `Bills.tsx`. **Not reactive** — triggered by a button. Uses `useTransferStaleStore` (Zustand) to track whether a recalc is needed: any mutation to bills or transactions marks it stale; the button click clears it.

`isTransferStale` is initialized to `true` so the indicator shows on first load before the user has ever calculated.

---

## Pages

| Page | Route | Status |
|---|---|---|
| `Bills.tsx` | `/` (index) | Complete |
| `Categories.tsx` | `/categories/:owner` | Complete |
| `ExpensesPage.tsx` | `/expenses/:type` | Not started |
| `IncomePage.tsx` | `/income` | Not started |

**Categories** — one page per owner (`/categories/mine`, `/categories/hers`). Shows all three shared categories (Food, Gas, Other) side by side as `CategoryBlock` components. Shared 3-month navigator at the top using `useBillMonthStore` (same window as Bills). Each block has three month columns; each column is split into a fixed description sub-column (~2×) and a fixed amount sub-column. Running total pinned at the top of each amount column. Rows are dynamic (no fixed height); inline entry works like a spreadsheet. Bills page CategoryRow totals update automatically via React Query cache invalidation.

**ExpensesPage** — reused for non-shared expenses and CC/direct debit payments (mine only). The `:type` param distinguishes them. Same layout as CategoryPage: monthly total at top, individual transactions below.

**IncomePage** — superseded by `IncomeBlock` on the Bills page. No longer planned as a standalone page.

---

## Component Structure

```
src/
  components/
    Modal.tsx               ← reusable overlay modal (fixed inset, scrollable body)
    bills/              ← all components used by the Bills summary page
      AddBillModal.tsx      ← create bill form modal; fetches accounts + categories for selects
      BillRow.tsx
      BillRowHeader.tsx
      CategoryRow.tsx
      IncomeAmountCell.tsx  ← single editable income cell; handles create/update/delete + keyboard nav
      IncomeBlock.tsx       ← income grid: label col + 3 month cols, Hers and Mine sections
      IncomeRow.tsx
      OwnerSection.tsx
      TotalRow.tsx
      TransferRow.tsx
    category/           ← all components used by the Categories page
      CategoryBlock.tsx       ← one per category (Food/Gas/Other); owns descRefs[colIdx][rowIdx] for all 3 columns; renders 3 CategoryMonthColumns
      CategoryMonthColumn.tsx ← one month column; receives ref registration + nav callbacks from CategoryBlock
      CategoryTransactionRow.tsx ← single editable row; handles create/update/delete inline
    transactions/
      TransactionRow.tsx  ← scaffolded; will be shared by ExpensesPage
  pages/
    Bills.tsx
    Categories.tsx
  hooks/
    billHooks.ts
    transactionHooks.ts
    categoryHooks.ts
    accountHooks.ts
  state/
    useBillMonth.ts       ← Zustand; tracks the 3-column display window (current + 2 prior months)
    useTransferStale.ts   ← Zustand; tracks whether transfer needs recalc
  utils/
    billUtils.ts          ← getBillMonthForColumn, sumByMonth, toDisplayAmount, toStoredAmount, calculateTransfer
    axios.ts              ← axiosAuth (API_URL), axiosPublic (AUTH_URL for refresh)
  api/
    baseApi.ts            ← BaseApi class; all domain APIs extend it
  config.ts               ← OWNERS, SHARED_CATEGORY_NAMES, CategoryName type
```

---

## Key Patterns

### Column layout
Bills page shows 3 months: colIndex 0 = 2 months ago, 1 = 1 month ago, 2 = current. `getBillMonthForColumn(month, year, colIndex)` returns a `yyyy-mm` string. The display window is navigated via BillRowHeader arrows, which update `useBillMonthStore` and mark the transfer stale.

### Amount storage
All amounts stored in cents (integers). `toDisplayAmount` converts to display string (`/100`, `.toFixed(2)`). `toStoredAmount` converts back.

### Spreadsheet-style keyboard navigation
All editable grids implement arrow-key navigation that skips read-only cells. The general pattern: a parent component owns a 2D ref array indexed by `[rowIndex][colIndex]`; child components receive directional callbacks (`onUp/onDown/onLeft/onRight`); a `wasKeyHandled` ref on each cell prevents the blur handler from double-saving after a key-nav event. Navigation silently no-ops at edges via optional chaining.

### Keyboard navigation in BillRow
`Bills.tsx` owns `cellRefs[rowIndex][colIndex]`. `OwnerSection` receives `onUp/onDown/onLeft/onRight` and passes them to each `BillRow`. Enter and ArrowDown both save and advance to the next row. ArrowLeft/Right wrap to the previous/next row at the column edges. `wasKeyHandled` guards the blur handler. "Hers" offset is always 0; "mine" offset is `hersBills.length`.

### Keyboard navigation in CategoryBlock / CategoryMonthColumn
`CategoryBlock` owns `descRefs[colIdx][rowIdx]` for all three month columns (lifted from `CategoryMonthColumn`). It passes `registerDescRef`, `focusDesc`, `onUp`, `onLeft`, `onRight` into each `CategoryMonthColumn`, which threads them through to `CategoryTransactionRow`. Cross-column Left/Right navigation always targets the desc input of the adjacent column at the same row index. At the edges (first/last column), optional chaining produces a no-op.

### CategoryTransactionRow inline entry rules
**Desc input:**
- Enter / ArrowRight → focus amount (same row)
- ArrowDown → next row's desc (via `onEnterAmount`)
- ArrowUp → prev row's desc (via `onUp`)
- ArrowLeft → prev column's desc (via `onLeft`)
- Any arrow when desc has content but amount is empty → redirect to amount regardless of direction

**Amount input:**
- Enter / ArrowDown → `commit(true)` + advance (red flash + refocus if desc filled but amount empty)
- ArrowUp → `commit(false)` + prev row's desc
- ArrowLeft → `commit(false)` + same row's desc
- ArrowRight → `commit(false)` + next column's desc
- Blur (no prior key nav) → `commit(false)`
- `wasEnterFired` ref prevents double-save when key nav triggers blur
- `isNavigatingAway` ref suppresses the `requestAnimationFrame` refocus on new-row create when navigating away

### Keyboard navigation in IncomeBlock
`IncomeBlock` owns two separate ref grids: `hersRefs[rowIdx][colIdx]` and `mineRefs[rowIdx][colIdx]`. `IncomeAmountCell` (single input) uses a `wasKeyHandled` ref and calls `onUp/onDown/onLeft/onRight` after committing. Tab (prevented) acts as ArrowRight. Cross-section boundary navigation is wired via `renderRows` boundary callbacks: Down at the last Hers row → Mine row 0 same column; Up at Mine row 0 → last Hers row same column; Right at last Hers cell → Mine row 0 col 0; Left at first Mine cell → last Hers row col 2.

### IncomeBlock layout
Grid with a fixed label column (80px) and 3 month amount columns (100px each):
- Month label row (read-only)
- Her Total row (read-only, sum of Hers income per month)
- My Total row (read-only, sum of Mine income per month)
- Hers section: colored sidebar label spanning full section height + editable amount rows
- Mine section: same structure

Row count per section = `Math.max(0, ...transactionCounts) + 1` (the +1 is the always-present empty new row). Transactions sorted by `id` ascending so new entries append to the bottom.

### Categories data fetch
`Categories.tsx` fetches all transactions for shared category IDs **without** a month filter, then filters client-side per column using `getBillMonthForColumn` + `t.month`. New category transactions are created with `month: billMonth`. The shared-category query on the Bills page (which includes `month: billMonth`) is a separate cache entry; both are invalidated by any transaction mutation, so Bills CategoryRow totals stay current.

### Stale transfer indicator
`TransferRow` takes `isStale: boolean` and applies a red outline to the cells when true. Any successful mutation (bill or transaction create/update/delete) calls `markTransferStale()` from `useTransferStaleStore`. Navigation between months also marks stale.

### Query keys
`useGetTransactions` includes the full `query` object in the TanStack Query key so different param combinations cache independently. The `enabled` flag gates fetches that depend on `category` param — the query won't fire until `sharedCategoryIds` is defined (i.e., until categories have loaded).

### env vars
- `API_URL` → go-budget base URL (default: `http://localhost:8082`)
- `AUTH_URL` → go-auth base URL for token refresh (default: `http://localhost:8080`)

### Tailwind
Uses the `tw:` prefix (`tw:flex`, `tw:text-sm`, etc.) — required by the MFE Tailwind config.

### pe-mfe-utils
`@bka-stuff/pe-mfe-utils` is installed via `github:` URL (public tarball). Never use `pnpm link` or workspace overrides — it breaks CI.

---

## What's Not Here Yet

- `ExpensesPage` — not started
- `TransactionRow` — scaffolded, not implemented
- The `Accounts` and `Transactions` stubs in `App.tsx` are not part of the plan — ignore them
- Pub/Sub, tracing — not wired in this MFE yet
