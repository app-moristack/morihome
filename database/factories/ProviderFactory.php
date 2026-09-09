<?php

namespace Database\Factories;

use App\Enums\ApprovalStatus;
use App\Enums\ProviderType;
use App\Models\Locality;
use App\Models\Provider;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProviderFactory extends Factory
{
    protected $model = Provider::class;

    public function definition(): array
    {
        $locality = Locality::query()->inRandomOrder()->first();
        $name = Str::title(faker()->words(2)).' Services';
        $phone = UserFactory::nextMauritianMobile();

        return [
            'user_id' => User::factory(),
            'provider_type' => faker()->randomElement(ProviderType::cases()),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(6)),
            'description' => faker()->paragraphs(2),
            'phone' => $phone,
            'whatsapp_phone' => $phone,
            'email' => Str::lower(Str::slug($name)).'@example.mu',
            'address' => faker()->number(1, 120).' Royal Road, '.($locality?->name ?? 'Port Louis'),
            'locality' => $locality?->name ?? 'Port Louis',
            'latitude' => $this->jitter($locality?->latitude ?? -20.1609),
            'longitude' => $this->jitter($locality?->longitude ?? 57.5012),
            'approval_status' => ApprovalStatus::Draft,
            'is_active' => true,
        ];
    }

    public function at(Locality $locality): static
    {
        return $this->state(fn () => [
            'locality' => $locality->name,
            'address' => faker()->number(1, 120).' Royal Road, '.$locality->name,
            'latitude' => $this->jitter($locality->latitude),
            'longitude' => $this->jitter($locality->longitude),
        ]);
    }

    public function ofType(ProviderType $providerType): static
    {
        return $this->state(fn () => ['provider_type' => $providerType]);
    }

    public function draft(): static
    {
        return $this->state(fn () => ['approval_status' => ApprovalStatus::Draft]);
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'approval_status' => ApprovalStatus::Approved,
            'submitted_at' => now()->subDays(10),
            'approved_at' => now()->subDays(7),
            'is_active' => true,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'approval_status' => ApprovalStatus::Pending,
            'submitted_at' => now()->subDays(2),
        ]);
    }

    public function rejected(string $reason = 'Incomplete business details.'): static
    {
        return $this->state(fn () => [
            'approval_status' => ApprovalStatus::Rejected,
            'submitted_at' => now()->subDays(5),
            'rejection_reason' => $reason,
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn () => [
            'approval_status' => ApprovalStatus::Suspended,
            'approved_at' => now()->subMonths(3),
            'suspended_at' => now()->subDay(),
            'is_active' => false,
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn () => ['is_verified' => true]);
    }

    public function featured(): static
    {
        return $this->state(fn () => ['is_featured' => true]);
    }

    private function jitter(float $coordinate): float
    {
        return round($coordinate + faker()->number(-220, 220) / 10000, 7);
    }
}
