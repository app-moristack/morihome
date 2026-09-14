<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('providers')
            ->where('provider_type', 'business')
            ->update(['provider_type' => 'agency']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Existing agencies cannot be distinguished from merged businesses.
    }
};
