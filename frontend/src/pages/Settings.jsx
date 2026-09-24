import { useState } from "react";

import {
  Settings as SettingsIcon,
  Building2,
  DatabaseBackup,
} from "lucide-react";

import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";

import HotelInfo from "../components/settings/HotelInfo";
import Backup from "../components/settings/Backup";

// ============================================================
// TABS
// ============================================================

const tabs = [
  {
    id: "hotel-info",
    label: "Hotel Info",
    icon: Building2,
  },
  {
    id: "backup",
    label: "Backup",
    icon: DatabaseBackup,
  },
];

// ============================================================
// SETTINGS PAGE
// ============================================================

export default function Settings({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeTab, setActiveTab] =
    useState("hotel-info");

  return (
    <div className="flex bg-base-850 min-h-screen">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        active="Settings"
        onNavigate={onNavigate}
      />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="flex-1 min-w-0">

        {/* TOP BAR */}

        <TopBar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          onNavigate={onNavigate}
        />

        <main className="p-4 sm:p-6 max-w-[1600px] mx-auto">

          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div className="mb-6">
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center">
                <SettingsIcon
                  size={21}
                  className="text-amber-400"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif tracking-tight">
                  Settings
                </h1>

                <p className="text-sm text-slate-400 mt-1">
                  Configure your hotel system preferences
                </p>
              </div>

            </div>
          </div>

          {/* =================================================
              TABS
          ================================================== */}

          <div className="bg-base-850 border border-base-border rounded-xl p-1.5 mb-6">
            <div className="flex flex-wrap gap-1">

              {tabs.map((tab) => {
                const Icon = tab.icon;

                const isActive =
                  activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`
                      flex items-center gap-2
                      px-5 py-2.5
                      rounded-lg
                      text-sm font-medium
                      transition-colors

                      ${
                        isActive
                          ? "bg-amber-400 text-base-950"
                          : "text-slate-400 hover:bg-base-800 hover:text-slate-200"
                      }
                    `}
                  >
                    <Icon size={16} />

                    {tab.label}
                  </button>
                );
              })}

            </div>
          </div>

          {/* =================================================
              TAB CONTENT
          ================================================== */}

          {activeTab === "hotel-info" && (
            <HotelInfo />
          )}

          {activeTab === "backup" && (
            <Backup />
          )}

        </main>
      </div>
    </div>
  );
}