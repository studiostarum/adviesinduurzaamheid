(function () {
    function init() {
        const elements = document.querySelectorAll("hz-embed");

        elements.forEach((element, index) => {
            // Clear any existing content in the element
            element.innerHTML = '';

            const form = document.createElement("form");
            form.className = "huisscan-form";
            form.id = `huisscan-form-${generateUniqueID()}`;

            form.onsubmit = function (e) {
                e.preventDefault();
                clearValidationMessages(form);

                // Custom validation
                let isValid = true; // Assume form is valid initially
                const dienst = form.querySelector("#dienst-select");
                const selectedOption = dienst.querySelector('[aria-selected="true"]');
                const postcode = form.querySelector("#postcode");
                const huisnummer = form.querySelector("#huisnummer");
                const toevoeging = form.querySelector("#toevoeging");

                if (!validateDienst(dienst)) isValid = false;
                if (!validatePostcode(postcode)) isValid = false;
                if (!validateHuisnummer(huisnummer)) isValid = false;
                if (!validateToevoeging(toevoeging)) isValid = false;

                if (isValid) {
                    const src = selectedOption.getAttribute("data-src");
                    const url = new URL(src);
                    url.searchParams.append("Zipcode", postcode.value);
                    url.searchParams.append("Housenumber", huisnummer.value);
                    url.searchParams.append("Addition", toevoeging.value);

                    // Open the URL in a new tab
                    window.open(url.toString(), '_blank');
                }
            };

            loadDropdownContent(function () {
                form.innerHTML = window.dropdownContent;
                element.appendChild(form);
                initializeCustomDropdown(form.querySelector("#dienst-select"));

                // Add input listeners for validation
                const inputs = form.querySelectorAll("input");
                inputs.forEach(input => {
                    input.addEventListener("input", function () {
                        validateInputWithDebounce(input);
                    });
                    input.addEventListener("blur", function () {
                        validateInput(input);
                    });
                });

                document.addEventListener("click", function (event) {
                    const isClickInside = form.contains(event.target);
                    if (!isClickInside) {
                        inputs.forEach(input => {
                            removeValidationMessage(input);
                        });
                    }
                });
            });
        });
    }

    function initializeCustomDropdown(dienstSelect) {
        const selectedOption = dienstSelect.querySelector(
            "#selected-option .selected-option_content");
        const optionsContainer = dienstSelect.querySelector(".options-container");
        const options = optionsContainer.querySelectorAll(".option");

        const defaultOption = optionsContainer.querySelector('[value="default"]');
        if (defaultOption) {
            defaultOption.classList.add('active');
            defaultOption.setAttribute('aria-selected', 'true');
        }

        selectedOption.addEventListener("click", function () {
            const isHidden = optionsContainer.style.display === "none" || optionsContainer.style
                .display === "";
            optionsContainer.style.display = isHidden ? "block" : "none";
            dienstSelect.classList.toggle('dienst-open', isHidden);
        });

        options.forEach(option => {
            option.addEventListener("click", function () {
                const value = option.getAttribute("value");
                const text = option.querySelector("span").textContent.trim();
                const svg = option.querySelector("svg").outerHTML;

                selectedOption.querySelector("span").textContent = text;
                selectedOption.querySelector("svg").outerHTML = svg;
                dienstSelect.setAttribute("value", value);

                options.forEach(opt => {
                    opt.setAttribute("aria-selected", "false");
                    opt.classList.remove('active');
                });
                option.setAttribute("aria-selected", "true");
                option.classList.add('active');

                removeValidationMessage(dienstSelect);

                optionsContainer.style.display = "none";
                dienstSelect.classList.remove('dienst-open');
            });
        });

        document.addEventListener("click", function (event) {
            if (!dienstSelect.contains(event.target)) {
                optionsContainer.style.display = "none";
                dienstSelect.classList.remove('dienst-open');
            }
        });
    }

    function generateUniqueID() {
        return Math.random().toString(36).substr(2, 9);
    }

    function displayValidationMessage(inputElement, message) {
        setTimeout(() => {
            removeValidationMessage(inputElement);
            const messageElement = document.createElement("div");
            messageElement.className = "form_message-error";
            messageElement.textContent = message;
            inputElement.style.setProperty("border-color", "#b42318", "important");
            inputElement.insertAdjacentElement("afterend", messageElement);
        }, 250);
    }

    function removeValidationMessage(inputElement) {
        inputElement.style.removeProperty("border-color");
        const message = inputElement.nextElementSibling;
        if (message && message.classList.contains("form_message-error")) {
            message.remove();
        }
    }

    function clearValidationMessages(form) {
        form.querySelectorAll(".form_message-error").forEach(message => message.remove());
        form.querySelectorAll("input, #dienst-select").forEach(input => input.style.removeProperty(
            "border-color"));
    }

    function validateInput(input) {
        const id = input.id;
        if (id === 'postcode') {
            validatePostcode(input);
        } else if (id === 'huisnummer') {
            validateHuisnummer(input);
        } else if (id === 'toevoeging') {
            validateToevoeging(input);
        }
    }

    function validateInputWithDebounce(input) {
        clearTimeout(input.debounceTimeout);
        input.debounceTimeout = setTimeout(() => {
            validateInput(input);
        }, 500);
    }

    function validateDienst(dienst) {
        const value = dienst.getAttribute("value");
        if (value && value !== "default") {
            removeValidationMessage(dienst);
            return true;
        } else {
            displayValidationMessage(dienst, "Kies eerst één van onze diensten.");
            return false;
        }
    }

    function validatePostcode(postcode) {
        postcode.value = postcode.value.toUpperCase();
        if (postcode.value.match(/[1-9][0-9]{3}[A-Za-z]{2}/)) {
            removeValidationMessage(postcode);
            return true;
        } else {
            displayValidationMessage(postcode, "Vul een geldige postcode in, bijvoorbeeld 1234AB.");
            return false;
        }
    }

    function validateHuisnummer(huisnummer) {
        huisnummer.value = huisnummer.value.replace(/[^0-9]/g, '');
        if (huisnummer.value.match(/^[1-9][0-9]*$/)) {
            removeValidationMessage(huisnummer);
            return true;
        } else {
            displayValidationMessage(huisnummer,
                "Vul een geldig huisnummer in.");
            return false;
        }
    }

    function validateToevoeging(toevoeging) {
        toevoeging.value = toevoeging.value.replace(/[^A-Za-z]/g, '').toUpperCase();
        if (toevoeging.value.match(/^[A-Za-z]*$/)) {
            removeValidationMessage(toevoeging);
            return true;
        } else {
            displayValidationMessage(toevoeging,
                "Vul een geldige toevoeging in, alleen letters zijn toegestaan.");
            return false;
        }
    }

    function loadDropdownContent(callback) {
        const script = document.createElement('script');
        script.src =
            'https://adviesinduurzaamheid.pages.dev/js/homeZeroContent.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    init();
})();
