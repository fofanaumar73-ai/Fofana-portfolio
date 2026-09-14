/* =========================================================
   FOFANA PORTFOLIO — MAIN JAVASCRIPT
   ========================================================= */

/* =========================================================
   1. SUPABASE INITIALIZATION
   ========================================================= */

const PORTFOLIO_SUPABASE_URL =
    "https://uryfgatzyesolwwmugin.supabase.co";

const PORTFOLIO_SUPABASE_KEY =
    "sb_publishable_QL4lxGKETA1_xMFFJ7RV5g_Wuyi_x-d";

const portfolioSupabase =
    window.supabase.createClient(
        PORTFOLIO_SUPABASE_URL,
        PORTFOLIO_SUPABASE_KEY
    );


/* =========================================================
   2. HELPERS
   ========================================================= */

function normalizeCategory(category) {
    if (!category) return "";

    return String(category)
        .toLowerCase()
        .trim()
        .replace(/_/g, "-")
        .replace(/\s+/g, "-");
}


function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getProjectCover(project) {
    if (project?.cover_image_url) {
        return project.cover_image_url;
    }

    if (
        Array.isArray(project?.project_images) &&
        project.project_images.length
    ) {
        return project.project_images[0];
    }

    return "";
}


function getProjectImages(project) {
    const images = [];

    if (
        Array.isArray(project?.project_images)
    ) {
        project.project_images.forEach(image => {
            if (!image) return;

            if (!images.includes(image)) {
                images.push(image);
            }
        });
    }

    return images;
}


/* =========================================================
   3. MOBILE NAVIGATION
   ========================================================= */

function initializeMobileNavigation() {

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navMenu =
        document.querySelector(".nav-menu");

    if (!menuToggle || !navMenu) {
        return;
    }

    menuToggle.addEventListener(
        "click",
        event => {

            event.preventDefault();
            event.stopPropagation();

            const isOpen =
                navMenu.classList.toggle(
                    "mobile-active"
                );

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation"
                    : "Open navigation"
            );
        }
    );


    navMenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    navMenu.classList.remove(
                        "mobile-active"
                    );

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuToggle.setAttribute(
                        "aria-label",
                        "Open navigation"
                    );
                }
            );

        });
}


/* =========================================================
   4. FAQ ACCORDION
   ========================================================= */

function initializeFaq() {

    const faqItems =
        document.querySelectorAll(
            ".faq-item"
        );

    faqItems.forEach(item => {

        const question =
            item.querySelector(
                ".faq-question"
            );

        if (!question) {
            return;
        }

        question.addEventListener(
            "click",
            () => {

                const alreadyOpen =
                    item.classList.contains(
                        "active"
                    );

                faqItems.forEach(
                    otherItem => {
                        otherItem.classList.remove(
                            "active"
                        );
                    }
                );

                if (!alreadyOpen) {
                    item.classList.add(
                        "active"
                    );
                }
            }
        );
    });
}


/* =========================================================
   5. WEB PROJECT SLIDE
   ========================================================= */

function createWebProjectSlide(project) {

    const slide =
        document.createElement(
            "div"
        );

    slide.className =
        "portfolio-slide";

    const cover =
        getProjectCover(project);

    const title =
        project.title ||
        "Untitled Project";


    slide.innerHTML = `
        <div class="slide-preview">

            ${
                cover
                    ? `
                        <img
                            src="${escapeHtml(cover)}"
                            alt="${escapeHtml(title)}"
                            loading="lazy"
                        >
                    `
                    : `
                        <div class="slide-placeholder">
                            <span>
                                PROJECT PREVIEW
                            </span>
                        </div>
                    `
            }

        </div>


        <div class="slide-info">

            <p>
                WEB DEVELOPMENT
            </p>

            <h3>
                ${escapeHtml(title)}
            </h3>

            <a
                href="${escapeHtml(
                    project.project_link ||
                    `project.html?id=${encodeURIComponent(project.id)}`
                )}"
                class="slide-link"
                ${
                    project.project_link
                        ? 'target="_blank" rel="noopener noreferrer"'
                        : ""
                }
            >
                VIEW PROJECTS →
            </a>

        </div>
    `;


    return slide;
}


