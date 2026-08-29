import { useState } from 'react'
import Dashboard from './pages/dashboard/Dashboard'
import Reservations from './pages/reservations/Reservations'
import Rooms from './pages/rooms/Rooms'
import RoomTypes from './pages/roomtypes/roomtypes'

// Lightweight page switcher for now — swap this for React Router once the
// public-facing website / online booking pages are added alongside the
// dashboard. Sidebar items without a page yet are no-ops.
const pages = {
  Dashboard,
  Reservations,
  RoomTypes,
  Rooms,
}

export default function App() {
  const [page, setPage] = useState('Dashboard')
  const Page = pages[page] || Dashboard

  const handleNavigate = (label) => {
    if (pages[label]) setPage(label)
  }

  return <Page onNavigate={handleNavigate} />
}
