<?php

namespace App\Console\Commands;

use App\Models\PropertyListingImage;
use App\Models\Provider;
use App\Models\ProviderPortfolioImage;
use App\Services\WebpImageStorage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ConvertImagesToWebp extends Command
{
    protected $signature = 'images:convert-webp {--apply : Save converted files and update image references}';

    protected $description = 'Convert existing uploaded images to WebP (preview by default; original files retained)';

    public function handle(WebpImageStorage $images): int
    {
        $disk = Storage::disk('public');
        $count = 0;
        $failed = 0;
        foreach ([Provider::class => ['logo_path', 'cover_path'], ProviderPortfolioImage::class => ['path'], PropertyListingImage::class => ['path']] as $class => $attributes) {
            foreach ($class::query()->lazyById(100) as $record) {
                foreach ($attributes as $attribute) {
                    $path = $record->{$attribute};
                    if (! $path || strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'webp') {
                        continue;
                    }
                    $stored = null;
                    try {
                        if (! $disk->exists($path)) {
                            throw new \RuntimeException('Source file is missing');
                        }
                        if ($this->option('apply')) {
                            $stored = $images->store($disk->path($path), dirname($path), $attribute === 'logo_path' ? 512 : 1920);
                            $values = [$attribute => $stored['path']];
                            if ($attribute === 'path') {
                                $values += ['width' => $stored['width'], 'height' => $stored['height']];
                            }
                            // Do not overwrite a photo replaced by its owner during conversion.
                            if (! $class::whereKey($record->id)->where($attribute, $path)->update($values)) {
                                $disk->delete($stored['path']);

                                continue;
                            }
                        }
                        $count++;
                    } catch (\Throwable $exception) {
                        if ($stored) {
                            $disk->delete($stored['path']);
                        }
                        $this->error($class.' #'.$record->id.' '.$attribute.': '.$exception->getMessage());
                        $failed++;
                    }
                }
            }
        }
        $this->info(($this->option('apply') ? 'Converted' : 'Would convert').': '.$count.'. Failed: '.$failed.'. Original files retained.');

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