/* =========================================================
   6. CREATIVE PROJECT SLIDE
   ========================================================= */

function createCreativeSlide(
    project,
    category
) {

    const slide =
        document.createElement(
            "div"
        );

    slide.className =
        "creative-slide";

    const title =
        project.title ||
        "Untitled Project";


    /*
       IMPORTANT:

       The homepage displays ONLY
       the single cover image.

       The other uploaded pages are
       NOT displayed here.

       They are displayed on
       project.html after clicking
       VIEW PAGES.
    */

    const cover =
        project.cover_image_url ||
        "";


    slide.innerHTML = `
        <div class="design-preview">

            ${
                cover
                    ? `
                        <img
                            src="${escapeHtml(cover)}"
                            alt="${escapeHtml(title)}"
                            loading="lazy"
                            class="creative-cover-image"
                        >
                    `
                    : `
                        <div class="slide-placeholder">
                            <span>
                                PROJECT PREVIEW
                            </span>
                        </div>
                    `
            }

        </div>


        <div class="creative-slide-info">

            <a
                href="project.html?id=${encodeURIComponent(project.id)}"
                class="slide-link creative-page-link"
            >
                VIEW PAGES →
            </a>

        </div>
    `;


    return slide;
}


/* =========================================================
   7. SLIDER ENGINE
   ========================================================= */

function setupSlider(
    slider,
    slides
) {

    if (
        !slider ||
        !slides.length
    ) {
        return;
    }


    const previousButton =
        slider.querySelector(
            ".slider-prev"
        );

    const nextButton =
        slider.querySelector(
            ".slider-next"
        );


    let currentIndex = 0;

    let autoSlideTimer =
        null;


    function showSlide(index) {

        currentIndex =
            (
                index +
                slides.length
            ) %
            slides.length;


        slides.forEach(
            (slide, index) => {

                slide.classList.toggle(
                    "active",
                    index === currentIndex
                );

            }
        );
    }


    function nextSlide() {

        if (
            slides.length < 2
        ) {
            return;
        }

        showSlide(
            currentIndex + 1
        );
    }


    function previousSlide() {

        if (
            slides.length < 2
        ) {
            return;
        }

        showSlide(
            currentIndex - 1
        );
    }


    function stopAutoSlide() {

        if (
            !autoSlideTimer
        ) {
            return;
        }

        clearInterval(
            autoSlideTimer
        );

        autoSlideTimer =
            null;
    }


    function startAutoSlide() {

        stopAutoSlide();

        if (
            slides.length > 1
        ) {

            autoSlideTimer =
                setInterval(
                    nextSlide,
                    5000
                );
        }
    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                nextSlide();

                startAutoSlide();
            }
        );
    }


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                previousSlide();

                startAutoSlide();
            }
        );
    }


    slider.addEventListener(
        "mouseenter",
        stopAutoSlide
    );


    slider.addEventListener(
        "mouseleave",
        startAutoSlide
    );


    showSlide(0);

    startAutoSlide();
}


/* =========================================================
   8. WEB SLIDER
   ========================================================= */

function initializeWebSlider(
    slider,
    projects
) {

    if (!slider) {
        return;
    }


    const track =
        slider.querySelector(
            ".portfolio-slider-track"
        );


    if (!track) {
        return;
    }


    if (!projects.length) {
        return;
    }


    track.innerHTML = "";


    projects.forEach(
        project => {

            track.appendChild(
                createWebProjectSlide(
                    project
                )
            );

        }
    );


    const slides =
        Array.from(
            track.querySelectorAll(
                ".portfolio-slide"
            )
        );


    setupSlider(
        slider,
        slides
    );
}


/* =========================================================
   9. CREATIVE SLIDERS
   ========================================================= */

