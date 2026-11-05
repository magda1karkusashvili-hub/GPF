(() => {
    "use strict";

    if (window.GPFLanguagesLoading) return;
    window.GPFLanguagesLoading = true;

    const translationsURL = new URL(
        "translations.json",
        document.currentScript?.src || window.location.href
    );

    const supportedLanguages = ["ka", "en", "fr", "ar", "zh"];

    const languageNames = {
        ka: "🇬🇪 ქართული",
        en: "🇬🇧 English",
        fr: "🇫🇷 Français",
        ar: "🇸🇦 العربية",
        zh: "🇨🇳 中文"
    };

    const languageLabels = {
        ka: "აირჩიეთ ენა",
        en: "Choose a language",
        fr: "Choisir une langue",
        ar: "اختر اللغة",
        zh: "选择语言"
    };

    window.GPFTranslate = (text) => text;
    window.GPFMessage = (lines) => lines.slice();

    async function initializeLanguages() {
        let dictionaries;

        try {
            const response = await fetch(translationsURL, {
                cache: "no-cache"
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            dictionaries = await response.json();

            for (const language of supportedLanguages) {
                if (
                    !dictionaries[language] ||
                    typeof dictionaries[language] !== "object"
                ) {
                    throw new Error(
                        `Missing language: ${language}`
                    );
                }
            }
        } catch (error) {
            console.error(
                "translations.json ვერ ჩაიტვირთა. შეამოწმეთ, ატვირთულია თუ არა languages.js-ის გვერდით.",
                error
            );

            document
                .querySelectorAll("#gpf-language")
                .forEach((select) => {
                    select.disabled = true;
                    select.title =
                        "translations.json ვერ ჩაიტვირთა";
                });

            return;
        }

        const normalize = (text) =>
            String(text).replace(/\s+/g, " ").trim();

        const englishTexts = new Set(
            Object.values(dictionaries).flatMap(
                (dictionary) => Object.keys(dictionary)
            )
        );

        const reverseTranslations = new Map();

        for (const language of [
            "en",
            "fr",
            "ar",
            "zh",
            "ka"
        ]) {
            for (const [original, translation] of Object.entries(
                dictionaries[language] || {}
            )) {
                reverseTranslations.set(
                    normalize(translation),
                    original
                );
            }
        }

        let savedLanguage = "";

        try {
            savedLanguage =
                localStorage.getItem("gpf-language") || "";
        } catch (error) {
            savedLanguage = "";
        }

        const requestedLanguage = new URLSearchParams(
            window.location.search
        ).get("lang");

        let currentLanguage = supportedLanguages.includes(
            requestedLanguage
        )
            ? requestedLanguage
            : supportedLanguages.includes(savedLanguage)
              ? savedLanguage
              : "ka";

        function getOriginalText(value) {
            const normalized = normalize(value);

            if (englishTexts.has(normalized)) {
                return normalized;
            }

            return (
                reverseTranslations.get(normalized) ||
                normalized
            );
        }

        function translate(value) {
            const original = getOriginalText(value);

            const dictionary =
                dictionaries[currentLanguage] || {};

            if (
                Object.prototype.hasOwnProperty.call(
                    dictionary,
                    original
                )
            ) {
                return dictionary[original];
            }

            if (englishTexts.has(original)) {
                return original;
            }

            const photoMatch = original.match(
                /^Paragliding in Georgia — photograph (\d+)$/
            );

            if (photoMatch) {
                return (
                    translate("Paragliding in Georgia") +
                    " — " +
                    translate("photograph") +
                    " " +
                    photoMatch[1]
                );
            }

            const enlargeMatch = original.match(
                /^Enlarge photograph (\d+): (.*)$/
            );

            if (enlargeMatch) {
                return (
                    translate("Enlarge photograph") +
                    " " +
                    enlargeMatch[1] +
                    ": " +
                    translate(enlargeMatch[2])
                );
            }

            return value;
        }

        window.GPFTranslate = translate;

        window.GPFMessage = (lines) => {
            return lines.map((line, index) => {
                /*
                 * მომხმარებლის დამატებითი შეტყობინება
                 * უცვლელი რჩება.
                 */
                if (index > 11) return line;

                const prefixes = [
                    "Location:",
                    "Preferred date:",
                    "Participants:",
                    "Name:",
                    "Phone:"
                ];

                for (const prefix of prefixes) {
                    if (!line.startsWith(prefix)) continue;

                    const value = line
                        .slice(prefix.length)
                        .trim();

                    const translatedValue =
                        prefix === "Location:"
                            ? translate(value)
                            : value;

                    return (
                        translate(prefix) +
                        " " +
                        translatedValue
                    );
                }

                return translate(line);
            });
        };

        const textCache = new WeakMap();
        const attributeCache = new WeakMap();

        const ignoredElements = [
            "script",
            "style",
            "textarea",
            "[contenteditable]",
            ".gpf-language-bar"
        ].join(",");

        const translatedAttributes = [
            "alt",
            "aria-label",
            "placeholder",
            "title"
        ];

        function localizeNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                if (
                    !node.parentElement ||
                    node.parentElement.closest(ignoredElements)
                ) {
                    return;
                }

                const rawText = node.nodeValue;

                if (!normalize(rawText)) return;

                let cached = textCache.get(node);

                if (!cached || rawText !== cached.last) {
                    cached = {
                        original: getOriginalText(rawText),
                        last: rawText,
                        before: rawText.match(/^\s*/)[0],
                        after: rawText.match(/\s*$/)[0]
                    };
                }

                const translated =
                    cached.before +
                    translate(cached.original) +
                    cached.after;

                if (translated !== rawText) {
                    node.nodeValue = translated;
                }

                cached.last = translated;
                textCache.set(node, cached);

                return;
            }

            if (
                node.nodeType !== Node.ELEMENT_NODE &&
                node.nodeType !== Node.DOCUMENT_NODE
            ) {
                return;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.matches(ignoredElements)) return;

                const cachedAttributes =
                    attributeCache.get(node) || {};

                for (const attribute of translatedAttributes) {
                    if (!node.hasAttribute(attribute)) continue;

                    const rawValue =
                        node.getAttribute(attribute);

                    let cached =
                        cachedAttributes[attribute];

                    if (!cached || rawValue !== cached.last) {
                        cached = {
                            original: getOriginalText(rawValue),
                            last: rawValue
                        };
                    }

                    const translated = translate(
                        cached.original
                    );

                    if (translated !== rawValue) {
                        node.setAttribute(
                            attribute,
                            translated
                        );
                    }

                    cached.last = translated;
                    cachedAttributes[attribute] = cached;
                }

                attributeCache.set(
                    node,
                    cachedAttributes
                );
            }

            for (const child of node.childNodes) {
                localizeNode(child);
            }
        }

        const observerSettings = {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter: translatedAttributes
        };

        let observer;

        function updatePageTitle() {
            const pageTitles = {
                "index.html": "Home",
                "about.html": "About Us",
                "gallery.html": "Gallery",
                "document.html": "Documents",
                "news.html": "News",
                "Needtoknow.html": "Need to know",
                "need-to-know.html": "Need to know",
                "contact.html": "Contact",
                "BookYourFlight.html": "Plan Your Adventure",
                "airspaces.html": "Airspaces"
            };

            const currentPage =
                window.location.pathname
                    .split("/")
                    .pop() || "index.html";

            document.title =
                translate(pageTitles[currentPage] || "Home") +
                " | " +
                translate("Georgian Paragliding Federation");
        }

        function applyLanguage() {
            observer?.disconnect();

            document.documentElement.lang =
                currentLanguage;

            document.documentElement.dir =
                currentLanguage === "ar" ? "rtl" : "ltr";

            localizeNode(document.body);
            updatePageTitle();

            document
                .querySelectorAll("#gpf-language")
                .forEach((select) => {
                    select.value = currentLanguage;

                    select.setAttribute(
                        "aria-label",
                        languageLabels[currentLanguage]
                    );
                });

            document
                .querySelectorAll(
                    'input[type="tel"], ' +
                    'a[href^="tel:"] p, ' +
                    ".airspace-code, " +
                    ".airspace-coordinates"
                )
                .forEach((element) => {
                    element.dir = "ltr";
                });

            document
                .querySelectorAll("input, textarea, select")
                .forEach((field) => {
                    if (
                        typeof field.setCustomValidity ===
                        "function"
                    ) {
                        field.setCustomValidity("");
                    }
                });

            observer?.observe(
                document.body,
                observerSettings
            );
        }

        function prepareLanguageSelector() {
            const header = document.querySelector(
                ".site-header, .nk-header"
            );

            let select = document.querySelector(
                "#gpf-language"
            );

            if (!select && header) {
                const bar = document.createElement("div");
                bar.className = "gpf-language-bar";

                select = document.createElement("select");
                select.id = "gpf-language";

                bar.appendChild(select);
                header.appendChild(bar);
            }

            document
                .querySelectorAll("#gpf-language")
                .forEach((languageSelect) => {
                    languageSelect.dir = "ltr";

                    /*
                     * ხუთივე ენა ყოველთვის ხელმისაწვდომია.
                     */
                    languageSelect.replaceChildren();

                    for (const language of supportedLanguages) {
                        const option =
                            document.createElement("option");

                        option.value = language;
                        option.textContent =
                            languageNames[language];

                        languageSelect.appendChild(option);
                    }

                    languageSelect.value =
                        currentLanguage;

                    languageSelect.addEventListener(
                        "change",
                        () => {
                            const selectedLanguage =
                                languageSelect.value;

                            if (
                                !supportedLanguages.includes(
                                    selectedLanguage
                                )
                            ) {
                                return;
                            }

                            currentLanguage =
                                selectedLanguage;

                            try {
                                localStorage.setItem(
                                    "gpf-language",
                                    currentLanguage
                                );
                            } catch (error) {
                                /*
                                 * ენის გადართვა იმუშავებს მაშინაც,
                                 * თუ ბრაუზერი შენახვას ზღუდავს.
                                 */
                            }

                            const url = new URL(
                                window.location.href
                            );

                            if (
                                url.searchParams.has("lang")
                            ) {
                                url.searchParams.set(
                                    "lang",
                                    currentLanguage
                                );

                                window.history.replaceState(
                                    null,
                                    "",
                                    url
                                );
                            }

                            applyLanguage();
                        }
                    );
                });
        }

        prepareLanguageSelector();

        observer = new MutationObserver((records) => {
            observer.disconnect();

            for (const record of records) {
                if (record.type === "childList") {
                    record.addedNodes.forEach(localizeNode);
                } else {
                    localizeNode(record.target);
                }
            }

            observer.observe(
                document.body,
                observerSettings
            );
        });

        applyLanguage();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeLanguages,
            { once: true }
        );
    } else {
        initializeLanguages();
    }
})();
