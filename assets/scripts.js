/* BASE LANGUAGE */
async function getLanguageData(lang) {
    switch (lang) {
        case 'en':
            return await import('../lang/en.js');
        case 'es':
            return await import('../lang/es.js');
        default:
            return await import('../lang/en.js');
    }
}
function detectLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');

    if (langFromUrl) return langFromUrl;

    const browserLang = navigator.language || navigator.languages[0];
    const shortLang = browserLang.split('-')[0];
    const regionLang = browserLang;

    if (regionLang === 'es-MX' || regionLang === 'es-ES') return 'es';

    return ['en', 'es'].includes(shortLang) ? shortLang : 'en';
}
function updateNavClass(lang) {
    const navPages = document.querySelectorAll('nav');
    if (!navPages.length) return;

    navPages.forEach(nav => {
        nav.classList.remove('lang-en', 'lang-es');
        nav.classList.add(`lang-${lang}`);
    });
}
async function langswitch(forcedLang = null) {
    const lang = forcedLang || detectLanguage();
    const lng = await getLanguageData(lang);
    const langData = lng.default || lng;

    function applyLanguage(data) {
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            const value = data[key];
            if (!value) return;

            if (element.tagName.toLowerCase() === 'img') {
                element.setAttribute('src', value);
                element.setAttribute('alt', key);
            } else {
                element.innerHTML = value;
                element.setAttribute('data-content', value);
            }
        });
    }

    function updateButtons(lang, data) {
        const buttons = document.querySelectorAll('button[data-lang="menu_lang"]');
        buttons.forEach(button => {
            button.innerHTML = data['menu_lang'];
            button.dataset.nextLang = lang === 'en' ? 'es' : 'en';
        });
    }

    function updateLinksForLanguage(lang) {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            const originalUrl = new URL(link.href, window.location.href);
            originalUrl.searchParams.set('lang', lang);
            link.href = originalUrl.toString();
        });
    }

    applyLanguage(langData);
    updateButtons(lang, langData);
    updateLinksForLanguage(lang);
    updateNavClass(lang);

    document.addEventListener("click", (e) => {
        const btn = e.target.closest('button[data-lang="menu_lang"]');
        if (!btn) return;

        const newLang = btn.dataset.nextLang;
        const url = new URL(window.location.href);
        url.searchParams.set('lang', newLang);
        window.location.href = url.toString();
    });

    return lang;
}

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin, DrawSVGPlugin, SplitText);

gsap.config({
    nullTargetWarn: false,
});

/* PRELOADER */
function Preloader() {
    const preloader = document.getElementById('preloader'),
        svgStr = document.querySelectorAll('.progressStroke'),
        svgRel = document.getElementById('progressCircle'),
        logoOL = document.querySelectorAll('.logoOL'),
        logoFill = document.querySelectorAll('.logoFill'),
        startDownloadKey = 'startDownloadExecuted';

    const tl_preloader = gsap.timeline({ paused: true });

    tl_preloader
        .addLabel("start")
        .to(svgStr, { autoAlpha: 1 })
        .from(svgStr, { drawSVG: '0', stagger: { each: 0.25, from: 'start' } })
        .addLabel("forRush", "-=2")
        .fromTo(svgRel,
            { attr: { r: "10" } },
            { attr: { r: "370" }, ease: "expo.in", duration: 3 },
            "forRush"
        )
        .to(logoOL, { autoAlpha: 1 }, ">")
        .from(logoOL, { drawSVG: '0', stagger: { each: 0.15, from: 'start' } }, ">")
        .to(logoFill, { autoAlpha: 1, stagger: { each: 0.15, from: 'start' } }, ">-1")
        .addLabel("CerebruleanVisited")
        .to(preloader, { top: '-100%', ease: 'expo.in' }, ">0.25")
        .addLabel("end");

    function startDownload() {
        if (localStorage.getItem(startDownloadKey)) return;
        localStorage.setItem(startDownloadKey, 'true');
        tl_preloader.play("start");
    }

    function reLoad() {
        tl_preloader.play("CerebruleanVisited");
    }

    function initPreloader() {
        if (!localStorage.getItem("CerebruleanFirstVisit")) {
            localStorage.setItem("CerebruleanFirstVisit", 'true');
            startDownload();
        } else {
            reLoad();
        }
    }

    initPreloader();
}

