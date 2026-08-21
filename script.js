let lenis;
let currentSectionIndex = 0;
const totalSections = 6;
const sectionTitles = [
    "section-1",
    "section-2",
    "section-3",
    "section-4",
    "section-5",
    "section-6",
];

let sectionScrollTriggers = [];
let isProgrammaticScroll = false;

window.addEventListener("DOMContentLoaded", () => {
    lenis = new Lenis({
        duration: 1.4,
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
        infinite: false,
        autoRaf: false,
    });

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
    setupSectionAnimations();
    requestAnimationFrame(() => ScrollTrigger.refresh());
    let resizeTimer = null;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            lenis.resize();
            ScrollTrigger.refresh();
        }, 200);
    });
});

function setupSectionAnimations() {
    const sections = document.querySelectorAll(".section-block");

    sections.forEach((sec, idx) => {
        // ---------------------------------------------------------
        // 1. Update section navigation
        // ---------------------------------------------------------
        const navTrigger = ScrollTrigger.create({
            trigger: sec,
            start: "top 50%",
            end: "bottom 50%",

            onEnter: () => {
                if (!isProgrammaticScroll) {
                    updateNav(idx);
                }
            },

            onEnterBack: () => {
                if (!isProgrammaticScroll) {
                    updateNav(idx);
                }
            },
        });

        sectionScrollTriggers[idx] = navTrigger;

        // ---------------------------------------------------------
        // 2. Background image parallax
        // ---------------------------------------------------------
        const bgImg = sec.querySelector(".bg-img");

        if (bgImg) {
            gsap.fromTo(
                bgImg,
                {
                    scale: 1.15,
                },
                {
                    scale: 1,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: sec,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                },
            );
        }

        // ---------------------------------------------------------
        // 3. Get section animation elements
        // ---------------------------------------------------------
        const topWhiteBgGradient = sec.querySelector(".topWhiteBgGradient");
        const bottomWhiteBgGradient = sec.querySelector(
            ".bottomWhiteBgGradient",
        );
        const contentBlock = sec.querySelector(".content-block");
        const title = sec.querySelector(".sec-title");
        const titles = sec.querySelectorAll(".sec-title");
        const subtitle = sec.querySelector(".sec-subtitle");
        const descs = sec.querySelectorAll(".sec-desc");
        const sustainableBtn = sec.querySelector(".sustainable-btn");
        const learnMoreBtn = sec.querySelector(".sec-buttons");
        const buttonElements = [sustainableBtn, learnMoreBtn].filter(Boolean);
        function getTitleAnimationSize() {
            const width = window.innerWidth;

            if (width >= 1024) {
                return {
                    from: 62,
                    to: 56,
                };
            }

            if (width >= 768) {
                return {
                    from: 37,
                    to: 34,
                };
            }

            return {
                from: 26,
                to: 26,
            };
        }
        // ---------------------------------------------------------
        // 5. Setup initial state
        // ---------------------------------------------------------
        if (descs.length) {
            gsap.set(descs, {
                opacity: 0.5,
                transformOrigin: "center center",
                willChange: "transform, opacity",
            });
        }

        if (subtitle) {
            gsap.set(subtitle, {
                transformOrigin: "center center",
                willChange: "transform, opacity",
            });
        }

        if (buttonElements.length) {
            gsap.set(buttonElements, {
                opacity: 0.5,
                transformOrigin: "center center",
                willChange: "transform, opacity",
            });
        }

        if (bottomWhiteBgGradient) {
            gsap.set(bottomWhiteBgGradient, {
                opacity: 0,
                yPercent: -100,
                transformOrigin: "center center",
                willChange: "transform, opacity",
            });
        }

        // ---------------------------------------------------------
        // 6. Main pinned timeline
        // ---------------------------------------------------------
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sec,
                start: "top top",
                end: "+=100%",
                scrub: true,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            },
        });

        // ---------------------------------------------------------
        // PHASE 1
        // Top white gradient moves upward
        // (skipped when the section has no .topWhiteBgGradient)
        // ---------------------------------------------------------
        if (topWhiteBgGradient) {
            tl.fromTo(
                topWhiteBgGradient,
                {
                    opacity: 1,
                    yPercent: 0,
                },
                {
                    yPercent: -100,
                    opacity: 1,
                    ease: "power2.inOut",
                    duration: 1,
                },
                0,
            );
        }

        // ---------------------------------------------------------
        // PHASE 2
        // Content moves upward
        // (skipped when the section has no .content-block)
        // ---------------------------------------------------------
        if (contentBlock) {
            tl.to(
                contentBlock,
                {
                    y: "-27vh",
                    scale: 0.95,
                    ease: "power2.inOut",
                    duration: 1,
                },
                0,
            );
        }

        // ---------------------------------------------------------
        // Section title animation
        // Only run when .sec-title exists
        // ---------------------------------------------------------
        if (title) {
            // tl.fromTo(
            //     title,
            //     {
            //         fontSize: "72px",
            //     },
            //     {
            //         fontSize: "56px",
            //         ease: "power2.inOut",
            //         duration: 1,
            //     },
            //     0,
            // );
            const { from, to } = getTitleAnimationSize();

            titles.forEach((el) => {
                // Ignore hidden responsive title
                if (getComputedStyle(el).display === "none") {
                    return;
                }

                gsap.set(el, {
                    fontSize: from,
                    transformOrigin: "center center",
                    willChange: "font-size",
                });

                tl.to(
                    el,
                    {
                        fontSize: to,
                        duration: 1.2,
                        transformOrigin: "center center",
                        willChange: "font-size",
                        ease: "none",
                    },
                    0.01,
                );
            });
        }

        // ---------------------------------------------------------
        // PHASE 3
        // Keep content near the top
        // (skipped when the section has no .content-block)
        // ---------------------------------------------------------
        if (contentBlock) {
            tl.to(
                contentBlock,
                {
                    y: "-27vh",
                    opacity: 1,
                    ease: "none",
                    duration: 1,
                },
                1.4,
            );
        }
        if (descs.length) {
            tl.to(
                descs,
                {
                    opacity: 1,
                    ease: "power1.in",
                    duration: 0.75,
                    stagger: 0.08,
                },
                0.02,
            );
        }
        if (buttonElements.length) {
            tl.to(
                buttonElements,
                {
                    opacity: 1,
                    ease: "power1.in",
                    duration: 0.7,
                    stagger: 0.08,
                },
                ">",
            );
        }

        // ---------------------------------------------------------
        // PHASE 4
        // Hide top gradient
        // (skipped when the section has no .topWhiteBgGradient)
        // ---------------------------------------------------------
        if (topWhiteBgGradient) {
            tl.to(
                topWhiteBgGradient,
                {
                    yPercent: -100,
                    opacity: 0,
                    ease: "power2.inOut",
                    duration: 1,
                },
                ">",
            );
        }

        // ---------------------------------------------------------
        // PHASE 5
        // Bottom gradient
        // ---------------------------------------------------------
        if (descs.length) {
            tl.to(
                descs,
                {
                    opacity: 0.5,
                    ease: "power1.in",
                    duration: 0.7,
                    stagger: 0.08,
                },
                ">",
            );
        }
        if (buttonElements.length) {
            tl.to(
                buttonElements,
                {
                    opacity: 0.5,
                    ease: "power1.in",
                    duration: 0.7,
                    stagger: 0.08,
                },
                ">",
            );
        }
        if (bottomWhiteBgGradient) {
            tl.fromTo(
                bottomWhiteBgGradient,
                {
                    opacity: 0,
                    yPercent: 0,
                },
                {
                    yPercent: 100,
                    opacity: 0,
                    ease: "power2.inOut",
                    duration: 1,
                },
            );

            tl.to(bottomWhiteBgGradient, {
                opacity: 1,
                yPercent: 100,
                duration: 1.5,
                ease: "none",
            });
        }
    });
}

