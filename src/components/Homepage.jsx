import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useSmoothScroll from "./useSmoothScroll";
import "./Homepage.css";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true }); // mobile address bar showing/hiding must not re-measure the pins

// splits a sentence into <span>s so GSAP can colour it word by word
const words = (t) =>
  t.split(" ").map((w, i) => (
    <span key={i} className="reveal-word">{w} </span>
  ));

// clickable, but never leaves the page: scrolls to a section on this same page instead of navigating
const goTo = (id) => (e) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: "smooth" });
};

const objectives = [
  { img: "/images/objective-1.png", name: "Education", title: "Promoting Pharmacy Education", meta: [["FOR", "STUDENTS"], ["VIA", "TRAINING"]], desc: "Supporting quality pharmacy education, training and skill development for students and professionals across Hyderabad." },
  { img: "/images/objective-2.png", name: "Research", title: "Supporting Pharmaceutical Research", meta: [["FOR", "SCIENTISTS"], ["VIA", "INNOVATION"]], desc: "Encouraging research, innovation and scientific development in pharmaceutical sciences and drug discovery." },
  { img: "/images/objective-3.png", name: "Standards", title: "Improving Professional Standards", meta: [["FOR", "PRACTITIONERS"], ["VIA", "ETHICS"]], desc: "Upholding ethics, best practices and high professional standards for pharmacists in practice, industry and academia." },
  { img: "/images/objective-4.png", name: "Awareness", title: "Encouraging Healthcare Awareness", meta: [["FOR", "COMMUNITY"], ["VIA", "HEALTH CAMPS"]], desc: "Organising health camps, awareness drives and public health programmes for the community." },
  { img: "/images/objective-5.png", name: "Community", title: "Building Pharmacist Communities", meta: [["FOR", "MEMBERS"], ["VIA", "NETWORKING"]], desc: "Connecting pharmacists, students, educators and industry leaders on one strong professional platform." },
];

// if an image is not found as given, try the same name with these extensions
const IMG_FALLBACK_EXT = [".jpg", ".jpeg", ".webp"];

// image onError: try the same name with other extensions, then hide it
const imgFallback = (src) => (e) => {
  const el = e.currentTarget;
  const tried = Number(el.dataset.tried || 0);
  if (tried < IMG_FALLBACK_EXT.length) {
    el.dataset.tried = String(tried + 1);
    el.src = src.replace(/\.\w+$/, IMG_FALLBACK_EXT[tried]);
  } else {
    el.style.display = "none";
  }
};

// affiliation logos: same fallback, but a logo that cannot load removes its whole slot (no empty gap in the strip)
const affFallback = (src) => (e) => {
  const el = e.currentTarget;
  const tried = Number(el.dataset.tried || 0);
  if (tried < IMG_FALLBACK_EXT.length) {
    el.dataset.tried = String(tried + 1);
    el.src = src.replace(/\.\w+$/, IMG_FALLBACK_EXT[tried]);
  } else {
    const slot = el.closest(".aff-logo");
    if (slot) slot.style.display = "none";
    else el.style.display = "none";
  }
};

// Activity types (the four cards, images: /images/activity-1.png ... activity-4.png). `key` links them to the events below.
const categories = [
  { key: "conference", img: "/images/activity-1.png", tag: "Conference", name: "Pharmacy Conferences", desc: "National and regional gatherings where pharmacists, researchers and industry share advances in practice and policy." },
  { key: "seminar", img: "/images/activity-2.png", tag: "Seminar / Workshop", name: "Seminars & Workshops", desc: "Focused talks and hands-on sessions on clinical skills, regulation and emerging pharmacy practice." },
  { key: "ce", img: "/images/activity-3.png", tag: "CE Programme", name: "Continuing Education", desc: "Programmes that help pharmacists keep their knowledge and skills up to date throughout their careers." },
  { key: "camp", img: "/images/activity-4.png", tag: "Health Camp", name: "Health Awareness Campaigns", desc: "Community camps and drives that take pharmacists into the public health conversation." },
];

// SAMPLE upcoming events (img = card photo) — replace with your real events (or load them from your Django API).
const events = [
  { id: 1, img: "/images/event-1.png", key: "conference", day: "12", mon: "DEC", year: "2026", title: "IPA Annual Pharmacy Conference", venue: "Hyderabad", time: "9:30 AM" },
  { id: 2, img: "/images/event-2.png", key: "seminar", day: "20", mon: "DEC", year: "2026", title: "Workshop on Good Pharmacy Practice", venue: "Hyderabad", time: "10:00 AM" },
  { id: 3, img: "/images/event-3.png", key: "ce", day: "09", mon: "JAN", year: "2027", title: "Clinical Pharmacy Update — CE Programme", venue: "Hyderabad", time: "10:00 AM" },
  { id: 4, img: "/images/event-4.png", key: "camp", day: "24", mon: "JAN", year: "2027", title: "Community Health Awareness Camp", venue: "Hyderabad", time: "8:00 AM" },
  { id: 5, img: "/images/event-1.png", key: "seminar", day: "07", mon: "FEB", year: "2027", title: "Seminar on Drug Regulation & Compliance", venue: "Hyderabad", time: "11:00 AM" },
];

