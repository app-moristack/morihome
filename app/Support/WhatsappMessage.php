<?php

namespace App\Support;

use App\Models\PlatformSetting;

final class WhatsappMessage
{
    public static function forService(?string $serviceName = null): string
    {
        $settings = PlatformSetting::current();

        return str_replace(
            [':app', ':service'],
            [$settings['app_name'], $serviceName ?? __('whatsapp.generic_service')],
            $settings['whatsapp_message_template'],
        );
    }
}
