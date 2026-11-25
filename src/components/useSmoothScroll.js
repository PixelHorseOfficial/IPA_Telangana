import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Smooth, eased scrolling for the whole page (section to section).
   - Lenis eases the wheel / keyboard scrolling
   - it is driven by GSAP's ticker and feeds ScrollTrigger, so the pinned hero, events and contact
     sections stay perfectly in sync
   - it waits for the navbar logo intro to finish, and is skipped for "reduced motion" visitors
   Install once:  npm install lenis                                                              */
export default function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,                                              // higher = slower, floatier
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),    // expo-out
      smoothWheel: true,
      wheelMultiplier: 1,
      autoRaf: false,                                              // GSAP's ticker drives it (below)
    });
    window.__lenis = lenis; // so other components (footer "back to top", dialogs) can use it

    // keep the page still while the navbar logo intro is playing
    if (!window.__introDone) lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("intro:done", start);
    const safety = setTimeout(start, 6000); // never leave scrolling locked

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      clearTimeout(safety);
      window.removeEventListener("intro:done", start);
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, []);
}