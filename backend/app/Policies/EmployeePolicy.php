<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    public function getRoleRank(?string $role): int
    {
        return match (strtolower((string) $role)) {
            'super_admin', 'owner' => 3,
            'admin', 'manager' => 2,
            'receptionist' => 1,
            default => 0,
        };
    }

    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'owner', 'admin', 'manager'], true);
    }

    public function view(User $user, Employee $employee): bool
    {
        if (in_array($user->role, ['super_admin', 'owner'], true)) {
            return true;
        }

        if ($user->id === $employee->user_id) {
            return true;
        }

        $targetRole = $employee->user?->role ?? 'staff';

        return $this->viewAny($user) 
            && $this->getRoleRank($user->role) >= $this->getRoleRank($targetRole);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['super_admin', 'owner', 'admin'], true);
    }

    public function update(User $user, Employee $employee): bool
    {
        if (in_array($user->role, ['super_admin', 'owner'], true)) {
            return true;
        }

        // Prevent users from updating their own record via management endpoints to avoid self-privilege escalation
        if ($user->id === $employee->user_id) {
            return false;
        }

        $currentUserRank = $this->getRoleRank($user->role);
        $targetUserRole = $employee->user?->role ?? 'staff';
        $targetUserRank = $this->getRoleRank($targetUserRole);

        return $currentUserRank > $targetUserRank;
    }

    public function delete(User $user, Employee $targetEmployee): bool
    {
        if ($user->id === $targetEmployee->user_id) {
            return false; // Prevent self-deletion
        }

        if (in_array($user->role, ['super_admin', 'owner'], true)) {
            return true;
        }

        $currentUserRank = $this->getRoleRank($user->role);
        $targetUserRole = $targetEmployee->user?->role ?? 'staff';
        $targetUserRank = $this->getRoleRank($targetUserRole);

        return $currentUserRank > $targetUserRank;
    }
}