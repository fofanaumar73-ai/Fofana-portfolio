/* =========================================================
   FOFANA TECH
   ADMIN LOGIN
   ========================================================= */


/* ---------------------------------------------------------
   GET THE LOGIN FORM
   --------------------------------------------------------- */

const adminLoginForm =
    document.getElementById("adminLoginForm");


const loginMessage =
    document.getElementById("loginMessage");


/* ---------------------------------------------------------
   LOGIN FORM SUBMISSION
   --------------------------------------------------------- */

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        event => {

            /*
               Prevent the browser from refreshing
               the page when the form is submitted.
            */

            event.preventDefault();


            /*
               Get the values entered by the user.
            */

            const email =
                document.getElementById("adminEmail").value.trim();

            const password =
                document.getElementById("adminPassword").value;


            /*
               Temporary test message.

               We are NOT checking the password here.

               Supabase Authentication will handle
               the real login later.
            */

            if (!email || !password) {

                loginMessage.textContent =
                    "Please enter your email and password.";

                return;

            }


            loginMessage.textContent =
                "Authentication will be connected soon.";

        }
    );

}
