<?php

namespace App\Enums;

enum ProviderType: string
{
    case Individual = 'individual';
    case Agency = 'agency';
    case Business = 'business';

    public function label(): string
    {
        return __('provider.type.'.$this->value);
    }

    public function hasOpeningHours(): bool
    {
        return $this !== self::Individual;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
