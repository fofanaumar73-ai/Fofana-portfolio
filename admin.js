/* =========================================================
   FOFANA PORTFOLIO — ADMIN CONTROLLER
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
   2. CHECK CURRENT PAGE
========================================================= */

const currentPage =
    window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

const isLoginPage =
    currentPage === "admin.html" ||
    currentPage === "";

const isDashboardPage =
    currentPage === "dashboard.html";

const isAddProjectPage =
    currentPage === "add-project.html";

const isManageProjectsPage =
    currentPage === "manage-projects.html";


/* =========================================================
   3. GET CURRENT SESSION
========================================================= */

async function getCurrentSession() {

    try {

        const { data, error } =
            await portfolioSupabase.auth.getSession();

        if (error) {

            console.error(
                "SESSION CHECK ERROR:",
                error
            );

            return null;
        }

        return data?.session || null;

    } catch (error) {

        console.error(
            "UNEXPECTED SESSION ERROR:",
            error
        );

        return null;
    }
}


/* =========================================================
   4. ADMIN LOGIN
========================================================= */

const adminLoginForm =
    document.getElementById("adminLoginForm");

if (adminLoginForm) {

    const adminEmail =
        document.getElementById("adminEmail");

    const adminPassword =
        document.getElementById("adminPassword");

    const loginMessage =
        document.getElementById("loginMessage");

    adminLoginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const email =
                adminEmail.value.trim();

            const password =
                adminPassword.value;

            const loginButton =
                adminLoginForm.querySelector(
                    "button[type='submit']"
                );

            loginMessage.textContent =
                "Logging in...";

            loginMessage.style.color =
                "#b46cff";

            loginButton.disabled = true;

            loginButton.textContent =
                "Logging in...";


            try {

                const { data, error } =
                    await portfolioSupabase.auth.signInWithPassword({

                        email: email,

                        password: password

                    });


                if (error) {

                    console.error(
                        "LOGIN ERROR:",
                        error
                    );

                    loginMessage.textContent =
                        error.message;

                    loginMessage.style.color =
                        "#ff6b6b";

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";

                    return;
                }


                if (data?.session) {

                    loginMessage.textContent =
                        "Login successful. Redirecting...";

                    loginMessage.style.color =
                        "#7dff9b";


                    setTimeout(() => {

                        window.location.href =
                            "dashboard.html";

                    }, 700);

                    return;
                }


                loginMessage.textContent =
                    "Login failed. No session was created.";

                loginMessage.style.color =
                    "#ff6b6b";

                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";


            } catch (error) {

                console.error(
                    "UNEXPECTED LOGIN ERROR:",
                    error
                );

                loginMessage.textContent =
                    "Something went wrong. Please try again.";

                loginMessage.style.color =
                    "#ff6b6b";

                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";
            }
        }
    );
}


/* =========================================================
   5. PROTECT ADMIN PAGES
========================================================= */

async function protectAdminPage() {

    const session =
        await getCurrentSession();

    if (!session) {

        window.location.href =
            "admin.html";

        return null;
    }

    return session;
}


/* =========================================================
   6. REDIRECT ALREADY LOGGED-IN USER
========================================================= */

async function redirectIfAlreadyLoggedIn() {

    const session =
        await getCurrentSession();

    if (session && isLoginPage) {

        window.location.href =
            "dashboard.html";
    }
}


/* =========================================================
   7. LOGOUT
========================================================= */

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled = true;

            logoutButton.textContent =
                "Logging out...";


            const { error } =
                await portfolioSupabase.auth.signOut();


            if (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );

                logoutButton.disabled = false;

                logoutButton.textContent =
                    "Logout";

                return;
            }


            window.location.href =
                "admin.html";
        }
    );
}


/* =========================================================
   8. ADD PROJECT BUTTON
========================================================= */

const addProjectButton =
    document.getElementById("addProjectButton");

if (addProjectButton) {

    addProjectButton.addEventListener(
        "click",
        async () => {

            const session =
                await protectAdminPage();

            if (!session) {
                return;
            }

            window.location.href =
                "add-project.html";
        }
    );
}


/* =========================================================
   9. MANAGE PROJECTS BUTTON
========================================================= */

const manageProjectsButton =
    document.getElementById(
        "manageProjectsButton"
    );

if (manageProjectsButton) {

    manageProjectsButton.addEventListener(
        "click",
        async () => {

            const session =
                await protectAdminPage();

            if (!session) {
                return;
            }

            window.location.href =
                "manage-projects.html";
        }
    );
}


