<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Payments;
use App\Models\Reservation_rooms;
use App\Models\Rooms;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonthlyRevenueController extends Controller
{

  public function getMonthlyRevenue(Request $request)
    {
        // 1. Validate inputs
        $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date'   => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        // 2. Date Boundaries
        $startDate = $request->filled('start_date') 
            ? Carbon::parse($request->input('start_date'))->startOfDay() 
            : now()->startOfMonth();

        $endDate = $request->filled('end_date') 
            ? Carbon::parse($request->input('end_date'))->endOfDay() 
            : now()->endOfMonth();

        $totalDays = $startDate->diffInDays($endDate) + 1;

        // 3. Hotel Capacity
        $totalRooms = Rooms::where('status', '!=', 'maintenance')->count();
        $totalAvailableRoomNights = $totalRooms * $totalDays;

        // 4. Revenue Aggregation
        $completedPayments = Payments::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $totalRevenue = (float) (clone $completedPayments)->sum('amount');

        $paymentBreakdown = (clone $completedPayments)
            ->select('payment_method', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get();

        // 5. Operational Expenses
        $expensesQuery = Expense::whereBetween('expense_date', [
            $startDate->toDateString(), 
            $endDate->toDateString()
        ]);

        $operationalExpenses = (float) (clone $expensesQuery)->sum('amount');

        $expenseBreakdown = (clone $expensesQuery)
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get()
            ->toArray();

       
        // 6. Pro-rated Payroll Expenses
         $staffRoles = ['manager', 'receptionist', 'cashier', 'staff'];
        $monthlyPayroll = (float) Employee::where('status', 'active')
            ->whereHas('user', function ($query) use ($staffRoles) {
                $query->whereIn('role', $staffRoles);
            })
            ->sum('salary');
        $proRatedPayroll = ($monthlyPayroll / 30) * $totalDays;

        if ($proRatedPayroll > 0) {
            $expenseBreakdown[] = [
                'category' => 'salaries',
                'total'    => round($proRatedPayroll, 2),
            ];
        }

        $totalExpenses = $operationalExpenses + $proRatedPayroll;

        // 7. Net Profit Calculations
        $netProfit = $totalRevenue - $totalExpenses;
        $profitMargin = $totalRevenue > 0 ? ($netProfit / $totalRevenue) * 100 : 0;

        // 8. Rooms Sold (SQL DATEDIFF Join)
        $roomsSold = (int) DB::table('reservation_rooms')
            ->join('reservations', 'reservation_rooms.reservation_id', '=', 'reservations.id')
            ->where('reservations.status', '!=', 'cancelled')
            ->whereBetween('reservations.check_in_date', [
                $startDate->toDateString(),
                $endDate->toDateString()
            ])
            ->sum(DB::raw('DATEDIFF(reservations.check_out_date, reservations.check_in_date)'));

        // 9. Hospitality KPIs
        $occupancyRate = $totalAvailableRoomNights > 0 
            ? ($roomsSold / $totalAvailableRoomNights) * 100 
            : 0;

        $adr    = $roomsSold > 0 ? ($totalRevenue / $roomsSold) : 0;
        $revPar = $totalAvailableRoomNights > 0 ? ($totalRevenue / $totalAvailableRoomNights) : 0;

        // 10. Comparative Daily Trends
        $dailyRevenue = Payments::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount) as revenue'))
            ->groupBy('date')
            ->pluck('revenue', 'date');

        $dailyExpenses = Expense::whereBetween('expense_date', [
                $startDate->toDateString(),
                $endDate->toDateString()
            ])
            ->select('expense_date as date', DB::raw('SUM(amount) as expense'))
            ->groupBy('expense_date')
            ->pluck('expense', 'date');

        $dailyPayrollShare = $proRatedPayroll / max($totalDays, 1);

        $dailyTrends = [];
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            $formattedDate = $currentDate->toDateString();
            $dayRev = (float) ($dailyRevenue[$formattedDate] ?? 0);
            $dayExp = (float) ($dailyExpenses[$formattedDate] ?? 0) + $dailyPayrollShare;

            $dailyTrends[] = [
                'date'    => $formattedDate,
                'revenue' => round($dayRev, 2),
                'expense' => round($dayExp, 2),
                'profit'  => round($dayRev - $dayExp, 2),
            ];
            $currentDate->addDay();
        }

        return response()->json([
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date'   => $endDate->toDateString(),
                'total_days' => $totalDays,
            ],
            'financials' => [
                'total_revenue'     => round($totalRevenue, 2),
                'total_expenses'    => round($totalExpenses, 2),
                'net_profit'        => round($netProfit, 2),
                'profit_margin'     => round($profitMargin, 2) . '%',
                'payment_breakdown' => $paymentBreakdown,
                'expense_breakdown' => $expenseBreakdown,
            ],
            'kpis' => [
                'rooms_sold'                  => $roomsSold,
                'total_available_room_nights' => $totalAvailableRoomNights,
                'occupancy_rate'              => round($occupancyRate, 2) . '%',
                'adr'                         => round($adr, 2),
                'rev_par'                     => round($revPar, 2),
            ],
            'daily_trends' => $dailyTrends,
        ]);
    }
    }

