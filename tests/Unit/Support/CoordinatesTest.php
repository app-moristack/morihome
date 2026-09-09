<?php

namespace Tests\Unit\Support;

use App\Support\Coordinates;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class CoordinatesTest extends TestCase
{
    public function test_distance_between_port_louis_and_curepipe_matches_known_geography(): void
    {
        $portLouis = new Coordinates(-20.1609, 57.5012);
        $curepipe = new Coordinates(-20.3160, 57.5261);

        $this->assertEqualsWithDelta(17.4, $portLouis->distanceTo($curepipe), 0.5);
    }

    public function test_distance_to_itself_is_zero(): void
    {
        $point = new Coordinates(-20.2654, 57.4791);

        $this->assertSame(0.0, $point->distanceTo($point));
    }

    public function test_distance_is_symmetric(): void
    {
        $grandBaie = new Coordinates(-20.0136, 57.5804);
        $mahebourg = new Coordinates(-20.4081, 57.7000);

        $this->assertEqualsWithDelta(
            $grandBaie->distanceTo($mahebourg),
            $mahebourg->distanceTo($grandBaie),
            0.0001,
        );
    }

    public function test_bounding_box_contains_every_point_within_the_radius(): void
    {
        $centre = new Coordinates(-20.1609, 57.5012);
        $box = $centre->boundingBox(10);

        $northEdge = new Coordinates($centre->latitude + 0.089, $centre->longitude);

        $this->assertLessThan(10, $centre->distanceTo($northEdge));
        $this->assertGreaterThanOrEqual($box['min_latitude'], $northEdge->latitude);
        $this->assertLessThanOrEqual($box['max_latitude'], $northEdge->latitude);
    }

    public function test_bounding_box_widens_with_the_radius(): void
    {
        $centre = new Coordinates(-20.1609, 57.5012);

        $narrow = $centre->boundingBox(5);
        $wide = $centre->boundingBox(50);

        $this->assertGreaterThan($narrow['max_latitude'], $wide['max_latitude']);
        $this->assertLessThan($narrow['min_longitude'], $wide['min_longitude']);
    }

    public function test_obfuscating_rounds_coordinates_away_from_the_exact_address(): void
    {
        $exact = new Coordinates(-20.1609123, 57.5012987);

        $approximate = $exact->obfuscated();

        $this->assertSame(-20.16, $approximate->latitude);
        $this->assertSame(57.5, $approximate->longitude);
    }

    public function test_latitude_outside_the_valid_range_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new Coordinates(-91.0, 57.5);
    }

    public function test_longitude_outside_the_valid_range_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new Coordinates(-20.1, 181.0);
    }
}
