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

        // 3. Hotel Capacity & Room Real-time Status Breakdown
        $totalRoomsCount = Rooms::count();
        $totalAvailableRooms = Rooms::where('status', '!=', 'maintenance')->count();
        $totalAvailableRoomNights = $totalAvailableRooms * $totalDays;

        $roomStatusCounts = Rooms::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $roomStatus = [
            'occupied'     => (int) ($roomStatusCounts['occupied'] ?? 0),
            'vacant_clean' => (int) ($roomStatusCounts['vacant_clean'] ?? 0),
            'vacant_dirty' => (int) ($roomStatusCounts['vacant_dirty'] ?? 0),
            'maintenance'  => (int) ($roomStatusCounts['maintenance'] ?? 0),
            'percentages'  => [
                'occupied'     => $totalRoomsCount > 0 ? round((($roomStatusCounts['occupied'] ?? 0) / $totalRoomsCount) * 100, 1) : 0,
                'vacant_clean' => $totalRoomsCount > 0 ? round((($roomStatusCounts['vacant_clean'] ?? 0) / $totalRoomsCount) * 100, 1) : 0,
                'vacant_dirty' => $totalRoomsCount > 0 ? round((($roomStatusCounts['vacant_dirty'] ?? 0) / $totalRoomsCount) * 100, 1) : 0,
                'maintenance'  => $totalRoomsCount > 0 ? round((($roomStatusCounts['maintenance'] ?? 0) / $totalRoomsCount) * 100, 1) : 0,
            ]
        ];

        // 4. Revenue Aggregation
        $completedPayments = Payments::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $totalRevenue = (float) (clone $completedPayments)->sum('amount');

        $paymentBreakdown = (clone $completedPayments)
            ->select('payment_method', DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->groupBy('payment_method')
            ->get();

        // 5. Rooms Sold Calculation (SQL DATEDIFF)
        $roomsSold = (int) DB::table('reservation_rooms')
            ->join('reservations', 'reservation_rooms.reservation_id', '=', 'reservations.id')
            ->where('reservations.status', '!=', 'cancelled')
            ->whereBetween('reservations.check_in_date', [
                $startDate->toDateString(),
                $endDate->toDateString()
            ])
            ->sum(DB::raw('DATEDIFF(reservations.check_out_date, reservations.check_in_date)'));

        // 6. Hospitality KPI Metrics
        $occupancyRate = $totalAvailableRoomNights > 0 
            ? ($roomsSold / $totalAvailableRoomNights) * 100 
            : 0;

        $adr    = $roomsSold > 0 ? ($totalRevenue / $roomsSold) : 0;
        $revPar = $totalAvailableRoomNights > 0 ? ($totalRevenue / $totalAvailableRoomNights) : 0;

        // 7. Daily Revenue Trends
        $dailyRevenue = Payments::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount) as revenue'))
            ->groupBy('date')
            ->pluck('revenue', 'date');

        $dailyTrends = [];
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            $formattedDate = $currentDate->toDateString();
            $dailyTrends[] = [
                'date'    => $formattedDate,
                'revenue' => round((float) ($dailyRevenue[$formattedDate] ?? 0), 2),
            ];
            $currentDate->addDay();
        }

        // 8. Dynamic JSON Response
        return response()->json([
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date'   => $endDate->toDateString(),
                'total_days' => $totalDays,
            ],
            'room_status' => $roomStatus,
            'financials'  => [
                'total_revenue'     => round($totalRevenue, 2),
                'payment_breakdown' => $paymentBreakdown,
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
    
    

