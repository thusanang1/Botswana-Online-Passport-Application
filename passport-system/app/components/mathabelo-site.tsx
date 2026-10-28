'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Check, Clock3, Mail, MapPin, Menu, Phone, ShieldCheck, Sparkles, X } from 'lucide-react'

const services = [
  { name: 'Cattle slaughtering', description: 'Professional slaughtering handled with care, hygiene and respect for every animal.', price: 'From P450 / head', featured: true },
  { name: 'Beef cutting & trimming', description: 'Clean, accurate cuts prepared to your preferred specification for retail or home use.', price: 'From P180 / head' },
  { name: 'Cold storage', description: 'Reliable chilled holding space to keep your products fresh and ready for collection.', price: 'From P35 / day' },
  { name: 'Carcass processing', description: 'End-to-end handling, weighing and preparation for farmers, butchers and businesses.', price: 'Custom quote' },
]

export function MathabeloSite() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="mathabelo-site">
      <header className="site-header">
        <div className="site-container header-inner">
          <Link href="#home" className="brand" onClick={() => setMenuOpen(false)} aria-label="Mathabelo Abbatoirs home">
            <span className="brand-mark">M</span>
            <span><strong>Mathabelo</strong><small>ABBATOIRS</small></span>
          </Link>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#about" onClick={() => setMenuOpen(false)}>About us</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            <a className="nav-cta" href="https://wa.me/26774000000" target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={16} /></a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-texture" aria-hidden="true" />
          <div className="site-container hero-inner">
            <div className="hero-copy">
              <p className="eyebrow"><span /> Proudly serving Botswana</p>
              <h1>Good meat starts with <em>good care.</em></h1>
              <p className="hero-lede">Trusted, hygienic and professional abattoir services for farmers, families and businesses across Botswana.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#services">View our services <ArrowUpRight size={18} /></a>
                <a className="button button-ghost" href="#contact">Get in touch</a>
              </div>
              <div className="hero-proof"><span><Check size={15} /> Hygienic processing</span><span><Check size={15} /> Reliable service</span></div>
            </div>
            <div className="hero-card" aria-label="Mathabelo service promise">
              <div className="hero-card-icon"><ShieldCheck size={28} /></div>
              <p className="eyebrow">Our promise</p>
              <h2>Handled with care from farm to table.</h2>
              <p>We combine skilled people, clean facilities and dependable service to give you peace of mind.</p>
              <a href="#about">Why choose Mathabelo <ArrowUpRight size={16} /></a>
            </div>
          </div>
        </section>

        <section className="stats-strip">
          <div className="site-container stats-grid"><div><strong>01</strong><span>Professional<br />handling</span></div><div><strong>02</strong><span>Clean &amp; controlled<br />environment</span></div><div><strong>03</strong><span>Local service<br />you can trust</span></div><div><strong>04</strong><span>Fair, transparent<br />pricing</span></div></div>
        </section>

        <section className="section services-section" id="services">
          <div className="site-container">
            <div className="section-heading"><div><p className="eyebrow">What we do</p><h2>Services made simple.</h2></div><p>Whether you are a farmer, butcher or family, our team is here to make every step clear and dependable.</p></div>
            <div className="services-grid">{services.map((service, index) => <article className={`service-card ${service.featured ? 'featured' : ''}`} key={service.name}><span className="service-number">0{index + 1}</span><h3>{service.name}</h3><p>{service.description}</p><div className="service-footer"><strong>{service.price}</strong><a href="#contact" aria-label={`Enquire about ${service.name}`}><ArrowUpRight size={17} /></a></div></article>)}</div>
            <p className="pricing-note">Prices are indicative and may vary by animal size, volume and requirements. Contact us for a tailored quote.</p>
          </div>
        </section>

        <section className="section about-section" id="about"><div className="site-container about-grid"><div className="about-image"><div className="about-badge"><Sparkles size={17} /><span>Built on<br /><strong>trust</strong></span></div></div><div className="about-copy"><p className="eyebrow">About Mathabelo</p><h2>A better standard for local meat processing.</h2><p>Mathabelo Abbatoirs is a local service partner committed to clean, careful and dependable meat processing. We work with people who value quality, straightforward service and doing things the right way.</p><p>From the moment livestock arrives to the final collection, our team keeps safety, hygiene and respect at the centre of every job.</p><a className="text-link" href="#contact">Talk to our team <ArrowUpRight size={16} /></a></div></div></section>

        <section className="section contact-section" id="contact"><div className="site-container"><div className="contact-intro"><div><p className="eyebrow">Come say hello</p><h2>Let&apos;s talk about<br /><em>your next job.</em></h2></div><p>Have a question, need a quote or want to book a service? Reach out to us directly.</p></div><div className="contact-grid"><div className="contact-details"><a href="https://wa.me/26774000000" target="_blank" rel="noreferrer" className="contact-item"><span className="contact-icon">W</span><span><small>WhatsApp us</small><strong>+267 74 000 000</strong></span><ArrowUpRight size={18} /></a><a href="mailto:hello@mathabelo.co.bw" className="contact-item"><span className="contact-icon"><Mail size={18} /></span><span><small>Email us</small><strong>hello@mathabelo.co.bw</strong></span><ArrowUpRight size={18} /></a><div className="contact-item"><span className="contact-icon"><Clock3 size={18} /></span><span><small>Opening hours</small><strong>Mon – Sat, 7:00 – 17:00</strong></span></div><div className="contact-item"><span className="contact-icon"><MapPin size={18} /></span><span><small>Find us</small><strong>Mathabelo Abbatoirs, Botswana</strong></span></div></div><div className="map-wrap"><iframe title="Map showing Mathabelo Abbatoirs location in Botswana" src="https://www.openstreetmap.org/export/embed.html?bbox=25.85%2C-24.72%2C25.95%2C-24.62&layer=mapnik" loading="lazy" /><a href="https://www.openstreetmap.org/?mlat=-24.67&mlon=25.90#map=13/-24.67/25.90" target="_blank" rel="noreferrer" className="map-link">Open larger map <ArrowUpRight size={15} /></a></div></div></div></section>
      </main>

      <footer className="site-footer"><div className="site-container footer-inner"><Link href="#home" className="brand"><span className="brand-mark">M</span><span><strong>Mathabelo</strong><small>ABBATOIRS</small></span></Link><p>Professional abattoir services, proudly local.</p><div><a href="tel:+26774000000"><Phone size={15} /> Call us</a><a href="mailto:hello@mathabelo.co.bw"><Mail size={15} /> Email</a></div></div><div className="site-container footer-bottom"><span>© {new Date().getFullYear()} Mathabelo Abbatoirs. All rights reserved.</span><span>Made for quality. Made in Botswana.</span></div></footer>
    </div>
  )
}
