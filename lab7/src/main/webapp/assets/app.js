const confirmForms = document.querySelectorAll("form[data-confirm]");
confirmForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
        const message = form.dataset.confirm;
        if (message && !window.confirm(message)) {
            event.preventDefault();
        }
    });
});

const usernameInput = document.getElementById("username");
if (usernameInput) {
    const validateUsername = () => {
        const isValid = /^[A-Za-z0-9._-]{3,30}$/.test(usernameInput.value);
        usernameInput.setCustomValidity(
            isValid || usernameInput.value.length === 0
                ? ""
                : "Use 3-30 letters, digits, dots, underscores, or dashes."
        );
    };

    usernameInput.addEventListener("input", validateUsername);
    validateUsername();
}

const passwordInput = document.getElementById("password");
if (passwordInput) {
    const validatePassword = () => {
        const isValid = /^(?=.*[A-Za-z])(?=.*\d).{6,60}$/.test(passwordInput.value);
        passwordInput.setCustomValidity(
            isValid || passwordInput.value.length === 0
                ? ""
                : "Include at least one letter and one digit in 6-60 characters."
        );
    };

    passwordInput.addEventListener("input", validatePassword);
    validatePassword();
}

const startCitySelect = document.getElementById("startCityId");
if (startCitySelect) {
    const validateStartCity = () => {
        startCitySelect.setCustomValidity(
            startCitySelect.value ? "" : "Please choose a starting city."
        );
    };

    startCitySelect.addEventListener("change", validateStartCity);
    validateStartCity();
}
