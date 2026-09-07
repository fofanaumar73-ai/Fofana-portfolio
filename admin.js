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
                "Preparing project...";


            /* -------------------------------------------------
               GET FORM VALUES
            ------------------------------------------------- */

            const title =
                document
                    .getElementById("projectTitle")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("projectCategory")
                    .value;


            const description =
                document
                    .getElementById("projectDescription")
                    .value
                    .trim();


            const projectLink =
                document
                    .getElementById("projectLink")
                    .value
                    .trim();


            const featured =
                document
                    .getElementById("projectFeatured")
                    .checked;


            const status =
                document
                    .getElementById("projectStatus")
                    .value;


            const coverImage =
                document
                    .getElementById("projectImage")
                    .files[0];


            const projectFiles =
                document
                    .getElementById("projectFiles")
                    .files;


            /* -------------------------------------------------
               CHECK LOGIN
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
               CHECK COVER IMAGE
            ------------------------------------------------- */

            if (!coverImage) {

                projectMessage.textContent =
                    "Please choose a cover image.";

                return;
            }


            /* -------------------------------------------------
               CREATE UNIQUE PROJECT FOLDER
            ------------------------------------------------- */

            const projectId =
                crypto.randomUUID();


            const uploadedImageUrls = [];


            /* -------------------------------------------------
               UPLOAD COVER IMAGE
            ------------------------------------------------- */

            projectMessage.textContent =
                "Uploading cover image...";


            const coverExtension =
                coverImage.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const coverPath =
                `${projectId}/cover.${coverExtension}`;


            const { error: coverUploadError } =
                await supabaseClient
                    .storage
                    .from("portfolio-projects")
                    .upload(
                        coverPath,
                        coverImage,
                        {
                            cacheControl: "3600",
                            upsert: false
                        }
                    );


            if (coverUploadError) {

                console.error(
                    "COVER UPLOAD ERROR:",
                    coverUploadError
                );

                projectMessage.textContent =
                    "Cover image upload failed.";

                return;
            }


            /* -------------------------------------------------
               GET COVER IMAGE URL
            ------------------------------------------------- */

            const {
                data: coverPublicUrlData
            } =
                supabaseClient
                    .storage
                    .from("portfolio-projects")
                    .getPublicUrl(
                        coverPath
                    );


            const coverImageUrl =
                coverPublicUrlData.publicUrl;


            /* -------------------------------------------------
               UPLOAD ADDITIONAL PROJECT IMAGES
            ------------------------------------------------- */

            projectMessage.textContent =
                "Uploading project images...";


            for (
                let i = 0;
                i < projectFiles.length;
                i++
            ) {

                const file =
                    projectFiles[i];


                const extension =
                    file.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                const filePath =
                    `${projectId}/page-${i + 1}.${extension}`;


                const {
                    error: imageUploadError
                } =
                    await supabaseClient
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


                if (imageUploadError) {

                    console.error(
                        "PROJECT IMAGE ERROR:",
                        imageUploadError
                    );

                    projectMessage.textContent =
                        `Image ${i + 1} failed to upload.`;

                    return;
                }


                const {
                    data: publicUrlData
                } =
                    supabaseClient
                        .storage
                        .from("portfolio-projects")
                        .getPublicUrl(
                            filePath
                        );


                uploadedImageUrls.push(
                    publicUrlData.publicUrl
                );

            }


            /* -------------------------------------------------
               SAVE PROJECT TO DATABASE
            ------------------------------------------------- */

            projectMessage.textContent =
                "Saving project...";


            const {
                data: projectData,
                error: projectError
            } =
                await supabaseClient
                    .from("projects")
                    .insert({

                        id: projectId,

                        title: title,

                        category: category,

                        description: description,

                        project_link:
                            projectLink || null,

                        cover_image_url:
                            coverImageUrl,

                        project_images:
                            uploadedImageUrls,

                        featured:
                            featured,

                        status:
                            status

                    })
                    .select()
                    .single();


            /* -------------------------------------------------
               DATABASE ERROR
            ------------------------------------------------- */

            if (projectError) {

                console.error(
                    "PROJECT DATABASE ERROR:",
                    projectError
                );

                projectMessage.textContent =
                    projectError.message;

                return;
            }


            /* -------------------------------------------------
               SUCCESS
            ------------------------------------------------- */

            console.log(
                "PROJECT CREATED:",
                projectData
            );


            projectMessage.textContent =
                "Project published successfully!";


            projectForm.reset();

        }
    );

}
