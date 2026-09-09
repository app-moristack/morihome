<?php

namespace App\Http\Controllers;

use App\Enums\ProviderType;
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

        return [
            'appName' => config('app.name'),
            'supportEmail' => config('morihome.support_email'),
            'supportWhatsapp' => config('morihome.support_whatsapp'),
            'defaultRadiusKm' => $search['default_radius_km'],
            'maxRadiusKm' => $search['max_radius_km'],
            'radiusOptionsKm' => $search['radius_options_km'],
            'providerTypes' => array_map(
                fn (ProviderType $type) => ['value' => $type->value, 'label' => $type->label()],
                ProviderType::cases(),
            ),
            'whatsappTemplate' => config('morihome.whatsapp.message_template'),
        ];
    }
}
