<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        foreach ($this->localities() as [$name, $district, $latitude, $longitude]) {
            DB::table('localities')->updateOrInsert(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'district' => $district,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );
        }
    }

    public function down(): void
    {
        DB::table('localities')->truncate();
    }

    private function localities(): array
    {
        return [
            ['Port Louis', 'Port Louis', -20.1609, 57.5012],
            ['Curepipe', 'Plaines Wilhems', -20.3160, 57.5261],
            ['Quatre Bornes', 'Plaines Wilhems', -20.2654, 57.4791],
            ['Vacoas', 'Plaines Wilhems', -20.2981, 57.4783],
            ['Phoenix', 'Plaines Wilhems', -20.2833, 57.5000],
            ['Beau Bassin', 'Plaines Wilhems', -20.2233, 57.4661],
            ['Rose Hill', 'Plaines Wilhems', -20.2419, 57.4680],
            ['Moka', 'Moka', -20.2181, 57.4964],
            ['Saint Pierre', 'Moka', -20.2167, 57.5211],
            ['Quartier Militaire', 'Moka', -20.2333, 57.5667],
            ['Grand Baie', 'Riviere du Rempart', -20.0136, 57.5804],
            ['Trou aux Biches', 'Pamplemousses', -20.0333, 57.5450],
            ['Triolet', 'Pamplemousses', -20.0500, 57.5500],
            ['Pamplemousses', 'Pamplemousses', -20.1042, 57.5722],
            ['Terre Rouge', 'Pamplemousses', -20.1281, 57.5225],
            ['Goodlands', 'Riviere du Rempart', -20.0367, 57.6494],
            ['Riviere du Rempart', 'Riviere du Rempart', -20.1053, 57.6836],
            ['Centre de Flacq', 'Flacq', -20.1897, 57.7136],
            ['Belle Mare', 'Flacq', -20.1917, 57.7736],
            ['Bel Air Riviere Seche', 'Flacq', -20.2578, 57.7472],
            ['Mahebourg', 'Grand Port', -20.4081, 57.7000],
            ['Rose Belle', 'Grand Port', -20.4008, 57.6000],
            ['Plaine Magnien', 'Grand Port', -20.4269, 57.6797],
            ['Souillac', 'Savanne', -20.5167, 57.5167],
            ['Chemin Grenier', 'Savanne', -20.4869, 57.4644],
            ['Flic en Flac', 'Black River', -20.2747, 57.3628],
            ['Bambous', 'Black River', -20.2597, 57.4064],
            ['Tamarin', 'Black River', -20.3256, 57.3706],
            ['Albion', 'Black River', -20.2078, 57.4028],
            ['Le Morne', 'Black River', -20.4550, 57.3200],
        ];
    }
};