/* SITE ANIMATIONS */
function linkDecoration() {
    const containers = document.querySelectorAll('.decoCont');

    containers.forEach(container => {
        const links = container.querySelectorAll('.decoLink');

        links.forEach(el => {
            if (el.querySelector('span[data-hover-layer]')) return;

            const text = el.textContent.trim();
            if (!text) return;

            const hoverLayer = document.createElement('span');
            hoverLayer.setAttribute('data-hover-layer', 'true');
            hoverLayer.textContent = text;

            Object.assign(el.style, {
                position: 'relative',
                display: 'inline-block',
                color: 'white',
                overflow: 'hidden'
            });

            Object.assign(hoverLayer.style, {
                position: 'absolute',
                width: '100%',
                top: '0',
                bottom: '0',
                left: '0',
                color: 'var(--color2nd)',
                clipPath: 'polygon(0 0, 0 0, 0% 100%, 0 100%)',
                transition: 'clip-path 0.2s ease-in-out',
                pointerEvents: 'none',
            });

            el.appendChild(hoverLayer);

            el.addEventListener('mouseenter', () => {
                hoverLayer.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
            });

            el.addEventListener('mouseleave', () => {
                hoverLayer.style.clipPath = 'polygon(0 0, 0 0, 0% 100%, 0 100%)';
            });
        });
    });
}

function hideHeader() {
    const hideHeader = gsap.from("header, nav", {
        yPercent: -150,
        paused: true,
        autoAlpha: 0,
        duration: 0.3,
    }).progress(1);

    ScrollTrigger.create({
        start: "15% top",
        end: 999999,
        onUpdate: (self) => {
            self.direction === -1 ? hideHeader.play() : hideHeader.reverse()
        }
    });
}

