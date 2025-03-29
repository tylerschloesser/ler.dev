import {
  IconDefinition,
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons'
import {
  faEnvelope,
  faGlobe,
} from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import React, { Suspense } from 'react'
import { Fragment } from 'react/jsx-runtime'

const HeroBackground = React.lazy(
  () => import('./hero-background.tsx'),
)

function Divider({ className }: { className?: string }) {
  return <hr className={clsx(className, 'text-gray-400')} />
}

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
      company: 'AWS Supply Chain',
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
      company: 'Kindle Vella',
      title: 'Senior Software Engineer',
      date: '2018 - 2022',
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
    <Section title="Experience">
      <div className="flex flex-col gap-4">
        {DATA.experience.map(
          ({ company, title, date, bullets }, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <h3 className="flex items-center justify-between">
                <span className="font-bold text-lg">
                  {title}
                </span>
                <span className="text-nowrap">{date}</span>
              </h3>
              <div className="font-semibold text-base">
                {company}
              </div>
              <ul className="list-disc list-outside pl-4">
                {bullets.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
            </div>
          ),
        )}
      </div>
    </Section>
  )
}

type SectionProps = React.PropsWithChildren<{
  title: string
}>

function Section({ title, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-serif font-light tracking-wider">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  )
}

function KeywordSection() {
  return (
    <Section title="Keywords">
      <div className="flex flex-col gap-2">
        {DATA.keywords.map(({ title, bullets }, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="font-bold text-xs">
              {title}:
            </div>
            <ul className="flex flex-wrap gap-1 text-sm">
              {bullets.map((content, j) => (
                <li
                  key={j}
                  className="py-0.5 px-2.5 rounded-full border-2 border-gray-400"
                >
                  {content}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

function EducationSection() {
  return (
    <Section title="Education">
      <div className="font-bold">
        University of Minnesota -{' '}
        <span className="text-nowrap">Twin Cities</span>
      </div>
      <div className="text-sm">
        <div>B.S. Computer Science</div>
        <div>2010 - 2014</div>
      </div>
    </Section>
  )
}

function Hero() {
  return (
    <div className="relative bg-black text-white overflow-hidden">
      <Suspense>
        <HeroBackground />
      </Suspense>
      <div className="relative">
        <div className="p-4 md:p-8">
          <span className="flex justify-center">
            <h1 className="text-xl md:text-2xl font-bold tracking-wider font-mono text-center">
              {'<h1>Tyler Schloesser</h1>'}
            </h1>
          </span>
        </div>
      </div>
    </div>
  )
}

function AboutSection() {
  return (
    <Section title="About">
      <p>
        <span className="font-bold">Frontend Engineer</span>{' '}
        with 11 years of experience. Aspiring indie game
        dev. <br className="not-print:hidden" /> I love to
        craft delightful user experiences. Able and eager to
        solve hard problems. Let's build something.
      </p>
    </Section>
  )
}

export function Resume() {
  return (
    <>
      <Hero />
      <div className="p-4 md:p-8 print:text-sm">
        <div className="flex flex-col md:grid grid-cols-[3fr_1fr] gap-4">
          <div className="flex flex-col gap-4">
            <AboutSection />
            <Divider />
            <ExperienceSection />
          </div>
          <Divider className="md:hidden" />
          <div className="flex flex-col gap-4">
            <KeywordSection />
            <Divider />
            <EducationSection />
            <Divider />
            <LinkSection />
          </div>
        </div>
      </div>
    </>
  )
}

function LinkSection() {
  const links = [
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
  ] satisfies {
    icon: IconDefinition
    href: string
    ariaLabel: string
    label: string
  }[]
  return (
    <Section title="Links">
      <div className="grid grid-cols-[auto_1fr] gap-2 text-sm">
        {links.map(
          ({ icon, href, ariaLabel, label }, i) => (
            <Fragment key={i}>
              <div
                className="flex items-center justify-center"
                aria-hidden
              >
                <FontAwesomeIcon icon={icon} />
              </div>
              <div>
                <a
                  className="underline"
                  href={href}
                  aria-label={ariaLabel}
                >
                  {label}
                </a>
              </div>
            </Fragment>
          ),
        )}
      </div>
    </Section>
  )
}
