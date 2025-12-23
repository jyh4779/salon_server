# Sales Dashboard & Schema Refactor

- [ ] Database Schema Update
    - [ ] Modify `backend/prisma/schema.prisma` to add `category_id` to `MENUS` and self-relation.
    - [ ] Run `prisma db push` and `generate`.
- [ ] Data Migration
    - [ ] Create and run script to map existing string `category` to `category_id`.
- [ ] Backend Implementation
    - [ ] Update `SalesService` to calculate New/Returning, Avg Ticket, NoShow.
    - [ ] Update `SalesService` to aggregate category stats using `category_id`.
- [ ] Frontend Implementation
    - [ ] Add `recharts` to `frontend/package.json`.
    - [ ] Update `SalesStats` interface in `frontend/src/api/sales.ts`.
    - [x] Implement `SalesPage` UI (Summary Cards, Pie Chart, Designer Columns).

- [ ] **Prepaid Ticket System (선불권)** <!-- id: 5 -->
    - [x] Schema Design & Migration (`PREPAID_TICKETS`, etc.) <!-- id: 6 -->
    - [x] Backend Implementation (`PrepaidModule`) <!-- id: 7 -->
    - [ ] Frontend Implementation (Settings, Payment) <!-- id: 8 -->
