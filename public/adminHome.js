document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logout-button");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            fetch("/logout", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then(response => {
                    if (response.redirected) {
                        window.location.href = response.url;  // Redirect to the login or home page
                    }
                })
                .catch(error => {
                    console.error("Error logging out:", error);
                });
        });
    }
});