// Membership tiers. Edit the wording to match IPA's real categories (fees are intentionally left out).
const tiers = [
  { id: "student", tag: "For students", name: "Student Membership", desc: "For pharmacy students who want to learn from the profession early and build a network before they graduate.",
    points: ["Open to B.Pharm, Pharm.D and M.Pharm students", "Access to seminars, workshops and student events", "Mentoring and career guidance from practitioners"] },
  { id: "professional", tag: "Most popular", name: "Professional Membership", featured: true, desc: "For practising pharmacists, educators, researchers and industry professionals across Telangana.",
    points: ["Priority registration for conferences and CE programmes", "Voice in professional and policy matters", "Networking with pharmacists, academia and industry"] },
  { id: "life", tag: "Lifetime", name: "Life Membership", desc: "A one-time commitment to the profession, for members who want to stay connected with IPA for life.",
    points: ["Lifelong access to all member benefits", "No yearly renewals", "Recognition within the IPA community"] },
];

const benefits = [
  "Discounted entry to conferences, seminars and workshops",
  "Continuing education programmes to keep skills current",
  "Networking with pharmacists, educators and industry leaders",
  "Updates on regulations, policy and professional news",
  "Opportunities to join health camps and community drives",
  "Part of a national body of over 20,000 members",
];

// Put your 4 logos in /public/images/ with these names (or change the paths).
const affiliations = [
  { img: "/images/affiliation-1.png", name: "World Health Organization" },
  { img: "/images/affiliation-2.jpg", name: "FIP – International Pharmaceutical Federation" },
  { img: "/images/affiliation-3.jpg", name: "FAPA – Federation of Asian Pharmaceutical Associations" },
  { img: "/images/affiliation-4.jpg", name: "Commonwealth Pharmacists Association" },
  { img: "/images/affiliation-g.png", name: "Commonwealth Pharmacists Association" },
];

// Dates are taken from the upload folder of each post (2024/10, 2024/09) — change to exact dates if you have them.
// `href` is kept for reference only; clicking a row opens a popup on this page instead of leaving it.
const news = [
  { title: "Notice: IPA Counting Communication Members", tag: "Notice", date: "OCT 2024", href: "https://ipa-goa.org/notice/", file: "PDF" },
  { title: "Duplicate Issuance", tag: "Latest News", date: "9 OCT 2024", href: "https://ipa-goa.org/duplicate-issuance/", file: "PDF" },
  { title: "Issuance of Duplicate Ballot Paper", tag: "Latest News", date: "OCT 2024", href: "https://ipa-goa.org/issuance-of-duplicate-ballot-paper/", file: "PDF" },
  { title: "IPA Final Contestants", tag: "Latest News", date: "26 SEP 2024", href: "https://ipa-goa.org/ipa-final-contestants/", file: "IMAGE" },
  { title: "Notice – Goa State Branch Elections 2024", tag: "News", date: "SEP 2024", href: "https://ipa-goa.org/notice-goa-state-branch-elections-2024/", file: "PDF" },
  { title: "Notice – IPA Goa Elections 2024", tag: "News", date: "SEP 2024", href: "https://ipa-goa.org/notice-ipa-goa-elections-2024/", file: "PDF" },
];

// Leadership & Committee — images: /public/images/leader-1.png ... leader-5.png. Replace the names with the real office bearers.
const leaders = [
  { img: "/images/leader-1.jpg", name: "Dr. R. N. Gupta", role: "National President" },
  { img: "/images/leader-2.jpeg", name: "DR. Subhash Mandal", role: "National. Hon. Gen. Secretary" },
  { img: "/images/leader-3.jpeg", name: "Dr. Anuradha Majumdar", role: "Editor-Pharma Times" },
  { img: "/images/leader-4.jpeg", name: "Dr. Ramesh adepu", role: "Hospital Pharmacy Division" },
  { img: "/images/leader-5.jpeg", name: "Mr. M. Vasudev Rao", role: "Industrial Pharmacy Division" },
];

// splits a heading into blurred words (they sharpen one after the other on scroll)
const blurWords = (t) =>
  t.split(" ").map((w, i) => (
    <span key={i} className="ldr-word">{w}&nbsp;</span>
  ));

/* A strip that drifts to the LEFT on its own (right -> left) and can be dragged either way with mouse or finger.
   `ref` = the clipping wrapper; its first child is the track holding two identical sets (that is what makes the loop seamless). */
