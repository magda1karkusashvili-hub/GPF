
/* =========================
   SAFE HELPERS
========================= */
const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

/* =========================
   DOM READY
========================= */
document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       MOBILE MENU (FIXED)
    ========================= */
    const toggle = qs(".menu-toggle");
    const menu = qs(".menu");

    if (toggle && menu) {

        // open/close menu
        toggle.addEventListener("click", (e) => {
            e.stopPropagation();
            menu.classList.toggle("active");
        });

        // close when clicking outside
        document.addEventListener("click", (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.remove("active");
            }
        });

        // close on link click (mobile UX)
        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("active");
            });
        });
    }

    /* =========================
       HERO SLIDER
    ========================= */
    let currentSlide = 0;
    const slides = qsa(".hero .slide");

    function showSlide(index) {
        if (!slides.length) return;

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(s => s.classList.remove("active"));
        slides[currentSlide].classList.add("active");
    }

    function changeSlide(step) {
        showSlide(currentSlide + step);
    }

    if (slides.length > 1) {
        setInterval(() => changeSlide(1), 3500);
    }

    /* =========================
       SCROLL REVEAL
    ========================= */
    function revealOnScroll() {
        qsa(".reveal").forEach(el => {
            const top = el.getBoundingClientRect().top;
            if (top < window.innerHeight - 100) {
                el.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", revealOnScroll);
    window.addEventListener("load", revealOnScroll);

    /* =========================
       GALLERY SLIDER
    ========================= */
    qsa(".gallery-card").forEach(card => {
        const imgs = card.querySelectorAll("img");
        if (imgs.length <= 1) return;

        let i = 0;

        imgs.forEach((img, idx) => {
            img.style.display = idx === 0 ? "block" : "none";
        });

        setInterval(() => {
            imgs[i].style.display = "none";
            i = (i + 1) % imgs.length;
            imgs[i].style.display = "block";
        }, 3000);
    });

    /* =========================
       ACTIVITY SLIDER
    ========================= */
    qsa(".activity-slider").forEach(slider => {
        const slides = slider.querySelectorAll(".slide");
        if (slides.length <= 1) return;

        let i = 0;

        setInterval(() => {
            slides[i].classList.remove("active");
            i = (i + 1) % slides.length;
            slides[i].classList.add("active");
        }, 3000);
    });

});

/* =========================
   MODAL SYSTEM
========================= */
function openModal(type) {

    const modal = qs("#modal");
    const titleEl = qs("#modal-title");
    const textEl = qs("#modal-text");

    if (!modal || !titleEl || !textEl) return;

    const data = {
        mission: {
            title: "🎯 Mission",
            text: "To develop safe and professional paragliding experiences in Georgia."
        },
        safety: {
            title: "🛡 Safety",
            text: "We follow strict international aviation safety standards."
        },
        development: {
            title: "🎓 Development",
            text: "We train pilots and support aviation growth."
        },
        vision: {
            title: "🌍 Vision",
            text: "To make Georgia a world paragliding hub."
        }
    };

    if (!data[type]) return;

    titleEl.innerText = data[type].title;
    textEl.innerText = data[type].text;

    modal.style.display = "flex";
}

function closeModal() {
    const modal = qs("#modal");
    if (modal) modal.style.display = "none";
}

/* =========================
   PASSWORD MODAL
========================= */
function openPasswordModal() {
    const modal = qs("#passwordModal");
    if (modal) modal.style.display = "flex";
}

function closePasswordModal() {
    const modal = qs("#passwordModal");
    if (modal) modal.style.display = "none";
}

/* close password modal on outside click */
window.addEventListener("click", (e) => {
    const modal = qs("#passwordModal");
    if (modal && e.target === modal) {
        modal.style.display = "none";
    }
});

/* =========================
   LIGHTBOX
========================= */
function openLightbox(img) {
    const lightbox = qs("#lightbox");
    const lightboxImg = qs("#lightbox-img");

    if (!lightbox || !lightboxImg) return;

    lightbox.style.display = "flex";
    lightboxImg.src = img.src;
}

function closeLightbox() {
    const lightbox = qs("#lightbox");
    if (lightbox) lightbox.style.display = "none";
}

/* =========================
   UTILITY
========================= */


function toggleMenu() {
    document.getElementById("menu").classList.toggle("active");
}

<script>
document.addEventListener("DOMContentLoaded", () => {

    const menu = document.getElementById("menu");
    const toggle = document.getElementById("menuToggle");
    const overlay = document.getElementById("menuOverlay");

    function openMenu() {
        menu.classList.add("active");
        overlay.classList.add("active");
    }

    function closeMenu() {
        menu.classList.remove("active");
        overlay.classList.remove("active");
    }

    toggle.addEventListener("click", () => {
        menu.classList.toggle("active");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", closeMenu);

    // auto close on click link
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

});
</script>
