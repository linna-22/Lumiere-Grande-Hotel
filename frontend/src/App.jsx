import { useEffect, useState } from 'react'

import Dashboard from './pages/dashboard/Dashboard'
import Reservations from './pages/reservations/Reservations'
import Rooms from './pages/rooms/Rooms'
import RoomTypes from './pages/roomtypes/roomtypes'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import ForgotPassword from './pages/auth/ForgotPassword'

import CheckIn from './pages/checkin/CheckIn'
import CheckOut from './pages/checkout/CheckOut'

import Guests from './pages/guests/Guests'
import AddGuest from './pages/guests/AddGuest'
import ViewGuest from './pages/guests/ViewGuest'

import Users from './pages/users/Users'
import AddUser from './pages/users/AddUser'
import ViewUser from './pages/users/ViewUser'
import EditUser from './pages/users/EditUser'

import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import ChangePassword from './pages/ChangePassword'

import AddReservation from './pages/reservations/AddReservation'
import BookingSuccess from './pages/booking/BookingSuccess'
import Invoices from './pages/invoices/Invoices'
import Housekeeping from './pages/housekeeping/Housekeeping'

import { setToken } from './api/client'
import { useAuth } from './hooks/useAuth'

const pages = {
  Dashboard,

  Reservations,
  'Reservations Add': AddReservation,
  Invoices,

  RoomTypes,
  Rooms,

  Guests,
  'Guests Add': AddGuest,
  'Guests View': ViewGuest,

  Login,
  Register,
  VerifyOtp,
  ForgotPassword,

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

  'Booking Success': BookingSuccess,
}

/**
 * Pages that can be opened WITHOUT being logged in.
 */
const PUBLIC_PAGES = ['Login', 'Register', 'VerifyOtp', 'ForgotPassword']

/**
 * Check for OAuth callback.
 *
 * Google/GitHub redirect back to:
 *
 * /auth/callback?token=
 */
function resolveOAuthCallback() {
  if (window.location.pathname !== '/auth/callback') {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (!token) {
    return false
  }

  setToken(token)

  /**
   * Remove token from the visible browser URL.
   */
  window.history.replaceState({}, '', '/')

  return true
}

export default function App() {
  /**
   * useAuth() is called ONLY here, once. Every page gets
   * this same `auth` object via props instead of calling
   * useAuth() itself — that keeps a single shared user state
   * across the whole app.
   */
  const auth = useAuth()
  const { user, loading } = auth

  const [page, setPage] = useState('Login')
  const [navigationData, setNavigationData] = useState({})

  /**
   * Handle OAuth callback.
   */
  useEffect(() => {
    resolveOAuthCallback()
  }, [])

  /**
   * Decide which page to display after authentication
   * has finished loading.
   */
  useEffect(() => {
    if (loading) {
      return
    }

    if (user) {
      /**
       * Only automatically redirect to Dashboard when
       * the application is currently on a public auth page.
       */
      setPage((currentPage) => {
        if (PUBLIC_PAGES.includes(currentPage)) {
          return 'Dashboard'
        }

        return currentPage
      })
    } else {
      /**
       * No valid session.
       * Keep the user on a public page (e.g. ForgotPassword)
       * instead of forcing them back to Login.
       */
      setPage((currentPage) =>
        PUBLIC_PAGES.includes(currentPage) ? currentPage : 'Login'
      )
    }
  }, [user, loading])

  /**
   * Navigation between pages.
   */
  const handleNavigate = (label, data = {}) => {
    if (pages[label]) {
      setPage(label)
      setNavigationData(data)
    }
  }

  /**
   * Don't render Login/Dashboard before we know whether
   * an existing token is valid.
   *
   * This prevents the "refresh -> Login" problem.
   */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: '#0d192d',
          color: '#1f2942',
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{
              borderColor: '#b08a4a',
              borderTopColor: 'transparent',
            }}
          />

          <p className="text-sm" style={{ color: '#7b8190' }}>
            Checking your session...
          </p>
        </div>
      </div>
    )
  }

  /**
   * Never allow protected pages to render without
   * an authenticated user.
   */
  if (!user && !PUBLIC_PAGES.includes(page)) {
    return <Login auth={auth} onNavigate={handleNavigate} />
  }

  const Page = pages[page] || Login

  return (
    <Page
      auth={auth}
      onNavigate={handleNavigate}
      {...navigationData}
    />
  )
}