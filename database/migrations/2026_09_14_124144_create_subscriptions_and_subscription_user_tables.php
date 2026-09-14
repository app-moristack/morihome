<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('category', 20);
            $table->string('tier', 20);
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description');
            $table->unsignedInteger('price_rupees')->default(0);
            $table->unsignedTinyInteger('duration_months')->nullable();
            $table->unsignedSmallInteger('active_item_limit');
            $table->unsignedSmallInteger('photos_per_item_limit');
            $table->unsignedTinyInteger('item_duration_months')->nullable();
            $table->boolean('business_verification_eligible')->default(false);
            $table->boolean('priority_in_search')->default(false);
            $table->boolean('featured_items')->default(false);
            $table->boolean('homepage_exposure')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['category', 'tier']);
            $table->index(['is_active', 'sort_order']);
        });

        Schema::create('subscription_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'starts_at', 'ends_at'], 'subscription_user_active_index');
            $table->index(['starts_at', 'created_at'], 'subscription_user_approval_queue_index');
        });

        $this->insertSubscriptions();
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_user');
        Schema::dropIfExists('subscriptions');
    }

    private function insertSubscriptions(): void
    {
        $now = now();
        $plans = [
            ['services', 'free', 'services-free', 'Services Free', 'For individual tradespeople getting started.', 0, null, 1, 3, null, false, false, false, false],
            ['services', 'plus', 'services-plus', 'Services Plus', 'More services and photos with business verification eligibility.', 499, 6, 5, 5, null, true, false, false, false],
            ['services', 'pro', 'services-pro', 'Services Pro', 'Maximum service visibility and capacity.', 999, 6, 15, 10, null, true, true, true, true],
            ['rental', 'free', 'rental-free', 'Rental Free', 'For individuals listing one rental property.', 0, null, 1, 5, 6, false, false, false, false],
            ['rental', 'plus', 'rental-plus', 'Rental Plus', 'More rental listings with featured placement.', 499, 6, 3, 10, 6, true, false, true, false],
            ['rental', 'pro', 'rental-pro', 'Rental Pro', 'Maximum rental visibility and capacity.', 999, 6, 10, 15, 6, true, true, true, true],
            ['sales', 'free', 'sales-free', 'Sales Free', 'For individuals listing one property for sale.', 0, null, 1, 5, 6, false, false, false, false],
            ['sales', 'plus', 'sales-plus', 'Sales Plus', 'More sale listings with featured placement.', 699, 6, 3, 10, 6, true, false, true, false],
            ['sales', 'pro', 'sales-pro', 'Sales Pro', 'Maximum property sale visibility and capacity.', 1199, 6, 10, 15, 6, true, true, true, true],
        ];

        DB::table('subscriptions')->insert(array_map(
            fn (array $plan, int $index): array => [
                'category' => $plan[0],
                'tier' => $plan[1],
                'slug' => $plan[2],
                'name' => $plan[3],
                'description' => $plan[4],
                'price_rupees' => $plan[5],
                'duration_months' => $plan[6],
                'active_item_limit' => $plan[7],
                'photos_per_item_limit' => $plan[8],
                'item_duration_months' => $plan[9],
                'business_verification_eligible' => $plan[10],
                'priority_in_search' => $plan[11],
                'featured_items' => $plan[12],
                'homepage_exposure' => $plan[13],
                'is_active' => true,
                'sort_order' => $index + 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            $plans,
            array_keys($plans),
        ));
    }
};
