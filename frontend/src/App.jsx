import { useState } from 'react'
import Dashboard from './pages/dashboard/Dashboard'
import Reservations from './pages/reservations/Reservations'
import Rooms from './pages/rooms/Rooms'
import RoomTypes from './pages/roomtypes/roomtypes'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'

// Lightweight page switcher for now — swap this for React Router once the
// public-facing website / online booking pages are added alongside the
// dashboard. Sidebar items without a page yet are no-ops.
const pages = {
  Dashboard,
  Reservations,
  RoomTypes,
  Rooms,
  Login,
  Register,
  VerifyOtp,
}

export default function App() {
  const [page, setPage] = useState('VerifyOtp')
  const [navigationData, setNavigationData] = useState({})
  const Page = pages[page] || Login

  const handleNavigate = (label, data = {}) => {
    if (pages[label]) {
      setPage(label)
      setNavigationData(data)
    }
  }

  return <Page onNavigate={handleNavigate} {...navigationData} />
}