<?php

namespace App\Http\Controllers\Api\V1\Provider;

use App\Actions\Providers\SubmitProviderForReview;
use App\Http\Controllers\Controller;
use App\Http\Resources\OwnedProviderResource;
use Illuminate\Http\Request;

class ProviderSubmissionController extends Controller
{
    public function store(Request $request, SubmitProviderForReview $submitForReview): OwnedProviderResource
    {
        $provider = $request->user()->provider;
        $this->authorize('submitForReview', $provider);

        return new OwnedProviderResource($submitForReview->handle($provider));
    }
}
