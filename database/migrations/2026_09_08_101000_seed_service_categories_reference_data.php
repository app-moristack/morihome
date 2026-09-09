<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $sortOrder = 0;

        foreach ($this->categories() as [$name, $icon, $isPopular]) {
            DB::table('service_categories')->updateOrInsert(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'icon' => $icon,
                    'is_active' => true,
                    'is_popular' => $isPopular,
                    'sort_order' => $sortOrder += 10,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );
        }
    }

    public function down(): void
    {
        DB::table('service_categories')->delete();
    }

    private function categories(): array
    {
        return [
            ['Plumber', 'droplets', true],
            ['Mason', 'brick-wall', true],
            ['Electrician', 'zap', true],
            ['Painter', 'paint-roller', true],
            ['Carpenter', 'hammer', true],
            ['Tiler', 'grid-3x3', true],
            ['Gardener', 'sprout', true],
            ['Landscaper', 'trees', false],
            ['Welder', 'flame', false],
            ['Aluminium & Glazing', 'panels-top-left', false],
            ['Roofing & Waterproofing', 'house', true],
            ['Air Conditioning', 'wind', true],
            ['Pool Services', 'waves', false],
            ['Cleaning', 'spray-can', true],
            ['Pest Control', 'bug', false],
            ['General Handyman', 'wrench', true],
            ['Architect & Designer', 'ruler', false],
            ['Contractor', 'hard-hat', false],
            ['Building Materials Supplier', 'package', false],
            ['Equipment & Tool Rental', 'forklift', false],
        ];
    }
};
