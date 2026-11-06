(() => {
    "use strict";

    function initializeSite() {
        if (window.GPFSiteInitialized) return;
        window.GPFSiteInitialized = true;

        const translate = text =>
            typeof window.GPFTranslate === "function"
                ? window.GPFTranslate(text)
                : text;

        /* =========================
           წელი
        ========================= */

        const year = document.getElementById("year");

        if (year) {
            year.textContent = new Date().getFullYear();
        }

        document.querySelectorAll(".motion-control").forEach(element => {
            element.remove();
        });

        /* =========================
           მობილური მენიუ
        ========================= */

        const menuButton = document.getElementById("menu-toggle");
        const menu = document.getElementById("main-menu");
        const mobileQuery = window.matchMedia("(max-width: 850px)");

        function setMenuOpen(open) {
            if (!menuButton || !menu) return;

            const expanded = mobileQuery.matches && open;

            menuButton.setAttribute(
                "aria-expanded",
                String(expanded)
            );

            menu.classList.toggle("is-open", expanded);
            menu.classList.remove("open", "active");

            if (mobileQuery.matches) {
                menu.style.display = expanded ? "flex" : "none";
            } else {
                menu.style.removeProperty("display");
            }
        }

        if (menuButton && menu) {
            menuButton.addEventListener("click", event => {
                event.preventDefault();

                const isOpen =
                    menuButton.getAttribute("aria-expanded") === "true";

                setMenuOpen(!isOpen);
            });

            menu.addEventListener("click", event => {
                if (
                    event.target instanceof Element &&
                    event.target.closest("a")
                ) {
                    setMenuOpen(false);
                }
            });

            document.addEventListener("click", event => {
                if (
                    !menu.contains(event.target) &&
                    !menuButton.contains(event.target)
                ) {
                    setMenuOpen(false);
                }
            });

            document.addEventListener("keydown", event => {
                if (
                    event.key === "Escape" &&
                    menuButton.getAttribute("aria-expanded") === "true"
                ) {
                    setMenuOpen(false);
                    menuButton.focus();
                }
            });

            mobileQuery.addEventListener("change", () => {
                setMenuOpen(false);
            });

            setMenuOpen(false);
        }

        /* =========================
           სიახლეების ფილტრები
        ========================= */

        const newsButtons = Array.from(
            document.querySelectorAll("[data-news-filter]")
        );

        const newsCards = Array.from(
            document.querySelectorAll("[data-news-category]")
        );

        newsButtons.forEach(button => {
            button.addEventListener("click", () => {
                const category = button.dataset.newsFilter;

                newsButtons.forEach(item => {
                    const active = item === button;

                    item.classList.toggle("is-active", active);
                    item.setAttribute("aria-pressed", String(active));
                });

                newsCards.forEach(card => {
                    const visible =
                        category === "all" ||
                        card.dataset.newsCategory === category;

                    card.hidden = !visible;

                    if (visible) {
                        card.style.removeProperty("display");
                    } else {
                        card.style.setProperty("display", "none");
                    }
                });
            });
        });

        /* =========================
           ოპერატორთან დაკავშირება
        ========================= */

        const operators = {
            "Gudauri": "995558338989",
            "Ananuri": "995599045777",
            "Tbilisi Sea": "995555004993",
            "Mestia": "995593988811",
            "Bakuriani": "995599334486"
        };

        const locationAliases = {
            gudauri: "Gudauri",
            ananuri: "Ananuri",
            "tbilisi-sea": "Tbilisi Sea",
            tbilisi_sea: "Tbilisi Sea",
            "tbilisi sea": "Tbilisi Sea",
            mestia: "Mestia",
            bakuriani: "Bakuriani"
        };

        const form = document.getElementById("adventure-form");
        const locationField =
            document.getElementById("adventure-location");

        const dateField = document.getElementById("adventure-date");
        const peopleField = document.getElementById("adventure-people");
        const nameField = document.getElementById("adventure-name");
        const phoneField = document.getElementById("adventure-phone");
        const messageField = document.getElementById("adventure-message");

        const callButton =
            document.getElementById("adventure-call-button");

        function getTodayInGeorgia() {
            const parts = new Intl.DateTimeFormat("en-US", {
                timeZone: "Asia/Tbilisi",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).formatToParts(new Date());

            const values = Object.fromEntries(
                parts.map(part => [part.type, part.value])
            );

            return `${values.year}-${values.month}-${values.day}`;
        }

        function getOperator() {
            if (!locationField) return "";

            locationField.setCustomValidity("");

            if (!locationField.value) {
                locationField.reportValidity();
                locationField.focus();
                return "";
            }

            const number = operators[locationField.value];

            if (!number) {
                locationField.setCustomValidity(
                    "ამ ადგილის ოპერატორის ნომერი ჯერ არ არის დამატებული."
                );

                locationField.reportValidity();
                return "";
            }

            return number;
        }

        if (locationField) {
            locationField.addEventListener("change", () => {
                locationField.setCustomValidity("");
            });

            const requested = new URLSearchParams(
                window.location.search
            ).get("location");

            if (requested) {
                const location =
                    locationAliases[requested.toLowerCase()] || requested;

                const available = Array.from(locationField.options).some(
                    option => option.value === location
                );

                if (available) locationField.value = location;
            }
        }

        if (dateField) {
            dateField.min = getTodayInGeorgia();

            dateField.addEventListener("input", () => {
                dateField.setCustomValidity("");
            });
        }

        if (phoneField) {
            phoneField.addEventListener("input", () => {
                phoneField.setCustomValidity("");
            });
        }

        if (nameField) {
            nameField.addEventListener("input", () => {
                nameField.setCustomValidity("");
            });
        }

        if (callButton) {
            callButton.addEventListener("click", event => {
                event.preventDefault();

                const number = getOperator();
                if (!number) return;

                window.location.href = "tel:+" + number;
            });
        }

        if (form) {
            form.addEventListener("submit", event => {
                event.preventDefault();

                const number = getOperator();
                if (!number) return;

                if (dateField) {
                    const today = getTodayInGeorgia();
                    dateField.min = today;

                    dateField.setCustomValidity(
                        dateField.value && dateField.value < today
                            ? "აირჩიეთ მიმდინარე ან მომავალი თარიღი."
                            : ""
                    );
                }

                if (nameField) {
                    nameField.setCustomValidity(
                        nameField.value.trim().length < 2
                            ? "მიუთითეთ სახელი და გვარი."
                            : ""
                    );
                }

                if (phoneField) {
                    const normalized = phoneField.value
                        .trim()
                        .replace(/[\s()-]/g, "");

                    phoneField.value = normalized;

                    phoneField.setCustomValidity(
                        /^\+[1-9][0-9]{7,14}$/.test(normalized)
                            ? ""
                            : "მიუთითეთ ტელეფონის ნომერი + ნიშნითა და ქვეყნის კოდით."
                    );
                }

                if (!form.reportValidity()) return;

                const lines = [
                    "NEW ADVENTURE REQUEST",
                    "",
                    "Hello, I am interested in your company’s services and would like to go paragliding.",
                    "Please confirm receipt of this message.",
                    "",
                    "Location: " + locationField.value,
                    "Preferred date: " + (dateField?.value || ""),
                    "Participants: " + (peopleField?.value || "1"),
                    "Name: " + (nameField?.value.trim() || ""),
                    "Phone: " + (phoneField?.value || "")
                ];

                const additional = messageField?.value.trim();

                if (additional) {
                    lines.push(
                        "",
                        "Additional information:",
                        additional
                    );
                }

                const localized =
                    typeof window.GPFMessage === "function"
                        ? window.GPFMessage(lines)
                        : lines;

                const url =
                    "https://wa.me/" +
                    number +
                    "?text=" +
                    encodeURIComponent(localized.join("\n"));

                /*
                 * იმავე ჩანართიდან გადასვლა მობილურში
                 * ამცირებს ახალი ფანჯრის დაბლოკვის პრობლემას.
                 */
                window.location.assign(url);
            });
        }

        /* =========================
           ძველი გალერეის გაფართოება

           ახალი ალბომების HTML-ს საკუთარი
           გაფართოების კოდი აქვს.
        ========================= */

        const gallery = document.getElementById("gallery-grid");
        const lightbox = document.getElementById("lightbox");
        const lightboxImage =
            document.getElementById("lightbox-image");

        if (gallery && lightbox && lightboxImage) {
            const items = Array.from(
                gallery.querySelectorAll(".gallery-item")
            );

            const counter =
                document.getElementById("lightbox-counter");

            const close =
                document.getElementById("lightbox-close");

            const previous =
                document.getElementById("lightbox-prev");

            const next =
                document.getElementById("lightbox-next");

            let index = 0;
            let opener = null;
            let oldOverflow = "";

            function showPhoto(nextIndex) {
                if (!items.length) return;

                index = (nextIndex + items.length) % items.length;

                const source = items[index].querySelector("img");
                if (!source) return;

                lightboxImage.src = source.getAttribute("src");
                lightboxImage.alt = source.alt;

                if (counter) {
                    counter.textContent = `${index + 1} / ${items.length}`;
                }
            }

            items.forEach((item, itemIndex) => {
                item.removeAttribute("target");

                item.addEventListener("click", event => {
                    event.preventDefault();

                    opener = item;
                    showPhoto(itemIndex);

                    if (!lightbox.open) {
                        oldOverflow =
                            document.documentElement.style.overflow;

                        lightbox.showModal();
                        document.documentElement.style.overflow = "hidden";
                    }
                });
            });

            close?.addEventListener("click", () => {
                lightbox.close();
            });

            previous?.addEventListener("click", () => {
                showPhoto(index - 1);
            });

            next?.addEventListener("click", () => {
                showPhoto(index + 1);
            });

            lightbox.addEventListener("keydown", event => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    showPhoto(index - 1);
                }

                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    showPhoto(index + 1);
                }
            });

            lightbox.addEventListener("click", event => {
                if (event.target === lightbox) lightbox.close();
            });

            lightbox.addEventListener("close", () => {
                document.documentElement.style.overflow = oldOverflow;
                opener?.focus({ preventScroll: true });
            });
        }

        /* =========================
           ვარიოს ხმა

           ფუნქციის გარეთ return აღარ არის.
           სხვა გვერდებზე ეს ნაწილი უბრალოდ გამოტოვდება.
        ========================= */

        initializeVario();

        function initializeVario() {
            const hero = document.getElementById("home");
            const controls = document.getElementById("vario-controls");
            const button = document.getElementById("vario-toggle");
            const volume = document.getElementById("vario-volume");
            const volumeText =
                document.getElementById("vario-volume-text");
            const status = document.getElementById("vario-status");

            if (!hero || !controls || !button || !volume) return;

            /*
             * თუ მთავარ გვერდზე ვარიო უკვე ინიციალიზებულია,
             * მეორე ხმის დამმუშავებელი არ დაემატება.
             */
            if (button.dataset.gpfVarioInitialized === "true") return;
            button.dataset.gpfVarioInitialized = "true";

            const wings = Array.from(
                hero.querySelectorAll('[data-vario="true"]')
            );

            if (!wings.length) {
                controls.hidden = true;
                return;
            }

            controls.hidden = false;

            let context = null;
            let oscillator = null;
            let gain = null;
            let enabled = false;
            let busy = false;
            let frame = 0;
            let lastTime = 0;
            let nextBeep = 0;
            let smoothedClimb = 0;

            const positions = new WeakMap();

            const audioText = {
                ka: [
                    "🔊 ვარიოს ჩართვა",
                    "🔇 ვარიოს გამორთვა",
                    "ხმა მიბმულია ყვითელ პარაპლანებზე.",
                    "ვარიო ჩართულია.",
                    "ხმა ვერ ჩაირთო. სცადეთ ხელახლა."
                ],
                en: [
                    "🔊 Enable vario",
                    "🔇 Disable vario",
                    "Sound follows the yellow paragliders.",
                    "Vario enabled.",
                    "Audio could not start. Try again."
                ],
                fr: [
                    "🔊 Activer le vario",
                    "🔇 Couper le vario",
                    "Le son suit les parapentes jaunes.",
                    "Vario activé.",
                    "Impossible d’activer le son. Réessayez."
                ],
                ar: [
                    "🔊 تشغيل الفاريو",
                    "🔇 إيقاف الفاريو",
                    "يتبع الصوت المظلات الصفراء.",
                    "الفاريو يعمل.",
                    "تعذر تشغيل الصوت. حاول مجددًا."
                ],
                zh: [
                    "🔊 开启升降仪声音",
                    "🔇 关闭升降仪声音",
                    "声音随黄色滑翔伞变化。",
                    "升降仪声音已开启。",
                    "声音无法启动，请重试。"
                ]
            };

            function getAudioText() {
                const language =
                    document.documentElement.lang.split("-")[0];

                return audioText[language] || audioText.ka;
            }

            function getVolume() {
                const maximum = Number(volume.max) || 100;
                const value = Number(volume.value) || 0;

                return Math.max(0, Math.min(1, value / maximum));
            }

            function updateAudioLabels() {
                const text = getAudioText();

                button.textContent = enabled ? text[1] : text[0];
                button.setAttribute("aria-pressed", String(enabled));

                if (volumeText) {
                    volumeText.textContent =
                        Math.round(getVolume() * 100) + "%";
                }

                if (status) {
                    status.textContent = enabled ? text[3] : text[2];
                }
            }

            function mute() {
                if (!context || !gain) return;

                const now = context.currentTime;
                gain.gain.cancelScheduledValues(now);
                gain.gain.setValueAtTime(0, now);
            }

            function beep(frequency, duration, loudness) {
                if (!context || !oscillator || !gain) return;

                const now = context.currentTime;

                oscillator.frequency.cancelScheduledValues(now);
                oscillator.frequency.setValueAtTime(frequency, now);
                oscillator.frequency.linearRampToValueAtTime(
                    frequency + 180,
                    now + duration
                );

                gain.gain.cancelScheduledValues(now);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(
                    loudness,
                    now + 0.008
                );
                gain.gain.setValueAtTime(
                    loudness,
                    now + Math.max(0.009, duration - 0.015)
                );
                gain.gain.linearRampToValueAtTime(
                    0,
                    now + duration
                );
            }

            function resetMovement() {
                lastTime = 0;
                smoothedClimb = 0;
                wings.forEach(wing => positions.delete(wing));
            }

            function tick(timestamp) {
                if (!enabled) return;

                frame = requestAnimationFrame(tick);

                const bounds = hero.getBoundingClientRect();

                const visible =
                    !document.hidden &&
                    bounds.bottom > 0 &&
                    bounds.top < window.innerHeight;

                if (!visible || context?.state !== "running") {
                    mute();
                    resetMovement();
                    return;
                }

                if (!lastTime) {
                    lastTime = timestamp;

                    wings.forEach(wing => {
                        positions.set(
                            wing,
                            wing.getBoundingClientRect().top - bounds.top
                        );
                    });

                    return;
                }

                const elapsed = (timestamp - lastTime) / 1000;
                if (elapsed < 0.05) return;

                lastTime = timestamp;

                if (elapsed > 0.5) {
                    resetMovement();
                    return;
                }

                let strongest = 0;

                wings.forEach(wing => {
                    const rect = wing.getBoundingClientRect();
                    const y = rect.top - bounds.top;
                    const previousY = positions.get(wing);

                    positions.set(wing, y);

                    if (
                        previousY === undefined ||
                        rect.right < bounds.left ||
                        rect.left > bounds.right ||
                        rect.bottom < Math.max(0, bounds.top) ||
                        rect.top > Math.min(window.innerHeight, bounds.bottom)
                    ) {
                        return;
                    }

                    /*
                     * ეკრანის ზომისგან შედარებით დამოუკიდებელი
                     * ვერტიკალური გადაადგილება.
                     */
                    const speed =
                        ((previousY - y) / Math.max(bounds.height, 1)) /
                        elapsed;

                    /* ანიმაციის ციკლის გადახტომის გამოტოვება */
                    if (Math.abs(speed) > 1.5) return;

                    if (Math.abs(speed) > Math.abs(strongest)) {
                        strongest = speed;
                    }
                });

                smoothedClimb +=
                    (strongest - smoothedClimb) * 0.25;

                const now = context.currentTime;
                const loudness = getVolume();

                if (now < nextBeep) return;

                if (loudness === 0) {
                    mute();
                    return;
                }

                if (smoothedClimb > 0.003) {
                    const intensity = Math.min(
                        1,
                        smoothedClimb / 0.18
                    );

                    const interval = 0.48 - intensity * 0.34;

                    beep(
                        1400 + intensity * 1400,
                        Math.min(0.11, interval * 0.55),
                        loudness * 0.12
                    );

                    nextBeep = now + interval;
                } else if (smoothedClimb < -0.003) {
                    const intensity = Math.min(
                        1,
                        Math.abs(smoothedClimb) / 0.18
                    );

                    beep(
                        380 - intensity * 150,
                        0.22,
                        loudness * 0.055
                    );

                    nextBeep = now + 0.3;
                } else {
                    mute();
                }
            }

            button.addEventListener("click", async () => {
                if (busy) return;

                if (enabled) {
                    enabled = false;
                    cancelAnimationFrame(frame);
                    mute();
                    resetMovement();
                    updateAudioLabels();
                    return;
                }

                busy = true;
                button.disabled = true;

                try {
                    const AudioContextClass =
                        window.AudioContext || window.webkitAudioContext;

                    if (!AudioContextClass) {
                        throw new Error("Audio unavailable");
                    }

                    if (!context) {
                        context = new AudioContextClass();

                        oscillator = context.createOscillator();
                        gain = context.createGain();

                        oscillator.type = "triangle";
                        gain.gain.value = 0;

                        oscillator.connect(gain);
                        gain.connect(context.destination);
                        oscillator.start();
                    }

                    /*
                     * resume უშუალოდ მომხმარებლის დაჭერის
                     * დამმუშავებელში სრულდება.
                     */
                    await context.resume();

                    if (context.state !== "running") {
                        throw new Error("Audio suspended");
                    }

                    enabled = true;
                    resetMovement();

                    beep(1600, 0.12, getVolume() * 0.1);
                    nextBeep = context.currentTime + 0.18;

                    frame = requestAnimationFrame(tick);
                    updateAudioLabels();
                } catch (error) {
                    enabled = false;
                    mute();
                    updateAudioLabels();

                    if (status) {
                        status.textContent = getAudioText()[4];
                    }

                    console.error("Vario:", error);
                } finally {
                    busy = false;
                    button.disabled = false;
                }
            });

            volume.addEventListener("input", () => {
                updateAudioLabels();

                if (getVolume() === 0) mute();
            });

            document.addEventListener("visibilitychange", () => {
                if (document.hidden) mute();
                resetMovement();
            });

            window.addEventListener("pagehide", () => {
                enabled = false;
                cancelAnimationFrame(frame);
                mute();
                resetMovement();
                updateAudioLabels();
            });

            new MutationObserver(updateAudioLabels).observe(
                document.documentElement,
                {
                    attributes: true,
                    attributeFilter: ["lang"]
                }
            );

            updateAudioLabels();
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