function useDragMarquee(ref, speed) {
  useEffect(() => {
    const marquee = ref.current;
    if (!marquee) return;
    const track = marquee.firstElementChild;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const SPEED = reduce ? 0 : speed;   // auto-drift in px per second (moves left)
    let x = 0;                          // current offset of the track
    let half = 0;                       // width of ONE set (the strip loops after this)
    let vel = 0;                        // throw speed after letting go (px per second)
    let dragging = false, hovering = false;
    let startX = 0, startPos = 0, lastX = 0, lastT = 0;

    const measure = () => { half = track.scrollWidth / 2; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("load", measure);

    // keep x inside one set so the loop never runs out
    const wrap = (v) => {
      if (half <= 0) return v;
      v %= half;
      return v > 0 ? v - half : v;
    };

    const tick = (_, deltaTime) => {
      const dt = Math.min(deltaTime, 50) / 1000;
      if (!dragging) {
        if (!hovering) x -= SPEED * dt;                 // gentle auto-drift (paused while the mouse rests on it)
        x += vel * dt;                                  // momentum from a drag…
        vel *= Math.exp(-4 * dt);                       // …that fades out
        if (Math.abs(vel) < 2) vel = 0;
      }
      x = wrap(x);
      track.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    gsap.ticker.add(tick);

    const down = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      vel = 0;
      startX = lastX = e.clientX;
      startPos = x;
      lastT = e.timeStamp;
      marquee.classList.add("is-dragging");
      marquee.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!dragging) return;
      x = startPos + (e.clientX - startX);
      const dtMs = e.timeStamp - lastT;
      if (dtMs > 0) vel = vel * 0.6 + ((e.clientX - lastX) / dtMs) * 1000 * 0.4;   // smoothed pointer speed
      lastX = e.clientX;
      lastT = e.timeStamp;
    };
    const up = (e) => {
      if (!dragging) return;
      dragging = false;
      marquee.classList.remove("is-dragging");
      if (e.timeStamp - lastT > 90) vel = 0;            // held still before letting go = no throw
      vel = Math.max(-3000, Math.min(3000, vel));
    };
    const enter = (e) => { if (e.pointerType === "mouse") hovering = true; };
    const leave = () => { hovering = false; };

    marquee.addEventListener("pointerdown", down);
    marquee.addEventListener("pointermove", move);
    marquee.addEventListener("pointerup", up);
    marquee.addEventListener("pointercancel", up);
    marquee.addEventListener("pointerenter", enter);
    marquee.addEventListener("pointerleave", leave);

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      window.removeEventListener("load", measure);
      marquee.removeEventListener("pointerdown", down);
      marquee.removeEventListener("pointermove", move);
      marquee.removeEventListener("pointerup", up);
      marquee.removeEventListener("pointercancel", up);
      marquee.removeEventListener("pointerenter", enter);
      marquee.removeEventListener("pointerleave", leave);
    };
  }, []);
}

