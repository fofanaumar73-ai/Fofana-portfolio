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

        const {
            data,
            error
        } =
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
   4. ADMIN LOGIN PAGE
========================================================= */

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


if (adminLoginForm) {

    const adminEmail =
        document.getElementById(
            "adminEmail"
        );


    const adminPassword =
        document.getElementById(
            "adminPassword"
        );


    const loginMessage =
        document.getElementById(
            "loginMessage"
        );


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


            loginButton.disabled =
                true;


            loginButton.textContent =
                "Logging in...";


            try {

                const {
                    data,
                    error
                } =
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


                    loginButton.disabled =
                        false;


                    loginButton.textContent =
                        "Login";


                    return;

                }


                if (data?.session) {

                    loginMessage.textContent =
                        "Login successful. Redirecting...";


                    loginMessage.style.color =
                        "#7dff9b";


                    setTimeout(
                        () => {

                            window.location.href =
                                "dashboard.html";

                        },
                        700
                    );


                    return;

                }


                loginMessage.textContent =
                    "Login failed. No session was created.";


                loginMessage.style.color =
                    "#ff6b6b";


                loginButton.disabled =
                    false;


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


                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "Login";

            }

        }
    );

}


/* =========================================================
   5. PROTECT DASHBOARD
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
   6. ALREADY LOGGED-IN CHECK
========================================================= */

async function redirectIfAlreadyLoggedIn() {

    const session =
        await getCurrentSession();


    if (
        session &&
        isLoginPage
    ) {

        window.location.href =
            "dashboard.html";

    }

}


/* =========================================================
   7. LOGOUT
========================================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled =
                true;


            logoutButton.textContent =
                "Logging out...";


            const {
                error
            } =
                await portfolioSupabase.auth.signOut();


            if (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );


                logoutButton.disabled =
                    false;


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
    document.getElementById(
        "addProjectButton"
    );


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
   9. INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * If we are on the login page,
         * redirect an already logged-in user.
         */

        if (isLoginPage) {

            await redirectIfAlreadyLoggedIn();

            return;

        }


        /*
         * Dashboard and Add Project
         * require authentication.
         */

        if (
            isDashboardPage ||
            isAddProjectPage
        ) {

            await protectAdminPage();

        }

    }
);
