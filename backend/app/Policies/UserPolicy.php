<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */

    private function getRoleRank(string $role): int
    {
        return match ($role) {
            'super_admin', 'owner' => 3,
            'admin'                => 2,
            'receptionist'         => 1,
            default                => 0, // 'staff' or basic users
        };
    }

    public function create(User $currentUser): bool
    {
        $myRank = $this->getRoleRank($currentUser->role);

        // Only Admins (Rank 2) and Super Admins (Rank 3) can create accounts
        // Receptionists/Staff (Rank 1/0) are denied immediately
        if ($myRank < 2) {
            return false;
        }

        // If 'role' is provided in request input, check role privilege
        $targetRole = request()->input('role', 'receptionist');
        $targetRank = $this->getRoleRank($targetRole);

        // Super Admins (Rank 3) can create any role
        if ($myRank === 3) {
            return true;
        }

        // Admins can ONLY create roles strictly below them (Rank 2 > Rank 1)
        // An Admin CANNOT create another Admin or a Super Admin
        return $myRank > $targetRank;
    }

    public function update(User $currentUser, User $targetUser): bool
    {
        // 1. Allow users to update their OWN profile details (name, email, password)
        if ($currentUser->id === $targetUser->id) {
            return true;
        }

        $myRank     = $this->getRoleRank($currentUser->role);
        $targetRank = $this->getRoleRank($targetUser->role);

        // 2. Super Admins / Owners can update anyone's profile
        if ($myRank === 3) {
            return true;
        }

        // 3. Higher rank can update lower rank (e.g., Admin updating a Receptionist)
        // An Admin CANNOT update a Super Admin or another Admin.
        return $myRank > $targetRank;
    }

    public function delete(User $currentUser, User $targetUser): bool
{
    // 1. CRITICAL: Prevent users from deleting themselves
    if ($currentUser->id === $targetUser->id) {
        return false;
    }

    $myRank     = $this->getRoleRank($currentUser->role);
    $targetRank = $this->getRoleRank($targetUser->role);

    // 2. You can ONLY delete users strictly BELOW your rank
    // (Prevents Super Admin from deleting another Super Admin, 
    // and Admin from deleting another Admin)
    return $myRank > $targetRank;
}

    public function viewAny(User $currentUser): bool
    {
        // Only staff with management roles (Rank >= 2: Manager, Admin, Owner, Super Admin)
        // or Receptionists (Rank 1) should be able to view user lists.
        return $this->getRoleRank($currentUser->role) >= 1;
    }

    public function view(User $currentUser, User $targetUser): bool
    {
        // Rule 1: Any user can ALWAYS view their own profile account
        if ($currentUser->id === $targetUser->id) {
            return true;
        }

        // Rule 2: Admins and higher can view anyone's profile
        return $this->getRoleRank($currentUser->role) >= 2;
    }

    // public function viewAny(User $user): bool
    // {
    //     //
    // }

    /**
     * Determine whether the user can view the model.
     */
    // public function view(User $user, User $model): bool
    // {
    //     //
    // }

    /**
     * Determine whether the user can create models.
     */
    // public function create(User $user): bool
    // {
    //     //
    // }

    /**
     * Determine whether the user can update the model.
     */
    // public function update(User $user, User $model): bool
    // {
    //     //
    // }

    /**
     * Determine whether the user can delete the model.
     */
    // public function delete(User $user, User $model): bool
    // {
    //     //
    // }

    /**
     * Determine whether the user can restore the model.
     */
    // public function restore(User $user, User $model): bool
    // {
    //     //
    // }

    /**
     * Determine whether the user can permanently delete the model.
     */
    // public function forceDelete(User $user, User $model): bool
    // {
    //     //
    // }
}
