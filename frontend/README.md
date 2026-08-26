# Hotel Dasmariñas — Management Dashboard

React + Vite + Tailwind CSS recreation of the dashboard screen.

## Setup

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Structure

```
src/
  App.jsx                        # lightweight page switcher (Dashboard /
                                  #   Reservations / Rooms) — swap for a real
                                  #   router later
  pages/
    dashboard/Dashboard.jsx       # dashboard page
    reservations/Reservations.jsx # reservations page
    rooms/Rooms.jsx                # rooms page
  components/
    layout/
      Sidebar.jsx                  # shared grouped nav (Main / Operations /
                                    #   Amenities), badges, collapse toggle
      TopBar.jsx                    # shared header: date/weather, search,
                                     #   New Reservation, notifications, user
    dashboard/
      Hero.jsx                       # hotel banner with quick-action buttons
      StatsGrid.jsx                  # 8 metric cards
    reservations/
      PageHeader.jsx                  # title + Export/Print/New Reservation
      StatsCards.jsx                  # 5 summary cards
      FilterTabs.jsx                   # All/Active/Checked In/Out/Cancelled
      ReservationsTable.jsx             # searchable, filterable table
      reservationsData.js                # sample reservation records
    rooms/
      PageHeader.jsx                  # title + Export/Print/view toggle/Add
      StatsCards.jsx                  # 6 summary cards
      FilterTabs.jsx                   # All/Available/Occupied/... filters
      RoomCard.jsx                     # single room card (grid view)
      RoomsGrid.jsx                     # grid of RoomCards
      RoomsList.jsx                      # compact table (list view)
      roomsData.js                        # sample room records
```

`Sidebar` and `TopBar` are shared across every page under `components/layout/`.
Each feature area (dashboard, reservations, rooms) gets its own folder under
both `components/` and `pages/`, so the upcoming public-facing website and
online booking flow can be added the same way — e.g. `components/site/` and
`pages/site/` — without touching the admin pages.

### Navigating between pages

`App.jsx` currently swaps pages by label via the sidebar's `onNavigate`
callback (no routing library yet). Clicking "Dashboard", "Reservations", or
"Rooms" in the sidebar switches the page; other sidebar items are placeholders
until their pages are built. Swap this for `react-router-dom` whenever you're
ready for real URLs.

## Responsive behavior

- **Sidebar** becomes a slide-in drawer below the `lg` breakpoint, toggled by
  the hamburger icon in the top bar; it stays permanently visible/static on
  large screens.
- **Top bar** collapses the date/weather into a smaller row under the header
  on small screens, and the search field turns into a tap-to-open search bar
  on phones (`sm` and below). The "New Reservation" button shrinks to an
  icon-only button on phones.
- **Hero** banner stacks the title block above the action buttons on
  small/medium screens (`lg:flex-row` on larger screens) and the badge row
  wraps instead of overflowing.
- **Stats grid** goes 1 column on phones, 2 columns on small tablets, and 4
  columns from `lg` (1024px) up.

## Notes

- Icons: `lucide-react`
- Font: Plus Jakarta Sans (loaded from Google Fonts in `index.html`)
- Colors/spacing are tuned in `tailwind.config.js` under the `base` and `amber`
  palette — tweak there to adjust the theme globally.
- The hero background photo and avatar are placeholder stock/Pravatar images —
  swap the `src` in `Hero.jsx` / `TopBar.jsx` for your own real assets.
- Only the Dashboard page is built; sidebar links are static placeholders
  (`href="#"`) ready to be wired up to routes (e.g. React Router) for the
  other pages.
