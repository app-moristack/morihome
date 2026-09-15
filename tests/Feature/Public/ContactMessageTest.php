<?php

namespace Tests\Feature\Public;

use App\Mail\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_valid_contact_message_is_sent_to_support_and_returns_202(): void
    {
        Mail::fake();
        config(['morihome.support_email' => 'moristack@gmail.com']);

        $response = $this->postJson('/api/v1/contact-message', [
            'name' => 'Alex Martin',
            'email' => 'alex@example.com',
            'phone' => '+230 5707 9335',
            'subject' => 'Profile or listing support',
            'message' => 'Please help me update my professional listing.',
        ]);

        $response
            ->assertAccepted()
            ->assertExactJson([
                'message' => 'Your message has been sent. We will get back to you shortly.',
            ]);

        Mail::assertSent(ContactMessage::class, function (ContactMessage $mail): bool {
            return $mail->hasTo('moristack@gmail.com')
                && $mail->hasReplyTo('alex@example.com', 'Alex Martin')
                && $mail->senderPhone === '+230 5707 9335'
                && $mail->subjectLine === 'Profile or listing support'
                && $mail->bodyText === 'Please help me update my professional listing.';
        });
    }

    public function test_invalid_contact_message_returns_422_and_sends_no_mail(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/contact-message', [
            'name' => '',
            'email' => 'not-an-email',
            'subject' => 'Unknown subject',
            'message' => 'short',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'subject', 'message']);

        Mail::assertNothingSent();
    }

    public function test_contact_message_escapes_html_in_the_email(): void
    {
        $mail = new ContactMessage(
            senderName: '<script>alert("name")</script>',
            senderEmail: 'alex@example.com',
            senderPhone: null,
            subjectLine: 'General question',
            bodyText: '<script>alert("message")</script>',
        );

        $mail
            ->assertSeeInHtml('&lt;script&gt;alert(&quot;name&quot;)&lt;/script&gt;', false)
            ->assertSeeInHtml('&lt;script&gt;alert(&quot;message&quot;)&lt;/script&gt;', false);
    }
}
