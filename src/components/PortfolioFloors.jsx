import { BIO, CAPABILITIES, CONTACT, EXPERIENCE, PROJECTS } from '../config/portfolioContent'

// Floor bodies. Every element carrying data-reveal is staggered in by the
// floor-transition timeline in PortfolioModal.

export function HomeFloor() {
  return (
    <article className="floor floor--home">
      <p className="floor__kicker" data-reveal>
        Full-stack developer · Applied AI
      </p>
      <h1 className="home-name" data-reveal>
        <span className="home-name__line">Edward</span>
        <span className="home-name__line home-name__line--indent">Kiboma</span>
      </h1>
      <p className="home-lede" data-reveal>
        Based in <em>New York / New Jersey</em>, I build products end to end — React frontends,
        cloud backends, and AI features that hold up in production.
      </p>
      <p className="home-meta" data-reveal>
        <span aria-hidden="true" className="lantern">
          <span className="lantern__glyph" />
        </span>
        Open to work · Previously GoDaddy &amp; Matrices.ai
      </p>
      <figure className="home-portrait" data-reveal>
        <img alt="Edward Kiboma laughing while holding his dog" decoding="async" src="/images/eddie.jpg" />
        <figcaption>The developer in question w/ P.P. (doggy)</figcaption>
      </figure>
    </article>
  )
}

export function ProjectsFloor() {
  return (
    <article className="floor floor--projects" aria-label="Selected projects">
      <ul className="directory">
        {PROJECTS.map((project, index) => {
          const inner = (
            <>
              <span className="directory__num" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="directory__main">
                <span className="directory__name">
                  {project.name}
                  {project.url && (
                    <span className="directory__arrow" aria-hidden="true">
                      ↗
                    </span>
                  )}
                </span>
                <span className="directory__blurb">{project.blurb}</span>
              </span>
              <span className="directory__meta">
                <span className="directory__stack">{project.stack}</span>
                <span className="directory__year">{project.year}</span>
              </span>
            </>
          )

          return (
            <li key={project.id} data-reveal>
              {project.url ? (
                <a className="directory__row" href={project.url} rel="noreferrer" target="_blank">
                  {inner}
                </a>
              ) : (
                <div className="directory__row">{inner}</div>
              )}
            </li>
          )
        })}
      </ul>
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
        Open to full-time roles and <em>interesting collaborations</em>.
      </p>
      <ul className="contact-links" data-reveal>
        <li>
          <a href={CONTACT.github.url} rel="noreferrer" target="_blank">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </li>
        <li>
          <a href={CONTACT.linkedin.url} rel="noreferrer" target="_blank">
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>
    </article>
  )
}
