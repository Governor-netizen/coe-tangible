import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.jpeg";
import "./Footer.css";

/* ─────────────────────────────────────────────
   Social icon SVG mini-components
   ───────────────────────────────────────────── */
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#0A0C10" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

/* ─────────────────────────────────────────────
   Navigation data
   ───────────────────────────────────────────── */
const navColumns = [
  {
    title: "Navigation",
    links: ["Home", "Machines", "3D Viewer", "Courses", "Lab Simulations"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API Reference", "Tutorials", "Research Papers", "Model Library"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Contact", "Blog", "Press Kit"],
  },
  {
    title: "Socials",
    links: ["Twitter / X", "GitHub", "LinkedIn", "YouTube", "Instagram"],
  },
];

const socialIcons = [
  { icon: <TwitterIcon />, label: "Twitter", href: "#" },
  { icon: <GithubIcon />, label: "GitHub", href: "https://github.com/Governor-netizen/coe-tangible" },
  { icon: <LinkedInIcon />, label: "LinkedIn", href: "#" },
  { icon: <YoutubeIcon />, label: "YouTube", href: "#" },
  { icon: <InstagramIcon />, label: "Instagram", href: "#" },
];

/* ─────────────────────────────────────────────
   Footer Component
   ───────────────────────────────────────────── */
export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  /* Intersection observer for scroll-reveal */
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer
      ref={footerRef}
      id="tangible-footer"
      className="footer-root"
    >
      {/* ── Grain texture overlay ── */}
      <div className="footer-grain" aria-hidden="true" />

      {/* ── Oversized background word ── */}
      <div
        className={`footer-bg-word ${isVisible ? "footer-bg-word--visible" : ""}`}
        aria-hidden="true"
      >
        TANGIBLE
      </div>

      {/* ── Ambient glow orbs ── */}
      <div className="footer-glow footer-glow--1" aria-hidden="true" />
      <div className="footer-glow footer-glow--2" aria-hidden="true" />

      {/* ── Main content grid ── */}
      <div
        className={`footer-content ${isVisible ? "footer-content--visible" : ""}`}
      >
        {/* Left column */}
        <div className="footer-left">
          <div className="footer-brand">
            <img
              alt="Tangible Logo"
              className="footer-brand__logo"
              src={logo}
            />
            <span className="footer-brand__name">Tangible</span>
            <span className="footer-brand__badge">3D</span>
          </div>

          <p className="footer-tagline">
            Engineering education,<br />
            <span className="footer-tagline__accent">reimagined in 3D.</span>
          </p>

          <p className="footer-desc">
            Interactive models designed to transform how students in Africa
            understand electrical machines — from lecture halls to spatial
            mastery.
          </p>

          {/* Newsletter */}
          <form onSubmit={handleSubscribe} className="footer-newsletter">
            <div className="footer-newsletter__field">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="footer-newsletter__input"
                required
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="footer-newsletter__btn"
              >
                {subscribed ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                )}
              </button>
            </div>
            {subscribed && (
              <span className="footer-newsletter__success">
                Welcome aboard ✦
              </span>
            )}
          </form>

          {/* Social icons */}
          <div className="footer-socials">
            {socialIcons.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="footer-socials__icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Right columns */}
        <div className="footer-nav">
          {navColumns.map((col, colIdx) => (
            <div
              key={col.title}
              className="footer-nav__col"
              style={{ transitionDelay: `${(colIdx + 2) * 0.1}s` }}
            >
              <h4 className="footer-nav__title">{col.title}</h4>
              <ul className="footer-nav__list">
                {col.links.map((link, linkIdx) => (
                  <li key={link} style={{ transitionDelay: `${(colIdx * 5 + linkIdx) * 0.03 + 0.3}s` }}>
                    <a href="#" className="footer-nav__link">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className={`footer-bottom ${isVisible ? "footer-bottom--visible" : ""}`}
      >
        <span className="footer-bottom__copy">
          © {new Date().getFullYear()} Tangible — Built for engineering education in Africa
        </span>
        <div className="footer-bottom__links">
          <a href="#" className="footer-bottom__link">Privacy</a>
          <a href="#" className="footer-bottom__link">Terms</a>
          <a href="#" className="footer-bottom__link">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