let currentMain = document.querySelector("#main_home");
function switchMain(targetId) {
    if (!targetId) return;
    const newMain = document.querySelector(targetId);
    if (!newMain || newMain === currentMain) return;

    const oldHeroText = currentMain.querySelectorAll(".section_hero-content div");
    const newHeroText = newMain.querySelectorAll(".section_hero-content div");
    const transBCKG = document.querySelector(".transBCKG");

    gsap.to(window, {
        duration: 0.5,
        scrollTo: { y: 0 },
        ease: "power4.inOut",
        onComplete: () => {
            const tl = gsap.timeline();
            tl.fromTo(oldHeroText, {
                autoAlpha: 1,
                xPercent: 0,
                "--letterSp": -0.25
            }, {
                autoAlpha: 0,
                xPercent: 50,
                "--letterSp": 15
            })
                .to("header, nav", {
                    y: -100,
                    duration: 0.5
                })
                .set("header, nav", { display: "none" })
                .to(currentMain, {
                    autoAlpha: 0,
                    duration: 0.3,
                    onStart: () => {
                        transBCKG.style.display = "flex";
                    },
                    onComplete: () => {
                        gsap.set(currentMain, { display: "none" });
                        currentMain = newMain;
                    }
                })
                .to({}, { duration: 0.25 })
                .set(newMain, { display: "flex", autoAlpha: 0 })
                .to(newMain, {
                    autoAlpha: 1,
                    duration: 0.45,
                    onComplete: () => {
                        transBCKG.style.display = "none";
                        contentSplits();
                    }
                })
                .set("header, nav", { display: "block", autoAlpha: 0 })
                .fromTo("header, nav", {
                    autoAlpha: 0,
                    y: -100
                }, {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.5
                })
                .fromTo(newHeroText, {
                    autoAlpha: 0,
                    xPercent: -50,
                    "--letterSp": 15
                }, {
                    autoAlpha: 1,
                    xPercent: 0,
                    "--letterSp": -0.25
                });
        }
    });
}
function portraitNavAnim() {
    const menuBTN = document.querySelector(".nav__hamburger");
    const menuInner = document.querySelectorAll(".nav__layer, .footer_list-items");
    const brands = document.querySelectorAll(".brand__container, .footer_list-item-home");

    if (!menuBTN || !menuInner.length) return;

    const isPortrait = window.matchMedia("(orientation: portrait)").matches;

    brands.forEach(brand => {
        if (!brand.dataset.bound) {
            brand.addEventListener("click", () => switchMain("#main_home"));
            brand.dataset.bound = "true";
        }
    });

    if (!isPortrait) {
        if (menuBTN.dataset.bound) {
            menuBTN.removeEventListener("click", menuBTN._menuAnim);
            document.querySelectorAll(".nav__layer ul li").forEach(link => {
                link.removeEventListener("click", menuBTN._menuAnim);
            });
            delete menuBTN.dataset.bound;
        }

        menuInner.forEach(inner => {
            gsap.set(inner, { clearProps: "all" });
        });
        gsap.set(".nav__layer ul li", { clearProps: "all" });
        gsap.set([".ham1", ".ham2", ".ham3"], { clearProps: "all" });

        document.querySelectorAll(".decoLink, .footer_list-item").forEach(link => {
            if (link.dataset.lang && link.dataset.lang.startsWith("menu_")) {
                link.onclick = () => switchMain(`#main_${link.dataset.lang.split("_")[1]}`);
            }
        });
        return;
    }

    if (menuBTN.dataset.bound) return;
    menuBTN.dataset.bound = "true";

    const tl = gsap.timeline({ paused: true, reversed: true });
    tl.to('.ham1', 0.5, { css: { "margin-top": "auto", "top": "auto" }, ease: "elastic.inOut" }, 'start')
        .to('.ham3', 0.5, { css: { "margin-bottom": "auto", "bottom": "auto" }, ease: "elastic.inOut" }, 'start')
        .to('.ham1,.ham3', 0.5, { rotate: 45, width: "85%", ease: "elastic.inOut" }, 'start+=0.5')
        .to('.ham2', 0.5, { rotate: -45, width: "85%", ease: "elastic.inOut" }, 'start+=0.5');

    const ma = gsap.timeline({ paused: true, reversed: true })
        .to(menuInner, {
            autoAlpha: 1,
            y: 0,
            height: "80dvh",
            ease: "power2.inOut"
        })
        .fromTo(".nav__layer ul li", { y: "30%", opacity: 0 }, {
            y: 0, opacity: 1, stagger: { amount: 0.2 }
        });

    function menuAnim() {
        tl.reversed() ? tl.play() : tl.reverse();
        ma.reversed() ? ma.play() : ma.reverse();
    }
    menuBTN._menuAnim = menuAnim;
    menuBTN.addEventListener("click", menuAnim);

    document.querySelectorAll(".decoLink, .footer_list-item").forEach(link => {
        if (link.dataset.lang && link.dataset.lang.startsWith("menu_")) {
            const targetId = `#main_${link.dataset.lang.split("_")[1]}`;
            link.addEventListener("click", () => {
                if (!ma.reversed()) {
                    ma.reverse().eventCallback("onReverseComplete", () => {
                        switchMain(targetId);
                        ma.eventCallback("onReverseComplete", null);
                    });
                    tl.reverse();
                } else {
                    switchMain(targetId);
                }
            });
        }
    });
}
document.addEventListener("DOMContentLoaded", portraitNavAnim);
window.addEventListener("resize", portraitNavAnim);
window.addEventListener("orientationchange", portraitNavAnim);

function heroParallax() {
    const sectionHeros = document.querySelectorAll(".section_hero");

    sectionHeros.forEach(sectionHero => {
        var heroVideo = sectionHero.querySelector(".section_hero-video");
        var heroCont = sectionHero.querySelector(".section_hero-content");

        if (heroVideo && heroCont) {
            gsap.to(heroVideo, {
                y: "60vh",
                scrollTrigger: {
                    start: "top end",
                    end: "bottom top",
                    scrub: true,
                    ease: "power3.inOut"
                }
            });
            gsap.to(heroCont, {
                y: "50vh",
                scrollTrigger: {
                    start: "top end",
                    end: "bottom top",
                    scrub: true,
                    ease: "power3.inOut"
                }
            });
        }
    })
}

