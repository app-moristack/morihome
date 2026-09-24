<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
        ]);

        if (! app()->isProduction()) {
            $this->call([
                DemoProviderSeeder::class,
                DemoPropertySeeder::class,
                DemoListingImageSeeder::class,
                DemoMixedAgencySeeder::class,
            ]);
        }

        $this->command->comment('Seeding complete.');
    }
}
