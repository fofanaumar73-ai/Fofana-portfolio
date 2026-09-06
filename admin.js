/* =========================================================
   FOFANA TECH — ADMIN AUTHENTICATION
   ========================================================= */

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


const adminLoginForm =
    document.getElementById("adminLoginForm");

const loginMessage =
    document.getElementById("loginMessage");


if (adminLoginForm) {

    adminLoginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("adminEmail").value.trim();

        const password =
            document.getElementById("adminPassword").value;


        loginMessage.textContent = "Signing in...";


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            loginMessage.textContent =
                "Invalid email or password.";

            console.error(error);

            return;
        }


        loginMessage.textContent =
            "Login successful. Opening dashboard...";


        window.location.href = "dashboard.html";

    });

}
