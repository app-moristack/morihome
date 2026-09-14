<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_user_id')->constrained('subscription_user')->restrictOnDelete();
            $table->string('purpose', 20);
            $table->string('property_type', 40);
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->unsignedBigInteger('price_rupees');
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();
            $table->decimal('area_sqm', 10, 2)->nullable();
            $table->boolean('is_furnished')->nullable();
            $table->string('address');
            $table->string('locality', 120);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('status', 20)->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['provider_id', 'purpose', 'status']);
            $table->index(['purpose', 'status', 'locality']);
            $table->index(['purpose', 'status', 'price_rupees']);
        });

        Schema::create('property_listing_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_listing_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('caption')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['property_listing_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_listing_images');
        Schema::dropIfExists('property_listings');
    }
};
