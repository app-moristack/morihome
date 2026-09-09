<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOpeningHoursRequest;
use App\Http\Resources\OpeningHourResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ProviderOpeningHoursController extends Controller
{
    public function update(UpdateOpeningHoursRequest $request): AnonymousResourceCollection
    {
        $provider = $request->user()->provider;

        DB::transaction(function () use ($provider, $request) {
            $provider->openingHours()->delete();

            foreach ($request->validated('hours') as $hour) {
                $provider->openingHours()->create($hour);
            }
        });

        return OpeningHourResource::collection($provider->openingHours()->get());
    }
}
