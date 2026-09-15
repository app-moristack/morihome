<?php

namespace Database\Seeders;

use App\Enums\ProviderType;
use App\Enums\UserRole;
use App\Models\Locality;
use App\Models\PropertyListing;
use App\Models\Provider;
use App\Models\Subscription;
use App\Models\SubscriptionUser;
use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoPropertySeeder extends Seeder
{
    public function run(): void
    {
        $localities = Locality::query()->orderBy('name')->get();
        $plans = Subscription::query()->whereIn('slug', ['rental-pro', 'sales-pro'])->get()->keyBy('slug');

        if ($localities->isEmpty() || $plans->count() !== 2) {
            $this->command?->error('Run migrations first: localities and property subscriptions are required.');

            return;
        }

        DB::transaction(function () use ($localities, $plans): void {
            foreach (range(1, 2) as $agencyNumber) {
                $slug = 'demo-property-agency-'.$agencyNumber;
                $name = 'Demo Property Agency '.$agencyNumber;
                $user = User::query()->firstOrCreate(
                    ['email' => $slug.'@example.mu'],
                    function () use ($name, $slug): array {
                        do {
                            $phone = UserFactory::nextMauritianMobile();
                        } while (User::where('phone', $phone)->exists());

                        return User::factory()->raw([
                            'name' => $name,
                            'email' => $slug.'@example.mu',
                            'phone' => $phone,
                        ]);
                    },
                );
                $user->assignRole(UserRole::Provider->value);

                $provider = Provider::query()->firstOrCreate(
                    ['slug' => $slug],
                    fn (): array => Provider::factory()->approved()->ofType(ProviderType::Agency)->raw([
                        'user_id' => $user->id,
                        'slug' => $slug,
                        'name' => $name,
                        'email' => $user->email,
                        'description' => 'Demo agency offering rental homes and properties for sale across Mauritius.',
                    ]),
                );

                foreach (['rental', 'sales'] as $purpose) {
                    $membership = SubscriptionUser::query()->updateOrCreate([
                        'user_id' => $user->id,
                        'subscription_id' => $plans[$purpose.'-pro']->id,
                    ], [
                        'starts_at' => now()->subDay(),
                        'ends_at' => now()->addMonths(6),
                        'approved_at' => now()->subDay(),
                    ]);

                    foreach (range(1, 10) as $index) {
                        $number = ($agencyNumber - 1) * 10 + $index;
                        $locality = $localities[($number - 1) % $localities->count()];
                        $type = ['apartment', 'house', 'villa', 'commercial', 'land'][($number - 1) % 5];
                        $residential = in_array($type, ['apartment', 'house', 'villa'], true);
                        $bedrooms = $residential ? 1 + ($number % 4) : null;
                        $offer = $purpose === 'rental' ? 'for rent' : 'for sale';
                        $title = ucfirst($type).' '.$offer.' in '.$locality->name;

                        PropertyListing::withTrashed()->updateOrCreate([
                            'slug' => 'demo-property-'.$purpose.'-'.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
                        ], [
                            'provider_id' => $provider->id,
                            'subscription_user_id' => $membership->id,
                            'purpose' => $purpose,
                            'property_type' => $type,
                            'title' => $title,
                            'description' => $title.'. '.match ($type) {
                                'apartment' => 'A bright apartment with an open living area, balcony and convenient access to local shops.',
                                'house' => 'A spacious family home with a private garden, covered parking and room to entertain.',
                                'villa' => 'A generous villa with a private pool, landscaped garden and a shaded terrace.',
                                'commercial' => 'A flexible commercial space with road access, customer parking and an open floor plan.',
                                'land' => 'A plot with road access and space for a future building project.',
                            }.' This is a fictional demonstration listing.',
                            'price_rupees' => $purpose === 'rental' ? 15000 + $number * 3500 : 2500000 + $number * 750000,
                            'bedrooms' => $bedrooms,
                            'bathrooms' => $residential ? max(1, $bedrooms - 1) : null,
                            'area_sqm' => $type === 'land' ? 400 + $number * 25 : 65 + $number * 12,
                            'is_furnished' => $residential ? $number % 2 === 0 : null,
                            'address' => $number.' Royal Road, '.$locality->name,
                            'locality' => $locality->name,
                            'latitude' => $locality->latitude,
                            'longitude' => $locality->longitude,
                            'status' => 'published',
                            'published_at' => now()->subDays($number),
                            'expires_at' => $membership->ends_at,
                            'deleted_at' => null,
                        ]);
                    }
                }
            }
        });

        $this->command?->comment('Demo properties seeded: 20 rentals and 20 sales.');
    }
}
