import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  CreditCard,
  DollarSign,
  Loader2,
  Percent,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import { apiFetch } from '../../api/client'


// =====================================================
// Helpers
// =====================================================

function formatMoney(value) {
  const number = Number(value || 0)

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number)
}


function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(
    Number(value || 0),
  )
}


function formatDate(date) {
  if (!date) return ''

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  )
}


function getCurrentMonthDates() {
  const now = new Date()

  const year = now.getFullYear()

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0')

  const lastDay = new Date(
    year,
    now.getMonth() + 1,
    0,
  ).getDate()

  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  }
}


function formatLabel(value) {
  if (!value) return 'Unknown'

  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    )
}


// =====================================================
// Stat Card
// =====================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#FFB21B]',
  iconBackground = 'bg-[#FFB21B]/10',
  valuePrefix = '',
}) {
  return (
    <div className="bg-[#0D192D] border border-[#1C2B43] rounded-xl p-5 hover:border-[#2A3B57] transition-colors">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm text-[#8EA0BA]">
            {title}
          </p>

          <div className="mt-3 flex items-baseline gap-1">

            {valuePrefix && (
              <span className="text-lg font-semibold text-[#8EA0BA]">
                {valuePrefix}
              </span>
            )}

            <p className="text-2xl font-bold tracking-tight text-white truncate">
              {value}
            </p>

          </div>

          {subtitle && (
            <p className="mt-2 text-xs text-[#64748B]">
              {subtitle}
            </p>
          )}

        </div>

        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBackground} ${iconColor}`}
        >
          <Icon size={20} />
        </div>

      </div>

    </div>
  )
}


// =====================================================
// Section Header
// =====================================================

function SectionHeader({
  title,
  subtitle,
}) {
  return (
    <div className="mb-5">

      <h2 className="text-base font-semibold text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="text-xs text-[#64748B] mt-1">
          {subtitle}
        </p>
      )}

    </div>
  )
}


// =====================================================
// Revenue / Expense Chart
// =====================================================

function RevenueChart({ data }) {
  const maxValue = useMemo(() => {
    if (!data?.length) return 1

    return Math.max(
      ...data.flatMap((item) => [
        Number(item.revenue || 0),
        Number(item.expense || 0),
      ]),
      1,
    )
  }, [data])


  if (!data?.length) {
    return (
      <div className="h-72 flex flex-col items-center justify-center">

        <Activity
          size={28}
          className="text-[#334155]"
        />

        <p className="mt-3 text-sm text-[#64748B]">
          No financial data available
        </p>

      </div>
    )
  }


  return (
    <div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-5">

        <div className="flex items-center gap-2 text-xs text-[#8EA0BA]">

          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB21B]" />

          Revenue

        </div>

        <div className="flex items-center gap-2 text-xs text-[#8EA0BA]">

          <span className="w-2.5 h-2.5 rounded-full bg-[#52627A]" />

          Expenses

        </div>

      </div>


      {/* Chart */}
      <div className="h-64 flex items-end gap-1 sm:gap-2 overflow-hidden">

        {data.map((item, index) => {

          const revenue =
            Number(item.revenue || 0)

          const expense =
            Number(item.expense || 0)

          const revenueHeight =
            (revenue / maxValue) * 100

          const expenseHeight =
            (expense / maxValue) * 100


          return (
            <div
              key={item.date || index}
              className="flex-1 min-w-[7px] h-full flex items-end justify-center gap-0.5 group relative"
            >

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">

                <div className="bg-[#071020] border border-[#2A3B57] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">

                  <p className="text-[10px] font-semibold text-white mb-1.5">
                    {formatDate(item.date)}
                  </p>

                  <p className="text-[10px] text-[#FFB21B]">
                    Revenue: ${formatMoney(revenue)}
                  </p>

                  <p className="text-[10px] text-[#8EA0BA]">
                    Expense: ${formatMoney(expense)}
                  </p>

                  <p className="text-[10px] text-[#20D39B]">
                    Profit: ${formatMoney(item.profit)}
                  </p>

                </div>

              </div>


              {/* Expense */}
              <div
                className="w-1/2 max-w-5 rounded-t-sm bg-[#52627A] transition-all duration-300 group-hover:bg-[#667890]"
                style={{
                  height: `${Math.max(
                    expenseHeight,
                    1,
                  )}%`,
                }}
              />


              {/* Revenue */}
              <div
                className="w-1/2 max-w-5 rounded-t-sm bg-[#FFB21B] transition-all duration-300 group-hover:bg-[#FFC54D]"
                style={{
                  height: `${Math.max(
                    revenueHeight,
                    1,
                  )}%`,
                }}
              />

            </div>
          )
        })}

      </div>


      {/* Chart X Axis */}
      <div className="flex justify-between mt-3 text-[10px] text-[#64748B]">

        <span>
          {formatDate(data[0]?.date)}
        </span>

        {data.length > 2 && (
          <span>
            {formatDate(
              data[
                Math.floor(
                  data.length / 2,
                )
              ]?.date,
            )}
          </span>
        )}

        <span>
          {formatDate(
            data[data.length - 1]?.date,
          )}
        </span>

      </div>

    </div>
  )
}


// =====================================================
// Breakdown Row
// =====================================================

function BreakdownRow({
  label,
  value,
  percentage,
  icon: Icon,
}) {
  return (
    <div className="py-3 border-b border-[#1C2B43] last:border-0">

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-3 min-w-0">

          <div className="w-8 h-8 rounded-lg bg-[#111F37] flex items-center justify-center text-[#8EA0BA] shrink-0">
            <Icon size={15} />
          </div>

          <span className="text-sm text-[#C4CEDC] truncate">
            {formatLabel(label)}
          </span>

        </div>


        <div className="text-right shrink-0">

          <p className="text-sm font-semibold text-white">
            ${formatMoney(value)}
          </p>

          {percentage !== undefined && (
            <p className="text-[10px] text-[#64748B]">
              {percentage.toFixed(1)}%
            </p>
          )}

        </div>

      </div>


      {percentage !== undefined && (
        <div className="mt-2 h-1.5 bg-[#17243A] rounded-full overflow-hidden">

          <div
            className="h-full bg-[#FFB21B] rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                percentage,
                100,
              )}%`,
            }}
          />

        </div>
      )}

    </div>
  )
}


