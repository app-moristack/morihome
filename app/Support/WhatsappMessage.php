<?php

namespace App\Support;

final class WhatsappMessage
{
    public static function forService(?string $serviceName = null): string
    {
        return str_replace(
            [':app', ':service'],
            [config('app.name'), $serviceName ?? __('whatsapp.generic_service')],
            config('morihome.whatsapp.message_template'),
        );
    }
}
