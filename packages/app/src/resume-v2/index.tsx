import {
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons'
import {
  faBriefcase,
  faDiploma,
  faEnvelope,
  faGlobe,
  faSearch,
} from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Fragment } from 'react/jsx-runtime'

interface Data {
  experience: {
    company: string
    title: string
    date: string
    bullets: string[]
  }[]
  keywords: {
    title: string
    bullets: string[]
  }[]
}

const DATA: Data = {
  experience: [
    {
      company: 'RPI Print',
      title: 'Principal Engineer',
      date: '2024 - Present',
      bullets: [
        'Led migration to AWS, eliminating website downtime and lead time in spinning up new new services.',
        'Led migration to CI/CD, reducing release cadence from weeks to days.',
        'Introduced operations metrics and processes, reducing error rates by 90% and MTTR from days to hours.',
        'Re-focused engineering org from re-building to re-purposing, eliminating 6 months of calendar time allocated to re-building systems with minimal business impact.',
        'Led network architecture redesign to allow legacy on-prem services to co-exist with newer AWS services.',
        'Led design system implementation in collaboration with design team. Reduced design review and QA tickets by 90%.',
      ],
    },
    {
      company: 'AWS Supply Chain (Amazon)',
      title: 'Senior Frontend Engineer',
      date: '2022 - 2023',
      bullets: [
        'Launched AWS Supply Chain at 2022 re:Invent.',
        'Led refactoring of shared micro-frontend dependencies in order to unblock major version upgrades.',
        'Led effort to ensure UI consistency across 3 micro-frontend teams by re:Invent launch.',
        'Led e2e test coverage, eliminating need for manual QA during prod release.',
        'Led migration to Backend for Frontend, mitigating cross team dependencies and reducing API latency by 50%.',
      ],
    },
    {
      company: 'Kindle Vella (Amazon)',
      title: 'Senior Software Engineer',
      date: '2019 - 2022',
      bullets: [
        'Launched Kindle Vella in 2020.',
        'Designed and built virtual currency, Amazon’s first to be available via Android and iOS in-app purchase.',
        'Led frontend development across web and mobile via web-views.',
      ],
    },
  ],
  keywords: [
    {
      title: "I'm exceptional at",
      bullets: [
        'TypeScript',
        'React',
        'HTML & CSS',
        'AWS & CDK',
        'Testing',
        'CI/CD',
      ],
    },
    {
      title: "I'm very good at",
      bullets: [
        'Playwright',
        'Redux',
        'GraphQL',
        'Java',
        'Spring',
        'Tailwind',
      ],
    },
    {
      title: "I'd love to get better at",
      bullets: [
        'UX Design',
        'A/B Testing',
        'Telemetry',
        'Realtime',
        'Microinteractions',
      ],
    },
  ],
}

function ExperienceSection() {
  return (
    <section>
      <div className="flex flex-col gap-2">
        {DATA.experience.map(
          ({ company, title, date, bullets }, i) => (
            <div key={i}>
              <h3 className="text-lg">
                <span className="font-semibold">
                  {title}
                </span>{' '}
                &middot;{' '}
                <span className="font-light">{date}</span>
              </h3>
              <div>{company}</div>
              <ul>
                {bullets.map((bullet, j) => (
                  <li key={j}>&bull; {bullet}</li>
                ))}
              </ul>
            </div>
          ),
        )}
      </div>
    </section>
  )
}

function KeywordSection() {
  return (
    <section>
      <div className="grid grid-cols-3">
        {DATA.keywords.map(({ title, bullets }, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="font-bold">{title}</div>
            <ul>
              {bullets.map((content, j) => (
                <li key={j}>{content}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function EducationSection() {
  return (
    <section>
      <div className="font-bold">
        University of Minnesota - Twin Cities
      </div>
      <div>B.S. Computer Science</div>
      <div>2010 - 2014</div>
    </section>
  )
}

export function ResumeV2() {
  return (
    <div className="p-8">
      <ExperienceSection />
      <KeywordSection />
      <EducationSection />
    </div>
  )
}

function Links() {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-2">
      {[
        {
          icon: faGlobe,
          href: 'https://ty.ler.dev',
          ariaLabel: 'Link to my website',
          label: 'ty.ler.dev',
        },
        {
          icon: faGithub,
          href: 'https://github.com/tylerschloesser',
          ariaLabel: 'Link to my GitHub profile',
          label: 'github.com/tylerschloesser',
        },
        {
          icon: faLinkedin,
          href: 'https://linkedin.com/in/tyler-schloesser',
          ariaLabel: 'Link to my LinkedIn profile',
          label: 'linkedin.com/in/tyler-schloesser',
        },
        {
          icon: faEnvelope,
          href: 'mailto:tyler.schloesser+resume@gmail.com',
          ariaLabel: 'Send me an email',
          label: 'tyler.schloesser@gmail.com',
        },
      ].map(({ icon, href, ariaLabel, label }, i) => (
        <Fragment key={i}>
          <div
            className="flex items-center justify-center text-xl"
            aria-hidden
          >
            <FontAwesomeIcon icon={icon} />
          </div>
          <div>
            <a
              className="text-blue-600 underline"
              href={href}
              aria-label={ariaLabel}
            >
              {label}
            </a>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