// =====================================================
// Dashboard
// =====================================================

export default function Dashboard({
  onNavigate,
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(false)

  const [dateRange, setDateRange] =
    useState(
      getCurrentMonthDates(),
    )

  const [dashboard, setDashboard] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState(null)


  // ===================================================
  // Fetch Analytics
  // ===================================================

  const fetchDashboard = useCallback(
    async (showRefresh = false) => {
      try {

        if (showRefresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setError(null)


        const params =
          new URLSearchParams()


        if (dateRange.start) {
          params.append(
            'start_date',
            dateRange.start,
          )
        }


        if (dateRange.end) {
          params.append(
            'end_date',
            dateRange.end,
          )
        }


        const response =
          await apiFetch(
            `/analytics/monthly-revenue?${params.toString()}`,
          )


        setDashboard(response)

      } catch (err) {

        console.error(
          'Dashboard analytics error:',
          err,
        )

        setError(
          err?.message ||
            'Unable to load dashboard data.',
        )

      } finally {

        setLoading(false)
        setRefreshing(false)

      }
    },
    [dateRange],
  )


  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])


  // ===================================================
  // Data
  // ===================================================

  const financials =
    dashboard?.financials || {}

  const kpis =
    dashboard?.kpis || {}

  const dailyTrends =
    dashboard?.daily_trends || []

  const paymentBreakdown =
    financials.payment_breakdown || []

  const expenseBreakdown =
    financials.expense_breakdown || []


  // ===================================================
  // Financial Values
  // ===================================================

  const totalRevenue =
    Number(
      financials.total_revenue || 0,
    )

  const totalExpenses =
    Number(
      financials.total_expenses || 0,
    )

  const netProfit =
    Number(
      financials.net_profit || 0,
    )


  // ===================================================
  // Breakdown Totals
  // ===================================================

  const paymentTotal = useMemo(() => {
    return paymentBreakdown.reduce(
      (sum, item) =>
        sum + Number(item.total || 0),
      0,
    )
  }, [paymentBreakdown])


  const expenseTotal = useMemo(() => {
    return expenseBreakdown.reduce(
      (sum, item) =>
        sum + Number(item.total || 0),
      0,
    )
  }, [expenseBreakdown])


  // ===================================================
  // Period
  // ===================================================

  const periodLabel = useMemo(() => {

    if (!dashboard?.period) {
      return 'Current period'
    }

    const start =
      dashboard.period.start_date

    const end =
      dashboard.period.end_date


    if (start === end) {
      return formatDate(start)
    }


    return `${formatDate(start)} – ${formatDate(end)}`

  }, [dashboard])


  // ===================================================
  // Loading
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#091326] flex items-center justify-center">

        <div className="flex flex-col items-center gap-4">

          <Loader2
            size={32}
            className="animate-spin text-[#FFB21B]"
          />

          <p className="text-sm text-[#8EA0BA]">
            Loading dashboard...
          </p>

        </div>

      </div>
    )
  }


  // ===================================================
  // Dashboard UI
  // ===================================================

  return (
    <div className="flex min-h-screen bg-[#091326]">

      {/* ==============================================
          Sidebar
      ============================================== */}

      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        active="Dashboard"
        onNavigate={onNavigate}
      />


      <div className="flex-1 min-w-0">

        {/* ============================================
            Top Bar
        ============================================ */}

        <TopBar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
          onNavigate={onNavigate}
        />


        <main className="max-w-[1500px] mx-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

          {/* ==========================================
              Dashboard Header
          ========================================== */}

          <div className="mb-7">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              {/* Title */}

              <div>

                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#FFB21B] mb-2">

                  <Activity size={14} />

                  HOTEL OVERVIEW

                </div>


                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">

                  Dashboard

                </h1>


                <p className="mt-1 text-sm text-[#8EA0BA]">

                  Monitor your hotel's financial and
                  operational performance.

                </p>

              </div>


              {/* ======================================
                  Date Controls
              ====================================== */}

              <div className="flex flex-col sm:flex-row gap-2">

                <div className="flex items-center gap-2 bg-[#0D192D] border border-[#1C2B43] rounded-lg px-3">

                  <CalendarDays
                    size={16}
                    className="text-[#64748B] shrink-0"
                  />


                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange(
                        (prev) => ({
                          ...prev,
                          start:
                            e.target.value,
                        }),
                      )
                    }
                    className="bg-transparent py-2.5 text-sm text-[#C4CEDC] outline-none"
                  />


                  <span className="text-[#52627A]">
                    →
                  </span>


                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange(
                        (prev) => ({
                          ...prev,
                          end:
                            e.target.value,
                        }),
                      )
                    }
                    className="bg-transparent py-2.5 text-sm text-[#C4CEDC] outline-none"
                  />

                </div>


                <button
                  type="button"
                  onClick={() =>
                    fetchDashboard(true)
                  }
                  disabled={refreshing}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFB21B] hover:bg-[#E99D08] text-[#091326] text-sm font-semibold disabled:opacity-60 transition-colors"
                >

                  <RefreshCw
                    size={15}
                    className={
                      refreshing
                        ? 'animate-spin'
                        : ''
                    }
                  />

                  Refresh

                </button>

              </div>

            </div>

          </div>


          {/* ==========================================
              Error
          ========================================== */}

          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">

              <div className="flex items-center justify-between gap-4">

                <span>
                  {error}
                </span>


                <button
                  type="button"
                  onClick={() =>
                    fetchDashboard(true)
                  }
                  className="font-medium text-[#FFB21B] hover:underline"
                >
                  Retry
                </button>

              </div>

            </div>
          )}


          {/* ==========================================
              Reporting Period
          ========================================== */}

          <div className="mb-6 rounded-xl bg-[#0D192D] border border-[#1C2B43] px-5 py-4">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg bg-[#FFB21B]/10 flex items-center justify-center text-[#FFB21B]">

                  <CalendarDays size={19} />

                </div>


                <div>

                  <p className="text-[10px] uppercase tracking-wider text-[#64748B]">

                    Reporting Period

                  </p>

                  <p className="text-sm font-medium text-white mt-0.5">

                    {periodLabel}

                  </p>

                </div>

              </div>


              <div className="sm:text-right">

                <p className="text-[10px] uppercase tracking-wider text-[#64748B]">

                  Total Days

                </p>

                <p className="text-lg font-semibold text-white">

                  {dashboard?.period?.total_days || 0}

                </p>

              </div>

            </div>

          </div>


          {/* ==========================================
              Financial Stats
          ========================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

            <StatCard
              title="Total Revenue"
              value={formatMoney(
                totalRevenue,
              )}
              valuePrefix="$"
              subtitle="Completed payments"
              icon={DollarSign}
              iconColor="text-[#FFB21B]"
              iconBackground="bg-[#FFB21B]/10"
            />


            <StatCard
              title="Total Expenses"
              value={formatMoney(
                totalExpenses,
              )}
              valuePrefix="$"
              subtitle="Operations + payroll"
              icon={Wallet}
              iconColor="text-[#8EA0BA]"
              iconBackground="bg-[#52627A]/20"
            />


            <StatCard
              title="Net Profit"
              value={formatMoney(
                netProfit,
              )}
              valuePrefix="$"
              subtitle={
                netProfit >= 0
                  ? 'Positive operating result'
                  : 'Negative operating result'
              }
              icon={
                netProfit >= 0
                  ? TrendingUp
                  : TrendingDown
              }
              iconColor={
                netProfit >= 0
                  ? 'text-[#20D39B]'
                  : 'text-[#FF6B81]'
              }
              iconBackground={
                netProfit >= 0
                  ? 'bg-[#20D39B]/10'
                  : 'bg-[#FF6B81]/10'
              }
            />


            <StatCard
              title="Profit Margin"
              value={
                financials.profit_margin ||
                '0%'
              }
              subtitle="Net profit / revenue"
              icon={Percent}
              iconColor="text-[#36A8FF]"
              iconBackground="bg-[#36A8FF]/10"
            />

          </div>


          {/* ==========================================
              Hospitality KPIs
          ========================================== */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <StatCard
              title="Occupancy"
              value={
                kpis.occupancy_rate ||
                '0%'
              }
              subtitle="Room nights sold"
              icon={BedDouble}
              iconColor="text-[#B98CFF]"
              iconBackground="bg-[#B98CFF]/10"
            />


            <StatCard
              title="Rooms Sold"
              value={formatNumber(
                kpis.rooms_sold,
              )}
              subtitle="Room nights"
              icon={Activity}
              iconColor="text-[#36A8FF]"
              iconBackground="bg-[#36A8FF]/10"
            />


            <StatCard
              title="ADR"
              value={formatMoney(
                kpis.adr,
              )}
              valuePrefix="$"
              subtitle="Average daily rate"
              icon={DollarSign}
              iconColor="text-[#FFB21B]"
              iconBackground="bg-[#FFB21B]/10"
            />


            <StatCard
              title="RevPAR"
              value={formatMoney(
                kpis.rev_par,
              )}
              valuePrefix="$"
              subtitle="Revenue per available room"
              icon={TrendingUp}
              iconColor="text-[#20D39B]"
              iconBackground="bg-[#20D39B]/10"
            />

          </div>


          {/* ==========================================
              Main Analytics
          ========================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">


            {/* ========================================
                Revenue Chart
            ======================================== */}

            <div className="xl:col-span-2 bg-[#0D192D] border border-[#1C2B43] rounded-xl p-5">

              <SectionHeader
                title="Revenue vs Expenses"
                subtitle="Daily financial performance"
              />


              <RevenueChart
                data={dailyTrends}
              />

            </div>


            {/* ========================================
                Financial Summary
            ======================================== */}

            <div className="bg-[#0D192D] border border-[#1C2B43] rounded-xl p-5">

              <SectionHeader
                title="Financial Summary"
                subtitle="Current reporting period"
              />


              <div className="space-y-6">

                {/* Revenue */}

                <div>

                  <div className="flex items-center justify-between text-xs mb-2">

                    <span className="text-[#8EA0BA]">
                      Revenue
                    </span>

                    <span className="font-semibold text-white">
                      ${formatMoney(
                        totalRevenue,
                      )}
                    </span>

                  </div>


                  <div className="h-2 bg-[#17243A] rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#FFB21B] rounded-full"
                      style={{
                        width:
                          totalRevenue > 0
                            ? '100%'
                            : '0%',
                      }}
                    />

                  </div>

                </div>


                {/* Expenses */}

                <div>

                  <div className="flex items-center justify-between text-xs mb-2">

                    <span className="text-[#8EA0BA]">
                      Expenses
                    </span>

                    <span className="font-semibold text-white">
                      ${formatMoney(
                        totalExpenses,
                      )}
                    </span>

                  </div>


                  <div className="h-2 bg-[#17243A] rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#52627A] rounded-full"
                      style={{
                        width:
                          totalRevenue > 0
                            ? `${Math.min(
                                (totalExpenses /
                                  totalRevenue) *
                                  100,
                                100,
                              )}%`
                            : '0%',
                      }}
                    />

                  </div>

                </div>


                {/* Profit */}

                <div className="border-t border-[#1C2B43] pt-5">

                  <p className="text-xs text-[#64748B]">
                    Net Profit
                  </p>


                  <div className="flex items-center justify-between mt-2">

                    <p
                      className={`text-2xl font-bold ${
                        netProfit >= 0
                          ? 'text-[#20D39B]'
                          : 'text-[#FF6B81]'
                      }`}
                    >
                      ${formatMoney(
                        netProfit,
                      )}
                    </p>


                    {netProfit >= 0 ? (
                      <div className="w-9 h-9 rounded-lg bg-[#20D39B]/10 flex items-center justify-center">

                        <ArrowUpRight
                          size={19}
                          className="text-[#20D39B]"
                        />

                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-[#FF6B81]/10 flex items-center justify-center">

                        <ArrowDownRight
                          size={19}
                          className="text-[#FF6B81]"
                        />

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ==========================================
              Payment + Expense Breakdown
          ========================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">


            {/* ========================================
                Payment Methods
            ======================================== */}

            <div className="bg-[#0D192D] border border-[#1C2B43] rounded-xl p-5">

              <SectionHeader
                title="Payment Methods"
                subtitle="Revenue collected by payment method"
              />


              {paymentBreakdown.length === 0 ? (

                <div className="py-10 text-center">

                  <CreditCard
                    size={28}
                    className="mx-auto text-[#334155]"
                  />

                  <p className="mt-3 text-sm text-[#64748B]">
                    No payment data available.
                  </p>

                </div>

              ) : (

                <div>

                  {paymentBreakdown.map(
                    (item, index) => {

                      const value =
                        Number(
                          item.total || 0,
                        )

                      const percentage =
                        paymentTotal > 0
                          ? (value /
                              paymentTotal) *
                            100
                          : 0


                      return (
                        <BreakdownRow
                          key={
                            item.payment_method ||
                            index
                          }
                          label={
                            item.payment_method
                          }
                          value={value}
                          percentage={
                            percentage
                          }
                          icon={CreditCard}
                        />
                      )
                    },
                  )}

                </div>

              )}

            </div>


            {/* ========================================
                Expense Breakdown
            ======================================== */}

            <div className="bg-[#0D192D] border border-[#1C2B43] rounded-xl p-5">

              <SectionHeader
                title="Expense Breakdown"
                subtitle="Where your hotel expenses are going"
              />


              {expenseBreakdown.length === 0 ? (

                <div className="py-10 text-center">

                  <PieChart
                    size={28}
                    className="mx-auto text-[#334155]"
                  />

                  <p className="mt-3 text-sm text-[#64748B]">
                    No expense data available.
                  </p>

                </div>

              ) : (

                <div>

                  {expenseBreakdown.map(
                    (item, index) => {

                      const value =
                        Number(
                          item.total || 0,
                        )

                      const percentage =
                        expenseTotal > 0
                          ? (value /
                              expenseTotal) *
                            100
                          : 0


                      return (
                        <BreakdownRow
                          key={
                            item.category ||
                            index
                          }
                          label={
                            item.category
                          }
                          value={value}
                          percentage={
                            percentage
                          }
                          icon={Wallet}
                        />
                      )
                    },
                  )}

                </div>

              )}

            </div>

          </div>


          {/* ==========================================
              Room Performance
          ========================================== */}

          <div className="bg-[#0D192D] border border-[#1C2B43] rounded-xl p-5 mb-8">

            <SectionHeader
              title="Room Performance"
              subtitle="Availability and occupancy overview"
            />


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


              {/* Available Room Nights */}

              <div className="rounded-lg bg-[#111F37] border border-[#1C2B43] p-4">

                <div className="flex items-center gap-2 text-[#64748B] mb-3">

                  <BedDouble size={16} />

                  <span className="text-xs">
                    Available Room Nights
                  </span>

                </div>


                <p className="text-xl font-bold text-white">

                  {formatNumber(
                    kpis.total_available_room_nights,
                  )}

                </p>

              </div>


              {/* Rooms Sold */}

              <div className="rounded-lg bg-[#111F37] border border-[#1C2B43] p-4">

                <div className="flex items-center gap-2 text-[#64748B] mb-3">

                  <Activity size={16} />

                  <span className="text-xs">
                    Room Nights Sold
                  </span>

                </div>


                <p className="text-xl font-bold text-white">

                  {formatNumber(
                    kpis.rooms_sold,
                  )}

                </p>

              </div>


              {/* Occupancy */}

              <div className="rounded-lg bg-[#FFB21B]/10 border border-[#FFB21B]/20 p-4">

                <div className="flex items-center gap-2 text-[#FFB21B] mb-3">

                  <TrendingUp size={16} />

                  <span className="text-xs">
                    Occupancy Rate
                  </span>

                </div>


                <p className="text-xl font-bold text-white">

                  {kpis.occupancy_rate ||
                    '0%'}

                </p>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  )
}