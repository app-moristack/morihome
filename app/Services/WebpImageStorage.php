<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class WebpImageStorage
{
    /** @return array{path: string, width: int, height: int} */
    public function store(string $source, string $directory, int $maxEdge = 1920): array
    {
        $size = @getimagesize($source);
        if (! $size || ! in_array($size['mime'], ['image/jpeg', 'image/png', 'image/webp'], true)
            || $size[0] * $size[1] > 24000000) {
            throw ValidationException::withMessages(['image' => __('messages.image_conversion_invalid')]);
        }

        $image = @imagecreatefromstring(file_get_contents($source));
        if ($image === false) {
            throw ValidationException::withMessages(['image' => __('messages.image_conversion_invalid')]);
        }

        if ($size['mime'] === 'image/jpeg') {
            $exif = @exif_read_data($source);
            $orientation = (int) ($exif['Orientation'] ?? 1);
            if (in_array($orientation, [3, 6, 8, 5, 7], true)) {
                $image = imagerotate($image, match ($orientation) {
                    3 => 180, 8 => 90, default => -90
                }, 0);
            }
            if (in_array($orientation, [2, 5], true)) {
                imageflip($image, IMG_FLIP_HORIZONTAL);
            } elseif (in_array($orientation, [4, 7], true)) {
                imageflip($image, IMG_FLIP_VERTICAL);
            }
        }

        $ratio = min(1, $maxEdge / max(imagesx($image), imagesy($image)));
        $width = max(1, (int) round(imagesx($image) * $ratio));
        $height = max(1, (int) round(imagesy($image) * $ratio));
        $output = imagecreatetruecolor($width, $height);
        imagealphablending($output, false);
        imagesavealpha($output, true);
        imagefill($output, 0, 0, imagecolorallocatealpha($output, 0, 0, 0, 127));
        imagecopyresampled($output, $image, 0, 0, 0, 0, $width, $height, imagesx($image), imagesy($image));

        ob_start();
        try {
            $encoded = imagewebp($output, null, 82);
            $bytes = ob_get_contents();
        } finally {
            ob_end_clean();
        }
        if (! $encoded || ! $bytes || substr($bytes, 8, 4) !== 'WEBP') {
            throw new RuntimeException('The image could not be converted to WebP.');
        }
        $path = trim($directory, '/').'/'.Str::uuid().'.webp';
        if (! Storage::disk('public')->put($path, $bytes)) {
            throw new RuntimeException('The WebP image could not be stored.');
        }

        return compact('path', 'width', 'height');
    }
}
