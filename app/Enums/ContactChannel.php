<?php

namespace App\Enums;

enum ContactChannel: string
{
    case Whatsapp = 'whatsapp';
    case Phone = 'phone';
    case Email = 'email';
    case Website = 'website';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