function initializeCreativeSlider(
    slider,
    projects,
    category
) {

    if (!slider) {
        return;
    }


    const track =
        slider.querySelector(
            ".portfolio-slider-track"
        );


    if (!track) {
        return;
    }


    if (!projects.length) {
        return;
    }


    track.innerHTML = "";


    projects.forEach(
        project => {

            track.appendChild(
                createCreativeSlide(
                    project,
                    category
                )
            );

        }
    );


    const slides =
        Array.from(
            track.querySelectorAll(
                ".creative-slide"
            )
        );


    setupSlider(
        slider,
        slides
    );


    updateCreativeProjectButtons(
        slider.closest(
            ".portfolio-section"
        )
    );
}


/* =========================================================
   10. REMOVE OLD CREATIVE BUTTONS
   ========================================================= */

function updateCreativeProjectButtons(
    section
) {

    if (!section) {
        return;
    }


    section
        .querySelectorAll(
            ".creative-project-link"
        )
        .forEach(
            button => {
                button.remove();
            }
        );
}


/* =========================================================
   11. LOAD PORTFOLIO PROJECTS
   ========================================================= */

async function loadPortfolioProjects() {

    try {

        const {
            data: projects,
            error
        } =
            await portfolioSupabase
                .from("projects")
                .select("*")
                .eq(
                    "status",
                    "published"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "PORTFOLIO PROJECT ERROR:",
                error
            );

            return;
        }


        if (
            !Array.isArray(projects)
        ) {
            return;
        }


        initializePortfolioSliders(
            projects
        );

    } catch (error) {

        console.error(
            "Unexpected portfolio error:",
            error
        );
    }
}


/* =========================================================
   12. INITIALIZE PORTFOLIO SLIDERS
   ========================================================= */

function initializePortfolioSliders(
    projects
) {

    const sections =
        document.querySelectorAll(
            "main section[data-category]"
        );


    sections.forEach(
        section => {

            const category =
                normalizeCategory(
                    section.dataset.category
                );


            if (!category) {
                return;
            }


            const categoryProjects =
                projects.filter(
                    project =>
                        normalizeCategory(
                            project.category
                        ) === category
                );


            const webSlider =
                section.querySelector(
                    ".portfolio-slider"
                );


            if (webSlider) {

                initializeWebSlider(
                    webSlider,
                    categoryProjects
                );

                return;
            }


            const creativeSlider =
                section.querySelector(
                    ".full-width-slider"
                );


            if (creativeSlider) {

                initializeCreativeSlider(
                    creativeSlider,
                    categoryProjects,
                    category
                );
            }

        }
    );
}


/* =========================================================
   13. LEARN MORE
   ========================================================= */

function initializeLearnMore() {

    const buttons =
        document.querySelectorAll(
            ".learn-more"
        );


    buttons.forEach(
        button => {

            const targetId =
                button.dataset.learnTarget;


            if (!targetId) {
                return;
            }


            const target =
                document.getElementById(
                    targetId
                );


            if (!target) {
                return;
            }


            button.setAttribute(
                "aria-expanded",
                "false"
            );


            target.hidden =
                true;


            target.classList.remove(
                "open",
                "active"
            );


            button.addEventListener(
                "click",
                () => {

                    const isOpen =
                        button.getAttribute(
                            "aria-expanded"
                        ) === "true";


                    buttons.forEach(
                        otherButton => {

                            const otherId =
                                otherButton.dataset
                                    .learnTarget;


                            const otherTarget =
                                document.getElementById(
                                    otherId
                                );


                            if (
                                !otherTarget ||
                                otherButton === button
                            ) {
                                return;
                            }


                            otherButton.setAttribute(
                                "aria-expanded",
                                "false"
                            );


                            otherTarget.hidden =
                                true;


                            otherTarget.classList.remove(
                                "open",
                                "active"
                            );
                        }
                    );


                    button.setAttribute(
                        "aria-expanded",
                        String(!isOpen)
                    );


                    target.hidden =
                        isOpen;


                    target.classList.toggle(
                        "open",
                        !isOpen
                    );


                    target.classList.toggle(
                        "active",
                        !isOpen
                    );


                    if (!isOpen) {

                        setTimeout(
                            () => {

                                target.scrollIntoView({
                                    behavior:
                                        "smooth",

                                    block:
                                        "center"
                                });

                            },
                            80
                        );
                    }

                }
            );
        }
    );
}
