/* =========================================================
   FOFANA PORTFOLIO
   Main JavaScript
   ========================================================= */


/* =========================================================
   1. MOBILE NAVIGATION
   ========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");

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
   2. FAQ ACCORDION
   ========================================================= */

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");

    if (!question) return;

    question.addEventListener("click", () => {

        const alreadyOpen = item.classList.contains("active");

        faqItems.forEach(otherItem => {
            otherItem.classList.remove("active");
        });

        if (!alreadyOpen) {
            item.classList.add("active");
        }

    });

});


/* =========================================================
   3. WEB DEVELOPMENT PROJECT SLIDER
   ========================================================= */

/*
   TEMPORARY PROJECT DATA

   These projects will eventually come from
   the Admin Dashboard and database.
*/

const webProjects = [

    {
        category: "WEB DEVELOPMENT",
        title: "Elite Gadgets",
        description: "Premium technology e-commerce website.",
        image: "",
        link: "https://fofanaumar73-ai.github.io/elite-gadgets/"
    },

    {
        category: "WEB DEVELOPMENT",
        title: "Project Two",
        description: "A modern responsive website.",
        image: "",
        link: "#"
    },

    {
        category: "WEB DEVELOPMENT",
        title: "Project Three",
        description: "A custom digital experience.",
        image: "",
        link: "#"
    }

];


let currentWebProject = 0;

const webSlider = document.querySelector(".portfolio-slider");

if (webSlider) {

    const slide = webSlider.querySelector(".portfolio-slide");
    const previousButton = webSlider.querySelector(".slider-prev");
    const nextButton = webSlider.querySelector(".slider-next");


    function displayWebProject(index) {

        const project = webProjects[index];

        if (!project || !slide) return;


        slide.innerHTML = `

            <div class="slide-placeholder"
                ${
                    project.image
                    ? `style="background-image: url('${project.image}'); background-size: cover; background-position: center;"`
                    : ""
                }>

                ${
                    project.image
                    ? ""
                    : "<span>PROJECT PREVIEW</span>"
                }

            </div>


            <div class="slide-info">

                <p>${project.category}</p>

                <h3>${project.title}</h3>

                <p>${project.description}</p>

                <a
                    href="${project.link}"
                    class="slide-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Project →
                </a>

            </div>

        `;

    }


    displayWebProject(currentWebProject);


    if (nextButton) {

        nextButton.addEventListener("click", () => {

            currentWebProject++;

            if (currentWebProject >= webProjects.length) {
                currentWebProject = 0;
            }

            displayWebProject(currentWebProject);

        });

    }


    if (previousButton) {

        previousButton.addEventListener("click", () => {

            currentWebProject--;

            if (currentWebProject < 0) {
                currentWebProject = webProjects.length - 1;
            }

            displayWebProject(currentWebProject);

        });

    }

}


/* =========================================================
   4. CREATIVE PORTFOLIO SLIDERS
   ========================================================= */

/*
   TEMPORARY DATA

   These are only placeholders for testing.

   Later, the Admin Dashboard will supply
   the real projects from the database.
*/

const creativeSlides = {

    "Brochure Design": [

        {
            title: "Brochure 01",
            image: ""
        },

        {
            title: "Brochure 02",
            image: ""
        },

        {
            title: "Brochure 03",
            image: ""
        },

        {
            title: "Brochure 04",
            image: ""
        }

    ],


    "Presentation Design": [

        {
            title: "Presentation 01",
            image: ""
        },

        {
            title: "Presentation 02",
            image: ""
        },

        {
            title: "Presentation 03",
            image: ""
        }

    ],


    "Ebook Design": [

        {
            title: "Ebook 01",
            image: ""
        },

        {
            title: "Ebook 02",
            image: ""
        },

        {
            title: "Ebook 03",
            image: ""
        }

    ],


    "Instagram Carousel": [

        {
            title: "Carousel 01",
            image: ""
        },

        {
            title: "Carousel 02",
            image: ""
        },

        {
            title: "Carousel 03",
            image: ""
        }

    ],


    "Pitch Deck": [

        {
            title: "Pitch Deck 01",
            image: ""
        },

        {
            title: "Pitch Deck 02",
            image: ""
        },

        {
            title: "Pitch Deck 03",
            image: ""
        }

    ]

};


/* =========================================================
   5. REUSABLE CREATIVE SLIDER ENGINE
   ========================================================= */

const designSections = document.querySelectorAll(".design-section");


