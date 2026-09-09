<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_service_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained()->cascadeOnUpdate();
            $table->foreignId('service_category_id')->constrained()->cascadeOnUpdate();
            $table->string('specialty')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->unique(['provider_id', 'service_category_id']);
            $table->index('service_category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_service_category');
    }
};
