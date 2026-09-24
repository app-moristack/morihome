import { t } from '@/i18n'
import { useLocale } from '@/hooks/useLocale'
import { Mail, MessageCircle } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/layout/PageHeader'
import { bootstrap } from '@/lib/bootstrap'
import { buildWhatsappUrl } from '@/lib/whatsapp'

type Section = { heading: string; body: string[] }

const CONTENT: Record<string, { title: string; intro: string; sections: Section[] }> = {
  about: {
    title: 'About MoriHome',
    intro:
      'MoriHome is a Mauritian platform for trusted home services and properties for rent or sale. We make it easier to find a reliable tradesperson or your next property in one place.',
    sections: [
      {
        heading: 'Why we review every professional',
        body: [
          'Anyone can publish a listing on an open directory. We take a different approach: every professional submits their details, and our team checks them before the profile becomes searchable.',
          'That means slower growth for us, and fewer wasted calls for you.',
        ],
      },
      {
        heading: 'How we rank results',
        body: [
          'Results are ordered by relevance to the service you asked for and by how close the professional is to the location you entered. Distance is calculated from real coordinates, not from a postal area.',
          'We show a professional’s town or village publicly. We never publish their exact home address.',
        ],
      },
      {
        heading: 'What we are building next',
        body: [
          'Customer reviews and quote requests are on the roadmap. MoriHome is available in English and French.',
        ],
      },
    ],
  },
  contact: {
    title: 'Contact us',
    intro: 'Questions about your listing, a profile you found, or the platform itself? We read everything.',
    sections: [
      {
        heading: 'For professionals',
        body: [
          'If your registration is taking longer than expected, or you need to correct details on an approved profile, get in touch and we will look at your account.',
        ],
      },
      {
        heading: 'For customers',
        body: [
          'If a listed professional behaved unprofessionally, tell us. We suspend listings that stop meeting our standards.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro:
      'These terms govern the use of MoriHome. By searching the directory or registering a profile, you accept them.',
    sections: [
      {
        heading: 'What MoriHome is',
        body: [
          'MoriHome is a directory. We introduce customers to professionals. We are not a party to any agreement, quotation, or work carried out between them, and we do not supervise that work.',
          'Any contract for work is between you and the professional you contact.',
        ],
      },
      {
        heading: 'Listing a profile',
        body: [
          'Professionals must provide accurate details and keep them up to date. Profiles are reviewed before publication and may be rejected or suspended if the information is inaccurate, misleading, or if we receive credible complaints.',
          'Changing identity, location or service details on an approved profile returns it to review.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Do not scrape the directory, submit false listings, impersonate another business, or use contact details for unsolicited marketing.',
        ],
      },
      {
        heading: 'Liability',
        body: [
          'The directory is provided as-is. We take reasonable care in reviewing listings, but we do not guarantee the quality, licensing, insurance or availability of any professional.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    intro: 'This explains what MoriHome collects, why, and what we do not do with it.',
    sections: [
      {
        heading: 'What we collect from professionals',
        body: [
          'The details you enter when you register: your name or business name, phone and WhatsApp number, optional email, your address and its coordinates, the services you offer, and any images you upload.',
          'Your address and exact coordinates are used to calculate distance. They are never shown publicly — the public profile shows your town or village and an approximate map position only.',
        ],
      },
      {
        heading: 'What we collect from visitors',
        body: [
          'Searching does not require an account. When you tap a WhatsApp button we record that a contact happened, which professional it was for, and which service category — so professionals can see how many leads they receive.',
          'We do not record, read or store the content of your WhatsApp messages. Those go directly between you and the professional.',
        ],
      },
      {
        heading: 'Your location',
        body: [
          'If you use the "current location" button, your browser asks your permission first. The coordinates are used for that search and are not stored against your identity.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You can ask us what we hold about you, correct it, or ask us to delete your account and listing. Contact us and we will action it.',
        ],
      },
    ],
  },
}

export default function StaticPage({ slug }: { slug: string }) {
  useLocale()
  const page = CONTENT[slug]

  if (!page) {
    return null
  }

  const supportWhatsapp = buildWhatsappUrl({
    number: bootstrap.supportWhatsapp,
    serviceName: 'the MoriHome directory',
  })

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <PageHeader title={t(page.title)} description={t(page.intro)} />

      <div className="mt-8 flex flex-col gap-8">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-bold text-ink-900">{t(section.heading)}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-sm leading-relaxed text-ink-600">
                {t(paragraph)}
              </p>
            ))}
          </section>
        ))}
      </div>

      {slug === 'contact' ? (
        <div className="card mt-8 flex flex-col gap-3 p-5">
          <a
            href={`mailto:${bootstrap.supportEmail}`}
            className="inline-flex min-h-11 items-center gap-2.5 font-semibold text-ink-800 hover:text-ink-900"
          >
            <Mail className="size-5 text-ink-400" aria-hidden />
            {bootstrap.supportEmail}
          </a>
          {supportWhatsapp ? (
            <a
              href={supportWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2.5 font-semibold text-ink-800 hover:text-ink-900"
            >
              <MessageCircle className="size-5 text-ink-400" aria-hidden />
              {t('Message us on WhatsApp')}
            </a>
          ) : null}
        </div>
      ) : null}

      <p className="mt-10 text-sm text-ink-500">
        <Link to="/" className="font-semibold text-ink-900 underline underline-offset-2">
          {t('Back to MoriHome')}
        </Link>
      </p>
    </div>
  )
}
