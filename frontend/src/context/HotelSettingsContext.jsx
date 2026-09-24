import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const HotelSettingsContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api";

export function HotelSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    hotel_name: "",
    hotel_phone: "",
    hotel_email: "",
    hotel_address: "",
    hotel_logo_url: "",
    check_in_time: "14:00",
    check_out_time: "12:00",
    currency_code: "USD",
    tax_rate: "",
  });

  const [loading, setLoading] = useState(true);

  // ==========================================================
  // LOAD PUBLIC SETTINGS
  // ==========================================================

  const fetchHotelSettings = async () => {
    try {
      const response = await fetch(
        `${API_URL}/public-settings`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load hotel settings."
        );
      }

      setSettings((previous) => ({
        ...previous,
        ...(data.data || {}),
      }));
    } catch (error) {
      console.error(
        "Failed to load public hotel settings:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchHotelSettings();
  }, []);

  // ==========================================================
  // UPDATE SETTINGS LOCALLY
  // ==========================================================

  const updateHotelSettings = (newSettings) => {
    setSettings((previous) => ({
      ...previous,
      ...newSettings,
    }));
  };

  return (
    <HotelSettingsContext.Provider
      value={{
        settings,
        loading,
        fetchHotelSettings,
        updateHotelSettings,
      }}
    >
      {children}
    </HotelSettingsContext.Provider>
  );
}

export function useHotelSettings() {
  const context = useContext(
    HotelSettingsContext
  );

  if (!context) {
    throw new Error(
      "useHotelSettings must be used inside HotelSettingsProvider"
    );
  }

  return context;
}