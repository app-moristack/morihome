<?php

namespace Tests\Unit\Support;

use App\Support\PhoneNumber;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class PhoneNumberTest extends TestCase
{
    public static function mauritianFormats(): array
    {
        return [
            'plain mobile' => ['57654321', '+23057654321'],
            'spaced mobile' => ['5765 4321', '+23057654321'],
            'dashed mobile' => ['5765-4321', '+23057654321'],
            'leading zero' => ['057654321', '+23057654321'],
            'country code without plus' => ['23057654321', '+23057654321'],
            'international form' => ['+230 5765 4321', '+23057654321'],
            'landline' => ['2071234', '+2302071234'],
        ];
    }

    #[DataProvider('mauritianFormats')]
    public function test_mauritian_numbers_normalise_to_e164(string $input, string $expected): void
    {
        $this->assertSame($expected, PhoneNumber::parse($input)->e164);
    }

    public function test_foreign_numbers_keep_their_own_country_code(): void
    {
        $this->assertSame('+33612345678', PhoneNumber::parse('+33 6 12 34 56 78')->e164);
    }

    public function test_whatsapp_digits_drop_the_leading_plus(): void
    {
        $this->assertSame('23057654321', PhoneNumber::parse('5765 4321')->whatsappDigits());
    }

    public function test_mauritian_mobiles_are_recognised(): void
    {
        $this->assertTrue(PhoneNumber::parse('57654321')->isMauritianMobile());
        $this->assertFalse(PhoneNumber::parse('2071234')->isMauritianMobile());
        $this->assertFalse(PhoneNumber::parse('+33612345678')->isMauritianMobile());
    }

    public function test_mauritian_mobiles_are_displayed_in_readable_groups(): void
    {
        $this->assertSame('+230 5765 4321', PhoneNumber::parse('57654321')->format());
    }

    public function test_non_mauritian_numbers_are_displayed_as_stored(): void
    {
        $this->assertSame('+33612345678', PhoneNumber::parse('+33612345678')->format());
    }

    public function test_a_number_with_no_digits_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        PhoneNumber::parse('not a phone');
    }

    public function test_a_number_of_the_wrong_length_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        PhoneNumber::parse('12345');
    }

    public function test_try_parse_returns_null_instead_of_throwing(): void
    {
        $this->assertNull(PhoneNumber::tryParse('nonsense'));
        $this->assertNull(PhoneNumber::tryParse(null));
        $this->assertNull(PhoneNumber::tryParse('   '));
        $this->assertSame('+23057654321', PhoneNumber::tryParse('57654321')?->e164);
    }
}
