<?php

namespace App\Enums;

enum SubscriptionCategory: string
{
    case Services = 'services';
    case Rental = 'rental';
    case Sales = 'sales';

    public function label(): string
    {
        return match ($this) {
            self::Services => 'Services',
            self::Rental => 'Property Rental',
            self::Sales => 'Property Sale',
        };
    }
}
