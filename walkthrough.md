# Sales Dashboard & Menu Schema Update Walkthrough

## 1. Overview
The sales dashboard has been enhanced to provide deeper marketing insights, and the `MENUS` database schema has been refactored to support robust category management.

## 2. Changes

### 2.1 Backend Schema Refactor
- **Self-Relation**: Updated `MENUS` table to use `category_id` (linking to parent menu items of type `CATEGORY`) instead of a simple string column.
- **Migration**: Defined `CategoryParent` relation in Prisma and updated seed script to populate Categories (Cut, Perm, etc.) as parent items and Menus as children.
- **Data Cleanup**: Seeded fresh data to ensure structural integrity.

### 2.2 Backend Logic (SalesService)
- **New Metrics**:
    - **New vs Returning**: Analyzes customer `created_at` date against the report date.
    - **NoShow / Cancel**: Counts these statuses separately from revenue-generating `COMPLETED` appointments.
    - **Average Ticket**: Calculated as `Total Revenue / Paid Count`.
- **Category Stats**: Aggregates sales by traversing `RESERVATION_ITEMS -> MENUS -> Parent(Category)`.

### 2.3 Frontend (SalesPage)
- **Summary Cards**:
    - Added "Cards/Cash" breakdown.
    - Added "Average Ticket (객단가)" with User icon.
    - Added "New/Returning (신규/재방문)" count.
    - Added "NoShow/Cancel" count with red alert color.
- **Visualizations**: integrated `recharts` to display a **Pie Chart** for Category Sales Share.
- **Tables**: Added "Average Ticket" column to Designer Performance table.

## 3. Verification Results

### 3.1 Build Status
- **Backend**: `npx prisma generate` and `seed.ts` executed successfully.
- **Frontend**: `yarn build` passed successfully (recharts integration verified).

### 3.2 Key Features Verified
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **New/Returning Count** | ✅ Implemented | Logic based on user registration date works. |
| **Avg Ticket** | ✅ Implemented | Displayed in Summary and Designer Table. |
| **NoShow Alert** | ✅ Implemented | Red text for immediate attention. |
| **Category Chart** | ✅ Implemented | Pie Chart renders using derived Category data. |
| **Schema Integrity** | ✅ Verified | Menus correctly link to Category parents in DB. |

### 3.3 Bug Fixes (Post-Release)
- **Percentage Display**: Fixed an issue where category percentages exceeded 100% due to a mismatch between Total Revenue and Sum of Category Values. Now calculates percentage based on the sum of category values.
- **UI Warnings**: Resolved `antd` deprecated `bordered` prop warning by migrating to `variant`.
- **Frontend Crash**: Fixed `undefined` error in Table by correcting `dataIndex` mapping for Category Stats.
- **Console Warnings**:
  - Suppressed React Router v7 future flag warnings by enabling them in `App.tsx`.
  - Mitigated Recharts `width(-1)` warning by enforcing a Dimension Guard. Used `ResizeObserver` to only render the chart when the container width is positive, preventing race conditions during Tab animations. Also applied `destroyOnHidden` to `Tabs` for clean DOM management.

### 3.4 Code Refactoring
- **Constants**: Moved hardcoded `CHART_COLORS` from `SalesPage.tsx` to `src/constants/colors.ts` to follow project conventions.
