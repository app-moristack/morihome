<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('morihome.admin.email');
        $password = config('morihome.admin.password') ?: Str::password(16);

        DB::transaction(function () use ($email, $password): void {
            User::role(UserRole::Admin->value)
                ->where(function ($query) use ($email): void {
                    $query->where('email', '!=', $email)->orWhereNull('email');
                })
                ->get()
                ->each(function (User $user): void {
                    $user->tokens()->delete();
                    DB::table('sessions')->where('user_id', $user->id)->delete();
                    $user->delete();
                });

            $admin = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => 'MoriHome Administrator',
                    'phone' => PhoneNumber::parse(config('morihome.support_whatsapp'))->e164,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                ],
            );

            $admin->syncRoles([UserRole::Admin->value]);
        });

        $this->command->comment("Admin ready: {$email}");

        if (! config('morihome.admin.password')) {
            $this->command->warn("Generated admin password (set ADMIN_PASSWORD to control it): {$password}");
        }
    }
}
