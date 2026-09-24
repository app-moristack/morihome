<?php

namespace App\Support;

use App\Models\PlatformSetting;

final class WhatsappMessage
{
    public static function forService(?string $serviceName = null): string
    {
        $settings = PlatformSetting::current();
        $template = $settings['whatsapp_message_template'];

        if ($template === 'Hello, I found your profile on :app. I am looking for help with :service.') {
            $template = __('whatsapp.template');
        }

        return str_replace(
            [':app', ':service'],
            [$settings['app_name'], $serviceName ?? __('whatsapp.generic_service')],
            $template,
        );
    }
}
