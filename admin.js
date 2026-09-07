/* =========================================================
   FOFANA TECH — ADMIN AUTHENTICATION
   ========================================================= */

const SUPABASE_URL = "https://uryfgatzyesolwwmugin.supabase.co";
const SUPABASE_KEY = "sb_publishable_QL4lxGKETA1_xMFFJ7RV5g_Wuyi_x-d";

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

    


