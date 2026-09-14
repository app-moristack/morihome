<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeding_keeps_only_configured_admin_and_preserves_regular_users(): void
    {
        config(['morihome.admin.email' => 'admin@morihome.mu', 'morihome.admin.password' => 'test-admin-password']);
        $oldAdmin = User::factory()->create(['phone' => config('morihome.support_whatsapp')]);
        $oldAdmin->assignRole(UserRole::Admin->value);
        $oldAdmin->createToken('old-admin-token');
        $noEmailAdmin = User::factory()->withoutEmail()->create();
        $noEmailAdmin->assignRole(UserRole::Admin->value);
        $regularUser = User::factory()->create();

        $this->seed(AdminSeeder::class);

        $admin = User::where('email', 'admin@morihome.mu')->sole();
        $this->assertTrue($admin->isAdmin());
        $this->assertTrue(Hash::check('test-admin-password', $admin->password));
        $this->assertNotNull($admin->email_verified_at);
        $this->assertModelMissing($oldAdmin);
        $this->assertModelMissing($noEmailAdmin);
        $this->assertModelExists($regularUser);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $oldAdmin->id, 'tokenable_type' => User::class]);

        config(['morihome.admin.password' => 'updated-test-password']);
        $this->seed(AdminSeeder::class);

        $this->assertSame($admin->id, User::role(UserRole::Admin->value)->sole()->id);
        $this->assertTrue(Hash::check('updated-test-password', $admin->fresh()->password));
        $this->assertSame(2, User::count());
    }
}
