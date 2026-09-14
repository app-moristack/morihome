<?php

namespace App\Enums;

enum SubscriptionTier: string
{
    case Free = 'free';
    case Plus = 'plus';
    case Pro = 'pro';

    public function label(): string
    {
        return match ($this) {
            self::Free => 'Free',
            self::Plus => 'Plus',
            self::Pro => 'Pro',
        };
    }
}
