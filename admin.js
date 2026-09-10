/* =========================================================
   FOFANA PORTFOLIO — ADMIN LOGIN
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
   2. GET PAGE ELEMENTS
========================================================= */

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


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


/* =========================================================
   3. CHECK IF ALREADY LOGGED IN
========================================================= */

async function checkExistingSession() {

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

        return;

    }


    if (
        data &&
        data.session
    ) {

        window.location.href =
            "dashboard.html";

    }

}


/* =========================================================
   4. ADMIN LOGIN
========================================================= */

if (adminLoginForm) {

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


            /* =========================
               SHOW LOADING STATE
            ========================== */

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
                    await portfolioSupabase
                        .auth
                        .signInWithPassword({
                            email: email,
                            password: password
                        });


                /* =========================
                   LOGIN ERROR
                ========================== */

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


                /* =========================
                   SUCCESS
                ========================== */

                if (
                    data &&
                    data.session
                ) {

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

                }

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
   5. INITIALIZE
========================================================= */

checkExistingSession();
