<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class EnsureUserIsProvider
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->provider === null) {
            throw new AccessDeniedHttpException(__('auth.provider_only'));
        }

        return $next($request);
    }
}
