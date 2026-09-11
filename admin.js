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


/* =========================================================
   3. CHECK AUTHENTICATION
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
   6. REDIRECT IF ALREADY LOGGED IN
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
   9. FILE NAME CLEANER
========================================================= */

function cleanFileName(fileName) {

    return fileName
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]/g, "-")
        .replace(/-+/g, "-");
}


/* =========================================================
   10. UPLOAD FILE TO SUPABASE STORAGE
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
            : Date.now() + "-" + Math.random()
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


    return data.publicUrl;
}


/* =========================================================
   11. ADD PROJECT FORM
========================================================= */

const projectForm =
    document.getElementById("projectForm");


if (projectForm) {

    projectForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* -----------------------------------------
               GET FORM ELEMENTS
            ----------------------------------------- */

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


            /* -----------------------------------------
               GET VALUES
            ----------------------------------------- */

            const title =
                titleInput.value.trim();

            const category =
                categoryInput.value;

            const description =
                descriptionInput.value.trim();

            const projectLink =
                projectLinkInput.value.trim();

            const coverFile =
                coverImageInput.files[0] || null;

            const galleryFiles =
                Array.from(
                    projectFilesInput.files
                );

            const featured =
                featuredInput.checked;

            const status =
                statusInput.value;


            /* -----------------------------------------
               BASIC VALIDATION
            ----------------------------------------- */

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


            /* -----------------------------------------
               CHECK LOGIN
            ----------------------------------------- */

            const session =
                await protectAdminPage();

            if (!session) {
                return;
            }


            /* -----------------------------------------
               DISABLE BUTTON
            ----------------------------------------- */

            submitButton.disabled = true;

            submitButton.textContent =
                "Publishing...";

            projectMessage.textContent =
                "Saving project...";

            projectMessage.style.color =
                "#b46cff";


            try {

                /* -------------------------------------
                   STEP 1 — CREATE PROJECT RECORD
                ------------------------------------- */

                const { data: projectData, error: insertError } =
                    await portfolioSupabase
                        .from("projects")
                        .insert({

                            title: title,

                            category: category,

                            description: description,

                            project_link:
                                projectLink || null,

                            featured: featured,

                            status: status

                        })
                        .select()
                        .single();


                if (insertError) {

                    console.error(
                        "PROJECT INSERT ERROR:",
                        insertError
                    );

                    throw insertError;
                }


                const projectId =
                    projectData.id;


                /* -------------------------------------
                   STEP 2 — UPLOAD COVER IMAGE
                ------------------------------------- */

                let coverImageUrl = null;


                if (coverFile) {

                    projectMessage.textContent =
                        "Uploading cover image...";


                    coverImageUrl =
                        await uploadProjectFile(
                            coverFile,
                            projectId,
                            "cover"
                        );
                }


                /* -------------------------------------
                   STEP 3 — UPLOAD PROJECT IMAGES
                ------------------------------------- */

                const projectImageUrls = [];


                if (galleryFiles.length > 0) {

                    for (
                        let i = 0;
                        i < galleryFiles.length;
                        i++
                    ) {

                        projectMessage.textContent =
                            `Uploading project image ${i + 1} of ${galleryFiles.length}...`;


                        const imageUrl =
                            await uploadProjectFile(
                                galleryFiles[i],
                                projectId,
                                `gallery-${i + 1}`
                            );


                        projectImageUrls.push(
                            imageUrl
                        );
                    }
                }


                /* -------------------------------------
                   STEP 4 — UPDATE PROJECT WITH IMAGES
                ------------------------------------- */

                const { error: updateError } =
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

                    console.error(
                        "PROJECT IMAGE UPDATE ERROR:",
                        updateError
                    );

                    throw updateError;
                }


                /* -------------------------------------
                   STEP 5 — SUCCESS
                ------------------------------------- */

                projectMessage.textContent =
                    "Project published successfully!";

                projectMessage.style.color =
                    "#7dff9b";


                submitButton.textContent =
                    "Published ✓";


                /* -------------------------------------
                   RESET FORM
                ------------------------------------- */

                projectForm.reset();


                /* -------------------------------------
                   RETURN BUTTON AFTER SHORT DELAY
                ------------------------------------- */

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
   12. INITIALIZATION
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
            isAddProjectPage
        ) {

            await protectAdminPage();
        }
    }
);
