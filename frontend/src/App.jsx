import { useEffect, useState } from 'react'
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
import Guests from './pages/guests/Guests'
import AddGuest from './pages/guests/AddGuest'
import ViewGuest from './pages/guests/ViewGuest'
import Users from './pages/users/Users'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import ChangePassword from './pages/ChangePassword'
import AddUser from './pages/users/AddUser'
import ViewUser from './pages/users/ViewUser'
import EditUser from './pages/users/EditUser'
import { setToken } from './api/client'

const pages = {
  Dashboard,
  Reservations,
  RoomTypes,
  Rooms,
  Guests,
  'Guests Add': AddGuest,
  'Guests View': ViewGuest,
  Login,
  Register,
  VerifyOtp,
  'Check In': CheckIn,
  'Check Out': CheckOut,
  Housekeeping,
  Profile,
  EditProfile,
  ChangePassword,
  Users,
  'Users Add': AddUser,
  'Users View': ViewUser,
  'Users Edit': EditUser,
}

// Determine the initial page by checking for an OAuth callback in the URL.
// GitHub/Google redirect the full browser here as a real navigation, so this
// runs once, outside React state, before the first render decides what to show.
function resolveInitialPage() {
  if (window.location.pathname === '/auth/callback') {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      setToken(token)
      // Clean the token out of the visible URL so it isn't left in browser
      // history or accidentally shared/bookmarked.
      window.history.replaceState({}, '', '/')
      return 'Dashboard'
    }
  }
  return 'Login'
}

export default function App() {
  const [page, setPage] = useState(() => resolveInitialPage())
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