/* =========================================================
   10. CLEAN FILE NAME
========================================================= */

function cleanFileName(fileName) {

    return fileName
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]/g, "-")
        .replace(/-+/g, "-");
}


/* =========================================================
   11. UPLOAD PROJECT FILE
========================================================= */

async function uploadProjectFile(
    file,
    folder,
    prefix
) {

    const safeName =
        cleanFileName(file.name);

    const uniqueId =
        typeof crypto !== "undefined" &&
        crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now() +
              "-" +
              Math.random()
                  .toString(36)
                  .substring(2);


    const filePath =
        `projects/${folder}/${prefix}-${uniqueId}-${safeName}`;


    const { error: uploadError } =
        await portfolioSupabase
            .storage
            .from("portfolio-projects")
            .upload(
                filePath,
                file,
                {
                    cacheControl: "3600",
                    upsert: false
                }
            );


    if (uploadError) {

        console.error(
            "FILE UPLOAD ERROR:",
            uploadError
        );

        throw uploadError;
    }


    const { data } =
        portfolioSupabase
            .storage
            .from("portfolio-projects")
            .getPublicUrl(filePath);


    if (!data?.publicUrl) {

        throw new Error(
            "Could not generate public image URL."
        );
    }


    return {
        url: data.publicUrl,
        path: filePath
    };
}


/* =========================================================
   12. ADD PROJECT FORM
========================================================= */

const projectForm =
    document.getElementById("projectForm");

if (projectForm) {

    projectForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const titleInput =
                document.getElementById(
                    "projectTitle"
                );

            const categoryInput =
                document.getElementById(
                    "projectCategory"
                );

            const descriptionInput =
                document.getElementById(
                    "projectDescription"
                );

            const projectLinkInput =
                document.getElementById(
                    "projectLink"
                );

            const coverImageInput =
                document.getElementById(
                    "projectImage"
                );

            const projectFilesInput =
                document.getElementById(
                    "projectFiles"
                );

            const featuredInput =
                document.getElementById(
                    "projectFeatured"
                );

            const statusInput =
                document.getElementById(
                    "projectStatus"
                );

            const projectMessage =
                document.getElementById(
                    "projectMessage"
                );

            const submitButton =
                projectForm.querySelector(
                    "button[type='submit']"
                );


            const title =
                titleInput.value.trim();

            const category =
                categoryInput.value;

            const description =
                descriptionInput.value.trim();

            const projectLink =
                projectLinkInput.value.trim();

            const coverFile =
                coverImageInput.files[0] ||
                null;

            const galleryFiles =
                Array.from(
                    projectFilesInput.files
                );

            const featured =
                featuredInput.checked;

            const status =
                statusInput.value;


            if (!title) {

                projectMessage.textContent =
                    "Please enter a project title.";

                projectMessage.style.color =
                    "#ff6b6b";

                return;
            }


            if (!category) {

                projectMessage.textContent =
                    "Please select a project category.";

                projectMessage.style.color =
                    "#ff6b6b";

                return;
            }


            if (!description) {

                projectMessage.textContent =
                    "Please enter a project description.";

                projectMessage.style.color =
                    "#ff6b6b";

                return;
            }


            const session =
                await protectAdminPage();

            if (!session) {
                return;
            }


            submitButton.disabled = true;

            submitButton.textContent =
                "Publishing...";

            projectMessage.textContent =
                "Saving project...";

            projectMessage.style.color =
                "#b46cff";


            try {

                /* CREATE DATABASE RECORD */

                const {
                    data: projectData,
                    error: insertError
                } =
                    await portfolioSupabase
                        .from("projects")
                        .insert({

                            title: title,

                            category: category,

                            description: description,

                            project_link:
                                projectLink ||
                                null,

                            featured:
                                featured,

                            status:
                                status

                        })
                        .select()
                        .single();


                if (insertError) {

                    throw insertError;
                }


                const projectId =
                    projectData.id;


                /* COVER IMAGE */

                let coverImageUrl =
                    null;


                if (coverFile) {

                    projectMessage.textContent =
                        "Uploading cover image...";


                    const coverResult =
                        await uploadProjectFile(
                            coverFile,
                            projectId,
                            "cover"
                        );


                    coverImageUrl =
                        coverResult.url;
                }


                /* GALLERY IMAGES */

                const projectImageUrls =
                    [];


                if (galleryFiles.length > 0) {

                    for (
                        let i = 0;
                        i < galleryFiles.length;
                        i++
                    ) {

                        projectMessage.textContent =
                            `Uploading image ${i + 1} of ${galleryFiles.length}...`;


                        const result =
                            await uploadProjectFile(
                                galleryFiles[i],
                                projectId,
                                `gallery-${i + 1}`
                            );


                        projectImageUrls.push(
                            result.url
                        );
                    }
                }


                /* UPDATE PROJECT */

                const {
                    error: updateError
                } =
                    await portfolioSupabase
                        .from("projects")
                        .update({

                            cover_image_url:
                                coverImageUrl,

                            project_images:
                                projectImageUrls

                        })
                        .eq(
                            "id",
                            projectId
                        );


                if (updateError) {

                    throw updateError;
                }


                projectMessage.textContent =
                    "Project published successfully!";

                projectMessage.style.color =
                    "#7dff9b";


                submitButton.textContent =
                    "Published ✓";


                projectForm.reset();


                setTimeout(() => {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Publish Project";

                }, 1500);


            } catch (error) {

                console.error(
                    "ADD PROJECT ERROR:",
                    error
                );


                projectMessage.textContent =
                    error.message ||
                    "Something went wrong while publishing the project.";

                projectMessage.style.color =
                    "#ff6b6b";


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Publish Project";
            }
        }
    );
}


