<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\Auth\RevokeAccountSessions;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    public function sendLink(Request $request): JsonResponse
    {
        $validated = $request->validate(['email' => ['required', 'email']]);

        if (! app()->isProduction() || ! in_array(config('mail.default'), ['log', 'array'], true)) {
            Password::sendResetLink($validated);
        }

        return response()->json(['message' => __('messages.reset_sent')]);
    }

    public function reset(Request $request, RevokeAccountSessions $revokeSessions): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'max:128', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset($validated, function ($user, string $password) use ($revokeSessions) {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
            ])->save();
            $revokeSessions->handle($user);
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return response()->json(['message' => __($status)]);
    }
}
