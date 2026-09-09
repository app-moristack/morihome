<?php

namespace App\Support;

use InvalidArgumentException;

final class PhoneNumber
{
    private const DEFAULT_COUNTRY_CODE = '230';

    private const MAURITIAN_MOBILE_LENGTH = 8;

    private const MAURITIAN_LANDLINE_LENGTH = 7;

    private function __construct(public readonly string $e164) {}

    public static function parse(string $input, string $countryCode = self::DEFAULT_COUNTRY_CODE): self
    {
        $digits = preg_replace('/\D/', '', $input) ?? '';

        if ($digits === '') {
            throw new InvalidArgumentException('Phone number contains no digits.');
        }

        if (str_starts_with(trim($input), '+')) {
            return new self('+'.$digits);
        }

        $digits = ltrim($digits, '0');

        if (str_starts_with($digits, $countryCode) && strlen($digits) > self::MAURITIAN_MOBILE_LENGTH) {
            return new self('+'.$digits);
        }

        $nationalLengths = [self::MAURITIAN_MOBILE_LENGTH, self::MAURITIAN_LANDLINE_LENGTH];

        if (in_array(strlen($digits), $nationalLengths, true)) {
            return new self('+'.$countryCode.$digits);
        }

        throw new InvalidArgumentException('Phone number is not a valid Mauritian or international number.');
    }

    public static function tryParse(?string $input, string $countryCode = self::DEFAULT_COUNTRY_CODE): ?self
    {
        if ($input === null || trim($input) === '') {
            return null;
        }

        try {
            return self::parse($input, $countryCode);
        } catch (InvalidArgumentException) {
            return null;
        }
    }

    public function whatsappDigits(): string
    {
        return ltrim($this->e164, '+');
    }

    public function isMauritianMobile(): bool
    {
        $national = $this->nationalNumber();

        return str_starts_with($this->e164, '+'.self::DEFAULT_COUNTRY_CODE)
            && strlen($national) === self::MAURITIAN_MOBILE_LENGTH
            && str_starts_with($national, '5');
    }

    public function nationalNumber(): string
    {
        $digits = ltrim($this->e164, '+');

        return str_starts_with($digits, self::DEFAULT_COUNTRY_CODE)
            ? substr($digits, strlen(self::DEFAULT_COUNTRY_CODE))
            : $digits;
    }

    public function format(): string
    {
        if (! $this->isMauritianMobile()) {
            return $this->e164;
        }

        $national = $this->nationalNumber();

        return sprintf('+%s %s %s', self::DEFAULT_COUNTRY_CODE, substr($national, 0, 4), substr($national, 4));
    }

    public function __toString(): string
    {
        return $this->e164;
    }
}
