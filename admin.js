/* =========================================================
   FOFANA TECH — ADMIN AUTHENTICATION
   ========================================================= */

const SUPABASE_URL = "https://uryfgatzyesolwwmugin.supabase.co";
const SUPABASE_KEY = "YOUR_PORTFOLIO_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   LOGIN
   ========================================================= */

const adminLoginForm =
    document.getElementById("adminLoginForm");

const loginMessage =
    document.getElementById("loginMessage");


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document.getElementById("adminEmail").value.trim();

            const password =
                document.getElementById("adminPassword").value;

            loginMessage.textContent =
                "Signing in...";


            const { error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });


            if (error) {

                console.error(error);

                loginMessage.textContent =
                    error.message;

                return;
            }


            loginMessage.textContent =
                "Login successful. Opening dashboard...";


            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 700);

        }
    );

}


/* =========================================================
   PROTECT DASHBOARD
   ========================================================= */

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    checkAdminSession();


    logoutButton.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            window.location.href =
                "admin.html";

        }
    );

}


async function checkAdminSession() {

    const { data } =
        await supabaseClient.auth.getSession();


    if (!data.session) {

        window.location.href =
            "admin.html";

        return;
    }


    console.log(
        "Authenticated admin:",
        data.session.user.email
    );

}


/* =========================================================
   ADD PROJECT BUTTON
   ========================================================= */

const addProjectButton =
    document.getElementById("addProjectButton");


if (addProjectButton) {

    addProjectButton.addEventListener("click", () => {

        window.location.href =
            "add-project.html";

    });

}


/* =========================================================
   ADD PROJECT FORM
   ========================================================= */

const projectForm =
    document.getElementById("projectForm");

const projectMessage =
    document.getElementById("projectMessage");


if (projectForm) {

    projectForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            projectMessage.textContent =
                "Saving project...";


            /* -------------------------------------------------
               GET FORM VALUES
            ------------------------------------------------- */

            const title =
                document.getElementById("projectTitle").value.trim();

            const category =
                document.getElementById("projectCategory").value;

            const description =
                document.getElementById("projectDescription").value.trim();

            const projectLink =
                document.getElementById("projectLink").value.trim();

            const featured =
                document.getElementById("projectFeatured").checked;

            const status =
                document.getElementById("projectStatus").value;


            /* -------------------------------------------------
               CHECK LOGIN SESSION
            ------------------------------------------------- */

            const { data: sessionData } =
                await supabaseClient.auth.getSession();


            if (!sessionData.session) {

                projectMessage.textContent =
                    "Your session has expired. Please log in again.";

                setTimeout(() => {

                    window.location.href =
                        "admin.html";

                }, 1500);

                return;
            }


            /* -------------------------------------------------
               SAVE PROJECT
            ------------------------------------------------- */

            const { data, error } =
                await supabaseClient
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


            /* -------------------------------------------------
               HANDLE ERROR
            ------------------------------------------------- */

            if (error) {

                console.error(
                    "PROJECT ERROR:",
                    error
                );

                projectMessage.textContent =
                    error.message;

                return;
            }


            /* -------------------------------------------------
               SUCCESS
            ------------------------------------------------- */

            console.log(
                "Project created:",
                data
            );


            projectMessage.textContent =
                "Project saved successfully!";


            projectForm.reset();

        }
    );

}
