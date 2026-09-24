<?php

namespace App\Enums;

enum SubscriptionCategory: string
{
    case Services = 'services';
    case Rental = 'rental';
    case Sales = 'sales';

    public function label(): string
    {
        return __('subscription.category.'.$this->value);
    }
}