export default function Homepage() {
  useSmoothScroll();   // smooth, eased scrolling between sections (Lenis)
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const heroRef = useRef(null);
  const objRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(-1);

  // events section
  const evRef = useRef(null);
  const memRef = useRef(null);
  const affRef = useRef(null);
  const newsRef = useRef(null);
  const ldrRef = useRef(null);
  const ctRef = useRef(null);
  const affMarqRef = useRef(null);   // logo strip
  const ldrMarqRef = useRef(null);   // members' photo strip
  const regNameRef = useRef(null);
  const [regEvent, setRegEvent] = useState(null);      // event being registered for
  const [newsItem, setNewsItem] = useState(null);      // news item shown in the popup (stays on this page)
  const [reg, setReg] = useState({ name: "", email: "", phone: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: POST { ...form } to your Django API here
    alert("Thank you! Your message has been sent to IPA Telangana.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  /* ---------- HERO: zoom + blur -> About transition, driven by the scroll position ----------
     The timeline is scrubbed by the scrollbar (not played by a timer), so a fast scroll can never
     run ahead of / behind the animation: scrolling down plays it, scrolling up rewinds it. */
  useLayoutEffect(() => {
    const hero = heroRef.current;

    // GSAP remembers the scroll position and restores it after a reload, which made the
    // page open already on the About state. Wipe that memory and always start at the top.
    ScrollTrigger.clearScrollMemory("manual");
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const toTopOnUnload = () => window.scrollTo(0, 0);
    window.addEventListener("beforeunload", toTopOnUnload);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: () => "+=" + (window.innerWidth <= 900 ? 800 : 1100), // scroll distance the transition takes (smaller = faster)
          pin: true,
          scrub: 0.6,               // small smoothing so it follows the scroll softly
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // markers: true,         // <- uncomment to debug
        },
        onUpdate: () => hero.classList.toggle("is-two", tl.time() > 1.1),
      });

      tl.to(".hero-inner-1", { opacity: 0, duration: 0.65, ease: "none" }, 0)
        .to(".hero-bg", { scale: 1.08, duration: 0.8, ease: "power1.out" }, 0)
        .to(".hero-bg", { filter: "blur(18px)", duration: 0.7, ease: "none" }, 0)
        .to(".hero-veil", { opacity: 0.6, duration: 0.6, ease: "none" }, 0.45)
        .set(".hero-panel-2", { opacity: 1 }, 1.1)
        .fromTo(".p2-line-in", { yPercent: 110 }, { yPercent: 0, duration: 0.45, stagger: 0.22, ease: "power2.out" }, 1.15)
        .fromTo(".p2-right", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "power2.out" }, 1.35)
        .to(".hero-veil", { opacity: 1, duration: 0.3, ease: "none" }, 1.55)
        .fromTo(".p2-eyebrow", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 1.65)
        .fromTo(
          ".reveal-word",
          { color: "rgba(13,20,69,0.18)" },
          { color: "#0d1445", stagger: 0.012, duration: 0.3, ease: "none" },
          1.6
        );
    }, heroRef);

    // after the navbar intro / image load: re-measure every trigger
    const remeasure = () => ScrollTrigger.refresh();
    window.addEventListener("intro:done", remeasure);
    window.addEventListener("load", remeasure);
    const t = setTimeout(remeasure, 800);

    return () => {
      clearTimeout(t);
      window.removeEventListener("intro:done", remeasure);
      window.removeEventListener("load", remeasure);
      window.removeEventListener("beforeunload", toTopOnUnload);
      ctx.revert();
    };
  }, []);

  const activate = (i) => {
    if (i === activeRef.current) return;
    setPrev(activeRef.current);
    activeRef.current = i;
    setActive(i);
  };

  /* ---------- OUR OBJECTIVES: heading fades in once; rows switch on hover ---------- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".obj-head > *", {
        opacity: 0, y: 28, duration: 0.7, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".obj-head", start: "top 85%", once: true },
      });
    }, objRef);
    return () => ctx.revert();
  }, []);

  /* ---------- EVENTS & ACTIVITIES ---------- */
  const nextOf = (key) => events.find((e) => e.key === key);
  const handleRegChange = (e) => setReg({ ...reg, [e.target.name]: e.target.value });
  const handleRegSubmit = (e) => {
    e.preventDefault();
    // TODO: POST { ...reg, eventId: regEvent.id } to your Django API here
    alert(`Thank you, ${reg.name}! Your registration for "${regEvent.title}" has been received.`);
    setReg({ name: "", email: "", phone: "" });
    setRegEvent(null);
  };

  useLayoutEffect(() => {
    const root = evRef.current;
    const mm = gsap.matchMedia();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      // heading + upcoming list rise in once
      gsap.from(".ev-head > *", {
        opacity: 0, y: 28, duration: 0.7, stagger: 0.12, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".ev-head", start: "top 85%", once: true },
      });
      gsap.from(".ev-upcoming-head", {
        opacity: 0, y: 30, duration: 0.7, stagger: 0.08, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".ev-upcoming", start: "top 85%", once: true },
      });

      // scroll drives a pinned stage (text slides up, images cross-fade) — desktop and mobile
      mm.add("all", () => {
        const n = categories.length;
        const track = root.querySelector(".ev-t-track");
        const items = Array.from(root.querySelectorAll(".ev-t-item"));
        const imgs = Array.from(root.querySelectorAll(".ev-img"));
        const stage = root.querySelector(".ev-stage");
        const countEl = root.querySelector(".ev-count-now");
        const barEl = root.querySelector(".ev-bar i");
        let pitch = items[0].offsetHeight;
        const state = { t: 0 };

        const clamp01 = (v) => Math.min(1, Math.max(0, v));
        const smooth = (v) => v * v * (3 - 2 * v);

        // t = 0 .. n-1 (fractional while moving between two slides)
        const render = () => {
          const t = state.t;
          track.style.transform = `translate3d(0, ${-t * pitch}px, 0)`;

          items.forEach((el, i) => {
            el.style.opacity = (1 - Math.min(1, Math.abs(i - t)) * 0.78).toFixed(3);
          });

          const base = Math.min(n - 1, Math.floor(t + 1e-6));
          const e = smooth(clamp01((t - base - 0.12) / 0.76)); // fade progress of the next image
          imgs.forEach((el, i) => {
            let op = 0, scale = 1;
            if (i === base) op = 1;                                  // current image stays underneath
            else if (i === base + 1) { op = e; scale = 1 + (1 - e) * 0.06; } // next image fades in, settling from a slight zoom
            el.style.opacity = op.toFixed(3);
            if (el.firstElementChild) el.firstElementChild.style.transform = `scale(${scale.toFixed(4)})`;
          });

          countEl.textContent = String(Math.min(n, Math.round(t) + 1)).padStart(2, "0");
          barEl.style.transform = `scaleX(${n > 1 ? t / (n - 1) : 1})`;
        };
        render();

        const st = ScrollTrigger.create({
          trigger: root.querySelector(".ev-track"),
          // the stage sticks at a vertically centred position (set in CSS as --stick); start exactly there
          start: () => "top top+=" + Math.round(parseFloat(getComputedStyle(stage).top) || 130),
          end: () => "+=" + (n - 1) * window.innerHeight * 0.8,
          invalidateOnRefresh: true,
          onRefresh: () => { pitch = items[0].offsetHeight; render(); },
          onUpdate: (self) => {
            gsap.to(state, {
              t: self.progress * (n - 1),
              duration: reduce ? 0 : 0.7,
              ease: "power3.out",
              overwrite: true,
              onUpdate: render,
            });
          },
        });

        return () => {
          st.kill();
          gsap.killTweensOf(state);
          track.style.transform = "";
          items.forEach((el) => { el.style.opacity = ""; });
          imgs.forEach((el) => {
            el.style.opacity = "";
            if (el.firstElementChild) el.firstElementChild.style.transform = "";
          });
        };
      });
    }, evRef);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  /* ---------- MEMBERSHIP: heading, cards and benefits rise in once ---------- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".mem-head > *", {
        opacity: 0, y: 28, duration: 0.7, stagger: 0.12, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".mem-head", start: "top 85%", once: true },
      });
      gsap.from(".mem-card", {
        opacity: 0, y: 40, duration: 0.8, stagger: 0.14, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".mem-grid", start: "top 85%", once: true },
      });
      gsap.from(".mem-benefits, .mem-cta", {
        opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".mem-benefits", start: "top 88%", once: true },
      });
    }, memRef);
    return () => ctx.revert();
  }, []);

  /* ---------- OUR AFFILIATION: heading + logo strip rise in once ---------- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".aff-head > *", {
        opacity: 0, y: 28, duration: 0.7, stagger: 0.12, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".aff-head", start: "top 85%", once: true },
      });
      gsap.from(".aff-marquee", {
        opacity: 0, y: 30, duration: 0.8, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".aff-marquee", start: "top 90%", once: true },
      });
    }, affRef);
    return () => ctx.revert();
  }, []);

  /* ---------- the two scrolling strips: logos (a bit faster) and members' photos ---------- */
  useDragMarquee(affMarqRef, 55);
  useDragMarquee(ldrMarqRef, 40);

  /* ---------- LATEST NEWS: heading and rows rise in once ---------- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".news-head > *", {
        opacity: 0, y: 28, duration: 0.7, stagger: 0.12, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".news-head", start: "top 85%", once: true },
      });
      gsap.from(".news-item", {
        opacity: 0, y: 36, duration: 0.7, stagger: 0.09, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".news-list", start: "top 88%", once: true },
      });
    }, newsRef);
    return () => ctx.revert();
  }, []);

  /* ---------- LEADERSHIP: headline sharpens word by word, photos open from cut corners ---------- */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ldr-eyebrow, .ldr-lead", {
        opacity: 0, y: 20, duration: 0.7, stagger: 0.1, ease: "power3.out", clearProps: "all",
        scrollTrigger: { trigger: ".ldr-head", start: "top 85%", once: true },
      });
      gsap.from(".ldr-word", {
        opacity: 0, filter: "blur(12px)", y: 10, duration: 0.8, stagger: 0.08, ease: "power2.out", clearProps: "all",
        scrollTrigger: { trigger: ".ldr-head", start: "top 85%", once: true },
      });
      gsap.fromTo(".ldr-photo",
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 82%, 86% 100%, 14% 100%, 0% 82%)" },
        { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 100% 100%, 0% 100%, 0% 100%)",
          duration: 1.1, stagger: 0.05, ease: "power3.out", clearProps: "clipPath",
          scrollTrigger: { trigger: ".ldr-marquee", start: "top 85%", once: true } });
      gsap.from(".ldr-photo img", {
        scale: 1.18, duration: 1.4, stagger: 0.05, ease: "power3.out", clearProps: "transform",
        scrollTrigger: { trigger: ".ldr-marquee", start: "top 85%", once: true },
      });
      gsap.from(".ldr-name, .ldr-role", {
        opacity: 0, y: 16, duration: 0.7, stagger: 0.03, ease: "power3.out", clearProps: "all", delay: 0.25,
        scrollTrigger: { trigger: ".ldr-marquee", start: "top 85%", once: true },
      });
    }, ldrRef);
    return () => ctx.revert();
  }, []);

  /* ---------- CONTACT: words light up, pill image grows full screen, contact columns appear ----------
     desktop: two columns appear over the image.
     mobile : the same grow effect, then the (taller) contact content glides up with the scroll. */
  useLayoutEffect(() => {
    const root = ctRef.current;
    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      const build = (mobile) => {
        const stage = root.querySelector(".ct-stage");
        const pill = root.querySelector(".ct-pill");
        const media = root.querySelector(".ct-media");
        const mimg = media.querySelector("img");
        const panel = root.querySelector(".ct-panel");
        const navPx = (document.querySelector(".navbar-glass") || {}).offsetHeight || 104;   // real height of the navbar
        const openAt = mobile ? 0.55 : 0.78;   // timeline progress after which the form can be clicked

        // where the small pill sits inside the stage
        const pillBox = () => {
          const s = stage.getBoundingClientRect();
          const p = pill.getBoundingClientRect();
          return { left: p.left - s.left, top: p.top - s.top, width: p.width, height: p.height };
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: mobile ? "+=4200" : "+=3200",
            pin: true,
            scrub: mobile ? 0.4 : 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => panel.classList.toggle("is-open", self.progress > openAt),
          },
        });

        tl.fromTo(".ct-word", { color: "rgba(13,20,69,0.18)" }, { color: "#0d1445", stagger: 0.3, duration: 0.5 }, 0)
          .fromTo(
            media,
            {
              left: () => pillBox().left,
              top: () => pillBox().top,
              width: () => pillBox().width,
              height: () => pillBox().height,
              borderRadius: 999,
            },
            {
              left: 0,
              top: 0,
              width: () => stage.clientWidth,
              height: () => stage.clientHeight,
              borderRadius: 0,
              duration: 2,
              ease: "power2.inOut",
            },
            1.2
          )
          .fromTo(mimg, { scale: 1.25 }, { scale: 1, duration: 2, ease: "power2.inOut" }, 1.2)
          .fromTo(".ct-shade", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.7)
          .fromTo(
            ".ct-info > *, .ct-field, .ct-form .btn-primary",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" },
            3.1
          );

        if (mobile) {
          // the contact content is taller than a phone screen: slide it up so every field can be reached
          tl.fromTo(
            panel,
            { y: 0 },
            { y: () => -Math.max(0, panel.scrollHeight - (stage.clientHeight - navPx - 40)), duration: 1.4, ease: "none" },
            4.5
          );
        }
      };

      mm.add("(min-width: 901px)", () => build(false));
      mm.add("(max-width: 900px)", () => build(true));
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  // dialogs (registration + news): Esc closes, page scroll locked, first field focused
  const dialogOpen = !!(regEvent || newsItem);
  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") { setRegEvent(null); setNewsItem(null); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();          // page must not scroll behind the dialog
    if (regEvent && regNameRef.current) regNameRef.current.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (window.__lenis) window.__lenis.start();
    };
  }, [dialogOpen, regEvent]);

  return (
    <div className="home">

      {/* ============ 01. HERO ============ */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg">
          <img src="/images/hero_bg.png" alt="Indian Pharmaceutical Association, Telangana" onError={(e) => (e.target.style.display = "none")} />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-veil"></div>

        {/* PANEL 1 — welcome */}
        <div className="hero-inner hero-inner-1">
          <h1 className="hero-title">
            Welcome to Indian Pharmaceutical Association, Telangana
          </h1>
          <div className="hero-side">
            <p className="hero-desc">
              The voice of pharmacists in Telangana — advancing pharmacy education, practice and public health.
            </p>
            <div className="hero-btns">
              <Link to="/about" className="btn-primary" onClick={goTo("objectives")}>About Us →</Link>
              <Link to="/membership" className="btn-secondary" onClick={goTo("membership")}>Become a Member</Link>
            </div>
          </div>
        </div>

        {/* PANEL 2 — about section, appears while scrolling */}
        <div className="hero-panel-2">
          <div className="hero-inner hero-inner-2">
            <div className="p2-left">
              <div className="p2-eyebrow">ABOUT IPA</div>
              <h2 className="p2-title">
                <span className="p2-line"><span className="p2-line-in">About IPA.</span></span>
                <span className="p2-line p2-dim"><span className="p2-line-in">Serving pharmacists since 1939.</span></span>
              </h2>
            </div>
            <div className="p2-right">
              <p className="p2-text">
                {words("The Indian Pharmaceutical Association is the voice of pharmacists in Telangana. For more than 85 years, IPA has connected students, educators, researchers and industry to advance pharmacy education, professional practice and public health — as part of a national body of over 20,000 members.")}
              </p>
              <Link to="/about" className="p2-link" onClick={goTo("objectives")}>Read more about IPA →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 02. OUR OBJECTIVES ============ */}
      <section className="objectives" id="objectives" ref={objRef}>
        <div className="obj-head">
          <div className="obj-eyebrow"><b>02</b><span>Our Objectives</span><i /></div>
          <div className="obj-head-row">
            <h2 className="obj-title">Five ways we serve<br />the profession.</h2>
            <p className="obj-lead">
              Choose an objective to see what we do, who it is for and how we deliver it.
            </p>
          </div>
        </div>

        <div className="obj-track">
          <div className="obj-stage">
            <ul className="obj-list">
              {objectives.map((o, i) => (
                <li key={o.title} className={`obj-item${i === active ? " is-active" : ""}`}>
                  <div className="obj-row" onMouseMove={() => activate(i)} onClick={() => activate(i)}>
                    <span className="obj-num">0{i + 1}</span>
                    <button
                      type="button"
                      className="obj-name"
                      onFocus={() => activate(i)}
                      aria-expanded={i === active}
                    >
                      {o.name}
                    </button>
                    <span className="obj-meta">
                      {o.meta.map(([k, v]) => (
                        <span className="obj-meta-item" key={k}><em>{k}</em>{v}</span>
                      ))}
                    </span>
                    <Link
                      to="/about"
                      className="obj-go"
                      aria-label={`Learn more: ${o.title}`}
                      tabIndex={i === active ? 0 : -1}
                      onClick={(e) => { e.preventDefault(); activate(i); }}
                    >
                      →
                    </Link>
                  </div>
                  <div className="obj-more"><div><p>{o.desc}</p></div></div>
                </li>
              ))}
            </ul>

            <div className="obj-media" aria-hidden="true">
              {objectives.map((o, i) => (
                <div
                  key={o.title}
                  className={`obj-slide${i === active ? " is-active" : i === prev ? " is-prev" : ""}`}
                >
                  <img src={o.img} alt="" onError={(e) => (e.target.style.display = "none")} />
                  <div className="obj-cap">
                    <span>{o.title}</span>
                    <span>0{i + 1} / 0{objectives.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 04. EVENTS & ACTIVITIES ============ */}
      <section className="events" id="events" ref={evRef}>
        <div className="ev-inner">
          <div className="ev-head">
            <div className="ev-eyebrow"><b>04</b><span>Events &amp; Activities</span><i /></div>
            <div className="ev-head-row">
              <h2 className="ev-title">
                Where pharmacists learn,
                <span>meet and give back.</span>
              </h2>
              <p className="ev-lead">
                From conferences to community camps — see what we offer and register for what is coming up.
              </p>
            </div>
          </div>

          {/* pinned stage: scroll moves through the four activity types */}
          <div className="ev-track" style={{ "--n": categories.length }}>
            <div className="ev-stage">
              <div className="ev-media" aria-hidden="true">
                {categories.map((c, i) => (
                  <div className="ev-img" key={c.key} style={{ zIndex: i + 1 }}>
                    <span className="ev-missing">{c.img}</span>
                    <img
                      src={c.img}
                      alt={c.name}
                      onError={imgFallback(c.img)}
                    />
                  </div>
                ))}
                <div className="ev-progress">
                  <span className="ev-count-now">01</span>
                  <span className="ev-bar"><i /></span>
                  <span>/ 0{categories.length}</span>
                </div>
              </div>

              <div className="ev-text">
                <div className="ev-t-track">
                  {categories.map((c, i) => {
                    const nx = nextOf(c.key);
                    return (
                      <article className="ev-t-item" key={c.key}>
                        <span className="ev-t-eyebrow"><b>0{i + 1}</b> — {c.tag}</span>
                        <h3 className="ev-t-title">{c.name}</h3>
                        <p className="ev-t-desc">{c.desc}</p>
                        {nx && (
                          <>
                            <dl className="ev-specs">
                              <div><dt>Next</dt><dd>{nx.day} {nx.mon} {nx.year}</dd></div>
                              <div><dt>Event</dt><dd>{nx.title}</dd></div>
                              <div><dt>Venue</dt><dd>{nx.venue} · {nx.time}</dd></div>
                            </dl>
                            <button type="button" className="ev-t-reg" onClick={() => setRegEvent(nx)}>
                              Register for this event <span aria-hidden="true">→</span>
                            </button>
                          </>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* all upcoming events with registration */}
          <div className="ev-upcoming">
            <div className="ev-upcoming-head">
              <h3>Upcoming events</h3>
              <span className="ev-count-note">{events.length} events · register online</span>
            </div>

            {/* stacking cards: each one sticks under the navbar and the next slides over it */}
            <ul className="ev-stack">
              {events.map((e, i) => {
                const c = categories.find((c) => c.key === e.key);
                return (
                  <li className={`ev-card ev-card--${i % 4}`} key={e.id} style={{ "--i": i }}>
                    <div className="ev-card-body">
                      <div className="ev-card-top">
                        <span className="ev-card-num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="ev-card-date">{e.day} {e.mon} {e.year}</span>
                      </div>
                      <div className="ev-card-main">
                        <span className="ev-card-tag">{c.tag}</span>
                        <h4 className="ev-card-title">{e.title}</h4>
                        <p className="ev-card-desc">{e.venue} · {e.time}</p>
                        <button type="button" className="ev-card-reg" onClick={() => setRegEvent(e)}>
                          Register <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </div>
                    <div className="ev-card-img">
                      <img src={e.img} alt="" onError={imgFallback(e.img)} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ 05. MEMBERSHIP ============ */}
      <section className="membership" id="membership" ref={memRef}>
        <div className="mem-bg" aria-hidden="true"></div>
        <div className="mem-inner">
          <div className="mem-head">
            <div className="mem-eyebrow"><b>05</b><span>Membership</span><i /></div>
            <div className="mem-head-row">
              <h2 className="mem-title">Join the voice of<br />pharmacists in Telangana.</h2>
              <p className="mem-lead">
                Choose the membership that fits where you are in your career and become part of IPA.
              </p>
            </div>
          </div>

          <div className="mem-grid">
            {tiers.map((t, i) => (
              <article className={`mem-card${t.featured ? " is-featured" : ""}`} key={t.id}>
                <div className="mem-card-top">
                  <span className="mem-card-num">0{i + 1}</span>
                  <span className="mem-card-tag">{t.tag}</span>
                </div>
                <h3 className="mem-card-name">{t.name}</h3>
                <p className="mem-card-desc">{t.desc}</p>
                <ul className="mem-card-points">
                  {t.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
                <Link to="/membership" className="mem-card-link" onClick={goTo("contact")}>
                  Apply <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>

          <div className="mem-benefits">
            <div className="mem-benefits-head">
              <span className="mem-kicker">Membership benefits</span>
              <h3>What you get as a member.</h3>
            </div>
            <ul className="mem-benefit-list">
              {benefits.map((b) => <li key={b}>{b}</li>)}
            </ul>
          </div>

          <div className="mem-cta">
            <p>Ready to be part of IPA Telangana?</p>
            <Link to="/membership" className="btn-primary" onClick={goTo("contact")}>Apply for Membership →</Link>
          </div>
        </div>
      </section>

      {/* ============ 06. OUR AFFILIATION ============ */}
      <section className="affiliation" id="affiliation" ref={affRef}>
        

        {/* logos scroll in from the right, endlessly. The set is rendered twice so the loop is seamless. */}
        <div className="aff-marquee" aria-label="Affiliated bodies" ref={affMarqRef}>
          <div className="aff-track">
            {[0, 1].map((copy) => (
              <ul className="aff-set" key={copy} aria-hidden={copy === 1}>
                {[...affiliations, ...affiliations].map((a, i) => (
                  <li className="aff-logo" key={`${copy}-${i}`}>
                    <span className="aff-logo-box">
                      <img src={a.img} alt={copy === 0 ? a.name : ""} draggable={false} onError={affFallback(a.img)} />
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 07. LATEST NEWS ============ */}
      <section className="news" id="news" ref={newsRef}>
        <div className="news-inner">
          <div className="news-head">
            <div className="news-eyebrow"><b>06</b><span>Latest News</span><i /></div>
            <div className="news-head-row">
              <h2 className="news-title">Notices and<br />updates from IPA.</h2>
              <p className="news-lead">
                Official notices, circulars and announcements — open any item to read it in full.
              </p>
            </div>
          </div>

          <ul className="news-list">
            {news.map((n, i) => (
              <li className="news-item" key={n.title}>
                {/* clickable, but opens a popup on this page — no redirect to other pages or sites */}
                <a
                  className="news-row"
                  href="#news"
                  role="button"
                  onClick={(e) => { e.preventDefault(); setNewsItem(n); }}
                >
                  <span className="news-bg" aria-hidden="true" />
                  <span className="news-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="news-name">{n.title}</span>
                  <span className="news-tag">{n.tag}</span>
                  <span className="news-date">{n.date} · {n.file}</span>
                  <span className="news-arrow" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="news-more">
            <Link to="/news" className="btn-primary" onClick={goTo("news")}>View all news →</Link>
          </div>
        </div>
      </section>

      {/* ============ 07. LEADERSHIP & COMMITTEE ============ */}
      <section className="leadership" id="leadership" ref={ldrRef}>
        <div className="ldr-inner">
          <div className="ldr-head">
            <div className="ldr-eyebrow"><b>07</b><span>Leadership &amp; Committee</span><i /></div>
            <div className="ldr-head-row">
              <h2 className="ldr-title">
                <span>{blurWords("The people who")}</span>
                <span>{blurWords("lead IPA Telangana.")}</span>
              </h2>
              <p className="ldr-lead">
                Our office bearers and executive committee guide the association&apos;s work for pharmacists across the state.
              </p>
            </div>
          </div>

        </div>

        {/* members' photos: scroll right -> left on their own, drag left / right to move them.
            The same set is rendered twice (and each set twice again) so the loop is seamless on wide screens. */}
        <div className="ldr-marquee" aria-label="Office bearers and committee" ref={ldrMarqRef}>
          <div className="ldr-track">
            {[0, 1].map((copy) => (
              <ul className="ldr-set" key={copy}>
                {[0, 1].map((rep) =>
                  leaders.map((l) => (
                    <li className="ldr-card" key={`${copy}-${rep}-${l.role}`} aria-hidden={copy === 1 || rep === 1}>
                      <div className="ldr-photo">
                        <img src={l.img} alt={copy === 0 && rep === 0 ? `${l.name}, ${l.role}` : ""} draggable={false} onError={imgFallback(l.img)} />
                      </div>
                      <h3 className="ldr-name">{l.name}</h3>
                      <p className="ldr-role">{l.role}</p>
                    </li>
                  ))
                )}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 08. CONTACT US ============ */}
      <section className="contact" id="contact" ref={ctRef}>
        <div className="ct-stage">
          <div className="ct-intro">
            <div className="ct-eyebrow"><b>08</b><span>Get in touch</span><i /></div>
            <h2 className="ct-title">
              <span className="ct-word">Contact</span>
              <span className="ct-word">Us</span>
              <span className="ct-pill" aria-hidden="true">
                <img src="/images/membership_bg.png" alt="" onError={imgFallback("/images/membership_bg.png")} />
              </span>
            </h2>
          </div>

          {/* this layer starts exactly on the pill and grows to full screen */}
          <div className="ct-media" aria-hidden="true">
            <img src="/images/membership_bg.png" alt="" onError={imgFallback("/images/membership_bg.png")} />
            <div className="ct-shade" />
          </div>

          {/* contact columns, revealed once the image is big */}
          <div className="ct-panel">
            <div className="ct-info">
              <span className="ct-kicker">Reach us</span>
              <h3>Indian Pharmaceutical Association, Telangana</h3>
              <p className="ct-role">Hon. Secretary,<br />Mr. Name Surname</p>
              <dl className="ct-specs">
                <div><dt>Phone</dt><dd>+91 00000 00000</dd></div>
                <div><dt>E-Mail</dt><dd>ipatelangana@gmail.com</dd></div>
                <div><dt>Website</dt><dd>www.ipa-telangana.org</dd></div>
              </dl>
            </div>

            <form className="ct-form" onSubmit={handleSubmit}>
              <label className="ct-field">
                Your Name (required)
                <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
              </label>
              <label className="ct-field">
                Your Email (required)
                <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
              </label>
              <label className="ct-field">
                Subject
                <input name="subject" value={form.subject} onChange={handleChange} />
              </label>
              <label className="ct-field">
                Your Message
                <textarea name="message" rows="3" value={form.message} onChange={handleChange} />
              </label>
              <button type="submit" className="btn-primary">Send</button>
            </form>
          </div>
        </div>
      </section>

      {/* registration dialog */}
      {regEvent && (
        <div className="ev-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setRegEvent(null); }}>
          <div className="ev-dialog" role="dialog" aria-modal="true" aria-labelledby="ev-dialog-title">
            <button type="button" className="ev-close" aria-label="Close" onClick={() => setRegEvent(null)}>✕</button>
            <span className="ev-dialog-kicker">Register</span>
            <h3 id="ev-dialog-title">{regEvent.title}</h3>
            <p className="ev-dialog-meta">
              {regEvent.day} {regEvent.mon} {regEvent.year} · {regEvent.time} · {regEvent.venue}
            </p>
            <form onSubmit={handleRegSubmit}>
              <label>
                Full name
                <input ref={regNameRef} name="name" value={reg.name} onChange={handleRegChange} required autoComplete="name" />
              </label>
              <label>
                Email
                <input type="email" name="email" value={reg.email} onChange={handleRegChange} required autoComplete="email" />
              </label>
              <label>
                Phone
                <input type="tel" name="phone" value={reg.phone} onChange={handleRegChange} required autoComplete="tel" />
              </label>
              <button type="submit" className="btn-primary full">Confirm registration</button>
            </form>
          </div>
        </div>
      )}

      {/* news dialog — opens on this page, nothing is redirected */}
      {newsItem && (
        <div className="ev-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) setNewsItem(null); }}>
          <div className="ev-dialog" role="dialog" aria-modal="true" aria-labelledby="news-dialog-title">
            <button type="button" className="ev-close" aria-label="Close" onClick={() => setNewsItem(null)}>✕</button>
            <span className="ev-dialog-kicker">{newsItem.tag}</span>
            <h3 id="news-dialog-title">{newsItem.title}</h3>
            <p className="ev-dialog-meta">{newsItem.date} · {newsItem.file}</p>
            <p className="ev-dialog-meta">
              The full {newsItem.file === "IMAGE" ? "image" : "document"} will be available here soon.
            </p>
            <button type="button" className="btn-primary full" onClick={() => setNewsItem(null)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}