/* =========================================================
   13. MANAGE PROJECTS
========================================================= */

const projectsContainer =
    document.getElementById(
        "projectsContainer"
    );


if (projectsContainer) {

    let allProjects = [];


    const searchInput =
        document.getElementById(
            "projectSearch"
        );

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const manageMessage =
        document.getElementById(
            "manageMessage"
        );


    /* -----------------------------------------
       LOAD PROJECTS
    ----------------------------------------- */

    async function loadProjects() {

        const session =
            await protectAdminPage();

        if (!session) {
            return;
        }


        projectsContainer.innerHTML = `
            <div class="project-loading">
                Loading projects...
            </div>
        `;


        const {
            data,
            error
        } =
            await portfolioSupabase
                .from("projects")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "LOAD PROJECTS ERROR:",
                error
            );


            projectsContainer.innerHTML = `
                <div class="project-empty">
                    <h3>Unable to load projects</h3>
                    <p>${escapeAdminHtml(error.message)}</p>
                </div>
            `;

            return;
        }


        allProjects =
            data || [];


        renderProjects();
    }


    /* -----------------------------------------
       ESCAPE HTML
    ----------------------------------------- */

    function escapeAdminHtml(value) {

        if (value === null ||
            value === undefined) {

            return "";
        }


        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* -----------------------------------------
       GET COVER IMAGE
    ----------------------------------------- */

    function getProjectCover(project) {

        if (
            project.cover_image_url &&
            project.cover_image_url.trim()
        ) {

            return project.cover_image_url;
        }


        if (
            Array.isArray(
                project.project_images
            ) &&
            project.project_images.length > 0
        ) {

            return project.project_images[0];
        }


        return "";
    }


    /* -----------------------------------------
       RENDER PROJECTS
    ----------------------------------------- */

    function renderProjects() {

        const searchTerm =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedCategory =
            categoryFilter
                ? categoryFilter.value
                : "";


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "";


        const filteredProjects =
            allProjects.filter(
                project => {

                    const matchesSearch =
                        !searchTerm ||
                        project.title
                            ?.toLowerCase()
                            .includes(
                                searchTerm
                            ) ||
                        project.description
                            ?.toLowerCase()
                            .includes(
                                searchTerm
                            );


                    const matchesCategory =
                        !selectedCategory ||
                        project.category ===
                            selectedCategory;


                    const matchesStatus =
                        !selectedStatus ||
                        project.status ===
                            selectedStatus;


                    return (
                        matchesSearch &&
                        matchesCategory &&
                        matchesStatus
                    );
                }
            );


        if (
            filteredProjects.length === 0
        ) {

            projectsContainer.innerHTML = `
                <div class="project-empty">
                    <div class="empty-icon">◈</div>
                    <h3>No projects found</h3>
                    <p>Try another search or add a new project.</p>
                </div>
            `;

            return;
        }


        projectsContainer.innerHTML =
            filteredProjects
                .map(
                    project =>
                        createProjectCard(
                            project
                        )
                )
                .join("");


        attachProjectActions();
    }


    /* -----------------------------------------
       CREATE PROJECT CARD
    ----------------------------------------- */

    function createProjectCard(
        project
    ) {

        const cover =
            getProjectCover(project);


        const imageHtml =
            cover
                ? `
                    <img
                        src="${escapeAdminHtml(cover)}"
                        alt="${escapeAdminHtml(project.title)}"
                        class="manage-project-image"
                    >
                  `
                : `
                    <div class="manage-project-no-image">
                        <span>NO IMAGE</span>
                    </div>
                  `;


        const statusClass =
            project.status === "published"
                ? "status-published"
                : "status-draft";


        const featuredHtml =
            project.featured
                ? `
                    <span class="project-featured-badge">
                        ★ Featured
                    </span>
                  `
                : "";


        return `
            <article
                class="manage-project-card"
                data-project-id="${escapeAdminHtml(project.id)}"
            >

                <div class="manage-project-image-wrap">

                    ${imageHtml}

                </div>


                <div class="manage-project-content">

                    <div class="manage-project-top">

                        <span class="project-category-badge">
                            ${escapeAdminHtml(project.category)}
                        </span>

                        <span class="project-status-badge ${statusClass}">
                            ${escapeAdminHtml(
                                project.status ||
                                "draft"
                            )}
                        </span>

                    </div>


                    <h2>
                        ${escapeAdminHtml(project.title)}
                    </h2>


                    <p>
                        ${escapeAdminHtml(
                            project.description ||
                            "No description."
                        )}
                    </p>


                    <div class="manage-project-meta">

                        ${featuredHtml}

                    </div>


                    <div class="manage-project-actions">

                        <button
                            type="button"
                            class="dashboard-button edit-project-button"
                            data-id="${escapeAdminHtml(project.id)}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="dashboard-button toggle-project-button"
                            data-id="${escapeAdminHtml(project.id)}"
                        >
                            ${
                                project.status === "published"
                                    ? "Set Draft"
                                    : "Publish"
                            }
                        </button>


                        <button
                            type="button"
                            class="dashboard-button feature-project-button"
                            data-id="${escapeAdminHtml(project.id)}"
                        >
                            ${
                                project.featured
                                    ? "Unfeature"
                                    : "Feature"
                            }
                        </button>


                        <button
                            type="button"
                            class="dashboard-button delete-project-button"
                            data-id="${escapeAdminHtml(project.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </article>
        `;
    }


    /* -----------------------------------------
       ATTACH BUTTON ACTIONS
    ----------------------------------------- */

    function attachProjectActions() {

        document
            .querySelectorAll(
                ".edit-project-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const project =
                            allProjects.find(
                                item =>
                                    item.id ===
                                    button.dataset.id
                            );


                        if (project) {

                            openEditProject(
                                project
                            );
                        }
                    }
                );
            });


        document
            .querySelectorAll(
                ".toggle-project-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        toggleProjectStatus(
                            button.dataset.id
                        );
                    }
                );
            });


        document
            .querySelectorAll(
                ".feature-project-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        toggleFeatured(
                            button.dataset.id
                        );
                    }
                );
            });


        document
            .querySelectorAll(
                ".delete-project-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteProject(
                            button.dataset.id
                        );
                    }
                );
            });
    }


    /* -----------------------------------------
       TOGGLE STATUS
    ----------------------------------------- */

    async function toggleProjectStatus(
        projectId
    ) {

        const project =
            allProjects.find(
                item =>
                    item.id === projectId
            );


        if (!project) {
            return;
        }


        const newStatus =
            project.status === "published"
                ? "draft"
                : "published";


        const {
            error
        } =
            await portfolioSupabase
                .from("projects")
                .update({
                    status: newStatus
                })
                .eq(
                    "id",
                    projectId
                );


        if (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error
            );

            alert(
                "Could not update project status."
            );

            return;
        }


        await loadProjects();
    }


    /* -----------------------------------------
       TOGGLE FEATURED
    ----------------------------------------- */

    async function toggleFeatured(
        projectId
    ) {

        const project =
            allProjects.find(
                item =>
                    item.id === projectId
            );


        if (!project) {
            return;
        }


        const {
            error
        } =
            await portfolioSupabase
                .from("projects")
                .update({
                    featured:
                        !project.featured
                })
                .eq(
                    "id",
                    projectId
                );


        if (error) {

            console.error(
                "FEATURE UPDATE ERROR:",
                error
            );

            alert(
                "Could not update featured status."
            );

            return;
        }


        await loadProjects();
    }


    /* -----------------------------------------
       DELETE PROJECT
    ----------------------------------------- */

    async function deleteProject(
        projectId
    ) {

        const project =
            allProjects.find(
                item =>
                    item.id === projectId
            );


        if (!project) {
            return;
        }


        const confirmed =
            confirm(
                `Delete "${project.title}"?\n\nThis will permanently remove the project from your portfolio.`
            );


        if (!confirmed) {
            return;
        }


        manageMessage.textContent =
            "Deleting project...";

        manageMessage.style.color =
            "#b46cff";


        try {

            /* DELETE DATABASE RECORD */

            const {
                error
            } =
                await portfolioSupabase
                    .from("projects")
                    .delete()
                    .eq(
                        "id",
                        projectId
                    );


            if (error) {

                throw error;
            }


            /*
               Storage cleanup is attempted below.
               If Storage delete permissions are not
               configured, the database deletion still
               succeeds.
            */

            const storagePaths =
                getProjectStoragePaths(
                    project
                );


            if (
                storagePaths.length > 0
            ) {

                const {
                    error: storageError
                } =
                    await portfolioSupabase
                        .storage
                        .from(
                            "portfolio-projects"
                        )
                        .remove(
                            storagePaths
                        );


                if (storageError) {

                    console.warn(
                        "STORAGE CLEANUP WARNING:",
                        storageError
                    );
                }
            }


            manageMessage.textContent =
                "Project deleted.";

            manageMessage.style.color =
                "#7dff9b";


            await loadProjects();


        } catch (error) {

            console.error(
                "DELETE PROJECT ERROR:",
                error
            );


            manageMessage.textContent =
                error.message ||
                "Could not delete project.";

            manageMessage.style.color =
                "#ff6b6b";
        }
    }


    /* -----------------------------------------
       GET STORAGE PATHS
    ----------------------------------------- */

    function getProjectStoragePaths(
        project
    ) {

        const paths = [];


        /*
           Supabase public URLs normally contain:

           /storage/v1/object/public/
           portfolio-projects/
           projects/...
        */

        const urls = [];


        if (project.cover_image_url) {

            urls.push(
                project.cover_image_url
            );
        }


        if (
            Array.isArray(
                project.project_images
            )
        ) {

            urls.push(
                ...project.project_images
            );
        }


        urls.forEach(url => {

            try {

                const marker =
                    "/portfolio-projects/";


                const index =
                    url.indexOf(
                        marker
                    );


                if (
                    index !== -1
                ) {

                    const path =
                        decodeURIComponent(
                            url.substring(
                                index +
                                marker.length
                            )
                        );


                    if (path) {

                        paths.push(
                            path
                        );
                    }
                }

            } catch (error) {

                console.warn(
                    "Could not parse storage URL:",
                    url
                );
            }
        });


        return [
            ...new Set(paths)
        ];
    }


    /* -----------------------------------------
       EDIT PROJECT
    ----------------------------------------- */

    function openEditProject(
        project
    ) {

        const modal =
            document.getElementById(
                "editProjectModal"
            );


        if (!modal) {
            return;
        }


        document.getElementById(
            "editProjectId"
        ).value =
            project.id;


        document.getElementById(
            "editProjectTitle"
        ).value =
            project.title || "";


        document.getElementById(
            "editProjectCategory"
        ).value =
            project.category || "";


        document.getElementById(
            "editProjectDescription"
        ).value =
            project.description || "";


        document.getElementById(
            "editProjectLink"
        ).value =
            project.project_link || "";


        document.getElementById(
            "editProjectFeatured"
        ).checked =
            Boolean(
                project.featured
            );


        document.getElementById(
            "editProjectStatus"
        ).value =
            project.status ||
            "draft";


        const currentCover =
            document.getElementById(
                "currentCoverImage"
            );


        if (
            currentCover &&
            project.cover_image_url
        ) {

            currentCover.innerHTML = `
                <img
                    src="${escapeAdminHtml(project.cover_image_url)}"
                    alt="Current cover"
                >
                <span>Current cover image</span>
            `;

        } else if (currentCover) {

            currentCover.innerHTML =
                "<span>No cover image</span>";
        }


        const editMessage =
            document.getElementById(
                "editProjectMessage"
            );


        if (editMessage) {

            editMessage.textContent =
                "";
        }


        modal.classList.add(
            "active"
        );


        document.body.classList.add(
            "modal-open"
        );
    }


    /* -----------------------------------------
       CLOSE EDIT MODAL
    ----------------------------------------- */

    function closeEditProject() {

        const modal =
            document.getElementById(
                "editProjectModal"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );


        document.body.classList.remove(
            "modal-open"
        );
    }


    const closeEditButton =
        document.getElementById(
            "closeEditProject"
        );


    const cancelEditButton =
        document.getElementById(
            "cancelEditProject"
        );


    if (closeEditButton) {

        closeEditButton.addEventListener(
            "click",
            closeEditProject
        );
    }


    if (cancelEditButton) {

        cancelEditButton.addEventListener(
            "click",
            closeEditProject
        );
    }


    /* -----------------------------------------
       CLOSE WHEN CLICKING OUTSIDE
    ----------------------------------------- */

    const editModal =
        document.getElementById(
            "editProjectModal"
        );


    if (editModal) {

        editModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    editModal
                ) {

                    closeEditProject();
                }
            }
        );
    }


    /* -----------------------------------------
       SAVE EDITED PROJECT
    ----------------------------------------- */

    const editProjectForm =
        document.getElementById(
            "editProjectForm"
        );


    if (editProjectForm) {

        editProjectForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const editMessage =
                    document.getElementById(
                        "editProjectMessage"
                    );


                const saveButton =
                    editProjectForm.querySelector(
                        "button[type='submit']"
                    );


                const projectId =
                    document.getElementById(
                        "editProjectId"
                    ).value;


                const title =
                    document.getElementById(
                        "editProjectTitle"
                    ).value.trim();


                const category =
                    document.getElementById(
                        "editProjectCategory"
                    ).value;


                const description =
                    document.getElementById(
                        "editProjectDescription"
                    ).value.trim();


                const projectLink =
                    document.getElementById(
                        "editProjectLink"
                    ).value.trim();


                const featured =
                    document.getElementById(
                        "editProjectFeatured"
                    ).checked;


                const status =
                    document.getElementById(
                        "editProjectStatus"
                    ).value;


                const newCover =
                    document.getElementById(
                        "editProjectImage"
                    ).files[0] ||
                    null;


                const newGalleryFiles =
                    Array.from(
                        document.getElementById(
                            "editProjectFiles"
                        ).files
                    );


                if (!title) {

                    editMessage.textContent =
                        "Project title is required.";

                    editMessage.style.color =
                        "#ff6b6b";

                    return;
                }


                if (!category) {

                    editMessage.textContent =
                        "Please select a category.";

                    editMessage.style.color =
                        "#ff6b6b";

                    return;
                }


                if (!description) {

                    editMessage.textContent =
                        "Project description is required.";

                    editMessage.style.color =
                        "#ff6b6b";

                    return;
                }


                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";


                try {

                    const project =
                        allProjects.find(
                            item =>
                                item.id ===
                                projectId
                        );


                    if (!project) {

                        throw new Error(
                            "Project could not be found."
                        );
                    }


                    let coverImageUrl =
                        project.cover_image_url ||
                        null;


                    let projectImageUrls =
                        Array.isArray(
                            project.project_images
                        )
                            ? [
                                ...project.project_images
                              ]
                            : [];


                    /* NEW COVER */

                    if (newCover) {

                        editMessage.textContent =
                            "Uploading new cover image...";


                        const result =
                            await uploadProjectFile(
                                newCover,
                                projectId,
                                "cover"
                            );


                        coverImageUrl =
                            result.url;
                    }


                    /* NEW GALLERY */

                    if (
                        newGalleryFiles.length >
                        0
                    ) {

                        projectImageUrls = [];


                        for (
                            let i = 0;
                            i < newGalleryFiles.length;
                            i++
                        ) {

                            editMessage.textContent =
                                `Uploading image ${i + 1} of ${newGalleryFiles.length}...`;


                            const result =
                                await uploadProjectFile(
                                    newGalleryFiles[i],
                                    projectId,
                                    `gallery-${i + 1}`
                                );


                            projectImageUrls.push(
                                result.url
                            );
                        }
                    }


                    editMessage.textContent =
                        "Updating project...";


                    const {
                        error
                    } =
                        await portfolioSupabase
                            .from("projects")
                            .update({

                                title: title,

                                category: category,

                                description:
                                    description,

                                project_link:
                                    projectLink ||
                                    null,

                                featured:
                                    featured,

                                status:
                                    status,

                                cover_image_url:
                                    coverImageUrl,

                                project_images:
                                    projectImageUrls

                            })
                            .eq(
                                "id",
                                projectId
                            );


                    if (error) {

                        throw error;
                    }


                    editMessage.textContent =
                        "Project updated successfully!";

                    editMessage.style.color =
                        "#7dff9b";


                    saveButton.textContent =
                        "Saved ✓";


                    await loadProjects();


                    setTimeout(() => {

                        closeEditProject();

                        saveButton.disabled =
                            false;

                        saveButton.textContent =
                            "Save Changes";

                    }, 900);


                } catch (error) {

                    console.error(
                        "EDIT PROJECT ERROR:",
                        error
                    );


                    editMessage.textContent =
                        error.message ||
                        "Could not update project.";

                    editMessage.style.color =
                        "#ff6b6b";


                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Save Changes";
                }
            }
        );
    }


    /* -----------------------------------------
       FILTER EVENTS
    ----------------------------------------- */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderProjects
        );
    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            renderProjects
        );
    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderProjects
        );
    }


    /* -----------------------------------------
       INITIAL LOAD
    ----------------------------------------- */

    loadProjects();
}