function contentSplits() {

    document.fonts.ready.then(() => {
        const containers = document.querySelectorAll(".section_container");

        containers.forEach((container) => {
            const sectionChildren = container.querySelectorAll(
                ".section_title, .section_paragraph, .section_img"
            );

            const ordered = Array.from(sectionChildren).sort((a, b) => {
                const orderA = parseInt(window.getComputedStyle(a).order) || 0;
                const orderB = parseInt(window.getComputedStyle(b).order) || 0;
                return orderA - orderB;
            });

            gsap.set(".section_paragraph", { autoAlpha: 0 });

            const tl_master = gsap.timeline({
                paused: true,
                scrollTrigger: {
                    trigger: container,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none none"
                }
            });

            ordered.forEach((el) => {
                if (el.classList.contains("section_title")) {
                    tl_master.addLabel("start")
                        .fromTo(
                            el,
                            { autoAlpha: 0, x: 25, "--letterSp": 2 },
                            { autoAlpha: 1, x: 0, "--letterSp": 0, duration: 0.6 },
                            "+=0.2"
                        );
                } else if (el.classList.contains("section_paragraph")) {
                    ScrollTrigger.batch(el, {
                        start: "top 75%",
                        once: true,
                        onEnter: (batch) => {
                            gsap.fromTo(batch,
                                { autoAlpha: 0, y: 20, lineHeight: "2.4rem" },
                                { autoAlpha: 1, y: 0, lineHeight: "2rem", duration: 0.6, ease: "power2.inOut" }
                            );
                        }
                    });
                } else if (el.matches(".section_img.scRight")) {
                    const img = el.querySelector('img') || el;
                    tl_master.fromTo(
                        img,
                        { filter: "grayscale(100)", autoAlpha: 0, x: 75 },
                        { filter: "grayscale(0)", autoAlpha: 1, x: 0, duration: 0.5 },
                        "start+=0.5"
                    );
                } else if (el.matches(".section_img.scLeft")) {
                    const img = el.querySelector('img') || el;
                    tl_master.fromTo(
                        img,
                        { filter: "grayscale(100)", autoAlpha: 0, x: -75 },
                        { filter: "grayscale(0)", autoAlpha: 1, x: 0, duration: 0.5 },
                        "start+=0.5"
                    );
                }
            });
        });
    });
}

