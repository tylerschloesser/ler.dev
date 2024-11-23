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
import { Fragment } from 'react/jsx-runtime'
import qrResume from '../qr-resume.svg'

export function ResumeV2() {
  return (
    <div className="min-h-dvh flex flex-col">
      <div
        className={clsx(
          'bg-slate-800 text-white',
          'uppercase tracking-widest',
        )}
      >
        <div
          className={clsx(
            'flex',
            'max-w-screen-sm mx-auto',
            'p-4 flex gap-2',
          )}
        >
          <h2 className="text-4xl">
            <span className="font-bold">Tyler</span>{' '}
            <span className="font-thin">Schloesser</span>
            <FontAwesomeIcon icon={faCode} />
          </h2>
          <h2 className="text-lg flex flex-col">
            <span>Frontend</span>
            <span>Engineer</span>
          </h2>
        </div>
      </div>
      <div className="self-center flex-1 flex max-w-screen-lg">
        <div className="hidden sm:flex flex-1 p-2 border-r border-dashed border-slate-500">
          <section>
            <a href="https://ty.ler.dev/qr/resume">
              <img src={qrResume} />
            </a>
          </section>
        </div>
        <div className="flex-[3] p-2">
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
          <section className="p-2">
            <div className="grid grid-cols-[auto_1fr] gap-1">
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
              ].map(
                ({ icon, href, ariaLabel, label }, i) => (
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
                ),
              )}
            </div>
          </section>
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
                  <li>
                    &bull; Migrated to AWS and TeamCity
                  </li>
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
                    &bull; Launched Kindle Vella in June
                    2021
                  </li>
                  <li>
                    &bull; Founding member. Led frontend
                    development across 2 teams. Led
                    microcurrency development. teams
                  </li>
                  <li>
                    &bull; React, Redux, GraphQL, Cypress,
                    ...
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
              <FontAwesomeIcon icon={faDiploma} /> Education
            </h3>
            <div className="font-bold">
              University of Minnesota - Twin Cities
            </div>
            <div>B.S. Computer Science</div>
            <div>2010 - 2014</div>
          </section>
        </div>
      </div>
    </div>
  )
}