/* =========================================================
   14. INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (isLoginPage) {

            await redirectIfAlreadyLoggedIn();

            return;
        }


        if (
            isDashboardPage ||
            isAddProjectPage ||
            isManageProjectsPage
        ) {

            await protectAdminPage();
        }
    }
);
/* =========================================================
   15. MANAGE REVIEWS
========================================================= */

const manageReviewsButton =
    document.getElementById(
        "manageReviewsButton"
    );


if (manageReviewsButton) {

    manageReviewsButton.addEventListener(
        "click",
        async () => {

            const session =
                await protectAdminPage();

            if (!session) {
                return;
            }

            window.location.href =
                "manage-reviews.html";
        }
    );
}


/* =========================================================
   16. REVIEW MANAGEMENT PAGE
========================================================= */

const reviewsContainer =
    document.getElementById(
        "reviewsContainer"
    );


if (reviewsContainer) {

    let allReviews = [];


    const reviewSearch =
        document.getElementById(
            "reviewSearch"
        );


    const reviewStatusFilter =
        document.getElementById(
            "reviewStatusFilter"
        );


    const reviewMessage =
        document.getElementById(
            "reviewMessage"
        );


    const reviewModal =
        document.getElementById(
            "reviewModal"
        );


    const reviewForm =
        document.getElementById(
            "reviewForm"
        );


    /* -----------------------------------------
       ESCAPE HTML
    ----------------------------------------- */

    function escapeReviewHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* -----------------------------------------
       LOAD REVIEWS
    ----------------------------------------- */

    async function loadReviews() {

        const session =
            await protectAdminPage();

        if (!session) {
            return;
        }


        reviewsContainer.innerHTML = `
            <div class="project-loading">
                Loading reviews...
            </div>
        `;


        const {
            data,
            error
        } =
            await portfolioSupabase
                .from("reviews")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "LOAD REVIEWS ERROR:",
                error
            );


            reviewsContainer.innerHTML = `
                <div class="project-empty">
                    <h3>Unable to load reviews</h3>
                    <p>${escapeReviewHtml(error.message)}</p>
                </div>
            `;

            return;
        }


        allReviews =
            data || [];


        renderReviews();
    }


    /* -----------------------------------------
       RENDER REVIEWS
    ----------------------------------------- */

    function renderReviews() {

        const search =
            reviewSearch
                ? reviewSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const status =
            reviewStatusFilter
                ? reviewStatusFilter.value
                : "";


        const filtered =
            allReviews.filter(
                review => {

                    const matchesSearch =
                        !search ||
                        review.client_name
                            ?.toLowerCase()
                            .includes(search) ||
                        review.client_role
                            ?.toLowerCase()
                            .includes(search) ||
                        review.review
                            ?.toLowerCase()
                            .includes(search);


                    const matchesStatus =
                        !status ||
                        review.status === status;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );


        if (
            filtered.length === 0
        ) {

            reviewsContainer.innerHTML = `
                <div class="project-empty">
                    <div class="empty-icon">★</div>
                    <h3>No reviews found</h3>
                    <p>Add your first client testimonial.</p>
                </div>
            `;

            return;
        }


        reviewsContainer.innerHTML =
            filtered
                .map(
                    review =>
                        createReviewCard(
                            review
                        )
                )
                .join("");


        attachReviewActions();
    }


    /* -----------------------------------------
       REVIEW CARD
    ----------------------------------------- */

    function createReviewCard(
        review
    ) {

        const stars =
            "★".repeat(
                Number(
                    review.rating || 5
                )
            );


        const statusClass =
            review.status === "published"
                ? "status-published"
                : "status-draft";


        return `
            <article
                class="review-management-card"
            >

                <div class="review-management-top">

                    <span class="project-status-badge ${statusClass}">
                        ${escapeReviewHtml(
                            review.status ||
                            "draft"
                        )}
                    </span>

                    ${
                        review.featured
                            ? `
                                <span class="project-featured-badge">
                                    ★ Featured
                                </span>
                              `
                            : ""
                    }

                </div>


                <div class="review-stars">
                    ${stars}
                </div>


                <blockquote>
                    “${escapeReviewHtml(
                        review.review
                    )}”
                </blockquote>


                <div class="review-client">

                    <strong>
                        ${escapeReviewHtml(
                            review.client_name
                        )}
                    </strong>

                    ${
                        review.client_role
                            ? `
                                <span>
                                    ${escapeReviewHtml(
                                        review.client_role
                                    )}
                                </span>
                              `
                            : ""
                    }

                </div>


                <div class="manage-project-actions">

                    <button
                        type="button"
                        class="dashboard-button edit-review-button"
                        data-id="${escapeReviewHtml(review.id)}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="dashboard-button toggle-review-button"
                        data-id="${escapeReviewHtml(review.id)}"
                    >
                        ${
                            review.status === "published"
                                ? "Set Draft"
                                : "Publish"
                        }
                    </button>


                    <button
                        type="button"
                        class="dashboard-button feature-review-button"
                        data-id="${escapeReviewHtml(review.id)}"
                    >
                        ${
                            review.featured
                                ? "Unfeature"
                                : "Feature"
                        }
                    </button>


                    <button
                        type="button"
                        class="dashboard-button delete-review-button"
                        data-id="${escapeReviewHtml(review.id)}"
                    >
                        Delete
                    </button>

                </div>

            </article>
        `;
    }


    /* -----------------------------------------
       ACTION BUTTONS
    ----------------------------------------- */

    function attachReviewActions() {

        document
            .querySelectorAll(
                ".edit-review-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const review =
                            allReviews.find(
                                item =>
                                    item.id ===
                                    button.dataset.id
                            );


                        if (review) {
                            openReviewModal(
                                review
                            );
                        }
                    }
                );
            });


        document
            .querySelectorAll(
                ".toggle-review-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        toggleReviewStatus(
                            button.dataset.id
                        );
                    }
                );
            });


        document
            .querySelectorAll(
                ".feature-review-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        toggleReviewFeatured(
                            button.dataset.id
                        );
                    }
                );
            });


        document
            .querySelectorAll(
                ".delete-review-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteReview(
                            button.dataset.id
                        );
                    }
                );
            });
    }


    /* -----------------------------------------
       OPEN MODAL
    ----------------------------------------- */

    function openReviewModal(
        review = null
    ) {

        reviewForm.reset();


        document.getElementById(
            "reviewId"
        ).value =
            review?.id || "";


        document.getElementById(
            "clientName"
        ).value =
            review?.client_name || "";


        document.getElementById(
            "clientRole"
        ).value =
            review?.client_role || "";


        document.getElementById(
            "reviewText"
        ).value =
            review?.review || "";


        document.getElementById(
            "reviewRating"
        ).value =
            review?.rating || 5;


        document.getElementById(
            "reviewFeatured"
        ).checked =
            Boolean(
                review?.featured
            );


        document.getElementById(
            "reviewStatus"
        ).value =
            review?.status ||
            "published";


        document.getElementById(
            "reviewModalTitle"
        ).textContent =
            review
                ? "Edit Review"
                : "Add Review";


        document.getElementById(
            "reviewFormMessage"
        ).textContent =
            "";


        reviewModal.classList.add(
            "active"
        );


        document.body.classList.add(
            "modal-open"
        );
    }


    /* -----------------------------------------
       CLOSE MODAL
    ----------------------------------------- */

    function closeReviewModal() {

        reviewModal.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "modal-open"
        );
    }


    document
        .getElementById(
            "addReviewButton"
        )
        ?.addEventListener(
            "click",
            () => {

                openReviewModal();
            }
        );


    document
        .getElementById(
            "closeReviewModal"
        )
        ?.addEventListener(
            "click",
            closeReviewModal
        );


    document
        .getElementById(
            "cancelReview"
        )
        ?.
