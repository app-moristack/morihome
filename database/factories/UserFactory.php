<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    private static int $phoneCounter = 0;

    public function definition(): array
    {
        $firstName = faker()->firstName();
        $lastName = faker()->lastName();

        return [
            'name' => $firstName.' '.$lastName,
            'phone' => self::nextMauritianMobile(),
            'email' => Str::lower($firstName.'.'.$lastName.'.'.Str::random(4)).'@example.mu',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    public static function nextMauritianMobile(): string
    {
        return '+2305'.str_pad((string) (1000000 + ++self::$phoneCounter), 7, '0', STR_PAD_LEFT);
    }

    public function withoutEmail(): static
    {
        return $this->state(fn () => ['email' => null, 'email_verified_at' => null]);
    }
}
