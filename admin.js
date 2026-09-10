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
   2. MOBILE NAVIGATION
   ========================================================= */

const menuToggle =
    document.querySelector(".menu-toggle");

const navMenu =
    document.querySelector(".nav-menu");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        const isOpen =
            navMenu.classList.toggle("mobile-active");

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

    });


    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

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

        });

    });

}


/* =========================================================
   3. FAQ ACCORDION
   ========================================================= */

const faqItems =
    document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question =
        item.querySelector(".faq-question");

    if (!question) return;

    question.addEventListener("click", () => {

        const alreadyOpen =
            item.classList.contains("active");


        faqItems.forEach(otherItem => {

            otherItem.classList.remove("active");

        });


        if (!alreadyOpen) {

            item.classList.add("active");

        }

    });

});


/* =========================================================
   4. CATEGORY NORMALIZATION
   ========================================================= */

function normalizeCategory(category) {

    if (!category) {
        return "";
    }

    return String(category)
        .toLowerCase()
        .trim()
        .replace(/_/g, "-")
        .replace(/\s+/g, "-");

}


/* =========================================================
   5. HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   6. GET PROJECT COVER
========================================================= */

function getProjectCover(project) {

    if (project.cover_image_url) {

        return project.cover_image_url;

    }


    if (
        Array.isArray(project.project_images) &&
        project.project_images.length > 0
    ) {

        return project.project_images[0];

    }


    return "";

}


/* =========================================================
   7. CREATE WEB PROJECT SLIDE
========================================================= */

function createWebProjectSlide(project) {

    const slide =
        document.createElement("div");

    slide.className =
        "portfolio-slide";


    const cover =
        getProjectCover(project);


    const title =
        project.title ||
        "Untitled Project";


    const description =
        project.description ||
        "";


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

            <p>
                ${escapeHtml(description)}
            </p>

            <a
                href="project.html?id=${encodeURIComponent(project.id)}"
                class="slide-link"
            >
                VIEW PROJECT →
            </a>

        </div>

    `;


    return slide;

}


/* =========================================================
   8. CREATE CREATIVE DESIGN SLIDE
========================================================= */

function createCreativeSlide(project, category) {

    const slide =
        document.createElement("div");

    slide.className =
        "creative-slide";


    const cover =
        getProjectCover(project);


    const title =
        project.title ||
        "Untitled Project";


    const description =
        project.description ||
        "";


    const categoryName =
        category
            .replace(/-/g, " ")
            .toUpperCase();


    slide.innerHTML = `

        <div class="design-preview">

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
                                ${escapeHtml(categoryName)} PREVIEW
                            </span>
                        </div>
                    `
            }

        </div>


        <div class="creative-slide-info">

            <p>
                ${escapeHtml(categoryName)}
            </p>

            <h3>
                ${escapeHtml(title)}
            </h3>

            <p>
                ${escapeHtml(description)}
            </p>

            <a
                href="project.html?id=${encodeURIComponent(project.id)}"
                class="slide-link"
            >
                LEARN MORE →
            </a>

        </div>

    `;


    return slide;

}


/* =========================================================
   9. GENERIC SLIDER ENGINE
========================================================= */

