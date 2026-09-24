<?php

namespace Database\Seeders;

use App\Enums\ProviderType;
use App\Enums\UserRole;
use App\Models\Locality;
use App\Models\PropertyListing;
use App\Models\Provider;
use App\Models\ServiceCategory;
use App\Models\Subscription;
use App\Models\SubscriptionUser;
use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DemoMixedAgencySeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            return;
        }

        DB::transaction(function (): void {
            $user = User::query()->firstOrCreate(
                ['email' => 'demo-mixed-agency@example.mu'],
                function (): array {
                    do {
                        $phone = UserFactory::nextMauritianMobile();
                    } while (User::query()->where('phone', $phone)->exists());

                    return User::factory()->raw([
                        'name' => 'MoriHome Demo Agency',
                        'email' => 'demo-mixed-agency@example.mu',
                        'phone' => $phone,
                    ]);
                },
            );
            $user->assignRole(UserRole::Provider->value);
            $locality = Locality::query()->where('name', 'Grand Baie')->firstOrFail();
            $provider = Provider::query()->firstOrCreate(
                ['slug' => 'morihome-demo-agency'],
                fn (): array => Provider::factory()->approved()->verified()->featured()
                    ->ofType(ProviderType::Agency)->at($locality)->raw([
                        'user_id' => $user->id,
                        'name' => 'MoriHome Demo Agency',
                        'slug' => 'morihome-demo-agency',
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'whatsapp_phone' => $user->phone,
                        'description' => 'Agence fictive de démonstration : plomberie, électricité, nettoyage et jardinage, ainsi que des villas, maisons et appartements à louer ou à vendre à Maurice.',
                        'service_areas' => ['Grand Baie', 'Port Louis', 'Curepipe'],
                    ]),
            );

            $categories = ServiceCategory::query()->whereIn('slug', ['plumber', 'electrician', 'cleaning', 'gardener'])->get();
            $provider->serviceCategories()->sync($categories->mapWithKeys(
                fn ($category): array => [$category->id => ['is_primary' => $category->slug === 'plumber']],
            )->all());

            $memberships = [];
            foreach (['services', 'rental', 'sales'] as $purpose) {
                $subscription = Subscription::query()->where('slug', $purpose.'-pro')->firstOrFail();
                $memberships[$purpose] = SubscriptionUser::query()->updateOrCreate([
                    'user_id' => $user->id,
                    'subscription_id' => $subscription->id,
                ], [
                    'starts_at' => now()->subDay(),
                    'ends_at' => now()->addYear(),
                    'approved_at' => now()->subDay(),
                ]);
            }

            if (! $provider->cover_path) {
                $provider->forceFill(['cover_path' => $this->image('villa', 'providers/'.$provider->id.'/demo-agency-cover.webp')['path']])->save();
            }
            foreach (['plumber', 'electrician', 'cleaning', 'gardener'] as $index => $asset) {
                $photo = $this->image($asset, 'providers/'.$provider->id.'/portfolio/demo-agency-'.$asset.'.webp');
                $provider->portfolioImages()->firstOrCreate(['path' => $photo['path']], [
                    ...$photo,
                    'caption' => 'Photo illustrative — agence fictive de démonstration.',
                    'sort_order' => $index,
                ]);
            }

            foreach (['rental', 'sales'] as $purpose) {
                foreach (['villa', 'house', 'apartment'] as $index => $type) {
                    $listing = PropertyListing::query()->firstOrCreate(
                        ['slug' => 'demo-agency-'.$purpose.'-'.$type],
                        fn (): array => [
                            'provider_id' => $provider->id,
                            'subscription_user_id' => $memberships[$purpose]->id,
                            'purpose' => $purpose,
                            'property_type' => $type,
                            'title' => ucfirst($type).' '.($purpose === 'rental' ? 'à louer' : 'à vendre').' à Grand Baie — Démo',
                            'description' => 'Annonce fictive de démonstration. Un bien lumineux et spacieux à Grand Baie, proche des commerces et des plages. Cette annonce permet de découvrir les photos, les équipements et le profil de notre agence multiservices.',
                            'price_rupees' => $purpose === 'rental' ? 65000 - $index * 15000 : 18000000 - $index * 4000000,
                            'bedrooms' => 4 - $index,
                            'bathrooms' => 3 - $index,
                            'area_sqm' => 240 - $index * 60,
                            'is_furnished' => true,
                            'amenities' => $type === 'villa' ? ['pool', 'garden', 'parking', 'air_conditioning'] : ['parking', 'balcony', 'air_conditioning'],
                            'address' => 'Royal Road, Grand Baie (adresse de démonstration)',
                            'locality' => $locality->name,
                            'latitude' => $locality->latitude,
                            'longitude' => $locality->longitude,
                            'status' => 'published',
                            'published_at' => now(),
                            'expires_at' => now()->addYear(),
                        ],
                    );
                    $assets = match ($type) {
                        'villa' => ['villa', 'pool'],
                        'house' => ['house', 'house_alt'],
                        default => ['apartment', 'apartment_alt'],
                    };
                    foreach ($assets as $position => $asset) {
                        $photo = $this->image($asset, 'properties/'.$listing->id.'/demo-agency-'.$asset.'.webp');
                        $listing->images()->firstOrCreate(['path' => $photo['path']], [
                            ...$photo,
                            'caption' => 'Photo illustrative — propriété fictive de démonstration.',
                            'sort_order' => $position,
                        ]);
                    }
                }
            }
        });
        $this->command?->info('Demo agency: /providers/morihome-demo-agency');
    }

    private function image(string $asset, string $path): array
    {
        $source = resource_path('images/listings/'.$asset.'.webp');
        $size = getimagesize($source);
        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->put($path, file_get_contents($source));
        }

        return ['path' => $path, 'width' => $size[0], 'height' => $size[1]];
    }
}
