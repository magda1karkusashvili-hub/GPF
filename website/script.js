"use strict";

(() => {
    function initializeSite() {
        if (document.body.dataset.gpfInitialized) return;

        document.body.dataset.gpfInitialized = "true";

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        /* =========================
           REMOVE OLD LANGUAGE BUTTONS
        ========================= */

        document.querySelectorAll(
            ".gpf-languages, .gpf-language-spacer"
        ).forEach((element) => element.remove());

        /* =========================
           MOBILE MENU
        ========================= */

        const menuToggle = document.getElementById("menu-toggle");
        const mainMenu = document.getElementById("main-menu");

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

            const open =
                menuToggle.getAttribute("aria-expanded") !== "true";

            mainMenu.classList.toggle("is-open", open);
            mainMenu.classList.toggle("open", open);
            mainMenu.classList.toggle("active", open);

            mainMenu.style.display = open ? "flex" : "none";

            menuToggle.setAttribute(
                "aria-expanded",
                String(open)
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
            if (event.key === "Escape") closeMenu();
        });

        window.matchMedia("(min-width: 851px)")
            .addEventListener("change", closeMenu);

        /* =========================
           NAVIGATION
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

            if (
                Object.prototype.hasOwnProperty.call(
                    pageLinks,
                    href
                )
            ) {
                link.setAttribute("href", pageLinks[href]);
            }
        });

        if (mainMenu) {
            [
                ["news.html", "News"],
                ["Needtoknow.html", "Need to know"]
            ].forEach(([href, text]) => {
                if (mainMenu.querySelector(`a[href="${href}"]`)) {
                    return;
                }

                const link = document.createElement("a");

                link.href = href;
                link.textContent = text;

                mainMenu.insertBefore(
                    link,
                    mainMenu.querySelector(
                        'a[href="contact.html"]'
                    )
                );
            });

            const currentPage =
                window.location.pathname.split("/").pop() ||
                "index.html";

            mainMenu.querySelectorAll("a").forEach((link) => {
                if (link.getAttribute("href") === currentPage) {
                    link.setAttribute("aria-current", "page");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }

        document.querySelectorAll(
            'a.nav-book[href="BookYourFlight.html"]'
        ).forEach((link) => {
            link.textContent = "Plan Your Adventure ↗";
        });

        /* =========================
           YEAR + BROWSER COLOR
        ========================= */

        document.querySelectorAll("#year").forEach((element) => {
            element.textContent = new Date().getFullYear();
        });

        let themeColor = document.querySelector(
            'meta[name="theme-color"]'
        );

        if (!themeColor) {
            themeColor = document.createElement("meta");
            themeColor.name = "theme-color";
            document.head.appendChild(themeColor);
        }

        themeColor.content = "#101f34";

        /* =========================
           FACEBOOK + INSTAGRAM
        ========================= */

        const footer = document.querySelector(
            ".site-footer, .nk-footer, footer"
        );

        if (footer && !footer.querySelector(".social-links")) {
            const social = document.createElement("div");

            social.className = "social-links";
            social.setAttribute("aria-label", "Social media");

            const socialPages = [
                [
                    "Facebook",
                    "https://www.facebook.com/GeorgianParaglidingFederation/"
                ],
                [
                    "Instagram",
                    "https://www.instagram.com/georgian_paragliding_fed/"
                ]
            ];

            socialPages.forEach(([name, url]) => {
                const link = document.createElement("a");

                link.href = url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                link.textContent = name + " ↗";

                link.setAttribute(
                    "aria-label",
                    name + " (opens in a new tab)"
                );

                social.appendChild(link);
            });

            const container =
                footer.querySelector(".container") || footer;

            const bottom =
                container.querySelector(".footer-bottom");

            if (bottom?.parentElement === container) {
                container.insertBefore(social, bottom);
            } else {
                container.appendChild(social);
            }
        }

        /* =========================
           GALLERY
        ========================= */

        const galleryGrid =
            document.getElementById("gallery-grid");

        const lightbox =
            document.getElementById("lightbox");

        const lightboxImage =
            document.getElementById("lightbox-image");

        const lightboxCounter =
            document.getElementById("lightbox-counter");

        const photographs = Array.from(
            { length: 22 },
            (_, index) => ({
                src: `images/para${index + 1}.jpg`,
                alt: index === 21
                    ? "Georgian Paragliding Federation official announcement"
                    : `Paragliding in Georgia — photograph ${index + 1}`
            })
        );

        let currentPhotograph = 0;
        let lastGalleryButton = null;
        let slideshowTimer = null;
        let slideshowButton = null;

        function updateSlideshowButton() {
            if (!slideshowButton) return;

            const playing = slideshowTimer !== null;

            slideshowButton.textContent = playing
                ? "Pause slideshow"
                : "Play slideshow";

            slideshowButton.setAttribute(
                "aria-pressed",
                String(playing)
            );
        }

        function stopSlideshow() {
            if (slideshowTimer !== null) {
                window.clearInterval(slideshowTimer);
                slideshowTimer = null;
            }

            updateSlideshowButton();
        }

        function renderLightbox() {
            if (!lightboxImage) return;

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
            currentPhotograph = (
                currentPhotograph +
                direction +
                photographs.length
            ) % photographs.length;

            renderLightbox();
        }

        function startSlideshow() {
            stopSlideshow();

            if (!lightbox?.open || document.hidden) return;

            slideshowTimer = window.setInterval(() => {
                moveLightbox(1);
            }, 3500);

            updateSlideshowButton();
        }

        function moveManually(direction) {
            const wasPlaying = slideshowTimer !== null;

            moveLightbox(direction);

            if (wasPlaying) startSlideshow();
        }

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
                document.body.classList.add("dialog-open");
            }
        }

        if (lightbox) {
            const toolbar =
                lightbox.querySelector(".lightbox-toolbar");

            if (toolbar) {
                slideshowButton =
                    document.createElement("button");

                slideshowButton.type = "button";
                slideshowButton.className =
                    "lightbox-slideshow";

                slideshowButton.addEventListener(
                    "click",
                    () => {
                        if (slideshowTimer !== null) {
                            stopSlideshow();
                        } else {
                            startSlideshow();
                        }
                    }
                );

                toolbar.insertBefore(
                    slideshowButton,
                    toolbar.querySelector("#lightbox-close")
                );

                updateSlideshowButton();
            }

            lightbox.addEventListener(
                "cancel",
                stopSlideshow
            );

            lightbox.addEventListener("close", () => {
                stopSlideshow();

                document.body.classList.remove(
                    "dialog-open"
                );

                lastGalleryButton?.focus();
            });

            lightbox.addEventListener("click", (event) => {
                if (event.target !== lightbox) return;

                const bounds =
                    lightbox.getBoundingClientRect();

                const outside =
                    event.clientX < bounds.left ||
                    event.clientX > bounds.right ||
                    event.clientY < bounds.top ||
                    event.clientY > bounds.bottom;

                if (outside) lightbox.close();
            });
        }

        if (galleryGrid) {
            const fragment =
                document.createDocumentFragment();

            photographs.forEach((photograph, index) => {
                const button =
                    document.createElement("button");

                button.type = "button";
                button.className = "gallery-item";

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

        document.getElementById("lightbox-close")
            ?.addEventListener("click", () => {
                lightbox?.close();
            });

        document.getElementById("lightbox-prev")
            ?.addEventListener("click", () => {
                moveManually(-1);
            });

        document.getElementById("lightbox-next")
            ?.addEventListener("click", () => {
                moveManually(1);
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
                if (document.hidden) stopSlideshow();
            }
        );

        reducedMotion.addEventListener(
            "change",
            (event) => {
                if (event.matches) stopSlideshow();
            }
        );

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
                const category =
                    button.dataset.newsFilter;

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
           LOCATIONS + OPERATORS
        ========================= */

        const locations = {
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

            if (
                Object.prototype.hasOwnProperty.call(
                    locations,
                    location
                )
            ) {
                link.href =
                    "BookYourFlight.html?location=" +
                    encodeURIComponent(location);
            }
        });

        /* =========================
           ADVENTURE FORM
        ========================= */

        const form =
            document.getElementById("adventure-form");

        if (form) {
            const locationInput =
                form.querySelector("#adventure-location");

            const dateInput =
                form.querySelector("#adventure-date");

            const nameInput =
                form.querySelector("#adventure-name");

            const phoneInput =
                form.querySelector("#adventure-phone");

            const peopleInput =
                form.querySelector("#adventure-people");

            const messageInput =
                form.querySelector("#adventure-message");

            const callButton =
                form.querySelector("#adventure-call-button");

            const whatsappButton =
                form.querySelector(
                    "#adventure-whatsapp-button"
                );

            const requestedLocation =
                new URLSearchParams(
                    window.location.search
                ).get("location");

            if (
                locationInput &&
                Object.prototype.hasOwnProperty.call(
                    locations,
                    requestedLocation
                )
            ) {
                const value =
                    locations[requestedLocation];

                const exists = Array.from(
                    locationInput.options
                ).some((option) => option.value === value);

                if (exists) locationInput.value = value;
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

            const phonePattern =
                /^\+[1-9][0-9]{7,14}$/;

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
            }

            [
                nameInput,
                phoneInput,
                dateInput
            ].forEach((input) => {
                input?.addEventListener("input", () => {
                    input.setCustomValidity("");
                });
            });

            function selectedOperator() {
                if (
                    !locationInput ||
                    !locationInput.reportValidity()
                ) {
                    return null;
                }

                return operators.get(locationInput.value);
            }

            function callOperator() {
                const phone = selectedOperator();

                if (phone) {
                    window.location.href = "tel:+" + phone;
                }
            }

            function openWhatsApp() {
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
                            : "Enter + followed by your country code " +
                              "and phone number, using digits only."
                    );
                }

                if (!form.reportValidity()) return;

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
                    "Preferred date: " +
                        (dateInput?.value || ""),
                    "Participants: " +
                        (peopleInput?.value || ""),
                    "Name: " +
                        (nameInput?.value.trim() || ""),
                    "Phone: " +
                        (phoneInput?.value.trim() || "")
                ];

                const additional =
                    messageInput?.value.trim();

                if (additional) {
                    message.push(
                        "",
                        "Additional information:",
                        additional
                    );
                }

                const link = document.createElement("a");

                link.href =
                    "https://wa.me/" +
                    phone +
                    "?text=" +
                    encodeURIComponent(message.join("\n"));

                link.target = "_blank";
                link.rel = "noopener noreferrer";

                document.body.appendChild(link);
                link.click();
                link.remove();
            }

            /*
             * Prevent older inline handlers from
             * opening the operator link twice.
             */
            window.addEventListener("click", (event) => {
                if (!(event.target instanceof Element)) {
                    return;
                }

                const button = event.target.closest(
                    "#adventure-call-button, " +
                    "#adventure-whatsapp-button"
                );

                if (!button || !form.contains(button)) {
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();

                if (button === callButton) {
                    callOperator();
                } else if (button === whatsappButton) {
                    openWhatsApp();
                }
            }, true);

            window.addEventListener("submit", (event) => {
                if (event.target !== form) return;

                event.preventDefault();
                event.stopImmediatePropagation();

                openWhatsApp();
            }, true);

            const note = document.getElementById(
                "adventure-whatsapp-note"
            );

            if (note) {
                note.textContent =
                    "WhatsApp will open with your completed request. " +
                    "Press Send in WhatsApp to deliver it. " +
                    "Opening the chat does not send your request " +
                    "or confirm a booking.";
            }
        }

        /* =========================
           LEGACY BOOKING FORM
        ========================= */

        const legacyForm =
            document.getElementById("booking-form");

        if (legacyForm) {
            const submit =
                legacyForm.querySelector("#booking-submit");

            if (submit) {
                submit.disabled = false;
                submit.textContent =
                    "Plan Your Adventure ↗";
            }

            legacyForm.addEventListener("submit", (event) => {
                event.preventDefault();

                const selected =
                    legacyForm.querySelector(
                        "#flight-location"
                    )?.value || "";

                const target = new URL(
                    "BookYourFlight.html",
                    window.location.href
                );

                const entry = Object.entries(
                    locations
                ).find(([key, name]) => {
                    return (
                        selected === key ||
                        selected === name
                    );
                });

                if (entry) {
                    target.searchParams.set(
                        "location",
                        entry[0]
                    );
                }

                window.location.assign(target.href);
            });
        }

        /* =========================
           PHOTO MOTION
           
           Subtle local deformation.
           This is not generated video.
        ========================= */

        if (!("IntersectionObserver" in window)) return;

        let motionPaused = reducedMotion.matches;

        const scenes = [];

        const motionButton =
            document.createElement("button");

        motionButton.type = "button";
        motionButton.className = "motion-control";

        function updateMotionButton() {
            motionButton.textContent = motionPaused
                ? "Play photo motion"
                : "Pause photo motion";

            motionButton.setAttribute(
                "aria-pressed",
                String(!motionPaused)
            );

            document.body.classList.toggle(
                "motion-paused",
                motionPaused
            );
        }

        motionButton.addEventListener("click", () => {
            motionPaused = !motionPaused;
            updateMotionButton();
        });

        reducedMotion.addEventListener(
            "change",
            (event) => {
                if (event.matches) {
                    motionPaused = true;
                    updateMotionButton();
                }
            }
        );

        updateMotionButton();

        const regions = {
            1: [0.38, 0.16, 0.38, 0.77],
            2: [0.27, 0.12, 0.27, 0.52],
            3: [0.27, 0.25, 0.18, 0.45],
            4: [0.02, 0.30, 0.96, 0.62],
            5: [0.34, 0.38, 0.35, 0.43],
            6: [0.23, 0.05, 0.38, 0.49],
            7: [0.49, 0.11, 0.40, 0.57],
            8: [0.35, 0.35, 0.28, 0.35],
            9: [0.27, 0.15, 0.50, 0.60],
            10: [0.15, 0.15, 0.52, 0.62],
            11: [0.15, 0.15, 0.52, 0.62],
            12: [0.20, 0.03, 0.52, 0.85],
            13: [0.50, 0.10, 0.40, 0.64],
            14: [0.30, 0.28, 0.25, 0.30],
            15: [0.08, 0.01, 0.35, 0.62],
            16: [0.32, 0.02, 0.40, 0.45],
            17: [0.11, 0.10, 0.57, 0.64],
            18: [0.13, 0.03, 0.62, 0.88],
            19: [0.12, 0.43, 0.30, 0.38],
            20: [0.53, 0.10, 0.34, 0.65],
            21: [0.28, 0.28, 0.25, 0.30]
        };

        const motionObserver =
            new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const scene = scenes.find(
                        (item) => item.canvas === entry.target
                    );

                    if (scene) {
                        scene.visible = entry.isIntersecting;
                    }
                });
            });

        function showMotionButton() {
            if (motionButton.isConnected) return;

            if (galleryGrid) {
                galleryGrid.before(motionButton);
                return;
            }

            const container = document.querySelector(
                "main .container, .nk-wrap"
            );

            container?.prepend(motionButton);
        }

        function attachPhotoMotion(image) {
            if (
                image.dataset.motionReady ||
                image.id === "lightbox-image" ||
                image.closest(".brand, .nk-brand")
            ) {
                return;
            }

            const match = image.getAttribute("src")?.match(
                /para(\d+)(?:\(1\))?\.jpg(?:[?#].*)?$/
            );

            if (!match) return;

            const number = Number(match[1]);

            /* Keep the official announcement static. */
            if (number === 22) return;

            image.dataset.motionReady = "true";

            function prepareScene() {
                if (!image.naturalWidth) return;

                const parent = image.parentElement;
                if (!parent) return;

                const canvas =
                    document.createElement("canvas");

                const context =
                    canvas.getContext("2d");

                if (!context) return;

                const width = Math.min(
                    image.naturalWidth,
                    1000
                );

                const height = Math.round(
                    width *
                    image.naturalHeight /
                    image.naturalWidth
                );

                canvas.width = width;
                canvas.height = height;
                canvas.className = "blue-hour-canvas";
                canvas.setAttribute("aria-hidden", "true");

                const source =
                    document.createElement("canvas");

                source.width = width;
                source.height = height;

                const sourceContext =
                    source.getContext("2d");

                if (!sourceContext) return;

                sourceContext.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );

                parent.classList.add("photo-motion");
                parent.appendChild(canvas);

                scenes.push({
                    canvas,
                    context,
                    source,
                    width,
                    height,
                    region: regions[number] || [
                        0.2, 0.2, 0.6, 0.6
                    ],
                    phase: scenes.length * 0.7,
                    visible: false
                });

                motionObserver.observe(canvas);
                showMotionButton();
            }

            if (image.complete) {
                prepareScene();
            } else {
                image.addEventListener(
                    "load",
                    prepareScene,
                    { once: true }
                );
            }
        }

        document.querySelectorAll("img")
            .forEach(attachPhotoMotion);

        if (galleryGrid) {
            new MutationObserver(() => {
                galleryGrid.querySelectorAll("img")
                    .forEach(attachPhotoMotion);
            }).observe(galleryGrid, {
                childList: true,
                subtree: true
            });
        }

        let lastFrame = 0;

        function animatePhotos(timestamp) {
            requestAnimationFrame(animatePhotos);

            if (
                motionPaused ||
                document.hidden ||
                timestamp - lastFrame < 66
            ) {
                return;
            }

            lastFrame = timestamp;

            const time = timestamp / 1000;

            scenes.forEach((scene) => {
                if (!scene.visible) return;

                const {
                    context,
                    source,
                    width,
                    height,
                    region,
                    phase
                } = scene;

                const centerX =
                    (region[0] + region[2] / 2) * width;

                const centerY =
                    (region[1] + region[3] / 2) * height;

                const radiusX = Math.max(
                    region[2] * width * 0.9,
                    80
                );

                const radiusY = Math.max(
                    region[3] * height * 0.8,
                    80
                );

                const movementX =
                    Math.sin(time * 0.45 + phase) *
                    width * 0.005;

                const movementY =
                    Math.cos(time * 0.38 + phase) *
                    height * 0.003;

                context.clearRect(
                    0,
                    0,
                    width,
                    height
                );

                for (let y = 0; y < height; y += 8) {
                    for (let x = 0; x < width; x += 40) {
                        const tileWidth = Math.min(
                            40,
                            width - x
                        );

                        const tileHeight = Math.min(
                            8,
                            height - y
                        );

                        const influence = Math.exp(
                            -2 * (
                                ((x - centerX) / radiusX) ** 2 +
                                ((y - centerY) / radiusY) ** 2
                            )
                        );

                        context.drawImage(
                            source,
                            x,
                            y,
                            tileWidth,
                            tileHeight,
                            x + movementX * influence,
                            y + movementY * influence,
                            tileWidth + 1,
                            tileHeight + 1
                        );
                    }
                }
            });
        }

        requestAnimationFrame(animatePhotos);
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
