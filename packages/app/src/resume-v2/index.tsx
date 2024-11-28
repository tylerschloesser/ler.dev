import {
  faGithub,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons'
import {
  faBriefcase,
  faCode,
  faDiploma,
  faEnvelope,
  faGlobe,
  faHeadSideGear,
} from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import QRCode from 'react-qr-code'
import { Fragment } from 'react/jsx-runtime'
import { Canvas } from './canvas'

export function ResumeV2() {
  return (
    <div className="min-h-dvh grid grid-cols-[1fr_2fr_1fr] grid-rows-[min-content_1fr]">
      <div className="bg-white flex justify-end">
        <a href="https://ty.ler.dev/qr/resume">
          <QRCode
            value="https://ty.ler.dev/qr/resume"
            className="h-32 w-32 p-2"
          />
        </a>
      </div>
      <div
        className={clsx(
          'bg-black text-white flex items-center',
          'border-x border-dashed border-white',
        )}
      >
        <h2 className="text-4xl p-10 uppercase tracking-wider">
          <span className="font-bold">Tyler</span>{' '}
          <span className="font-thin">Schloesser</span>{' '}
          <FontAwesomeIcon icon={faCode} />
        </h2>
      </div>
      <div className="bg-black" />
      <div className="bg-black">
        <Canvas />
      </div>
      <div
        className={clsx(
          'p-8 border-x border-dashed border-black',
        )}
      >
        <h3 className="text-lg font-bold uppercase">
          <FontAwesomeIcon icon={faHeadSideGear} /> About
        </h3>
        <p>
          I'm a frontend engineer with a passion for
          building user interfaces that are both beautiful
          and functional. I have experience with a variety
          of technologies and am always looking to learn
          more.
        </p>
        <p>
          I'm a frontend engineer with a passion for
          building user interfaces that are both beautiful
          and functional. I have experience with a variety
          of technologies and am always looking to learn
          more.
        </p>
        <section>
          <h3 className="text-lg font-bold uppercase">
            <FontAwesomeIcon icon={faBriefcase} />{' '}
            Experience
          </h3>
          <div className="flex flex-col gap-2">
            <div>
              <h3 className="font-bold">
                Principal Engineer
              </h3>
              <div>RPI Print &middot; 2024 - Present</div>
              <ul>
                <li>
                  &bull; Launched BookWright Online in Nov
                  2024
                </li>
                <li>&bull; Migrated to AWS and TeamCity</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">Indie GameDev</h3>
              <div>2023 - 2024</div>
              <ul>
                <li>
                  &bull; Hacked on mobile game prototypes
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">
                Senior Frontend Engineer
              </h3>
              <div>
                AWS Supply Chain &middot; 2022 - 2023
              </div>
              <ul>
                <li>
                  &bull; Launched AWS Supply Chain in Nov
                  2023
                </li>
                <li>
                  &bull; Led micro-frontend development
                  across 3 teams
                </li>
                <li>
                  &bull; React, TypeScript, Single SPA,
                  Cypress, AppSync, ...
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">
                Senior Software Engineer
              </h3>
              <div>Kindle Vella &middot; 2019 - 2022</div>
              <ul>
                <li>
                  &bull; Launched Kindle Vella in June 2021
                </li>
                <li>
                  &bull; Founding member. Led frontend
                  development across 2 teams. Led
                  microcurrency development. teams
                </li>
                <li>
                  &bull; React, Redux, GraphQL, Cypress, ...
                </li>
                <li>
                  &bull; Led microcurrency development
                </li>
                <li>
                  &bull; Java, Spring, DynamoDB, SQS, ...
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold">
                Software Engineer
              </h3>
              <div>
                Amazon Publishing &middot; 2014 - 2019
              </div>
              <ul>
                <li>&bull; TODO</li>
              </ul>
            </div>
          </div>
        </section>
        <section>
          <h3 className="text-lg font-bold uppercase">
            Skills
          </h3>
          <div className="grid grid-cols-[auto_1fr] gap-1">
            {[
              {
                label: 'React',
                value: 10,
              },
              {
                label: 'TypeScript',
                value: 10,
              },
              {
                label: 'CSS',
                value: 9,
              },
              {
                label: 'Testing',
                value: 8,
              },
              {
                label: 'AWS',
                value: 8,
              },
            ].map(({ label, value }, i) => (
              <Fragment key={i}>
                <span>{label}</span>
                <div className="flex items-center">
                  <span className="relative flex border-2 border-slate-600 w-32 h-4">
                    <span
                      className="absolute inset-0 bg-blue-600"
                      style={{
                        width: `${value * 10}%`,
                      }}
                    />
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-lg font-bold uppercase">
            <FontAwesomeIcon icon={faDiploma} /> Education
          </h3>
          <div className="font-bold">
            University of Minnesota - Twin Cities
          </div>
          <div>B.S. Computer Science</div>
          <div>2010 - 2014</div>
        </section>
      </div>
      <div className="p-8">
        <Links />
      </div>
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
