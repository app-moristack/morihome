<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('providers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnUpdate();
            $table->string('provider_type', 20);
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->string('phone', 20);
            $table->string('whatsapp_phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->json('social_links')->nullable();

            $table->string('address');
            $table->string('locality', 120);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->json('service_areas')->nullable();

            $table->string('logo_path')->nullable();
            $table->string('cover_path')->nullable();

            $table->string('approval_status', 20)->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('suspended_at')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_featured')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['approval_status', 'is_active']);
            $table->index(['latitude', 'longitude']);
            $table->index('locality');
            $table->index(['is_featured', 'is_verified']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('providers');
    }
};
