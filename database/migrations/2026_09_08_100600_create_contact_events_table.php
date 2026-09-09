<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained()->cascadeOnUpdate();
            $table->foreignId('service_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('channel', 20);
            $table->string('source', 30)->nullable();
            $table->string('session_hash', 64)->nullable();
            $table->timestamps();

            $table->index(['provider_id', 'created_at']);
            $table->index(['channel', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_events');
    }
};
