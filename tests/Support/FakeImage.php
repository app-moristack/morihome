<?php

namespace Tests\Support;

use Illuminate\Http\UploadedFile;

/**
 * Builds real PNG bytes rather than using UploadedFile::fake()->image(),
 * which needs the GD extension the runtime does not always carry.
 */
final class FakeImage
{
    public static function upload(string $name, int $width, int $height): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'morihome-image').'.png';
        file_put_contents($path, self::pngBytes($width, $height));

        return new UploadedFile($path, $name, 'image/png', test: true);
    }

    public static function pngBytes(int $width, int $height): string
    {
        $header = pack('NNCCCCC', $width, $height, 8, 2, 0, 0, 0);

        $raw = str_repeat("\x00".str_repeat("\x00", $width * 3), $height);

        return "\x89PNG\r\n\x1a\n"
            .self::chunk('IHDR', $header)
            .self::chunk('IDAT', gzcompress($raw, 9))
            .self::chunk('IEND', '');
    }

    private static function chunk(string $type, string $data): string
    {
        return pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));
    }
}