function updateNav(index) {
    currentSectionIndex = index;

    // Update header info
    const numElem = document.getElementById("active-num");
    const titleElem = document.getElementById("active-title");

    if (numElem) numElem.textContent = `0${index + 1}`;
    if (titleElem) titleElem.textContent = sectionTitles[index];

    // Update side navigation dots
    const dots = document.querySelectorAll(".nav-dot");
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });
}

function scrollToSection(index) {
    const targetSec = document.getElementById(`section-${index + 1}`);

    if (!targetSec || !lenis) return;

    // Immediately update the current section
    currentSectionIndex = index;
    updateNav(index);

    isProgrammaticScroll = true;

    lenis.scrollTo(targetSec, {
        duration: 1.4,

        easing: (t) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },

        lock: true,
        force: true,

        onComplete: () => {
            currentSectionIndex = index;
            updateNav(index);

            // Allow ScrollTrigger to control nav again
            requestAnimationFrame(() => {
                isProgrammaticScroll = false;
            });
        },
    });
}

// IMPORTANT: expose to Blade inline onclick
window.scrollToSection = scrollToSection;

window.addEventListener(
    "keydown",
    (e) => {
        if (
            e.key !== "ArrowDown" &&
            e.key !== "ArrowUp" &&
            e.key !== "PageDown" &&
            e.key !== "PageUp"
        ) {
            return;
        }

        /*
         * Stop browser native scrolling from fighting Lenis.
         */
        e.preventDefault();

        if (e.key === "ArrowDown" || e.key === "PageDown") {
            if (currentSectionIndex < totalSections - 1) {
                scrollToSection(currentSectionIndex + 1);
            }
        } else {
            if (currentSectionIndex > 0) {
                scrollToSection(currentSectionIndex - 1);
            }
        }
    },
    {
        passive: false,
    },
);