designSections.forEach(section => {

    const heading = section.querySelector(
        ".section-heading h2"
    );

    const preview = section.querySelector(
        ".design-preview"
    );

    const previousButton = section.querySelector(
        ".slider-prev"
    );

    const nextButton = section.querySelector(
        ".slider-next"
    );


    if (
        !heading ||
        !preview ||
        !previousButton ||
        !nextButton
    ) {
        return;
    }


    const category = heading.textContent.trim();

    const slides = creativeSlides[category];


    if (!slides || slides.length === 0) {
        return;
    }


    let currentSlide = 0;

    let autoSlide;


    /* -----------------------------------------------------
       DISPLAY CURRENT SLIDE
       ----------------------------------------------------- */

    function displayCreativeSlide(index) {

        const selectedSlide = slides[index];

        if (!selectedSlide) return;


        preview.classList.remove("slide-changing");

        void preview.offsetWidth;


        if (selectedSlide.image) {

            preview.style.backgroundImage =
                `url("${selectedSlide.image}")`;

            preview.style.backgroundSize = "cover";

            preview.style.backgroundPosition = "center";

            preview.innerHTML = "";

        }

        else {

            preview.style.backgroundImage = "";

            preview.innerHTML = `
                <span>${selectedSlide.title}</span>
            `;

        }


        preview.classList.add("slide-changing");

    }


    /* -----------------------------------------------------
       NEXT SLIDE
       ----------------------------------------------------- */

    function nextSlide() {

        currentSlide++;

        if (currentSlide >= slides.length) {
            currentSlide = 0;
        }

        displayCreativeSlide(currentSlide);

    }


    /* -----------------------------------------------------
       PREVIOUS SLIDE
       ----------------------------------------------------- */

    function previousSlide() {

        currentSlide--;

        if (currentSlide < 0) {
            currentSlide = slides.length - 1;
        }

        displayCreativeSlide(currentSlide);

    }


    /* -----------------------------------------------------
       BUTTON CONTROLS
       ----------------------------------------------------- */

    nextButton.addEventListener(
        "click",
        () => {

            nextSlide();

            restartAutoSlide();

        }
    );


    previousButton.addEventListener(
        "click",
        () => {

            previousSlide();

            restartAutoSlide();

        }
    );


    /* -----------------------------------------------------
       AUTOMATIC SLIDING
       ----------------------------------------------------- */

    function startAutoSlide() {

        autoSlide = setInterval(
            nextSlide,
            5000
        );

    }


    function stopAutoSlide() {

        clearInterval(autoSlide);

    }


    function restartAutoSlide() {

        stopAutoSlide();

        startAutoSlide();

    }


    /* -----------------------------------------------------
       PAUSE WHEN USER HOVERS
       ----------------------------------------------------- */

    section.addEventListener(
        "mouseenter",
        stopAutoSlide
    );


    section.addEventListener(
        "mouseleave",
        startAutoSlide
    );


    /* -----------------------------------------------------
       INITIAL SLIDE
       ----------------------------------------------------- */

    displayCreativeSlide(currentSlide);

    startAutoSlide();

});


/* =========================================================
   6. TOUCH / SWIPE SUPPORT
   ========================================================= */

designSections.forEach(section => {

    const preview = section.querySelector(
        ".design-preview"
    );

    if (!preview) return;


    let touchStartX = 0;

    let touchEndX = 0;


    preview.addEventListener(
        "touchstart",
        event => {

            touchStartX =
                event.changedTouches[0].screenX;

        },
        { passive: true }
    );


    preview.addEventListener(
        "touchend",
        event => {

            touchEndX =
                event.changedTouches[0].screenX;


            const swipeDistance =
                touchStartX - touchEndX;


            if (Math.abs(swipeDistance) < 50) {
                return;
            }


            const buttonClass =
                swipeDistance > 0
                ? ".slider-next"
                : ".slider-prev";


            const button =
                section.querySelector(buttonClass);


            if (button) {
                button.click();
            }

        },
        { passive: true }
    );

});


/* =========================================================
   7. SCROLL REVEAL
   ========================================================= */

const revealElements = document.querySelectorAll(
    ".section-heading, .benefit-card, .stat, .reviews-placeholder, .service-information"
);


if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

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

        element.classList.add("reveal");

        revealObserver.observe(element);

    });

}


/* =========================================================
   8. ACTIVE NAVIGATION
   ========================================================= */

const sections = document.querySelectorAll(
    "main section[id]"
);

const navigationLinks = document.querySelectorAll(
    ".nav-menu a"
);


window.addEventListener(
    "scroll",
    () => {

        let currentSection = "";


        sections.forEach(section => {

            const sectionTop =
                section.offsetTop;

            const sectionHeight =
                section.offsetHeight;


            if (
                window.scrollY >= sectionTop - 200 &&
                window.scrollY <
                sectionTop + sectionHeight - 200
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navigationLinks.forEach(link => {

            link.classList.remove("active");


            const linkTarget =
                link.getAttribute("href");


            if (
                linkTarget ===
                `#${currentSection}`
            ) {

                link.classList.add("active");

            }

        });

    }
);


/* =========================================================
   9. CONSOLE MESSAGE
   ========================================================= */

console.log(
    "Fofana Portfolio is ready."
);
