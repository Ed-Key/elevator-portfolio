import { BIO, CAPABILITIES, COMPANIES, CONTACT, EXPERIENCE } from '../config/portfolioContent'

// Floor bodies. Every element carrying data-reveal is staggered in by the
// floor-transition timeline in PortfolioModal.

function GitHubIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" height="16" viewBox="0 0 16 16" width="16">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  )
}

function ResumeIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
    </svg>
  )
}

export function HomeFloor() {
  return (
    <article className="floor floor--home">
      <p className="floor__kicker" data-reveal>
        Full-stack developer · Applied AI
      </p>
      <h1 className="home-name" data-reveal>
        Edward <span className="home-name__accent">Kiboma</span>
      </h1>
      <p className="home-lede" data-reveal>
        I build web products end to end from the <em>New York / New Jersey</em> area. I started in
        ed-tech at Tufts, and shipping things people actually use is still the whole point.
      </p>
      <ul className="home-links" data-reveal>
        <li>
          <a href={CONTACT.github.url} rel="noreferrer" target="_blank">
            <GitHubIcon />
            GitHub
          </a>
        </li>
        <li>
          <a href={CONTACT.linkedin.url} rel="noreferrer" target="_blank">
            <LinkedInIcon />
            LinkedIn
          </a>
        </li>
        <li>
          <a href={CONTACT.resume.url} rel="noreferrer" target="_blank">
            <ResumeIcon />
            Resume
          </a>
        </li>
      </ul>
      <div className="companies" data-reveal>
        <span className="companies__label">Previously</span>
        <ul className="companies__list">
          {COMPANIES.map((company, index) => (
            <li key={company.id}>
              {index > 0 && (
                <span aria-hidden="true" className="companies__slash">
                  /
                </span>
              )}
              {company.wordmark ? (
                <img
                  alt={company.name}
                  className="companies__wordmark"
                  src={company.wordmark}
                  style={company.wordmarkHeight ? { height: `${company.wordmarkHeight}px` } : undefined}
                />
              ) : (
                <>
                  <span aria-hidden="true" className="companies__chip">
                    {company.logo ? <img alt="" src={company.logo} /> : company.initial}
                  </span>
                  <span className="companies__name">{company.name}</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <p className="home-meta" data-reveal>
        <span aria-hidden="true" className="lantern">
          <span className="lantern__glyph" />
        </span>
        Open to work
      </p>
      <figure className="home-portrait" data-reveal>
        <img alt="Edward Kiboma laughing while holding his dog" decoding="async" src="/images/eddie.jpg" />
        <figcaption>The developer in question w/ P.P. (doggy)</figcaption>
      </figure>
    </article>
  )
}

export function AboutFloor() {
  return (
    <article className="floor floor--about">
      <div className="about-bio">
        {BIO.map((paragraph) => (
          <p data-reveal key={paragraph.slice(0, 24)}>
            {paragraph}
          </p>
        ))}
      </div>
      <div className="about-side">
        <section aria-label="Experience" data-reveal>
          <h3 className="side-heading">Experience</h3>
          <ul className="experience">
            {EXPERIENCE.map((job) => (
              <li key={job.company}>
                <span className="experience__company">{job.company}</span>
                <span className="experience__role">{job.role}</span>
                <span className="experience__period">{job.period}</span>
              </li>
            ))}
          </ul>
        </section>
        <section aria-label="Capabilities" data-reveal>
          <h3 className="side-heading">Capabilities</h3>
          <ul className="capabilities">
            {CAPABILITIES.map((group) => (
              <li key={group.label}>
                <span className="capabilities__label">{group.label}</span>
                <span className="capabilities__items">{group.items}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  )
}

export function ContactFloor() {
  return (
    <article className="floor floor--contact">
      <p className="floor__kicker" data-reveal>
        Ground floor — doors open
      </p>
      <a className="contact-email" data-reveal href={`mailto:${CONTACT.email}`}>
        {CONTACT.email}
      </a>
      <p className="contact-line" data-reveal>
        Looking for a full-time role. If you’re building something good, email me.
      </p>
      <ul className="home-links" data-reveal>
        <li>
          <a href={CONTACT.github.url} rel="noreferrer" target="_blank">
            <GitHubIcon />
            GitHub
          </a>
        </li>
        <li>
          <a href={CONTACT.linkedin.url} rel="noreferrer" target="_blank">
            <LinkedInIcon />
            LinkedIn
          </a>
        </li>
        <li>
          <a href={CONTACT.resume.url} rel="noreferrer" target="_blank">
            <ResumeIcon />
            Resume
          </a>
        </li>
      </ul>
    </article>
  )
}
