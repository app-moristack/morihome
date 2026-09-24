<?php

namespace Tests\Feature\Provider;

use App\Actions\Providers\StoreProviderImage;
use App\Models\PropertyListing;
use App\Models\Provider;
use App\Services\WebpImageStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\Support\FakeImage;
use Tests\TestCase;

class WebpImageStorageTest extends TestCase
{
    use RefreshDatabase;

    public function test_converts_and_resizes_real_upload_bytes_and_preserves_alpha(): void
    {
        Storage::fake('public');
        $file = FakeImage::upload('photo.png', 2400, 1200);
        $image = imagecreatetruecolor(2400, 1200);
        imagealphablending($image, false);
        imagesavealpha($image, true);
        imagefill($image, 0, 0, imagecolorallocatealpha($image, 0, 0, 0, 127));
        imagepng($image, $file->getRealPath());
        $stored = app(WebpImageStorage::class)->store($file->getRealPath(), 'photos');
        $this->assertSame([1920, 960], [$stored['width'], $stored['height']]);
        $this->assertStringEndsWith('.webp', $stored['path']);
        $this->assertSame('image/webp', Storage::disk('public')->mimeType($stored['path']));
        $decoded = imagecreatefromwebp(Storage::disk('public')->path($stored['path']));
        $this->assertSame(127, imagecolorsforindex($decoded, imagecolorat($decoded, 0, 0))['alpha']);
    }

    public function test_corrects_jpeg_orientation_before_saving(): void
    {
        Storage::fake('public');
        $file = FakeImage::upload('portrait.jpg', 800, 400);
        $image = imagecreatetruecolor(800, 400);
        imagejpeg($image, $file->getRealPath());
        $jpeg = file_get_contents($file->getRealPath());
        $exif = "Exif\0\0".'II'.pack('vV', 42, 8).pack('v', 1).pack('vvVvvV', 0x0112, 3, 1, 6, 0, 0);
        file_put_contents($file->getRealPath(), substr($jpeg, 0, 2)."\xff\xe1".pack('n', strlen($exif) + 2).$exif.substr($jpeg, 2));
        $stored = app(WebpImageStorage::class)->store($file->getRealPath(), 'photos');
        $this->assertSame([400, 800], [$stored['width'], $stored['height']]);
    }

    public function test_failed_conversion_keeps_the_previous_provider_image(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('old.png', FakeImage::pngBytes(200, 200));
        $provider = Provider::factory()->create(['logo_path' => 'old.png']);
        $file = FakeImage::upload('bad.png', 200, 200);
        file_put_contents($file->getRealPath(), 'not an image');
        try {
            app(StoreProviderImage::class)->handle($provider, $file, 'logo_path');
            $this->fail('Invalid image was accepted');
        } catch (ValidationException) {
            $this->assertSame('old.png', $provider->fresh()->logo_path);
            Storage::disk('public')->assertExists('old.png');
            $this->assertCount(1, Storage::disk('public')->allFiles());
        }
    }

    public function test_existing_image_conversion_preserves_metadata_and_is_repeatable(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('existing/photo.png', FakeImage::pngBytes(800, 600));
        $listing = PropertyListing::factory()->create();
        $photo = $listing->images()->create(['path' => 'existing/photo.png', 'caption' => 'Garden', 'sort_order' => 20]);
        $this->artisan('images:convert-webp')->assertSuccessful();
        $this->assertSame('existing/photo.png', $photo->fresh()->path);
        $this->artisan('images:convert-webp', ['--apply' => true])->assertSuccessful();
        $photo->refresh();
        $this->assertStringEndsWith('.webp', $photo->path);
        $this->assertSame('Garden', $photo->caption);
        $this->assertSame(20, $photo->sort_order);
        $this->assertSame(800, $photo->width);
        Storage::disk('public')->assertExists('existing/photo.png');
        $path = $photo->path;
        $this->artisan('images:convert-webp', ['--apply' => true])->assertSuccessful();
        $this->assertSame($path, $photo->fresh()->path);
    }
}
