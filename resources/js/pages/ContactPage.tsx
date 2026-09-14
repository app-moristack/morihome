import {
  ChevronRight,
  CircleHelp,
  Clock3,
  Handshake,
  Heart,
  ListFilter,
  Mail,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Send,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { publicApi } from '@/api/endpoints'
import { ApiError } from '@/api/client'
import { bootstrap } from '@/lib/bootstrap'
import { buildWhatsappUrl } from '@/lib/whatsapp'
import heroImage from '../../images/mauritius-luxury-home-about-hero.png'

const FAQS = [
  {
    icon: UserRound,
    question: 'How do I register as a professional?',
    answer: 'Choose “Join as a Pro” and follow the simple registration process.',
  },
  {
    icon: Settings,
    question: 'Is MoriHome free to use?',
    answer:
      'Yes. Finding and contacting professionals is free for customers. MoriHome is also free for individual and self-employed professionals. Agencies and companies pay a yearly subscription, with no commitment or credit card required. Payment is made through Juice to activate the account.',
  },
  {
    icon: CircleHelp,
    question: 'How do I contact a professional?',
    answer: 'Open their profile and contact them directly using the WhatsApp button.',
  },
  {
    icon: ShieldCheck,
    question: 'Do you verify professionals?',
    answer: 'Our team reviews professional profiles before they appear in the directory.',
  },
]

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="contact-eyebrow">
      <span aria-hidden />
      {children}
    </p>
  )
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return <span className="contact-field-icon">{children}</span>
}

export default function ContactPage() {
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const whatsappUrl = buildWhatsappUrl({
    number: bootstrap.supportWhatsapp,
    serviceName: 'MoriHome support',
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)

    setIsSending(true)
    setStatus(null)

    try {
      const response = await publicApi.sendContactMessage({
        name: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        phone: String(form.get('phone') ?? ''),
        subject: String(form.get('subject') ?? 'General question'),
        message: String(form.get('message') ?? ''),
      })

      formElement.reset()
      setStatus({ type: 'success', message: response.message })
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof ApiError
            ? error.message
            : 'We could not send your message. Please try again or contact us by email.',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="contact-page">
      <section className="site-page-hero contact-hero" aria-labelledby="contact-title">
        <img
          src={heroImage}
          alt="A contemporary Mauritian home beneath a mountain at sunset"
          className="contact-hero-image"
          fetchPriority="high"
        />
        <div className="contact-hero-wash" aria-hidden />
        <div className="container-page relative">
          <div className="contact-hero-copy">
            <Eyebrow>Contact us</Eyebrow>
            <h1 id="contact-title">
              We’re here
              <br />
              <span>to help.</span>
            </h1>
            <p>
              Have a question, suggestion or need assistance? Our team is here to help you. Get in touch with
              us and we’ll get back to you as soon as possible.
            </p>
            <div className="contact-promises">
              {[
                { icon: MessagesSquare, label: 'Quick Response' },
                { icon: Handshake, label: 'Friendly Support' },
                { icon: Heart, label: 'Committed to Mauritius' },
              ].map(({ icon: Icon, label }) => (
                <div key={label}>
                  <Icon className="home-illustrated-icon" aria-hidden />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="home-handwritten site-page-hero-note">
            Let’s
            <br />
            Build a Better
            <br />
            Mauritius Together
            <span aria-hidden />
          </p>
        </div>
      </section>

      <section className="container-page contact-main" aria-label="Contact MoriHome">
        <form className="contact-form-card" onSubmit={handleSubmit}>
          <div>
            <h2>Send us a message</h2>
            <p>Fill in the form below and we’ll get back to you shortly.</p>
          </div>

          <label>
            <span className="sr-only">Your name</span>
            <FieldIcon>
              <UserRound aria-hidden />
            </FieldIcon>
            <input name="name" type="text" autoComplete="name" placeholder="Your name *" required />
          </label>
          <label>
            <span className="sr-only">Your email address</span>
            <FieldIcon>
              <Mail aria-hidden />
            </FieldIcon>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Your email address *"
              required
            />
          </label>
          <label>
            <span className="sr-only">Your phone number</span>
            <FieldIcon>
              <MessageCircle aria-hidden />
            </FieldIcon>
            <input name="phone" type="tel" autoComplete="tel" placeholder="Your phone number" />
          </label>
          <label>
            <span className="sr-only">Subject</span>
            <FieldIcon>
              <ListFilter aria-hidden />
            </FieldIcon>
            <select name="subject" defaultValue="General question" required>
              <option>General question</option>
              <option>Professional registration</option>
              <option>Profile or listing support</option>
              <option>Report a concern</option>
              <option>Partnership enquiry</option>
            </select>
          </label>
          <label className="contact-message-field">
            <span className="sr-only">Your message</span>
            <FieldIcon>
              <MessageCircle aria-hidden />
            </FieldIcon>
            <textarea name="message" rows={5} placeholder="Your message *" required />
          </label>

          <button type="submit" className="contact-submit" disabled={isSending}>
            <Send size={18} aria-hidden /> {isSending ? 'Sending…' : 'Send Message'}
          </button>
          {status ? (
            <p
              className={`contact-form-status contact-form-status-${status.type}`}
              role={status.type === 'error' ? 'alert' : 'status'}
            >
              {status.message}
            </p>
          ) : null}
          <p className="contact-response-time">
            <Clock3 size={16} aria-hidden /> We usually respond within 24 hours.
          </p>
        </form>

        <aside className="contact-info-card" aria-labelledby="contact-info-title">
          <div>
            <h2 id="contact-info-title">Contact Information</h2>
            <p>You can also reach us through the following channels.</p>
          </div>
          <div className="contact-info-list">
            <div>
              <span className="contact-info-icon">
                <Mail aria-hidden />
              </span>
              <p>
                <strong>Email</strong>
                <a href={`mailto:${bootstrap.supportEmail}`}>{bootstrap.supportEmail}</a>
                <small>We’ll get back to you soon.</small>
              </p>
            </div>
            <div>
              <span className="contact-info-icon">
                <MapPin aria-hidden />
              </span>
              <p>
                <strong>Service area</strong>
                <span>Mauritius</span>
                <small>Local support, island-wide.</small>
              </p>
            </div>
            <div>
              <span className="contact-info-icon">
                <Clock3 aria-hidden />
              </span>
              <p>
                <strong>Response time</strong>
                <span>Within 24 hours</span>
                <small>Monday to Friday.</small>
              </p>
            </div>
            {whatsappUrl ? (
              <div>
                <span className="contact-info-icon">
                  <MessageCircle aria-hidden />
                </span>
                <p>
                  <strong>WhatsApp</strong>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Chat with us directly
                  </a>
                  <small>Fast, friendly assistance.</small>
                </p>
              </div>
            ) : null}
          </div>
          <div className="contact-island-note">
            <MapPin aria-hidden />
            <p className="home-handwritten">
              Local Solutions
              <br />
              for a Brighter
              <br />
              Mauritius
              <span aria-hidden />
            </p>
          </div>
        </aside>
      </section>

      <section className="contact-faq" aria-labelledby="faq-title">
        <div className="container-page">
          <Eyebrow>Frequently asked questions</Eyebrow>
          <h2 id="faq-title">Quick Answers</h2>
          <div className="contact-faq-grid">
            {FAQS.map(({ icon: Icon, question, answer }) => (
              <details key={question}>
                <summary>
                  <span className="contact-faq-icon">
                    <Icon aria-hidden />
                  </span>
                  <span>
                    <strong>{question}</strong>
                  </span>
                  <ChevronRight aria-hidden />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
