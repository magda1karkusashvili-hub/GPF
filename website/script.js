"use strict";

(() => {
    /* =========================
       MOBILE MENU
    ========================= */

    const menuToggle = document.querySelector("#menu-toggle");
    const mainMenu = document.querySelector("#main-menu");

    function closeMenu() {
        mainMenu?.classList.remove("is-open");
        menuToggle?.setAttribute("aria-expanded", "false");
    }

    menuToggle?.addEventListener("click", () => {
        if (!mainMenu) return;

        const isOpen = mainMenu.classList.toggle("is-open");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });

    mainMenu?.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("click", (event) => {
        if (
            mainMenu &&
            menuToggle &&
            !mainMenu.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    window.matchMedia("(min-width: 851px)")
        .addEventListener("change", (event) => {
            if (event.matches) closeMenu();
        });

    /* =========================
       PAGE LINKS
    ========================= */

    const pageLinks = {
        "#home": "index.html",
        "#about": "about.html",
        "#gallery": "gallery.html",
        "#documents": "document.html",
        "#contact": "contact.html",
        "#booking": "BookYourFlight.html",
        "#information": "news.html"
    };

    function hasKey(object, key) {
        return Object.prototype.hasOwnProperty.call(object, key);
    }

    document.querySelectorAll("a[href]").forEach((link) => {
        const href = link.getAttribute("href");

        if (hasKey(pageLinks, href)) {
            link.setAttribute("href", pageLinks[href]);
        }
    });

    if (
        mainMenu &&
        !mainMenu.querySelector('a[href="news.html"]')
    ) {
        const newsLink = document.createElement("a");

        newsLink.href = "news.html";
        newsLink.textContent = "News";

        const contactLink = mainMenu.querySelector(
            'a[href="contact.html"]'
        );

        mainMenu.insertBefore(
            newsLink,
            contactLink || null
        );
    }

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    mainMenu?.querySelectorAll("a").forEach((link) => {
        if (link.getAttribute("href") === currentPage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    /* =========================
       FOOTER YEAR
    ========================= */

    const yearElement = document.querySelector("#year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    /* =========================
       GALLERY AND LIGHTBOX
    ========================= */

    try {
        (() => {
            const galleryGrid = document.querySelector(
                "#gallery-grid"
            );

            const lightbox = document.querySelector(
                "#lightbox"
            );

            const lightboxImage = document.querySelector(
                "#lightbox-image"
            );

            const lightboxCounter = document.querySelector(
                "#lightbox-counter"
            );

            /*
             * Add only the photographs you want in the gallery.
             * Their order here determines their display order.
             */

            const photographs = [
                {
                    src: "images/para1.jpg",
                    alt: "Paragliding in Georgia"
                },
                {
                    src: "images/para2.jpg",
                    alt: "A paragliding adventure"
                },
                {
                    src: "images/para3.jpg",
                    alt: "A moment in flight"
                },
                {
                    src: "images/para4.jpg",
                    alt: "Discover Georgia from above"
                },
                {
                    src: "images/para5.jpg",
                    alt: "Discover Georgia from above"
                },
                {
                    src: "images/para8.jpg",
                    alt: "Discover Georgia from above"
                },
                {
                    src: "images/para17.jpg",
                    alt: "Discover Georgia from above"
                },
                {
                    src: "images/para18.jpg",
                    alt: "Discover Georgia from above"
                },
                {
                    src: "images/para20.jpg",
                    alt: "Discover Georgia from above"
                },
                {
                    src: "images/para21.jpg",
                    alt: "Discover Georgia from above"
                },
                {
                    src: "images/para11.jpg",
                    alt: "Discover Georgia from above"
                },
                {
                    src: "images/para13.jpg",
                    alt: "Discover Georgia from above"
                }
            ];

            const slideshowDelay = 3500;

            const reducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

            let currentPhotograph = 0;
            let lastGalleryButton = null;
            let slideshowTimer = null;
            let slideshowPlaying = false;
            let slideshowButton = null;

            /* PLAY / PAUSE BUTTON */

            if (lightbox) {
                const toolbar = lightbox.querySelector(
                    ".lightbox-toolbar"
                );

                if (toolbar) {
                    slideshowButton =
                        document.createElement("button");

                    slideshowButton.type = "button";

                    slideshowButton.className =
                        "gallery-slideshow-toggle";

                    slideshowButton.textContent = "Play ▶";

                    slideshowButton.setAttribute(
                        "aria-label",
                        "Start automatic slideshow"
                    );

                    slideshowButton.style.cssText = `
                        padding: 10px 16px;
                        margin-left: auto;
                        margin-right: 12px;
                        border: 1px solid currentColor;
                        border-radius: 8px;
                        background: transparent;
                        color: inherit;
                        font: inherit;
                        cursor: pointer;
                    `;

                    const closeButton = toolbar.querySelector(
                        "#lightbox-close"
                    );

                    toolbar.insertBefore(
                        slideshowButton,
                        closeButton || null
                    );
                }

                lightboxImage?.setAttribute(
                    "aria-live",
                    "off"
                );
            }

            function updateSlideshowButton() {
                if (!slideshowButton) return;

                slideshowButton.textContent =
                    slideshowPlaying
                        ? "Pause ❚❚"
                        : "Play ▶";

                slideshowButton.setAttribute(
                    "aria-label",
                    slideshowPlaying
                        ? "Pause automatic slideshow"
                        : "Start automatic slideshow"
                );

                slideshowButton.disabled =
                    photographs.length < 2;
            }

            /* DISPLAY PHOTOGRAPH */

            function renderLightbox() {
                if (
                    !lightboxImage ||
                    !photographs.length
                ) {
                    return;
                }

                const photograph =
                    photographs[currentPhotograph];

                lightboxImage.src = photograph.src;
                lightboxImage.alt = photograph.alt;

                if (lightboxCounter) {
                    lightboxCounter.textContent =
                        `${currentPhotograph + 1} / ${photographs.length}`;
                }
            }

            function moveLightbox(direction) {
                if (!photographs.length) return;

                currentPhotograph =
                    (
                        currentPhotograph +
                        direction +
                        photographs.length
                    ) % photographs.length;

                renderLightbox();
            }

            /* AUTOMATIC SLIDESHOW */

            function clearSlideshowTimer() {
                if (slideshowTimer !== null) {
                    window.clearInterval(slideshowTimer);
                    slideshowTimer = null;
                }
            }

            function startSlideshow() {
                clearSlideshowTimer();

                if (
                    !lightbox?.open ||
                    photographs.length < 2 ||
                    document.hidden
                ) {
                    slideshowPlaying = false;
                    updateSlideshowButton();
                    return;
                }

                slideshowPlaying = true;
                updateSlideshowButton();

                slideshowTimer = window.setInterval(() => {
                    moveLightbox(1);
                }, slideshowDelay);
            }

            function stopSlideshow() {
                clearSlideshowTimer();
                slideshowPlaying = false;
                updateSlideshowButton();
            }

            function moveManually(direction) {
                moveLightbox(direction);

                if (slideshowPlaying) {
                    startSlideshow();
                }
            }

            slideshowButton?.addEventListener(
                "click",
                () => {
                    if (slideshowPlaying) {
                        stopSlideshow();
                    } else {
                        startSlideshow();
                    }
                }
            );

            /* OPEN PHOTOGRAPH */

            function openLightbox(index, button) {
                if (!photographs[index]) return;

                if (
                    !lightbox ||
                    !lightboxImage ||
                    typeof lightbox.showModal !== "function"
                ) {
                    window.location.assign(
                        photographs[index].src
                    );

                    return;
                }

                stopSlideshow();

                currentPhotograph = index;
                lastGalleryButton = button;

                renderLightbox();

                if (!lightbox.open) {
                    lightbox.showModal();

                    document.body.classList.add(
                        "dialog-open"
                    );
                }

                if (!reducedMotion.matches) {
                    startSlideshow();
                }
            }

            /* BUILD GALLERY */

            if (galleryGrid) {
                const fragment =
                    document.createDocumentFragment();

                photographs.forEach((photograph, index) => {
                    const button =
                        document.createElement("button");

                    button.className = "gallery-item";
                    button.type = "button";

                    button.setAttribute(
                        "aria-label",
                        `Enlarge photograph ${index + 1}: ${photograph.alt}`
                    );

                    const image =
                        document.createElement("img");

                    image.src = photograph.src;
                    image.alt = photograph.alt;
                    image.loading = "lazy";
                    image.decoding = "async";

                    button.appendChild(image);

                    button.addEventListener("click", () => {
                        openLightbox(index, button);
                    });

                    fragment.appendChild(button);
                });

                galleryGrid.replaceChildren(fragment);
            }

            /* CLOSE AND ARROWS */

            document.querySelector("#lightbox-close")
                ?.addEventListener("click", () => {
                    stopSlideshow();
                    lightbox?.close();
                });

            document.querySelector("#lightbox-prev")
                ?.addEventListener("click", () => {
                    moveManually(-1);
                });

            document.querySelector("#lightbox-next")
                ?.addEventListener("click", () => {
                    moveManually(1);
                });

            lightbox?.addEventListener(
                "cancel",
                stopSlideshow
            );

            lightbox?.addEventListener("close", () => {
                stopSlideshow();

                document.body.classList.remove(
                    "dialog-open"
                );

                lastGalleryButton?.focus();
            });

            lightbox?.addEventListener("click", (event) => {
                if (event.target !== lightbox) return;

                const bounds =
                    lightbox.getBoundingClientRect();

                const outside =
                    event.clientX < bounds.left ||
                    event.clientX > bounds.right ||
                    event.clientY < bounds.top ||
                    event.clientY > bounds.bottom;

                if (outside) {
                    stopSlideshow();
                    lightbox.close();
                }
            });

            /* KEYBOARD CONTROLS */

            document.addEventListener(
                "keydown",
                (event) => {
                    if (!lightbox?.open) return;

                    if (event.key === "ArrowLeft") {
                        event.preventDefault();
                        moveManually(-1);
                    }

                    if (event.key === "ArrowRight") {
                        event.preventDefault();
                        moveManually(1);
                    }
                }
            );

            document.addEventListener(
                "visibilitychange",
                () => {
                    if (document.hidden) {
                        stopSlideshow();
                    }
                }
            );

            reducedMotion.addEventListener(
                "change",
                (event) => {
                    if (event.matches) {
                        stopSlideshow();
                    }
                }
            );

            updateSlideshowButton();
        })();
    } catch (error) {
        console.error(
            "Gallery initialization failed:",
            error
        );
    }

    /* =========================
       NEWS FILTERS
    ========================= */

    const newsButtons = document.querySelectorAll(
        "[data-news-filter]"
    );

    const newsArticles = document.querySelectorAll(
        "[data-news-category]"
    );

    newsButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const category = button.dataset.newsFilter;

            newsButtons.forEach((item) => {
                const active = item === button;

                item.classList.toggle(
                    "is-active",
                    active
                );

                item.setAttribute(
                    "aria-pressed",
                    String(active)
                );
            });

            newsArticles.forEach((article) => {
                article.hidden =
                    category !== "all" &&
                    article.dataset.newsCategory !== category;
            });
        });
    });

    /* =========================
       LOCATIONS
    ========================= */

    const locationNames = {
        tbilisi_sea: "Tbilisi Sea",
        gudauri: "Gudauri",
        ananuri: "Ananuri",
        mestia: "Mestia",
        bakuriani: "Bakuriani"
    };

    document.querySelectorAll("a[data-location]").forEach(
        (link) => {
            const location = link.dataset.location;

            if (hasKey(locationNames, location)) {
                link.href =
                    "BookYourFlight.html?location=" +
                    encodeURIComponent(location);
            }
        }
    );

    const requestedLocation = new URLSearchParams(
        window.location.search
    ).get("location");

    /* =========================
       PHONE VALIDATION
    ========================= */

    const phonePattern = /^\+[1-9][0-9]{7,14}$/;

    const phoneError =
        "Enter + followed by your country code and phone number, " +
        "using digits only. Example: +995593466744";

    function setupPhoneValidation(input) {
        if (!input) return;

        input.type = "tel";
        input.required = true;
        input.minLength = 9;
        input.maxLength = 16;

        input.pattern = "\\+[1-9][0-9]{7,14}";

        input.placeholder = "+995593466744";
        input.title = phoneError;
        input.autocomplete = "tel";

        input.addEventListener("input", () => {
            input.setCustomValidity("");
        });

        input.addEventListener("invalid", () => {
            if (input.validity.valueMissing) {
                input.setCustomValidity(
                    "Please enter your phone number " +
                    "with + and your country code."
                );
            } else if (
                !phonePattern.test(input.value)
            ) {
                input.setCustomValidity(phoneError);
            }
        });
    }

    /* =========================
       DATE HELPERS
    ========================= */

    function dateInGeorgia() {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Tbilisi",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(new Date());

        const values = {};

        parts.forEach((part) => {
            values[part.type] = part.value;
        });

        return `${values.year}-${values.month}-${values.day}`;
    }

    function showFieldError(event, field, message) {
        event.preventDefault();
        field.setCustomValidity(message);
        field.reportValidity();
        field.focus();
    }

    /* =========================
       POPUP AND RECEIPT STYLES
    ========================= */

    const noticeStyles = document.createElement("style");

    noticeStyles.textContent = `
        #email-notice {
            border: 0;
            border-radius: 22px;
            padding: 0;
            width: min(480px, calc(100% - 32px));
            max-height: calc(100dvh - 40px);
            color: #17243a;
            background: #ffffff;
            box-shadow: 0 24px 90px #0d1e3b55;
        }

        #email-notice::backdrop {
            background: #081a38aa;
        }

        #email-notice .notice-top {
            background: #b91c35;
            color: #ffffff;
            padding: 26px 28px;
        }

        #email-notice .notice-top p {
            margin: 0 0 8px;
            font: 700 12px/1.5 system-ui;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        #email-notice h2 {
            margin: 0;
            color: #ffffff;
            font: 700 28px/1.2 system-ui;
        }

        #email-notice .notice-body {
            padding: 24px 28px;
            font: 400 16px/1.65 system-ui;
        }

        #email-notice .notice-body p {
            margin: 0 0 18px;
        }

        #email-notice .notice-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        #email-notice button {
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            background: #ffffff;
            color: #17243a;
            padding: 12px 18px;
            font: 600 15px system-ui;
            cursor: pointer;
        }

        #email-notice button.notice-primary {
            background: #b91c35;
            border-color: #b91c35;
            color: #ffffff;
        }

        #email-notice button:focus-visible {
            outline: 3px solid #2563eb;
            outline-offset: 3px;
        }

        #email-notice [hidden],
        #booking-receipt[hidden],
        .booking-section[hidden] {
            display: none !important;
        }

        #booking-receipt {
            max-width: 760px;
            margin: 60px auto;
            padding: 0 20px;
            font-family: system-ui, sans-serif;
            color: #17243a;
        }

        #booking-receipt .receipt-card {
            background: #ffffff;
            border: 1px solid #dce4ee;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 15px 55px #0b234b12;
        }

        #booking-receipt .receipt-header {
            background: #07356c;
            color: #ffffff;
            padding: 32px;
        }

        #booking-receipt h1 {
            color: inherit;
            font-size: 32px;
            margin: 12px 0;
        }

        #booking-receipt .receipt-label {
            font-size: 12px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        #booking-receipt .receipt-body {
            padding: 32px;
            line-height: 1.7;
        }

        #booking-receipt .receipt-alert {
            border-left: 4px solid #be123c;
            background: #fff1f2;
            color: #9f1239;
            padding: 18px;
            border-radius: 8px;
            margin: 24px 0;
        }

        #booking-receipt .receipt-link {
            display: inline-block;
            background: #07356c;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 9px;
        }
    `;

    document.head.appendChild(noticeStyles);

    /* =========================
       EMAIL NOTICE POPUP
    ========================= */

    const notice = document.createElement("dialog");

    notice.id = "email-notice";

    notice.setAttribute(
        "aria-labelledby",
        "email-notice-title"
    );

    notice.setAttribute(
        "aria-describedby",
        "email-notice-text"
    );

    notice.innerHTML = `
        <div class="notice-top">
            <p>Important email reminder</p>

            <h2 id="email-notice-title">
                Please check your spam folder
            </h2>
        </div>

        <div class="notice-body">
            <p id="email-notice-text"></p>

            <div class="notice-actions">
                <button
                    type="button"
                    class="notice-primary"
                    id="email-notice-confirm"
                >
                    Got it
                </button>

                <button
                    type="button"
                    id="email-notice-back"
                    hidden
                >
                    Back to form
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(notice);

    const noticeConfirm = notice.querySelector(
        "#email-notice-confirm"
    );

    const noticeBack = notice.querySelector(
        "#email-notice-back"
    );

    const noticeText = notice.querySelector(
        "#email-notice-text"
    );

    let onNoticeConfirm = null;

    function showEmailNotice(message, onContinue = null) {
        onNoticeConfirm = onContinue;
        noticeText.textContent = message;

        noticeConfirm.textContent = onContinue
            ? "Continue to send request"
            : "Got it";

        noticeBack.hidden = !onContinue;

        if (typeof notice.showModal !== "function") {
            onNoticeConfirm = null;

            if (onContinue) {
                if (window.confirm(message)) {
                    onContinue();
                }
            } else {
                window.alert(message);
            }

            return;
        }

        if (!notice.open) {
            notice.showModal();
        }
    }

    noticeConfirm.addEventListener("click", () => {
        const action = onNoticeConfirm;

        onNoticeConfirm = null;
        notice.close();

        if (action) action();
    });

    noticeBack.addEventListener("click", () => {
        notice.close();
    });

    notice.addEventListener("close", () => {
        onNoticeConfirm = null;
    });

    /*
     * Call only after your registration server
     * confirms a successful registration.
     */
    window.showRegistrationEmailNotice = () => {
        showEmailNotice(
            "Your registration was successful. " +
            "Please check your inbox and Spam or Junk folder " +
            "for our email. If you find it in Spam, mark it as Not spam."
        );
    };

    document.addEventListener(
        "registration:success",
        window.showRegistrationEmailNotice
    );

    /* =========================
       FLIGHT REQUEST FORM
    ========================= */

    const requestForm = document.querySelector(
        "#flight-request-form"
    );

    if (requestForm) {
        // Company receives booking details here.
        requestForm.action =
            "https://formsubmit.co/magda1.karkusashvili@gmail.com";

        requestForm.method = "POST";

        const phoneInput = requestForm.querySelector(
            "#request-phone"
        );

        const dateInput = requestForm.querySelector(
            "#request-date"
        );

        const nameInput = requestForm.querySelector(
            "#request-name"
        );

        const locationInput = requestForm.querySelector(
            "#request-location"
        );

        const peopleInput = requestForm.querySelector(
            "#request-people"
        );

        function hiddenSetting(name, value) {
            let input = requestForm.querySelector(
                `[name="${name}"]`
            );

            if (!input) {
                input = document.createElement("input");

                input.type = "hidden";
                input.name = name;

                requestForm.appendChild(input);
            }

            input.value = value;
        }

        const pageUrl = new URL(window.location.href);

        pageUrl.search = "";
        pageUrl.hash = "";

        const nextUrl = new URL(pageUrl.href);

        nextUrl.searchParams.set(
            "booking",
            "received"
        );

        hiddenSetting("_url", pageUrl.href);
        hiddenSetting("_next", nextUrl.href);
        hiddenSetting("_template", "table");
        hiddenSetting("_captcha", "true");

        /* OPERATOR CONTACTS */

        const operators = {
            "Gudauri": {
                phone: "+995 558338989",
                map: "https://maps.app.goo.gl/5gHm342YP9DKH45U9"
            },

            "Tbilisi Sea": {
                phone: "+995 555004993",
                map: "https://maps.app.goo.gl/wujra2Yebuk76uxg9"
            },

            "Ananuri": {
                phone: "+995 599045777",
                map: "https://maps.app.goo.gl/96VSxjA1fJoaJk336"
            },

            "Mestia": {
                phone: "+995 593988811",
                map: "https://maps.app.goo.gl/DxyBgUGpeiuekDLw7"
            },

            "Bakuriani": {
                phone: "+995 593466744"
            }
        };

        function formattedDate() {
            const [year, month, day] =
                (dateInput?.value || "").split("-");

            return year && month && day
                ? `${day}.${month}.${year}`
                : "";
        }

        /* CUSTOMER EMAIL */

        function customerMessage() {
            const location =
                locationInput?.value || "";

            const operator = operators[location] || {
                phone: "+995 593466744"
            };

            const map = operator.map
                ? `\nMeeting point on Google Maps:\n${operator.map}\n`
                : "";

            return `Hello!

Thank you for choosing to fly with us.
Your flight request has been received.

YOUR FLIGHT DETAILS
Location: ${location}
Preferred date: ${formattedDate()}
Participants: ${peopleInput?.value || ""}

YOUR FLIGHT OPERATOR
Phone: ${operator.phone}
${map}
Please contact your flight operator one day before your preferred flight date to confirm availability, the exact time and the meeting point.

Flights depend on weather conditions. We may need to reschedule your flight or adjust the departure time. Your booking is confirmed once agreed with our team.

Please check your Spam or Junk folder if you cannot find our email.

We wish you a wonderful flight and an unforgettable experience!

Best regards,
Georgian Paragliding Federation`;
        }

        /* PREPARE EMAIL SETTINGS */

        function prepareEmailSettings() {
            hiddenSetting(
                "_autoresponse",
                customerMessage()
            );

            hiddenSetting(
                "_subject",
                `New Flight Request — ${nameInput?.value.trim() || "Guest"} | ${locationInput?.value || ""} | ${formattedDate()}`
            );

            hiddenSetting("_template", "table");
            hiddenSetting("_url", pageUrl.href);
            hiddenSetting("_next", nextUrl.href);
            hiddenSetting("_captcha", "true");
        }

        requestForm.addEventListener(
            "formdata",
            (event) => {
                event.formData.set(
                    "_autoresponse",
                    customerMessage()
                );

                event.formData.set(
                    "_subject",
                    `New Flight Request — ${nameInput?.value.trim() || "Guest"} | ${locationInput?.value || ""} | ${formattedDate()}`
                );

                event.formData.set(
                    "_template",
                    "table"
                );

                event.formData.set(
                    "_url",
                    pageUrl.href
                );

                event.formData.set(
                    "_next",
                    nextUrl.href
                );

                event.formData.set(
                    "_captcha",
                    "true"
                );
            }
        );

        setupPhoneValidation(phoneInput);

        if (dateInput) {
            dateInput.min = dateInGeorgia();

            dateInput.addEventListener("focus", () => {
                dateInput.min = dateInGeorgia();
            });
        }

        if (
            locationInput &&
            hasKey(locationNames, requestedLocation)
        ) {
            locationInput.value =
                locationNames[requestedLocation];
        }

        requestForm.addEventListener(
            "input",
            (event) => {
                if (
                    typeof event.target.setCustomValidity ===
                    "function"
                ) {
                    event.target.setCustomValidity("");
                }
            }
        );

        /* VALIDATION AND SUBMISSION */

        let noticeAcknowledged = false;

        requestForm.addEventListener(
            "submit",
            (event) => {
                if (
                    window.location.protocol !== "https:" &&
                    window.location.protocol !== "http:"
                ) {
                    event.preventDefault();

                    alert(
                        "Please open this page using Live Server " +
                        "or your Codespaces HTTPS link."
                    );

                    return;
                }

                if (
                    !dateInput?.value ||
                    dateInput.value < dateInGeorgia()
                ) {
                    if (dateInput) {
                        showFieldError(
                            event,
                            dateInput,
                            "Please choose today or a future date."
                        );
                    } else {
                        event.preventDefault();
                    }

                    return;
                }

                if (
                    nameInput &&
                    nameInput.value.trim().length < 2
                ) {
                    showFieldError(
                        event,
                        nameInput,
                        "Please enter your full name."
                    );

                    return;
                }

                if (
                    phoneInput &&
                    !phonePattern.test(phoneInput.value)
                ) {
                    showFieldError(
                        event,
                        phoneInput,
                        phoneError
                    );

                    return;
                }

                if (!requestForm.reportValidity()) {
                    event.preventDefault();
                    return;
                }

                if (noticeAcknowledged) {
                    noticeAcknowledged = false;
                    prepareEmailSettings();
                    return;
                }

                event.preventDefault();

                const submitter = event.submitter;

                showEmailNotice(
                    "After sending your flight request, please check " +
                    "your inbox and Spam or Junk folder. Our email may " +
                    "arrive there. If it does, mark it as Not spam so " +
                    "future messages reach your inbox.",

                    () => {
                        noticeAcknowledged = true;

                        try {
                            requestForm.requestSubmit(
                                submitter || undefined
                            );
                        } finally {
                            noticeAcknowledged = false;
                        }
                    }
                );
            }
        );

        /* RETURN AFTER SUBMISSION */

        const returnedFromSubmission =
            new URLSearchParams(window.location.search)
                .get("booking") === "received";

        if (returnedFromSubmission) {
            const bookingSection =
                requestForm.closest(".booking-section");

            if (bookingSection) {
                bookingSection.hidden = true;
            }

            const receipt = document.getElementById(
                "booking-receipt"
            );

            if (receipt) {
                receipt.hidden = false;
            }

            showEmailNotice(
                "Your flight request has been submitted. " +
                "Please check your inbox and Spam or Junk folder " +
                "for our email. Email delivery may take a few minutes. " +
                "If you find it in Spam, mark it as Not spam."
            );

            const cleanUrl = new URL(
                window.location.href
            );

            cleanUrl.searchParams.delete("booking");

            window.history.replaceState(
                null,
                "",
                cleanUrl.href
            );
        }
    }

    /* =========================
       LEGACY BOOKING LINKS
    ========================= */

    const legacyBookingForm = document.querySelector(
        "#booking-form"
    );

    if (legacyBookingForm) {
        const legacySubmit =
            legacyBookingForm.querySelector(
                "#booking-submit"
            );

        if (legacySubmit) {
            legacySubmit.disabled = false;

            legacySubmit.textContent =
                "Continue to booking ↗";
        }

        const help = legacyBookingForm.querySelector(
            ".form-help"
        );

        if (help) {
            help.textContent =
                "Continue to our booking page to send " +
                "your flight request by email.";
        }

        legacyBookingForm.addEventListener(
            "submit",
            (event) => {
                event.preventDefault();

                const selected =
                    legacyBookingForm.querySelector(
                        "#flight-location"
                    )?.value || "";

                const target = new URL(
                    "BookYourFlight.html",
                    window.location.href
                );

                if (hasKey(locationNames, selected)) {
                    target.searchParams.set(
                        "location",
                        selected
                    );
                }

                window.location.assign(target.href);
            }
        );
    }
})();