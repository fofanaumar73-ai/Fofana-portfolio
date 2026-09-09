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

        navMenu.classList.toggle("mobile-active");

    });

    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("mobile-active");

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
   4. CATEGORY HELPERS
   ========================================================= */

function normalizeCategory(category) {

    if (!category) {
        return "";
    }

    return category
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
   6. CREATE PROJECT SLIDE
   ========================================================= */

function createProjectSlide(project, category) {

    const slide =
        document.createElement("div");

    slide.className = "portfolio-slide";

    const cover =
        project.cover_image_url ||
        (
            Array.isArray(project.project_images) &&
            project.project_images.length
                ? project.project_images[0]
                : ""
        );

    const title =
        project.title || "Untitled Project";

    const description =
        project.description || "";

    const normalized =
        normalizeCategory(category);

    const buttonText =
        normalized === "web-development"
            ? "VIEW PROJECT →"
            : "LEARN MORE →";

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
                ${escapeHtml(
                    category
                        .replace(/-/g, " ")
                        .toUpperCase()
                )}
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
                ${buttonText}
            </a>

        </div>

    `;

    return slide;

}


/* =========================================================
   7. INITIALIZE SLIDER
   ========================================================= */

function initializeSlider(slider, projects, category) {

    if (!slider) return;

    const previousButton =
        slider.querySelector(".slider-prev");

    const nextButton =
        slider.querySelector(".slider-next");

    let slides = [];
    let currentIndex = 0;
    let autoSlideTimer = null;

    /*
       Find the existing slide container.
    */

    const existingSlide =
        slider.querySelector(".portfolio-slide") ||
        slider.querySelector(".design-preview");

    /*
       If no projects exist, leave the placeholder.
    */

    if (!projects || projects.length === 0) {

        return;

    }


    /*
       Create a dedicated track.
    */

    let track =
        slider.querySelector(".portfolio-slider-track");

    if (!track) {

        track =
            document.createElement("div");

        track.className =
            "portfolio-slider-track";

        slider.insertBefore(
            track,
            nextButton
        );

    }

    track.innerHTML = "";

    /*
       Create all project slides.
    */

    projects.forEach(project => {

        const slide =
            createProjectSlide(
                project,
                category
            );

        track.appendChild(slide);

    });

    slides =
        Array.from(
            track.children
        );


    /*
       Hide all slides except first.
    */

    function showSlide(index) {

        if (!slides.length) return;

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


    /*
       NEXT
    */

    function nextSlide() {

        showSlide(
            currentIndex + 1
        );

    }


    /*
       PREVIOUS
    */

    function previousSlide() {

        showSlide(
            currentIndex - 1
        );

    }


    /*
       RESET AUTO SLIDE TIMER
    */

    function resetAutoSlide() {

        clearInterval(
            autoSlideTimer
        );

        if (slides.length > 1) {

            autoSlideTimer =
                setInterval(
                    nextSlide,
                    5000
                );

        }

    }


    /*
       NEXT BUTTON
    */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                nextSlide();

                resetAutoSlide();

            }
        );

    }


    /*
       PREVIOUS BUTTON
    */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                previousSlide();

                resetAutoSlide();

            }
        );

    }


    /*
       START FIRST SLIDE
    */

    showSlide(0);

    resetAutoSlide();


    /*
       Pause when mouse is over slider.
       This prevents the slide changing while
       someone is reading it.
    */

    slider.addEventListener(
        "mouseenter",
        () => {

            clearInterval(
                autoSlideTimer
            );

        }
    );


    slider.addEventListener(
        "mouseleave",
        () => {

            resetAutoSlide();

        }
    );

}


/* =========================================================
   8. LOAD PORTFOLIO PROJECTS
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


        console.log(
            "Portfolio projects loaded:",
            projects
        );


        if (!projects) {
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
   9. INITIALIZE ALL PORTFOLIO SLIDERS
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


        if (!category) return;


        const categoryProjects =
            projects.filter(project => {

                return normalizeCategory(
                    project.category
                ) === category;

            });


        const slider =
            section.querySelector(
                ".portfolio-slider, .full-width-slider"
            );


        if (!slider) return;


        initializeSlider(
            slider,
            categoryProjects,
            category
        );

    });

}


/* =========================================================
   10. PROJECT DETAIL PAGE
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

                .eq(
                    "id",
                    projectId
                )

                .eq(
                    "status",
                    "published"
                )

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
   11. DISPLAY PROJECT DETAILS
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


    /* COVER */

    if (cover) {

        const coverUrl =
            project.cover_image_url;

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


    /* PROJECT LINK */

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


    /* GALLERY */

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
                    `${project.title} - Page ${index + 1}`;

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
        `${project.title} | Fofana Umar`;

}


/* =========================================================
   12. PROJECT ERROR
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
   13. SCROLL REVEAL
   ========================================================= */

const revealElements =
    document.querySelectorAll(
        ".section-heading, .benefit-card, .stat, .service-information"
    );


if (
    "IntersectionObserver"
    in window
) {

    const revealObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(
                    entry => {

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

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        element => {

            element.classList.add(
                "reveal"
            );

            revealObserver.observe(
                element
            );

        }
    );

}


/* =========================================================
   14. ACTIVE NAVIGATION
   ========================================================= */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );

const navigationLinks =
    document.querySelectorAll(
        ".nav-menu a"
    );


window.addEventListener(
    "scroll",
    () => {

        let currentSection = "";


        sections.forEach(
            section => {

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
                        section.getAttribute(
                            "id"
                        );

                }

            }
        );


        navigationLinks.forEach(
            link => {

                link.classList.remove(
                    "active"
                );


                if (
                    link.getAttribute(
                        "href"
                    ) ===
                    `#${currentSection}`
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);


/* =========================================================
   15. INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const isProjectPage =
            window.location.pathname
                .toLowerCase()
                .includes(
                    "project.html"
                );


        if (isProjectPage) {

            loadProjectDetails();

        } else {

            loadPortfolioProjects();

        }

    }
);
