(() => {
    "use strict";

    if (window.GPFLanguagesLoading) return;
    window.GPFLanguagesLoading = true;

    const translationsURL = new URL(
        "translations.json",
        document.currentScript?.src || window.location.href
    );

    const supportedLanguages = [
        "ka",
        "en",
        "fr",
        "ar",
        "zh"
    ];

    const languageNames = {
        ka: "ქართული",
        en: "English",
        fr: "Français",
        ar: "العربية",
        zh: "中文"
    };

    const languageLabels = {
        ka: "აირჩიეთ ენა",
        en: "Choose a language",
        fr: "Choisir une langue",
        ar: "اختر اللغة",
        zh: "选择语言"
    };

    window.GPFTranslate = value => value;

    window.GPFMessage = lines => lines.slice();

    function normalize(value) {
        return String(value)
            .replace(/\s+/g, " ")
            .trim();
    }

    async function initializeLanguages() {
        let dictionaries;

        /* =========================
           თარგმანების ჩატვირთვა
        ========================= */

        try {
            const response = await fetch(translationsURL);
               
        

            if (!response.ok) {
                throw new Error(
                    "HTTP " + response.status
                );
            }

            dictionaries = await response.json();

            for (const language of supportedLanguages) {
                const dictionary = dictionaries[language];

                if (
                    !dictionary ||
                    typeof dictionary !== "object" ||
                    Array.isArray(dictionary)
                ) {
                    throw new Error(
                        "Missing dictionary: " + language
                    );
                }

                const containsInvalidValues =
                    Object.values(dictionary).some(
                        value => typeof value !== "string"
                    );

                if (containsInvalidValues) {
                    throw new Error(
                        "Invalid translation: " + language
                    );
                }
            }
        } catch (error) {
            console.error(
                "GPF: translations.json ვერ ჩაიტვირთა ან არასწორია.",
                error
            );

            if (
                !document.getElementById(
                    "gpf-language-error"
                )
            ) {
                const warning =
                    document.createElement("p");

                warning.id = "gpf-language-error";

                warning.setAttribute(
                    "role",
                    "status"
                );

                warning.textContent =
                    "თარგმანი ვერ ჩაიტვირთა. გვერდი განაახლეთ ან შეამოწმეთ translations.json.";

                warning.style.cssText = [
                    "padding:12px 18px",
                    "margin:0",
                    "background:#182d44",
                    "color:#ffffff",
                    "font-size:13px",
                    "line-height:1.7"
                ].join(";");

                const header =
                    document.querySelector(
                        ".site-header"
                    );

                if (header) {
                    header.after(warning);
                }
            }

            document
                .querySelectorAll("#gpf-language")
                .forEach(select => {
                    select.disabled = true;

                    select.title =
                        "translations.json ვერ ჩაიტვირთა";
                });

            return;
        }

        /* =========================
           თარგმანების საძიებო რუკები
        ========================= */

        const sourceKeys = new Set();
        const reverseTranslations = new Map();
        const languageLookups = {};

        for (const language of supportedLanguages) {
            languageLookups[language] = new Map();

            for (const [key, value] of Object.entries(
                dictionaries[language]
            )) {
                const normalizedKey = normalize(key);

                sourceKeys.add(normalizedKey);

                languageLookups[language].set(
                    normalizedKey,
                    value
                );

                const normalizedValue =
                    normalize(value);

                if (normalizedValue) {
                    reverseTranslations.set(
                        normalizedValue,
                        normalizedKey
                    );
                }
            }
        }

        /* =========================
           საწყისი ენა
        ========================= */

        let savedLanguage = "";

        try {
            savedLanguage =
                localStorage.getItem(
                    "gpf-language"
                ) || "";
        } catch (_) {
            savedLanguage = "";
        }

        const requestedLanguage =
            new URLSearchParams(
                window.location.search
            ).get("lang");

        let currentLanguage =
            supportedLanguages.includes(
                requestedLanguage
            )
                ? requestedLanguage
                : supportedLanguages.includes(
                    savedLanguage
                )
                    ? savedLanguage
                    : "ka";

        /* =========================
           ტექსტის თარგმნა
        ========================= */

        function getSourceText(value) {
            const normalized = normalize(value);

            if (sourceKeys.has(normalized)) {
                return normalized;
            }

            return (
                reverseTranslations.get(
                    normalized
                ) || normalized
            );
        }

        function translate(value) {
            const source = getSourceText(value);

            return (
                languageLookups[
                    currentLanguage
                ].get(source) ?? value
            );
        }

        window.GPFTranslate = translate;

        /* =========================
           WhatsApp-ის ტექსტი

           სახელი, ნომერი და თავისუფალი
           შეტყობინება არ ითარგმნება.
        ========================= */

        window.GPFMessage = lines => {
            return lines.map((line, index) => {
                if (index > 11) return line;

                const prefixes = [
                    "Location:",
                    "Preferred date:",
                    "Participants:",
                    "Name:",
                    "Phone:"
                ];

                for (const prefix of prefixes) {
                    if (
                        !line.startsWith(prefix)
                    ) {
                        continue;
                    }

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

        /* =========================
           გვერდის ტექსტების შენახვა
        ========================= */

        const textCache = new WeakMap();
        const attributeCache = new WeakMap();

        const ignoredElements = [
            "script",
            "style",
            "textarea",
            "code",
            "pre",
            "[contenteditable]",
            ".gpf-language-bar",
            "[translate='no']",
            "[data-no-translate]"
        ].join(",");

        const translatedAttributes = [
            "alt",
            "aria-label",
            "placeholder",
            "title"
        ];

        function localizeNode(node) {
            /* ჩვეულებრივი ტექსტი */

            if (
                node.nodeType === Node.TEXT_NODE
            ) {
                if (
                    !node.parentElement ||
                    node.parentElement.closest(
                        ignoredElements
                    )
                ) {
                    return;
                }

                const rawText = node.nodeValue;

                if (!normalize(rawText)) return;

                let cached = textCache.get(node);

                if (
                    !cached ||
                    rawText !== cached.last
                ) {
                    cached = {
                        source: getSourceText(
                            rawText
                        ),
                        last: rawText,
                        before:
                            rawText.match(/^\s*/)[0],
                        after:
                            rawText.match(/\s*$/)[0]
                    };
                }

                const translated =
                    cached.before +
                    translate(cached.source) +
                    cached.after;

                if (
                    translated !== rawText
                ) {
                    node.nodeValue = translated;
                }

                cached.last = translated;

                textCache.set(
                    node,
                    cached
                );

                return;
            }

            /* HTML ელემენტები */

            if (
                node.nodeType !==
                Node.ELEMENT_NODE
            ) {
                return;
            }

            if (
                node.closest(
                    ignoredElements
                )
            ) {
                return;
            }

            const cachedAttributes =
                attributeCache.get(node) || {};

            for (
                const attribute
                of translatedAttributes
            ) {
                if (
                    !node.hasAttribute(attribute)
                ) {
                    continue;
                }

                const rawValue =
                    node.getAttribute(attribute);

                let cached =
                    cachedAttributes[attribute];

                if (
                    !cached ||
                    rawValue !== cached.last
                ) {
                    cached = {
                        source: getSourceText(
                            rawValue
                        ),
                        last: rawValue
                    };
                }

                const translated =
                    translate(cached.source);

                if (
                    translated !== rawValue
                ) {
                    node.setAttribute(
                        attribute,
                        translated
                    );
                }

                cached.last = translated;

                cachedAttributes[attribute] =
                    cached;
            }

            attributeCache.set(
                node,
                cachedAttributes
            );

            Array.from(
                node.childNodes
            ).forEach(localizeNode);
        }

        /* =========================
           გვერდების სათაურები
        ========================= */

        const pageTitles = {
            "index.html": "Home",
            "about.html": "About Us",
            "gallery.html": "Gallery",
            "document.html": "Documents",
            "news.html": "News",
            "needtoknow.html": "Need to know",
            "need-to-know.html": "Need to know",
            "contact.html": "Contact",
            "bookyourflight.html":
                "Plan Your Adventure",
            "airspaces.html": "Airspaces",
            "pilots.html": "Meet Our Pilots"
        };

        /* =========================
           დინამიკური ტექსტების დაკვირვება
        ========================= */

        const observerSettings = {
            subtree: true,
            childList: true,
            characterData: true,
            attributes: true,
            attributeFilter:
                translatedAttributes
        };

        const observer =
            new MutationObserver(records => {
                observer.disconnect();

                try {
                    records.forEach(record => {
                        if (
                            record.type ===
                            "childList"
                        ) {
                            record.addedNodes
                                .forEach(
                                    localizeNode
                                );
                        } else {
                            localizeNode(
                                record.target
                            );
                        }
                    });
                } finally {
                    observer.observe(
                        document.body,
                        observerSettings
                    );
                }
            });

        /* =========================
           ენის გამოყენება
        ========================= */

        function applyLanguage() {
            observer.disconnect();

            document.documentElement.lang =
                currentLanguage;

            document.documentElement.dir =
                currentLanguage === "ar"
                    ? "rtl"
                    : "ltr";

            localizeNode(
                document.body
            );

            const currentPage =
                window.location.pathname
                    .split("/")
                    .pop()
                    .toLowerCase() ||
                "index.html";

            if (
                pageTitles[currentPage]
            ) {
                document.title =
                    translate(
                        pageTitles[currentPage]
                    ) +
                    " | " +
                    translate(
                        "Georgian Paragliding Federation"
                    );
            }

            document
                .querySelectorAll(
                    "#gpf-language"
                )
                .forEach(select => {
                    select.value =
                        currentLanguage;

                    select.disabled = false;

                    select.setAttribute(
                        "aria-label",
                        languageLabels[
                            currentLanguage
                        ]
                    );
                });

            document
                .querySelectorAll(
                    "input[type='tel'], " +
                    ".airspace-code, " +
                    ".airspace-coordinates"
                )
                .forEach(element => {
                    element.dir = "ltr";
                });

            try {
                localStorage.setItem(
                    "gpf-language",
                    currentLanguage
                );
            } catch (_) {
                /*
                 * ენის შეცვლა მუშაობს მაშინაც,
                 * როდესაც ბრაუზერი შენახვას ზღუდავს.
                 */
            }

            observer.observe(
                document.body,
                observerSettings
            );

            document.dispatchEvent(
                new CustomEvent(
                    "gpf:languagechange",
                    {
                        detail: {
                            language:
                                currentLanguage
                        }
                    }
                )
            );
        }

        /* =========================
           ენის არჩევის ღილაკი
        ========================= */

        document
            .querySelectorAll(
                "#gpf-language"
            )
            .forEach(select => {
                select.dir = "ltr";

                select.replaceChildren();

                supportedLanguages.forEach(
                    language => {
                        const option =
                            document.createElement(
                                "option"
                            );

                        option.value = language;

                        option.textContent =
                            languageNames[
                                language
                            ];

                        select.append(option);
                    }
                );

                select.addEventListener(
                    "change",
                    () => {
                        if (
                            !supportedLanguages
                                .includes(
                                    select.value
                                )
                        ) {
                            return;
                        }

                        currentLanguage =
                            select.value;

                        const url = new URL(
                            window.location.href
                        );

                        url.searchParams.set(
                            "lang",
                            currentLanguage
                        );

                        window.history
                            .replaceState(
                                null,
                                "",
                                url
                            );

                        applyLanguage();
                    }
                );
            });

        /* =========================
           ენის შენარჩუნება
           სხვა გვერდზე გადასვლისას
        ========================= */

        document.addEventListener(
            "click",
            event => {
                if (
                    !(
                        event.target
                        instanceof Element
                    )
                ) {
                    return;
                }

                const anchor =
                    event.target.closest(
                        "a[href]"
                    );

                if (
                    !anchor ||
                    anchor.hasAttribute(
                        "download"
                    )
                ) {
                    return;
                }

                const href =
                    anchor.getAttribute(
                        "href"
                    );

                if (
                    !href ||
                    href.startsWith("#")
                ) {
                    return;
                }

                const url = new URL(
                    href,
                    window.location.href
                );

                if (
                    url.origin !==
                    window.location.origin
                ) {
                    return;
                }

                const isHTMLPage =
                    /\.html$/i.test(
                        url.pathname
                    ) ||
                    url.pathname.endsWith("/");

                if (!isHTMLPage) return;

                url.searchParams.set(
                    "lang",
                    currentLanguage
                );

                anchor.href = url.href;
            },
            true
        );

        applyLanguage();
    }

    /* =========================
       გვერდის მზადყოფნა
    ========================= */

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeLanguages,
            {
                once: true
            }
        );
    } else {
        initializeLanguages();
    }
})();
