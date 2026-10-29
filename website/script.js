"use strict";

(() => {
    function initializeSite() {
        function hasKey(object, key) {
            return Object.prototype.hasOwnProperty.call(
                object,
                key
            );
        }

        /* =========================
           REMOVE LANGUAGE BUTTONS
        ========================= */

        const languageStyles = document.createElement("style");

        languageStyles.textContent = `
            .gpf-languages,
            .gpf-language-spacer {
                display: none !important;
            }
        `;

        document.head.appendChild(languageStyles);

        document.querySelectorAll(
            ".gpf-languages, .gpf-language-spacer"
        ).forEach((element) => {
            element.remove();
        });

        /* =========================
           MOBILE MENU
        ========================= */

        const menuToggle = document.querySelector(
            "#menu-toggle"
        );

        const mainMenu = document.querySelector(
            "#main-menu"
        );

        function closeMenu() {
            if (!mainMenu || !menuToggle) return;

            mainMenu.classList.remove(
                "is-open",
                "open",
                "active"
            );

            mainMenu.style.removeProperty("display");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        /*
         * Capture this button before any older inline
         * menu handler, avoiding duplicate toggles.
         */
        window.addEventListener("click", (event) => {
            if (
                !menuToggle ||
                !mainMenu ||
                !(event.target instanceof Element) ||
                !menuToggle.contains(event.target)
            ) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            const isOpen =
                menuToggle.getAttribute(
                    "aria-expanded"
                ) !== "true";

            mainMenu.classList.toggle(
                "is-open",
                isOpen
            );

            mainMenu.classList.toggle(
                "open",
                isOpen
            );

            mainMenu.classList.toggle(
                "active",
                isOpen
            );

            mainMenu.style.display = isOpen
                ? "flex"
                : "none";

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        }, true);

        mainMenu?.addEventListener("click", (event) => {
            if (
                event.target instanceof Element &&
                event.target.closest("a")
            ) {
                closeMenu();
            }
        });

        document.addEventListener("click", (event) => {
            if (
                mainMenu &&
                menuToggle &&
                event.target instanceof Node &&
                !mainMenu.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        window.matchMedia("(min-width: 851px)")
            .addEventListener("change", () => {
                closeMenu();
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

        document.querySelectorAll("a[href]").forEach((link) => {
            const href = link.getAttribute("href");

            if (hasKey(pageLinks, href)) {
                link.setAttribute(
                    "href",
                    pageLinks[href]
                );
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

        document.querySelectorAll(
            'a.nav-book[href="BookYourFlight.html"]'
        ).forEach((link) => {
            link.textContent = "Plan Your Adventure ↗";
        });

        const currentPage =
            window.location.pathname.split("/").pop() ||
            "index.html";

        mainMenu?.querySelectorAll("a").forEach((link) => {
            if (link.getAttribute("href") === currentPage) {
                link.setAttribute(
                    "aria-current",
                    "page"
                );
            } else {
                link.removeAttribute("aria-current");
            }
        });

        /* =========================
           FOOTER YEAR
        ========================= */

        const yearElement = document.querySelector("#year");

        if (yearElement) {
            yearElement.textContent =
                new Date().getFullYear();
        }

        /* =========================
           GALLERY AND LIGHTBOX
        ========================= */

        try {
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

            const reducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

            let currentPhotograph = 0;
            let lastGalleryButton = null;
            let slideshowTimer = null;
            let slideshowPlaying = false;
            let slideshowButton = null;

            const toolbar = lightbox?.querySelector(
                ".lightbox-toolbar"
            );

            if (toolbar) {
                slideshowButton =
                    document.createElement("button");

                slideshowButton.type = "button";
                slideshowButton.className =
                    "gallery-slideshow-toggle";

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

                toolbar.insertBefore(
                    slideshowButton,
                    toolbar.querySelector("#lightbox-close")
                );
            }

            lightboxImage?.setAttribute(
                "aria-live",
                "off"
            );

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

            function renderLightbox() {
                if (!lightboxImage) return;

                const photograph =
                    photographs[currentPhotograph];

                lightboxImage.src = photograph.src;
                lightboxImage.alt = photograph.alt;

                if (lightboxCounter) {
                    lightboxCounter.textContent =
                        `${currentPhotograph + 1} / ` +
                        photographs.length;
                }
            }

            function moveLightbox(direction) {
                currentPhotograph =
                    (
                        currentPhotograph +
                        direction +
                        photographs.length
                    ) % photographs.length;

                renderLightbox();
            }

            function stopSlideshow() {
                if (slideshowTimer !== null) {
                    window.clearInterval(slideshowTimer);
                    slideshowTimer = null;
                }

                slideshowPlaying = false;
                updateSlideshowButton();
            }

            function startSlideshow() {
                stopSlideshow();

                if (
                    !lightbox?.open ||
                    photographs.length < 2 ||
                    document.hidden
                ) {
                    return;
                }

                slideshowPlaying = true;
                updateSlideshowButton();

                slideshowTimer = window.setInterval(() => {
                    moveLightbox(1);
                }, 3500);
            }

            function moveManually(direction) {
                const wasPlaying = slideshowPlaying;

                moveLightbox(direction);

                if (wasPlaying) {
                    startSlideshow();
                }
            }

            slideshowButton?.addEventListener("click", () => {
                if (slideshowPlaying) {
                    stopSlideshow();
                } else {
                    startSlideshow();
                }
            });

            function openLightbox(index, button) {
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
                        `Enlarge photograph ${index + 1}: ` +
                        photograph.alt
                    );

                    const image = document.createElement("img");

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

            document.addEventListener("keydown", (event) => {
                if (!lightbox?.open) return;

                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    moveManually(-1);
                }

                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    moveManually(1);
                }
            });

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

        const operators = new Map([
            ["Gudauri", "995558338989"],
            ["Ananuri", "995599045777"],
            ["Tbilisi Sea", "995555004993"],
            ["Mestia", "995593988811"],
            ["Bakuriani", "995599334486"]
        ]);

        document.querySelectorAll(
            "a[data-location]"
        ).forEach((link) => {
            const location = link.dataset.location;

            if (hasKey(locationNames, location)) {
                link.href =
                    "BookYourFlight.html?location=" +
                    encodeURIComponent(location);
            }
        });

        const requestedLocation = new URLSearchParams(
            window.location.search
        ).get("location");

        /* =========================
           ADVENTURE FORM
        ========================= */

        const adventureForm = document.querySelector(
            "#adventure-form"
        );

        if (adventureForm) {
            const locationInput =
                adventureForm.querySelector(
                    "#adventure-location"
                );

            const dateInput =
                adventureForm.querySelector(
                    "#adventure-date"
                );

            const nameInput =
                adventureForm.querySelector(
                    "#adventure-name"
                );

            const phoneInput =
                adventureForm.querySelector(
                    "#adventure-phone"
                );

            const peopleInput =
                adventureForm.querySelector(
                    "#adventure-people"
                );

            const messageInput =
                adventureForm.querySelector(
                    "#adventure-message"
                );

            const callButton =
                adventureForm.querySelector(
                    "#adventure-call-button"
                );

            const whatsappButton =
                adventureForm.querySelector(
                    "#adventure-whatsapp-button"
                );

            const whatsappNote = document.querySelector(
                "#adventure-whatsapp-note"
            );

            if (whatsappNote) {
                whatsappNote.textContent =
                    "WhatsApp will open with your completed " +
                    "request and connect you with the relevant " +
                    "operator. Press Send in WhatsApp to deliver " +
                    "your request. Opening the chat does not " +
                    "send the request or confirm a booking.";
            }

            if (
                locationInput &&
                hasKey(locationNames, requestedLocation)
            ) {
                locationInput.value =
                    locationNames[requestedLocation];
            }

            function dateInGeorgia() {
                const parts = new Intl.DateTimeFormat(
                    "en-US",
                    {
                        timeZone: "Asia/Tbilisi",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                    }
                ).formatToParts(new Date());

                const values = {};

                parts.forEach((part) => {
                    values[part.type] = part.value;
                });

                return (
                    values.year + "-" +
                    values.month + "-" +
                    values.day
                );
            }

            if (dateInput) {
                dateInput.min = dateInGeorgia();

                dateInput.addEventListener("focus", () => {
                    dateInput.min = dateInGeorgia();
                });
            }

            const phonePattern = /^\+[1-9][0-9]{7,14}$/;

            if (phoneInput) {
                phoneInput.type = "tel";
                phoneInput.required = true;
                phoneInput.minLength = 9;
                phoneInput.maxLength = 16;
                phoneInput.pattern =
                    "\\+[1-9][0-9]{7,14}";

                phoneInput.placeholder =
                    "+[country code][number]";

                phoneInput.title =
                    "Include + and your country code. " +
                    "Use digits only after +.";

                phoneInput.addEventListener("input", () => {
                    phoneInput.setCustomValidity("");
                });
            }

            nameInput?.addEventListener("input", () => {
                nameInput.setCustomValidity("");
            });

            dateInput?.addEventListener("input", () => {
                dateInput.setCustomValidity("");
            });

            function selectedOperator() {
                if (!locationInput) return null;

                if (!locationInput.reportValidity()) {
                    return null;
                }

                return operators.get(locationInput.value);
            }

            function callOperator() {
                const phone = selectedOperator();

                if (!phone) return;

                window.location.href = "tel:+" + phone;
            }

            function openWhatsAppRequest() {
                if (dateInput) {
                    dateInput.min = dateInGeorgia();

                    dateInput.setCustomValidity(
                        dateInput.value &&
                        dateInput.value < dateInGeorgia()
                            ? "Please choose today or a future date."
                            : ""
                    );
                }

                if (nameInput) {
                    nameInput.setCustomValidity(
                        nameInput.value.trim().length < 2
                            ? "Please enter your full name."
                            : ""
                    );
                }

                if (phoneInput) {
                    phoneInput.setCustomValidity(
                        phonePattern.test(phoneInput.value)
                            ? ""
                            : "Enter + followed by your country " +
                              "code and phone number, using digits only."
                    );
                }

                if (!adventureForm.reportValidity()) return;

                const phone = selectedOperator();

                if (!phone) return;

                const message = [
                    "NEW ADVENTURE REQUEST",
                    "",
                    "Hello, I am interested in your company’s " +
                    "services and would like to go paragliding.",
                    "Please confirm receipt of this message.",
                    "",
                    "Location: " + locationInput.value,
                    "Preferred date: " + (dateInput?.value || ""),
                    "Participants: " + (peopleInput?.value || ""),
                    "Name: " + (nameInput?.value.trim() || ""),
                    "Phone: " + (phoneInput?.value.trim() || ""),
                    "",
                    "Additional information:",
                    messageInput?.value.trim() || "Not provided"
                ].join("\n");

                const whatsappURL =
                    "https://wa.me/" +
                    phone +
                    "?text=" +
                    encodeURIComponent(message);

                const link = document.createElement("a");

                link.href = whatsappURL;
                link.target = "_blank";
                link.rel = "noopener noreferrer";

                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            /*
             * Capture the contact buttons before older inline
             * handlers so that only the updated message is used.
             */
            window.addEventListener("click", (event) => {
                if (!(event.target instanceof Element)) return;

                const button = event.target.closest(
                    "#adventure-call-button, " +
                    "#adventure-whatsapp-button"
                );

                if (!button || !adventureForm.contains(button)) {
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();

                if (button === callButton) {
                    callOperator();
                } else if (button === whatsappButton) {
                    openWhatsAppRequest();
                }
            }, true);

            window.addEventListener("submit", (event) => {
                if (event.target !== adventureForm) return;

                event.preventDefault();
                event.stopImmediatePropagation();

                openWhatsAppRequest();
            }, true);
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
                    "Plan Your Adventure ↗";
            }

            const help = legacyBookingForm.querySelector(
                ".form-help"
            );

            if (help) {
                help.textContent =
                    "Choose a location and continue to contact " +
                    "the operator by phone or WhatsApp.";
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
                    } else {
                        const locationEntry = Object.entries(
                            locationNames
                        ).find(([, name]) => name === selected);

                        if (locationEntry) {
                            target.searchParams.set(
                                "location",
                                locationEntry[0]
                            );
                        }
                    }

                    window.location.assign(target.href);
                }
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeSite,
            { once: true }
        );
    } else {
        initializeSite();
    }
})();
