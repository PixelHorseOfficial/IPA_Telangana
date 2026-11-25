import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

/* ---- edit the links here (change "to" / "href" to your real routes and profiles) ---- */
const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Activities", to: "/" },
  { label: "Central Executive Council", to: "/" },
  { label: "Divisions", to: "/" },
  { label: "Publications", to: "/" },
];

const divisions = [
  { label: "Industrial Pharmacy", to: "/" },
  { label: "Hospital Pharmacy", to: "/" },
  { label: "Community Pharmacy", to: "/" },
  { label: "Regulatory Affairs", to: "/" },
  { label: "Education Division", to: "/" },
  { label: "Students' Forum", to: "/" },
];

const follow = [
  { label: "Facebook", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "X", href: "#" },
];

const legal = [
  { label: "Privacy", to: "/" },
  { label: "Terms", to: "/" },
  { label: "Sitemap", to: "/" },
];

// the giant wordmark: every letter is its own span so GSAP can lift them in one after another
const MARK = "IPA TELANGANA";

export default function Footer() {
  const rootRef = useRef(null);
  const boxRef = useRef(null);
  const lineRef = useRef(null);

  /* ---------- make the wordmark fill the full width, at any screen size ---------- */
  useLayoutEffect(() => {
    const box = boxRef.current;
    const line = lineRef.current;

    const fit = () => {
      line.style.fontSize = "100px";                       // measure at a known size…
      const w = line.getBoundingClientRect().width;
      if (w > 0) line.style.fontSize = (100 * box.clientWidth) / w + "px"; // …then scale to the box
    };

    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); // re-fit once the display font has loaded
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  /* ---------- scroll-in: columns rise, wordmark letters lift out of a mask ---------- */
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      gsap.from(".ft-col", {
        opacity: 0, y: 36, duration: 0.8, stagger: 0.12, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".ft-grid", start: "top 90%", once: true },
      });
      gsap.from(".ft-ch", {
        yPercent: 110, duration: 1.1, stagger: 0.05, ease: "power4.out", clearProps: "transform",
        scrollTrigger: { trigger: ".ft-mark", start: "top 96%", once: true },
      });
      gsap.from(".ft-bottom", {
        opacity: 0, duration: 0.9, ease: "power2.out", clearProps: "all",
        scrollTrigger: { trigger: ".ft-bottom", start: "top 99%", once: true },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const toTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer" ref={rootRef}>
      <div className="ft-bg" aria-hidden="true"></div>

      <div className="ft-inner">
        {/* top: brand on the left, link columns on the right */}
        <div className="ft-grid">
          <div className="ft-col ft-brand">
            <Link to="/" className="ft-logo" aria-label="Indian Pharmaceutical Association, Telangana — home">
              <img src="/images/logo.png" alt="Indian Pharmaceutical Association, Telangana / Hyderabad" />
            </Link>
            <p className="ft-about-text">
              India&apos;s premier national body for pharmacists — empowering the profession since 1939 through education, research and advocacy.
            </p>
            <address className="ft-contact">
              <span>IPA House, Kalina, Santacruz (E),<br />Mumbai - 400 098</span>
              <a href="tel:+912226670820">+91 22 2667 0820</a>
              <a href="mailto:ipa@ipapharma.org">ipa@ipapharma.org</a>
            </address>
            <Link to="/membership" className="ft-btn">
              Become a Member <span aria-hidden="true">→</span>
            </Link>
          </div>

          <nav className="ft-col" aria-label="Quick links">
            <h4>Quick Links</h4>
            <ul>
              {quickLinks.map((l) => (
                <li key={l.label}><Link className="ft-link" to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className="ft-col" aria-label="Divisions">
            <h4>Divisions</h4>
            <ul>
              {divisions.map((l) => (
                <li key={l.label}><Link className="ft-link" to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav className="ft-col" aria-label="Follow us">
            <h4>Follow</h4>
            <ul>
              {follow.map((l) => (
                <li key={l.label}>
                  <a className="ft-link" href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* giant wordmark, scaled to the full width; letters rise from a mask on scroll */}
        <div className="ft-mark" ref={boxRef} aria-label="IPA Telangana">
          <span className="ft-mark-line" ref={lineRef} aria-hidden="true">
            {MARK.split("").map((c, i) => (
              <span className="ft-ch" key={i}>{c === " " ? "\u00a0" : c}</span>
            ))}
          </span>
        </div>

        {/* bottom bar */}
        <div className="ft-bottom">
          <div className="ft-credit">
            <span>© {new Date().getFullYear()} The Indian Pharmaceutical Association (IPA). All rights reserved.</span>
            <span>Designed by <b>PixelHorse</b></span>
          </div>
          <div className="ft-bottom-right">
            <ul className="ft-legal">
              {legal.map((l) => (
                <li key={l.label}><Link to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
            <button type="button" className="ft-top-btn" onClick={toTop} aria-label="Back to top">
              Back to top <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}