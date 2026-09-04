import { useState } from 'react'
import Dashboard from './pages/dashboard/Dashboard'
import Reservations from './pages/reservations/Reservations'
import Rooms from './pages/rooms/Rooms'
import RoomTypes from './pages/roomtypes/roomtypes'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import CheckIn from './pages/checkin/CheckIn'
import CheckOut from './pages/checkout/CheckOut'
import Housekeeping from './pages/housekeeping/Housekeeping'

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
  'Check In': CheckIn,
  'Check Out': CheckOut,
  Housekeeping,
}

export default function App() {
  const [page, setPage] = useState('Login')
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