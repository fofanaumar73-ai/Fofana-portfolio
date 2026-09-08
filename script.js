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

        navMenu.classList.toggle(
            "mobile-active"
        );

    });


    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove(
                "mobile-active"
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

            otherItem.classList.remove(
                "active"
            );

        });


        if (!alreadyOpen) {

            item.classList.add(
                "active"
            );

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



function getCategoryContainer(category) {

    const normalized =
        normalizeCategory(category);


    const containers = {

        "web-development":
            "webDevelopmentProjects",

        "brochure-design":
            "brochureProjects",

        "presentation-design":
            "presentationProjects",

        "ebook-design":
            "ebookProjects",

        "instagram-carousel":
            "carouselProjects",

        "pitch-deck":
            "pitchDeckProjects"

    };


    const containerId =
        containers[normalized];


    if (!containerId) {
        return null;
    }


    return document.getElementById(
        containerId
    );

}



/* =========================================================
   5. CREATE PROJECT CARD
   ========================================================= */

function createProjectCard(project) {

    const card =
        document.createElement("article");


    card.className =
        "portfolio-project-card";


    const cover =
        project.cover_image_url ||
        (
            project.project_images &&
            project.project_images.length
                ? project.project_images[0]
                : ""
        );


    const category =
        project.category
            ? project.category
                .replace(/-/g, " ")
                .toUpperCase()
            : "PROJECT";


    card.innerHTML = `

        <div class="portfolio-project-image">

            ${
                cover

                ? `
                    <img
                        src="${escapeHtml(cover)}"
                        alt="${escapeHtml(project.title)}"
                        loading="lazy"
                    >
                `

                : `
                    <div class="project-image-placeholder">
                        <span>
                            PROJECT PREVIEW
                        </span>
                    </div>
                `
            }

        </div>


        <div class="portfolio-project-info">

            <p class="portfolio-project-category">
                ${escapeHtml(category)}
            </p>


            <h3>
                ${escapeHtml(project.title)}
            </h3>


            <p>
                ${escapeHtml(project.description || "")}
            </p>


            <a
                href="project.html?id=${encodeURIComponent(project.id)}"
                class="portfolio-learn-more"
            >
                ${
                    normalizeCategory(project.category)
                    === "web-development"

                    ? "VIEW PROJECT →"

                    : "LEARN MORE →"
                }
            </a>

        </div>

    `;


    return card;

}



/* =========================================================
   6. BASIC HTML ESCAPE
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
   7. DISPLAY PROJECTS BY CATEGORY
   ========================================================= */

function displayProjects(projects) {

    const containers = [

        "webDevelopmentProjects",

        "brochureProjects",

        "presentationProjects",

        "ebookProjects",

        "carouselProjects",

        "pitchDeckProjects"

    ];


    containers.forEach(id => {

        const container =
            document.getElementById(id);


        if (container) {

            container.innerHTML = "";

        }

    });


    projects.forEach(project => {

        const container =
            getCategoryContainer(
                project.category
            );


        if (!container) {

            console.warn(
                "Unknown project category:",
                project.category
            );

            return;

        }


        const card =
            createProjectCard(project);


        container.appendChild(card);

    });

}



/* =========================================================
   8. LOAD PROJECTS FROM SUPABASE
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


        displayProjects(
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
   9. PROJECT DETAIL PAGE
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
   10. DISPLAY PROJECT DETAILS
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
            project.title;

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


    /* ---------------------------------------------------------
       COVER
    --------------------------------------------------------- */

    if (cover) {

        const coverUrl =
            project.cover_image_url;


        if (coverUrl) {

            cover.src =
                coverUrl;

            cover.alt =
                project.title;

            cover.style.display =
                "block";

        } else {

            cover.style.display =
                "none";

        }

    }


    /* ---------------------------------------------------------
       PROJECT LINK
    --------------------------------------------------------- */

    if (externalLink) {

        if (project.project_link) {

            externalLink.href =
                project.project_link;

            externalLink.style.display =
                "inline-flex";

        } else {

            externalLink.style.display =
                "none";

        }

    }


    /* ---------------------------------------------------------
       GALLERY
    --------------------------------------------------------- */

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
   11. PROJECT ERROR
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
   12. SCROLL REVEAL
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
   13. ACTIVE NAVIGATION
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

        let currentSection =
            "";


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
   14. INITIALIZE
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
