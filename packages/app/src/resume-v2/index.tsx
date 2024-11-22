import clsx from 'clsx'

export function ResumeV2() {
  return (
    <div>
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
          </h2>
          <h2 className="text-lg flex flex-col">
            <span>Frontend</span>
            <span>Engineer</span>
          </h2>
        </div>
      </div>
      <div className="text-justify">
        <div className="p-4 max-w-screen-sm mx-auto flex flex-col gap-2 border-dashed border-x border-slate-800">
          <h3 className="text-lg font-bold">Who am I?</h3>
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
        </div>
      </div>
      <section>
        <h3>RPI Print</h3>
        <div>Principal Engineer</div>
        <div>2024 - Present</div>
        <ul>
          <li>Launched BookWright Online in Nov 2024</li>
          <li>Migrated to AWS and TeamCity</li>
        </ul>
      </section>
      <section>
        <h3>GameDev</h3>
        <div>2023 - 2024</div>
        <ul>
          <li>Hacked on mobile game prototypes</li>
        </ul>
      </section>
      <section>
        <h3>Amazon</h3>
        <div>Senior Frontend Engineer</div>
        <div>2014 - 2023</div>
        <ul>
          <li>Launched AWS Supply Chain in Nov 2023</li>
          <li>Launched Kindle Vella in June 2021</li>
        </ul>
      </section>
    </div>
  )
}
