<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $table = config('permission.table_names.roles', 'roles');

        foreach (UserRole::values() as $role) {
            DB::table($table)->updateOrInsert(
                ['name' => $role, 'guard_name' => 'web'],
                ['created_at' => $now, 'updated_at' => $now],
            );
        }
    }

    public function down(): void
    {
        DB::table(config('permission.table_names.roles', 'roles'))
            ->whereIn('name', UserRole::values())
            ->delete();
    }
};
