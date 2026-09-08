/* =========================================================
   FOFANA PORTFOLIO — MAIN JAVASCRIPT
   ========================================================= */

/* =========================================================
   1. SUPABASE INITIALIZATION
   ========================================================= */

const PORTFOLIO_SUPABASE_URL = "https://uryfgatzyesolwwmugin.supabase.co";
const PORTFOLIO_SUPABASE_KEY = "sb_publishable_QL4lxGKETA1_xMFFJ7RV5g_Wuyi_x-d";

const portfolioSupabase = window.supabase.createClient(
    PORTFOLIO_SUPABASE_URL,
    PORTFOLIO_SUPABASE_KEY
);


/* =========================================================
   2. MOBILE NAVIGATION
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
   3. FAQ ACCORDION
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
   4. FETCH AND POPULATE SUPABASE PROJECTS
   ========================================================= */

async function loadPortfolioProjects() {
    try {
        const { data: projects, error } = await portfolioSupabase
            .from("projects")
            .select("*")
            .eq("status", "published")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("PORTFOLIO PROJECT ERROR:", error);
            return;
        }

        console.log("Portfolio projects loaded from Supabase:", projects);

        if (!projects || projects.length === 0) return;

        // Categorize projects matching backend keys
        const categorized = {
            web: projects.filter(p => p.category === "web-development" || p.category === "WEB DEVELOPMENT"),
            brochure: projects.filter(p => p.category === "brochure-design" || p.category === "Brochure Design"),
            presentation: projects.filter(p => p.category === "presentation-design" || p.category === "Presentation Design"),
            ebook: projects.filter(p => p.category === "ebook-design" || p.category === "Ebook Design"),
            carousel: projects.filter(p => p.category === "instagram-carousel" || p.category === "Instagram Carousel"),
            pitchDeck: projects.filter(p => p.category === "pitch-deck" || p.category === "Pitch Deck")
        };

        // Initialize Web Slider with real data
        if (categorized.web.length > 0) {
            initWebSlider(categorized.web);
        }

        // Initialize Creative Sliders with real data
        initCreativeSliders({
            "Brochure Design": categorized.brochure,
            "Presentation Design": categorized.presentation,
            "Ebook Design": categorized.ebook,
            "Instagram Carousel": categorized.carousel,
            "Pitch Deck": categorized.pitchDeck
        });

    } catch (err) {
        console.error("Unexpected error loading projects:", err);
    }
}


/* =========================================================
   5. WEB DEVELOPMENT SLIDER ENGINE (DYNAMIC)
   ========================================================= */

function initWebSlider(projects) {
    let currentWebProject = 0;
    const webSlider = document.querySelector(".portfolio-slider");

    if (!webSlider) return;

    const slide = webSlider.querySelector(".portfolio-slide");
    const previousButton = webSlider.querySelector(".slider-prev");
    const nextButton = webSlider.querySelector(".slider-next");

    function displayWebProject(index) {
        const project = projects[index];
        if (!project || !slide) return;

        const imageUrl = project.cover_image_url || "";

        slide.innerHTML = `
            <div class="slide-placeholder"
                ${imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : ''}>
                ${!imageUrl ? `<span>${project.title}</span>` : ''}
            </div>

            <div class="slide-info">
                <p>${project.category.replace("-", " ").toUpperCase()}</p>
                <h3>${project.title}</h3>
                <p>${project.description || ''}</p>
                ${project.project_link ? `
                    <a href="${project.project_link}" class="slide-link" target="_blank" rel="noopener noreferrer">
                        View Project →
                    </a>` : ''}
            </div>
        `;
    }

    displayWebProject(currentWebProject);

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            currentWebProject = (currentWebProject + 1) % projects.length;
            displayWebProject(currentWebProject);
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            currentWebProject = (currentWebProject - 1 + projects.length) % projects.length;
            displayWebProject(currentWebProject);
        });
    }
}


/* =========================================================
   6. CREATIVE SLIDER ENGINE (DYNAMIC)
   ========================================================= */

function initCreativeSliders(creativeData) {
    const designSections = document.querySelectorAll(".design-section");

    designSections.forEach(section => {
        const heading = section.querySelector(".section-heading h2");
        const preview = section.querySelector(".design-preview");
        const previousButton = section.querySelector(".slider-prev");
        const nextButton = section.querySelector(".slider-next");

        if (!heading || !preview || !previousButton || !nextButton) return;

        const categoryTitle = heading.textContent.trim();
        const slides = creativeData[categoryTitle];

        if (!slides || slides.length === 0) return;

        let currentSlide = 0;
        let autoSlide;

        function displayCreativeSlide(index) {
            const selectedSlide = slides[index];
            if (!selectedSlide) return;

            const imageUrl = selectedSlide.cover_image_url || (selectedSlide.project_images && selectedSlide.project_images[0]);

            preview.classList.remove("slide-changing");
            void preview.offsetWidth;

            if (imageUrl) {
                preview.style.backgroundImage = `url("${imageUrl}")`;
                preview.style.backgroundSize = "cover";
                preview.style.backgroundPosition = "center";
                preview.innerHTML = "";
            } else {
                preview.style.backgroundImage = "";
                preview.innerHTML = `<span>${selectedSlide.title}</span>`;
            }

            preview.classList.add("slide-changing");
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            displayCreativeSlide(currentSlide);
        }

        function previousSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            displayCreativeSlide(currentSlide);
        }

        nextButton.addEventListener("click", () => {
            nextSlide();
            restartAutoSlide();
        });

        previousButton.addEventListener("click", () => {
            previousSlide();
            restartAutoSlide();
        });

        function startAutoSlide() {
            autoSlide = setInterval(nextSlide, 5000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlide);
        }

        function restartAutoSlide() {
            stopAutoSlide();
            startAutoSlide();
        }

        section.addEventListener("mouseenter", stopAutoSlide);
        section.addEventListener("mouseleave", startAutoSlide);

        displayCreativeSlide(currentSlide);
        startAutoSlide();
    });
}


/* =========================================================
   7. TOUCH / SWIPE SUPPORT
   ========================================================= */

document.querySelectorAll(".design-section").forEach(section => {
    const preview = section.querySelector(".design-preview");
    if (!preview) return;

    let touchStartX = 0;
    let touchEndX = 0;

    preview.addEventListener("touchstart", event => {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    preview.addEventListener("touchend", event => {
        touchEndX = event.changedTouches[0].screenX;
        const swipeDistance = touchStartX - touchEndX;

        if (Math.abs(swipeDistance) < 50) return;

        const buttonClass = swipeDistance > 0 ? ".slider-next" : ".slider-prev";
        const button = section.querySelector(buttonClass);

        if (button) button.click();
    }, { passive: true });
});


/* =========================================================
   8. SCROLL REVEAL & ACTIVE NAVIGATION
   ========================================================= */

const revealElements = document.querySelectorAll(".section-heading, .benefit-card, .stat, .service-information");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("revealed");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(element => {
        element.classList.add("reveal");
        revealObserver.observe(element);
    });
}

const sections = document.querySelectorAll("main section[id]");
const navigationLinks = document.querySelectorAll(".nav-menu a");

window.addEventListener("scroll", () => {
    let currentSection = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop - 200 && window.scrollY < sectionTop + sectionHeight - 200) {
            currentSection = section.getAttribute("id");
        }
    });

    navigationLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }
    });
});


/* =========================================================
   9. INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadPortfolioProjects();
});