/* SLIDERS */
async function renderSlides() {
    const lang = detectLanguage();
    const contentData = (await getLanguageData(lang)).default;

    const wrapper = document.querySelector(".slider_wrapper");
    const template = document.getElementById("slider_template");

    if (!wrapper || !template) return;
    const paginationContainer = wrapper.querySelector(".slider_pagination");

    wrapper.querySelectorAll(".slide").forEach(el => el.remove());

    const grouped = {};
    Object.entries(contentData).forEach(([key, value]) => {
        if (!key.startsWith("aboutSlider")) return;

        const match = key.match(/^(aboutSlider\w+)(\d{2})$/);
        if (!match) return;

        const baseKey = match[1];
        const suffix = match[2];

        if (!grouped[suffix]) grouped[suffix] = {};
        grouped[suffix][baseKey] = value;
    });

    Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([suffix, slideData]) => {
            const clone = template.content.cloneNode(true);
            const slide = clone.querySelector(".slide");

            slide.querySelectorAll("[data-lang]").forEach(el => {
                const key = el.dataset.lang;
                if (slideData[key] !== undefined) {
                    if (el.tagName === "IMG") {
                        el.src = slideData[key];
                    } else {
                        el.innerHTML = slideData[key];
                    }
                }
            });

            wrapper.insertBefore(slide, paginationContainer);
        });

    slideScript();
    return true;
}
function slideScript() {
    const sections = gsap.utils.toArray(".slide");
    const sectionImages = gsap.utils.toArray(".slider_backimg");
    const slideImages = gsap.utils.toArray(".slider_img");
    const outerWrappers = gsap.utils.toArray(".slider_outer");
    const innerWrappers = gsap.utils.toArray(".slider_inner");
    const count = document.querySelector(".slider_lead-count");
    const paginationContainer = document.querySelector(".slider_pagination");
    const wrap = gsap.utils.wrap(0, sections.length);
    let animating = false;
    let currentIndex = 0;

    if (!sections.length) return;

    gsap.set(outerWrappers, { xPercent: 100 });
    gsap.set(innerWrappers, { xPercent: -100 });

    gsap.set(sections[0], { autoAlpha: 1, zIndex: 2 });
    gsap.set([outerWrappers[0], innerWrappers[0]], { xPercent: 0 });
    if (count) count.textContent = 1;

    function gotoSection(index, direction) {
        animating = true;
        index = wrap(index);

        let tl = gsap.timeline({
            defaults: { duration: 1, ease: "expo.inOut" },
            onComplete: () => (animating = false),
        });

        let currentSection = sections[currentIndex];
        let nextSection = sections[index];

        let heading = currentSection.querySelector(".slider_heading");
        let title = currentSection.querySelector(".slider_title");
        let paragraph = currentSection.querySelector(".slider_paragraph");
        let button = currentSection.querySelector(".slider_button");

        let nextHeading = nextSection.querySelector(".slider_heading");
        let nextTitle = nextSection.querySelector(".slider_title");
        let nextParagraph = nextSection.querySelector(".slider_paragraph");
        let nextButton = nextSection.querySelector(".slider_button");

        gsap.set([sections, sectionImages, slideImages], { zIndex: 0, autoAlpha: 0 });
        gsap.set([currentSection, slideImages[currentIndex], sectionImages[currentIndex]], { zIndex: 1, autoAlpha: 1 });
        gsap.set([nextSection, slideImages[index], sectionImages[index]], { zIndex: 2, autoAlpha: 1 });

        if (count) tl.set(count, { text: index + 1 }, 0.32);

        tl.fromTo(outerWrappers[index], { xPercent: 100 * direction }, { xPercent: 0 }, 0)
            .fromTo(innerWrappers[index], { xPercent: -100 * direction }, { xPercent: 0 }, 0)
            .to(heading, { "--letterSp": 15, xPercent: 30 * direction }, 0)
            .to(title, { xPercent: 50 * direction }, 0)
            .to(paragraph, { xPercent: 30 * direction }, 0)
            .to(button, { xPercent: 30 * direction }, 0)
            .fromTo(nextHeading, { "--letterSp": 15, xPercent: -30 * direction }, { "--letterSp": 0, xPercent: 0 }, 0)
            .fromTo(nextTitle, { xPercent: -50 * direction }, { xPercent: 0 }, 0)
            .fromTo(nextParagraph, { xPercent: -30 * direction }, { xPercent: 0 }, 0)
            .fromTo(nextButton, { xPercent: -30 * direction }, { xPercent: 0 }, 0)
            .fromTo(slideImages[index], { scale: 2 }, { scale: 1 }, 0)
            .fromTo(sectionImages[index], { scaleX: 1.4, scaleY: 1.1 }, { scaleX: 1, scaleY: 1, duration: 1 }, 0)
            .fromTo(sectionImages[currentIndex], { scaleX: 1, scaleY: 1 }, { scaleX: 1.4, scaleY: 1.1 }, 0)
            .timeScale(0.8);

        currentIndex = index;
        updatePaginationStyle();
    }

    function createPagination() {
        paginationContainer.innerHTML = "";
        sections.forEach((section, index) => {
            const button = document.createElement("button");
            button.addEventListener("click", () => {
                if (animating) return;
                gotoSection(index, index > currentIndex ? 1 : -1);
            });
            paginationContainer.appendChild(button);
        });
        updatePaginationStyle();
    }

    function updatePaginationStyle() {
        const buttons = paginationContainer.querySelectorAll("button");
        buttons.forEach((button, index) => {
            button.classList.toggle("active", index === currentIndex);
        });
    }

    createPagination();

    if (sections.length > 1) {
        setInterval(() => {
            if (!animating) gotoSection(currentIndex + 1, 1);
        }, 7000);
    }
}

async function initApp() {
    Preloader();
    await langswitch();
    linkDecoration();
    hideHeader();
    heroParallax();
    contentSplits();
    await renderSlides();

    let videos = document.querySelectorAll('video');
    videos.forEach(function (video) {
        video.play().catch(error => {
            console.error("Video play failed:", error);
        });
    });
}
initApp();