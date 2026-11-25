import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Navbar.css";

/* ---- the menu: every item scrolls to a section of the homepage (no other pages) ----
   "target" = the id of the section it scrolls to. Special targets:
     "top"     = very top of the page (hero)
     "about"   = the "About IPA" state of the hero
     "contact" = the contact form
   Edit the labels / targets here. */
const MENU = [
  { label: "Home", target: "top" },
  { label: "About", target: "about" },
  { label: "Membership", target: "membership" },
  { label: "Meetings", target: "leadership" },
  { label: "Latest News", target: "news" },
  { label: "Resources", target: "affiliation" },
  { label: "Advocacy Corner", target: "objectives" },
  { label: "Activities", target: "events" },
];

/* sections watched to highlight the current menu item while scrolling (in page order) */
const SPY_IDS = ["objectives", "events", "membership", "affiliation", "news", "leadership", "contact"];

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [current, setCurrent] = useState("top");   // which section is on screen right now
  // "intro" -> logo animation playing, "done" -> normal navbar
  const [phase, setPhase] = useState(() => (prefersReduced() ? "done" : "intro"));

  const location = useLocation();
  const navigate = useNavigate();

  const navRef = useRef(null);
  const glassRef = useRef(null);
  const navLogoRef = useRef(null);
  const introLogoRef = useRef(null);
  const introBgRef = useRef(null);

  /* ---------- LOGO INTRO ----------
     1) the logo builds up from the bottom edge on a white screen
     2) the white screen collapses upward until it is exactly the navbar bar,
        while the logo flies and shrinks onto the real (left) logo spot
     3) in ONE frame the intro layer is removed and the real navbar logo shows -> no flicker, no double logo */
  useLayoutEffect(() => {
    if (phase !== "intro") return; // runs once on mount only
    const logoEl = introLogoRef.current;
    const navEl = navLogoRef.current;
    const glassEl = glassRef.current;
    const bgEl = introBgRef.current;
    let ctx;

    const run = () => {
      ctx = gsap.context(() => {
        // measure BEFORE any transform is applied
        const from = logoEl.getBoundingClientRect();
        const to = navEl.getBoundingClientRect();
        const barH = glassEl.getBoundingClientRect().height;
        const vh = bgEl.getBoundingClientRect().height;

        const tl = gsap.timeline({
          onComplete: () => {
            window.__introDone = true;
            setPhase("done"); // intro layer removed + real logo shown in the same commit
            window.dispatchEvent(new Event("intro:done"));
          },
        });

        // 1) build up from the bottom edge
        tl.fromTo(
          logoEl,
          { clipPath: "inset(100% 0% 0% 0%)", y: 40 },
          { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.3, ease: "power3.out" }
        )
          // 2) short hold
          .to({}, { duration: 0.35 })
          // 3) logo flies + shrinks onto the navbar logo spot…
          .to(logoEl, {
            x: to.left - from.left,
            y: to.top - from.top,
            scale: to.height / from.height,
            transformOrigin: "0 0",
            duration: 1.1,
            ease: "power3.inOut",
          })
          // …while the white cover collapses upward into the navbar bar (same timing, same ease)
          .fromTo(
            bgEl,
            { clipPath: "inset(0px 0px 0px 0px)" },
            { clipPath: `inset(0px 0px ${vh - barH}px 0px)`, duration: 1.1, ease: "power3.inOut" },
            "<"
          );
      });
    };

    if (logoEl.complete && logoEl.naturalWidth) run();
    else logoEl.addEventListener("load", run, { once: true });

    return () => {
      logoEl.removeEventListener("load", run);
      ctx && ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- scroll: glass effect, progress bar, and "which section am I in" ---------- */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);

      if (location.pathname !== "/") { setCurrent(null); return; }
      let cur = "top";
      const heroST = ScrollTrigger.getAll().find((s) => s.trigger && s.trigger.classList && s.trigger.classList.contains("hero"));
      if (heroST && window.scrollY > heroST.start + (heroST.end - heroST.start) * 0.5) cur = "about";
      SPY_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) cur = id;
      });
      setCurrent(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    const onEscape = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  // lock scroll while mobile menu is open OR intro is playing
  // (html has scrollbar-gutter: stable in Navbar.css, so the page does not jump when the scrollbar hides)
  useEffect(() => {
    document.body.style.overflow = menuOpen || phase === "intro" ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, phase]);

  const closeAll = () => setMenuOpen(false);

  /* ---------- smooth scroll to a section ---------- */
  const targetY = (id) => {
    if (id === "top") return 0;
    const all = ScrollTrigger.getAll();

    if (id === "about") {                               // end of the hero pin = the full "About IPA" state
      const hero = document.querySelector(".hero");
      const st = all.find((s) => s.trigger === hero);
      return st ? st.end : 0;
    }
    if (id === "contact") {                             // far enough into the pinned contact section that the form is open
      const stage = document.querySelector(".ct-stage");
      const st = all.find((s) => s.trigger === stage);
      if (st) return st.start + (st.end - st.start) * 0.92;
    }
    const el = document.getElementById(id);
    if (!el) return null;
    const barH = glassRef.current ? glassRef.current.offsetHeight : 104;
    return el.getBoundingClientRect().top + window.scrollY - barH;
  };

  const goTo = (id) => {
    closeAll();
    const run = () => {
      const y = targetY(id);
      if (y == null) return;
      if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 });   // same eased scroller as the page
      else window.scrollTo({ top: y, behavior: "smooth" });
    };
    if (location.pathname !== "/") {                    // coming from another route: go home first, then scroll
      navigate("/");
      setTimeout(run, 900);
    } else {
      run();
    }
  };

  const onAnchor = (id) => (e) => {
    e.preventDefault();
    goTo(id);
  };

  const glassClass = "navbar-glass" + (phase === "intro" ? " pre" : "");
  const activeItem = MENU.find((m) => m.target === current);   // first menu item that points at the current section

  return (
    <>
      {phase !== "done" && (
        <div className="intro" aria-hidden="true">
          <div ref={introBgRef} className="intro-bg" />
          <img ref={introLogoRef} src="/images/logo.png" alt="" className="intro-logo" />
        </div>
      )}

      <div className="scroll-progress" style={{ width: `${progress}%` }} />

      <header ref={navRef} className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className={glassClass} ref={glassRef}>
          {/* logo: left side of the bar (on the homepage it scrolls back to the top) */}
          <Link
            to="/"
            className="logo"
            onClick={(e) => { if (location.pathname === "/") onAnchor("top")(e); else closeAll(); }}
          >
            <img ref={navLogoRef} src="/images/logo.png" alt="IPA Logo" className="logo-img" />
          </Link>

          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>

          {/* desktop: one row on the right of the bar. mobile: the same items stack inside the drawer */}
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <button className="mobile-close" onClick={closeAll}>✕</button>

            <div className="nav-group">
              {MENU.map((item, i) => (
                <div key={item.label} className="nav-item" style={{ "--d": `${i * 60}ms` }}>
                  <a
                    href={`#${item.target}`}
                    className={activeItem === item ? "active" : ""}
                    onClick={onAnchor(item.target)}
                  >
                    {item.label}
                  </a>
                </div>
              ))}

              <div className="nav-actions">
                {/* OB Login is the only link that still opens a different page */}
                <Link to="/ob-login" className="login-btn" onClick={closeAll}>OB Login</Link>
                <a href="#contact" className="contact-btn" onClick={onAnchor("contact")}>Contact Us</a>
              </div>
            </div>
          </nav>
        </div>

        <div className={`nav-overlay ${menuOpen ? "show" : ""}`} onClick={closeAll} />
      </header>
    </>
  );
}