function setupSlider(slider, slides) {

    if (!slider || !slides.length) {
        return;
    }


    const previousButton =
        slider.querySelector(".slider-prev");

    const nextButton =
        slider.querySelector(".slider-next");


    let currentIndex = 0;

    let autoSlideTimer = null;


    function showSlide(index) {

        currentIndex =
            (index + slides.length) %
            slides.length;


        slides.forEach((slide, i) => {

            slide.classList.toggle(
                "active",
                i === currentIndex
            );

        });

    }


    function nextSlide() {

        if (slides.length < 2) {
            return;
        }

        showSlide(
            currentIndex + 1
        );

    }


    function previousSlide() {

        if (slides.length < 2) {
            return;
        }

        showSlide(
            currentIndex - 1
        );

    }


    function stopAutoSlide() {

        if (autoSlideTimer) {

            clearInterval(
                autoSlideTimer
            );

            autoSlideTimer = null;

        }

    }


    function startAutoSlide() {

        stopAutoSlide();


        if (slides.length > 1) {

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
   10. INITIALIZE WEB SLIDER
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


    /*
       If there are no projects,
       keep the HTML placeholder.
    */

    if (
        !projects ||
        projects.length === 0
    ) {

        return;

    }


    track.innerHTML = "";


    projects.forEach(project => {

        track.appendChild(
            createWebProjectSlide(project)
        );

    });


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
   11. INITIALIZE CREATIVE SLIDER
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


    /*
       If there are no projects,
       keep the HTML placeholder.
    */

    if (
        !projects ||
        projects.length === 0
    ) {

        return;

    }


    track.innerHTML = "";


    projects.forEach(project => {

        track.appendChild(
            createCreativeSlide(
                project,
                category
            )
        );

    });


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

}


/* =========================================================
   12. LOAD PORTFOLIO PROJECTS
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
                .eq("status", "published")
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


        console.log(
            "Portfolio projects loaded:",
            projects
        );


        if (!Array.isArray(projects)) {
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
   13. INITIALIZE ALL PORTFOLIO SLIDERS
========================================================= */

function initializePortfolioSliders(
    projects
) {

    const sections =
        document.querySelectorAll(
            "[data-category]"
        );


    sections.forEach(section => {

        const category =
            normalizeCategory(
                section.dataset.category
            );


        if (!category) {
            return;
        }


        const categoryProjects =
            projects.filter(project => {

                return normalizeCategory(
                    project.category
                ) === category;

            });


        /*
           WEB DEVELOPMENT
        */

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


        /*
           CREATIVE DESIGN
        */

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

    });

}


/* =========================================================
   14. PROJECT DETAIL PAGE
========================================================= */

async function loadProjectDetails() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const projectId =
        params.get("id");


    if (!projectId) {

        showProjectError(
            "No project was selected."
        );

        return;

    }


    try {

        const {
            data: project,
            error
        } =
            await portfolioSupabase
                .from("projects")
                .select("*")
                .eq("id", projectId)
                .eq("status", "published")
                .single();


        if (error || !project) {

            console.error(
                "PROJECT DETAIL ERROR:",
                error
            );

            showProjectError(
                "Project could not be found."
            );

            return;

        }


        displayProjectDetails(
            project
        );


    } catch (error) {

        console.error(
            "Unexpected detail error:",
            error
        );

        showProjectError(
            "Something went wrong while loading this project."
        );

    }

}


/* =========================================================
   15. DISPLAY PROJECT DETAILS
========================================================= */

function displayProjectDetails(project) {

    const title =
        document.getElementById(
            "projectTitle"
        );

    const category =
        document.getElementById(
            "projectCategory"
        );

    const description =
        document.getElementById(
            "projectDescription"
        );

    const cover =
        document.getElementById(
            "projectCover"
        );

    const gallery =
        document.getElementById(
            "projectGallery"
        );

    const externalLink =
        document.getElementById(
            "projectExternalLink"
        );


    if (title) {

        title.textContent =
            project.title || "";

    }


    if (category) {

        category.textContent =
            project.category
                ? project.category
                    .replace(/-/g, " ")
                    .toUpperCase()
                : "";

    }


    if (description) {

        description.textContent =
            project.description || "";

    }


    /* =====================================================
       COVER
    ===================================================== */

    if (cover) {

        const coverUrl =
            getProjectCover(project);


        if (coverUrl) {

            cover.src =
                coverUrl;

            cover.alt =
                project.title || "";

            cover.style.display =
                "block";

        } else {

            cover.style.display =
                "none";

        }

    }


    /* =====================================================
       PROJECT LINK
    ===================================================== */

    if (externalLink) {

        if (project.project_link) {

            externalLink.href =
                project.project_link;

            externalLink.target =
                "_blank";

            externalLink.rel =
                "noopener noreferrer";

            externalLink.style.display =
                "inline-flex";

        } else {

            externalLink.style.display =
                "none";

        }

    }


    /* =====================================================
       GALLERY
    ===================================================== */

    if (gallery) {

        gallery.innerHTML = "";


        const images =
            Array.isArray(
                project.project_images
            )
                ? project.project_images
                : [];


        images.forEach(
            (imageUrl, index) => {

                if (!imageUrl) {
                    return;
                }


                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    imageUrl;


                image.alt =
                    `${project.title || "Project"} - Page ${index + 1}`;


                image.loading =
                    "lazy";


                image.className =
                    "project-gallery-image";


                gallery.appendChild(
                    image
                );

            }
        );

    }


    document.title =
        `${project.title || "Project"} | Fofana Umar`;

}


/* =========================================================
   16. PROJECT ERROR
========================================================= */

function showProjectError(message) {

    const loading =
        document.getElementById(
            "projectLoading"
        );

    const errorBox =
        document.getElementById(
            "projectError"
        );


    if (loading) {

        loading.style.display =
            "none";

    }


    if (errorBox) {

        errorBox.textContent =
            message;

        errorBox.style.display =
            "block";

    }

}


/* =========================================================
   17. SCROLL REVEAL
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".section-heading, .benefit-card, .stat, .service-information"
    );


if ("IntersectionObserver" in window) {

    const revealObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "revealed"
                        );

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(element => {

        element.classList.add(
            "reveal"
        );

        revealObserver.observe(
            element
        );

    });

} else {

    revealElements.forEach(element => {

        element.classList.add(
            "revealed"
        );

    });

}


/* =========================================================
   18. ACTIVE NAVIGATION
========================================================= */

const pageSections =
    document.querySelectorAll(
        "main section[id]"
    );


const navigationLinks =
    document.querySelectorAll(
        ".nav-menu a[href^='#']"
    );


function updateActiveNavigation() {

    let currentSection = "";


    pageSections.forEach(section => {

        const sectionTop =
            section.offsetTop;


        const sectionHeight =
            section.offsetHeight;


        if (
            window.scrollY >=
            sectionTop - 200 &&

            window.scrollY <
            sectionTop +
            sectionHeight -
            200
        ) {

            currentSection =
                section.id;

        }

    });


    navigationLinks.forEach(link => {

        link.classList.remove(
            "active"
        );


        if (
            link.getAttribute("href") ===
            `#${currentSection}`
        ) {

            link.classList.add(
                "active"
            );

        }

    });

}


window.addEventListener(
    "scroll",
    updateActiveNavigation,
    {
        passive: true
    }
);


/* =========================================================
   19. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const isProjectPage =
            window.location.pathname
                .toLowerCase()
                .endsWith(
                    "project.html"
                );


        if (isProjectPage) {

            loadProjectDetails();

        } else {

            loadPortfolioProjects();

        }


        updateActiveNavigation();

    }
);
