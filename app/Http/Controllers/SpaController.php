<?php

namespace App\Http\Controllers;

use App\Enums\ProviderType;
use App\Models\PlatformSetting;
use App\Services\Seo\PageMetaResolver;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class SpaController extends Controller
{
    public function __invoke(Request $request, PageMetaResolver $metaResolver): View
    {
        return view('app', [
            'meta' => $metaResolver->resolve($request),
            'bootstrap' => $this->bootstrap(),
        ]);
    }

    private function bootstrap(): array
    {
        $search = config('morihome.search');
        $settings = PlatformSetting::current();

        return [
            'appName' => $settings['app_name'],
            'supportEmail' => $settings['support_email'],
            'supportWhatsapp' => $settings['support_whatsapp'],
            'defaultRadiusKm' => $search['default_radius_km'],
            'maxRadiusKm' => $search['max_radius_km'],
            'radiusOptionsKm' => $search['radius_options_km'],
            'providerTypes' => array_map(
                fn (ProviderType $type) => ['value' => $type->value, 'label' => $type->label()],
                ProviderType::cases(),
            ),
            'whatsappTemplate' => $settings['whatsapp_message_template'],
        ];
    }
}
