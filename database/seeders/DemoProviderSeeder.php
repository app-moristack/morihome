<?php

namespace Database\Seeders;

use App\Enums\ApprovalStatus;
use App\Enums\ModerationAction;
use App\Enums\ProviderType;
use App\Enums\UserRole;
use App\Models\Locality;
use App\Models\Provider;
use App\Models\ProviderModerationEvent;
use App\Models\ProviderOpeningHour;
use App\Models\ServiceCategory;
use App\Models\Subscription;
use App\Models\SubscriptionUser;
use App\Models\User;
use Database\Factories\UserFactory;
use Database\Seeders\Data\DemoProviderBlueprints;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class DemoProviderSeeder extends Seeder
{
    public function run(): void
    {
        $localities = Locality::all()->keyBy('name');
        $categories = ServiceCategory::where('is_active', true)->get();

        if ($localities->isEmpty() || $categories->isEmpty()) {
            $this->command->error('Run migrations first: localities and service categories are missing.');

            return;
        }

        $blueprints = DemoProviderBlueprints::all();

        foreach ($blueprints as $blueprint) {
            $this->command->info('Seeding provider: '.$blueprint['name']);
            $this->createProvider($blueprint, $localities, $categories);
        }

        $this->command->comment('Demo providers seeded: '.count($blueprints));
    }

    private function createProvider(array $blueprint, Collection $localities, Collection $categories): void
    {
        $locality = $localities[$blueprint['locality']] ?? $localities->first();

        $user = User::query()->firstOrCreate(
            ['email' => $blueprint['slug'].'@example.mu'],
            function () use ($blueprint): array {
                do {
                    $phone = UserFactory::nextMauritianMobile();
                } while (User::where('phone', $phone)->exists());

                return User::factory()->raw([
                    'name' => $blueprint['name'],
                    'email' => $blueprint['slug'].'@example.mu',
                    'phone' => $phone,
                ]);
            },
        );
        $user->assignRole(UserRole::Provider->value);

        $provider = Provider::query()->firstOrCreate(
            ['slug' => $blueprint['slug']],
            fn (): array => $this->factoryFor($blueprint, $locality)->raw([
                'user_id' => $user->id,
                'name' => $blueprint['name'],
                'slug' => $blueprint['slug'],
                'description' => $blueprint['description'],
                'email' => $blueprint['slug'].'@example.mu',
                'service_areas' => $blueprint['service_areas'],
            ]),
        );

        $provider->serviceCategories()->sync($this->categoryIdsFor($blueprint['categories'], $categories));

        $tier = $blueprint['featured'] ? 'pro' : (
            $blueprint['type'] === ProviderType::Agency || count($blueprint['categories']) > 1 ? 'plus' : 'free'
        );
        $subscription = Subscription::query()->where('slug', 'services-'.$tier)->firstOrFail();

        SubscriptionUser::query()->updateOrCreate([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
        ], [
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonths(6),
            'approved_at' => now()->subDay(),
        ]);

        $this->seedOpeningHours($provider);
        $this->seedModerationTrail($provider);
    }

    private function factoryFor(array $blueprint, Locality $locality): Factory
    {
        $factory = Provider::factory()->at($locality)->ofType($blueprint['type']);

        $factory = match ($blueprint['status']) {
            'approved' => $factory->approved(),
            'pending' => $factory->pending(),
            'rejected' => $factory->rejected(),
            'suspended' => $factory->suspended(),
            default => $factory,
        };

        if ($blueprint['verified'] ?? false) {
            $factory = $factory->verified();
        }

        return ($blueprint['featured'] ?? false) ? $factory->featured() : $factory;
    }

    private function categoryIdsFor(array $slugs, Collection $categories): array
    {
        $ids = [];

        foreach (array_values($slugs) as $position => $slug) {
            $category = $categories->firstWhere('slug', $slug);

            if ($category !== null) {
                $ids[$category->id] = ['is_primary' => $position === 0];
            }
        }

        return $ids;
    }

    private function seedOpeningHours(Provider $provider): void
    {
        if (! $provider->provider_type->hasOpeningHours()) {
            return;
        }

        foreach (range(0, 6) as $day) {
            ProviderOpeningHour::firstOrCreate([
                'provider_id' => $provider->id,
                'day_of_week' => $day,
            ], [
                'is_closed' => $day === 0,
                'opens_at' => $day === 0 ? null : ($day === 6 ? '08:30' : '08:00'),
                'closes_at' => $day === 0 ? null : ($day === 6 ? '12:30' : '17:00'),
            ]);
        }
    }

    private function seedModerationTrail(Provider $provider): void
    {
        if ($provider->submitted_at === null) {
            return;
        }

        ProviderModerationEvent::firstOrCreate([
            'provider_id' => $provider->id,
            'actor_id' => $provider->user_id,
            'action' => ModerationAction::Submitted,
            'from_status' => ApprovalStatus::Draft,
            'to_status' => ApprovalStatus::Pending,
        ]);
    }
}
