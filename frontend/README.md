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
  App.jsx                        # entry point — renders the current page
                                  #   (swap in a router here later)
  pages/
    dashboard/
      Dashboard.jsx               # dashboard page: composes the components
                                   #   below into the full layout
  components/
    dashboard/
      Sidebar.jsx                  # left nav (Dashboard, Reservations, Rooms,
                                    #   Guests, Check it, Checkout, Payment,
                                    #   Invoice, Employee, Setting, Logout)
      TopBar.jsx                    # date/weather, search, New Reservation,
                                     #   user menu
      Hero.jsx                       # hotel banner with quick-action buttons
      StatsGrid.jsx                  # 8 metric cards
```

Everything dashboard-specific lives under a `dashboard` folder in both
`components/` and `pages/`, so the upcoming public-facing website and online
booking flow can sit alongside it as their own `components/site/` (or
similar) and `pages/site/` (or similar) folders without clashing — e.g.:

```
src/
  pages/
    dashboard/Dashboard.jsx
    site/Home.jsx            # (future) public homepage
    site/Booking.jsx         # (future) online booking flow
  components/
    dashboard/...
    site/...                 # (future) shared site components
```

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
