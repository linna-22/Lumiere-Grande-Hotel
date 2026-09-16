import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  apiFetch,
  setToken,
  clearToken,
  getToken,
} from '../api/client'


export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  // ========================================
  // Get User From API Response
  // ========================================

  const extractUser = (response) => {
    if (response?.data) {
      return response.data
    }

    if (response?.user) {
      return response.user
    }

    return response
  }


  // ========================================
  // Check Existing Session
  // ========================================

  const checkSession = useCallback(async () => {
    const token = getToken()

    if (!token) {
      console.log('[Auth] No valid token found.')

      setUser(null)
      setLoading(false)

      return null
    }

    try {
      const response = await apiFetch('/user/me')

      const currentUser = extractUser(response)

      if (!currentUser) {
        throw new Error(
          'User information was not returned.'
        )
      }

      setUser(currentUser)

      return currentUser
    } catch (err) {
      console.error(
        '[Auth] Session check failed:',
        err
      )

      clearToken()
      setUser(null)

      return null
    } finally {
      setLoading(false)
    }
  }, [])


  // ========================================
  // Restore Session On App Start
  // ========================================

  useEffect(() => {
    checkSession()
  }, [checkSession])


  // ========================================
  // Login
  // ========================================

  const login = useCallback(
    async ({ email, password }) => {
      setError(null)

      const response = await apiFetch('/login', {
        method: 'POST',

        body: JSON.stringify({
          email,
          password,
        }),
      })

      /*
       * If 2FA is required, Laravel does not
       * return the final access token yet.
       */
      if (response.access_token) {
        setToken(response.access_token)

        const currentUser =
          response.user ??
          response.data ??
          null

        setUser(currentUser)
      }

      return response
    },
    [],
  )


  // ========================================
  // Register
  // ========================================

  const register = useCallback(
    async ({
      name,
      email,
      password,
      password_confirmation,
    }) => {
      setError(null)

      const response = await apiFetch('/register', {
        method: 'POST',

        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation,
        }),
      })

      if (response.access_token) {
        setToken(response.access_token)

        /*
         * If register returned the user,
         * use it directly.
         */
        const currentUser =
          response.user ??
          response.data ??
          null

        if (currentUser) {
          setUser(currentUser)

          return response
        }

        /*
         * Otherwise get the authenticated user.
         */
        const meResponse =
          await apiFetch('/user/me')

        setUser(
          extractUser(meResponse)
        )
      }

      return response
    },
    [],
  )


  // ========================================
  // Verify OTP
  // ========================================

  const verifyOtp = useCallback(
    async ({ email, otp_code }) => {
      setError(null)

      const response = await apiFetch(
        '/verify-otp',
        {
          method: 'POST',

          body: JSON.stringify({
            email,
            otp_code,
          }),
        }
      )

      /*
       * OTP verification should return
       * the final access token.
       */
      if (!response.access_token) {
        throw new Error(
          'OTP verified, but no access token was returned.'
        )
      }

      /*
       * Save the final authenticated token.
       */
      setToken(response.access_token)

      /*
       * IMPORTANT:
       *
       * Do NOT assume the OTP response contains
       * the complete user object.
       *
       * Fetch the authenticated admin from /user/me.
       */
      const meResponse =
        await apiFetch('/user/me')

      const currentUser =
        extractUser(meResponse)

      if (!currentUser) {
        clearToken()

        throw new Error(
          'Unable to retrieve authenticated user.'
        )
      }

      /*
       * Now React knows the user is authenticated.
       */
      setUser(currentUser)

      return {
        ...response,
        user: currentUser,
      }
    },
    [],
  )


  // ========================================
  // Logout
  // ========================================

  const logout = useCallback(
    async () => {
      try {
        await apiFetch('/logout', {
          method: 'POST',
        })
      } catch (err) {
        console.error(
          '[Auth] Logout request failed:',
          err
        )
      } finally {
        clearToken()
        setUser(null)
      }
    },
    [],
  )


  return {
    user,
    loading,
    error,

    login,
    register,
    verifyOtp,
    logout,
    checkSession,

    isAuthenticated: Boolean(user),
  }
}