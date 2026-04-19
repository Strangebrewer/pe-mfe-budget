# pe-mfe-budget — Claude Context

## What This Is

The budget MFE. Tracks monthly bills, shared category spending (Food, Gas, Other), and income across two owners (Mine/Hers). The core purpose is calculating a monthly transfer amount so that the shared financial burden or surplus is split equally between the two owners.

---

## Domain Model

### Owners
Two fixed owners defined in `src/config.ts`:
- `mine` → display name "K"
- `hers` → display name "C"

The sidebar labels on Bills.tsx use "Mine" / "Hers" (capitalized), not the config names. The config names are used only in the transfer direction label (e.g. "K → C").

### Accounts
Checking, savings, and credit card accounts. Each has a `type` field: `"asset"` or `"debt"`. Accounts don't own bills, but bills can have a default source account ID.

### Categories
Three shared categories defined as a const in `src/config.ts`: `SHARED_CATEGORY_NAMES = ['Food', 'Gas', 'Other']`. These are the only categories relevant to Bills — do not hardcode these strings elsewhere, always import from config.

### Bills
Recurring monthly expenses owned by one of the two owners. Each bill has an `owner` field (`'mine'` | `'hers'`). Bills come back from the API with an embedded `transactions` array. Bill transactions have a `billMonth` field in `yyyy-mm` format.

### Transactions
Two kinds:
- **Bill transactions** — embedded in bill objects, use `billMonth` (`yyyy-mm`) for month matching
- **Category/income transactions** — fetched separately, use `date` (`yyyy-mm-dd`) for month matching; compare with `.substring(0, 7)` or use `sumByMonth` from `billUtils.ts`

**Pending refactor**: the two-format date situation is intentional for now but will be unified — all transactions should eventually carry only a month field, not a specific day. Flag any new code that relies on the `date` field being a full date.

Transactions have: `owner`, `categoryId` (optional), `amount` (stored in cents), `date` or `billMonth`.

### Income
Fetched as transactions with `income: true` query param. Have `owner` and `date` fields. Filtered via `sumByMonth`.

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

## Pages (Planned)

| Page | Route | Status |
|---|---|---|
| `Bills.tsx` | `/` (index) | Complete |
| `CategoryPage.tsx` | `/categories/:category/:owner` | Not started |
| `ExpensesPage.tsx` | `/expenses/:type` | Not started |
| `IncomePage.tsx` | `/income` | Not started |

**CategoryPage** — single component, 6 nav links pointing to it with different `category` + `owner` params (Food/Gas/Other × mine/hers). Shows a monthly total at the top, followed by a list of individual transactions.

**ExpensesPage** — reused for non-shared expenses and CC/direct debit payments (mine only). The `:type` param distinguishes them. Same layout as CategoryPage: monthly total at top, individual transactions below.

**IncomePage** — shows all income transactions for both owners together on one page.

---

## Component Structure

```
src/
  components/
    bills/              ← all components used by the Bills summary page
      BillRow.tsx
      BillRowHeader.tsx
      CategoryRow.tsx
      IncomeRow.tsx
      OwnerSection.tsx
      TotalRow.tsx
      TransferRow.tsx
    transactions/
      TransactionRow.tsx  ← scaffolded; will be shared by CategoryPage and ExpensesPage
  pages/
    Bills.tsx
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

### Keyboard navigation in BillRow
Tab is browser-native. Enter uses a shared `cellRefs` array in `Bills.tsx` indexed by `[rowIndex][colIndex]`. `OwnerSection` receives a `rowOffset` prop so "hers" and "mine" rows don't collide in the shared ref array. "Hers" offset is always 0; "mine" offset is `hersBills.length`.

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

- `CategoryPage`, `ExpensesPage`, `IncomePage` — not started
- `TransactionRow` — scaffolded, not implemented
- The `Accounts` and `Transactions` stubs in `App.tsx` are not part of the plan — ignore them
- Pub/Sub, tracing — not wired in this MFE yet
