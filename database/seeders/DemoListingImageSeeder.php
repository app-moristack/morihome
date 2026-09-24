<?php

namespace Database\Seeders;

use App\Models\PropertyListing;
use App\Models\Provider;
use Database\Seeders\Data\DemoProviderBlueprints;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class DemoListingImageSeeder extends Seeder
{
    private const SERVICE_IMAGES = [
        'plumber' => 'plumber',
        'mason' => 'construction',
        'contractor' => 'construction',
        'electrician' => 'electrician',
        'painter' => 'painter',
        'carpenter' => 'carpenter',
        'tiler' => 'tiler',
        'landscaper' => 'landscaper',
        'gardener' => 'gardener',
        'cleaning' => 'cleaning',
        'roofing-waterproofing' => 'roofing',
        'air-conditioning' => 'air_conditioning',
        'aluminium-glazing' => 'glazing',
        'general-handyman' => 'tools',
        'pest-control' => 'pest_control',
        'welder' => 'welder',
        'architect-designer' => 'architect',
        'building-materials-supplier' => 'tools',
        'equipment-tool-rental' => 'tools',
        'pool-services' => 'pool',
    ];

    private const PROPERTY_IMAGES = [
        'apartment' => ['apartment', 'apartment_alt'],
        'house' => ['house', 'house_alt'],
        'villa' => ['villa', 'pool'],
        'commercial' => ['commercial', 'commercial_alt'],
        'land' => ['land'],
    ];

    public function run(): void
    {
        // Safe to invoke explicitly in production: only fill missing photos on
        // existing demo records. DatabaseSeeder still excludes demos there.
        $blueprints = collect(DemoProviderBlueprints::all())->keyBy('slug');
        $providerSlugs = $blueprints->keys()->merge(['demo-property-agency-1', 'demo-property-agency-2']);

        DB::transaction(function () use ($blueprints, $providerSlugs): void {
            $providers = Provider::query()->whereIn('slug', $providerSlugs)->withCount('portfolioImages')->get();
            foreach ($providers as $provider) {
                $category = $blueprints->get($provider->slug)['categories'][0] ?? null;
                $asset = $category ? self::SERVICE_IMAGES[$category] : 'villa';

                if (! $provider->cover_path) {
                    $image = $this->copyImage($asset, 'providers/'.$provider->id.'/demo-cover.webp');
                    $provider->forceFill(['cover_path' => $image['path']])->save();
                }

                if ($provider->portfolio_images_count === 0) {
                    $provider->portfolioImages()->create([
                        ...$this->copyImage($asset, 'providers/'.$provider->id.'/portfolio/demo-'.$asset.'.webp'),
                        'caption' => 'Illustrative stock photo for this demonstration listing.',
                        'sort_order' => 0,
                    ]);
                }
            }

            $listingSlugs = collect(['rental', 'sales'])->flatMap(fn (string $purpose) => collect(range(1, 20))->map(fn (int $number) => 'demo-property-'.$purpose.'-'.str_pad((string) $number, 2, '0', STR_PAD_LEFT))
            );
            $listings = PropertyListing::query()->whereIn('slug', $listingSlugs)
                ->whereIn('property_type', array_keys(self::PROPERTY_IMAGES))
                ->whereDoesntHave('images')->get();
            foreach ($listings as $listing) {
                $assets = self::PROPERTY_IMAGES[$listing->property_type];
                $number = (int) substr($listing->slug, -2);
                if (intdiv(max(0, $number - 1), 5) % 2 === 1) {
                    $assets = array_reverse($assets);
                }

                foreach ($assets as $order => $asset) {
                    $listing->images()->create([
                        ...$this->copyImage($asset, 'properties/'.$listing->id.'/demo-'.$asset.'.webp'),
                        'caption' => 'Illustrative stock photo for this fictional '.$listing->property_type.' listing.',
                        'sort_order' => $order,
                    ]);
                }
            }
        });

        $this->command?->info('Demo listing covers and galleries populated; existing photos preserved.');
    }

    /** @return array{path: string, width: int, height: int} */
    private function copyImage(string $asset, string $path): array
    {
        $source = resource_path('images/listings/'.$asset.'.webp');
        $size = getimagesize($source);
        if ($size === false) {
            throw new RuntimeException('Invalid demo image: '.$source);
        }

        $disk = Storage::disk('public');
        if (! $disk->exists($path) && ! $disk->put($path, file_get_contents($source))) {
            throw new RuntimeException('Cannot store demo image: '.$path);
        }

        return ['path' => $path, 'width' => $size[0], 'height' => $size[1]];
    }
}
