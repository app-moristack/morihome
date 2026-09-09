<?php

namespace App\Policies;

use App\Models\Provider;
use App\Models\User;

class ProviderPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return false;
    }

    public function view(User $user, Provider $provider): bool
    {
        return $this->owns($user, $provider);
    }

    public function update(User $user, Provider $provider): bool
    {
        return $this->owns($user, $provider);
    }

    public function submitForReview(User $user, Provider $provider): bool
    {
        return $this->owns($user, $provider) && $provider->approval_status->canSubmitForReview();
    }

    public function managePortfolio(User $user, Provider $provider): bool
    {
        return $this->owns($user, $provider);
    }

    public function moderate(User $user, Provider $provider): bool
    {
        return false;
    }

    public function delete(User $user, Provider $provider): bool
    {
        return $this->owns($user, $provider);
    }

    private function owns(User $user, Provider $provider): bool
    {
        return $user->id === $provider->user_id;
    }
}
