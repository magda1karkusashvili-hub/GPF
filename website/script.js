
/* ვარიოს ხმა — მობილურის მხარდაჭერით */

const hero = document.getElementById("home");
const controls = document.getElementById("vario-controls");
const button = document.getElementById("vario-toggle");
const volume = document.getElementById("vario-volume");
const volumeText = document.getElementById("vario-volume-text");
const status = document.getElementById("vario-status");

if (!hero || !controls || !button || !volume) return;

const yellowWings = Array.from(
    hero.querySelectorAll('[data-vario="true"]')
);

if (!yellowWings.length) {
    controls.hidden = true;
    return;
}

controls.hidden = false;

const audioLabels = {
    ka: {
        on: "🔊 ვარიოს ჩართვა",
        off: "🔇 ვარიოს გამორთვა",
        volume: "ხმა",
        ready: "ხმა მიბმულია ყვითელ პარაპლანებზე.",
        active: "ვარიო ჩართულია.",
        error: "ხმა ვერ ჩაირთო. სცადეთ ხელახლა."
    },
    en: {
        on: "🔊 Enable vario",
        off: "🔇 Disable vario",
        volume: "Volume",
        ready: "Sound follows the yellow paragliders.",
        active: "Vario enabled.",
        error: "Audio could not start. Try again."
    },
    fr: {
        on: "🔊 Activer le vario",
        off: "🔇 Couper le vario",
        volume: "Volume",
        ready: "Le son suit les parapentes jaunes.",
        active: "Vario activé.",
        error: "Impossible d’activer le son. Réessayez."
    },
    ar: {
        on: "🔊 تشغيل الفاريو",
        off: "🔇 إيقاف الفاريو",
        volume: "الصوت",
        ready: "يتبع الصوت المظلات الصفراء.",
        active: "الفاريو يعمل.",
        error: "تعذر تشغيل الصوت. حاول مجددًا."
    },
    zh: {
        on: "🔊 开启升降仪声音",
        off: "🔇 关闭升降仪声音",
        volume: "音量",
        ready: "声音跟随黄色滑翔伞。",
        active: "升降仪声音已开启。",
        error: "无法开启声音，请重试。"
    }
};

let enabled = false;
let busy = false;
let failed = false;

let context;
let oscillator;
let output;

let animationFrame = 0;
let lastSample = 0;
let nextTone = 0;
let startupUntil = 0;

let selectedWing = null;
let selectedAt = 0;
let toneMode = "silent";

const positions = new Map();
const speeds = new Map();

function updateAudioLabels() {
    const language =
        document.documentElement.lang.split("-")[0];

    const text = audioLabels[language] || audioLabels.ka;

    button.textContent = enabled ? text.off : text.on;
    button.setAttribute("aria-pressed", String(enabled));
    volumeText.textContent = text.volume;

    status.textContent = failed
        ? text.error
        : enabled
            ? text.active
            : text.ready;
}

function resetMovement() {
    positions.clear();
    speeds.clear();
    lastSample = 0;
    selectedWing = null;
}

function muteAudio() {
    if (!context || !output) return;

    const now = context.currentTime;

    output.gain.cancelScheduledValues(now);
    output.gain.setTargetAtTime(0, now, 0.015);

    toneMode = "silent";
}

function prepareAudio() {
    if (context) return;

    const AudioEngine =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioEngine) {
        throw new Error("Audio unavailable");
    }

    context = new AudioEngine();

    oscillator = context.createOscillator();
    output = context.createGain();

    /*
     * Triangle უფრო მკვეთრია, ვიდრე წინა sine,
     * მაგრამ ხმა ზედმეტად მაღალი არ ხდება.
     */
    oscillator.type = "triangle";
    oscillator.frequency.value = 1600;
    output.gain.value = 0;

    oscillator.connect(output);
    output.connect(context.destination);

    oscillator.start();
}

function beep(frequency, duration, level, rising = false) {
    const now = context.currentTime;

    oscillator.frequency.cancelScheduledValues(now);
    oscillator.frequency.setValueAtTime(frequency, now);

    /*
     * აწევისას თითოეული სიგნალიც მაღლა იწევს.
     */
    if (rising) {
        oscillator.frequency.linearRampToValueAtTime(
            frequency + 180,
            now + duration
        );
    }

    output.gain.cancelScheduledValues(now);
    output.gain.setValueAtTime(0, now);
    output.gain.linearRampToValueAtTime(level, now + 0.008);

    output.gain.setValueAtTime(
        level,
        now + Math.max(0.012, duration - 0.018)
    );

    output.gain.linearRampToValueAtTime(
        0,
        now + duration
    );
}

function visibleHero() {
    const box = hero.getBoundingClientRect();

    return (
        !document.hidden &&
        box.bottom > 0 &&
        box.top < window.innerHeight
    );
}

function measureSpeed(timestamp) {
    const elapsed = lastSample
        ? (timestamp - lastSample) / 1000
        : 0;

    lastSample = timestamp;

    const heroBox = hero.getBoundingClientRect();
    const candidates = [];

    for (const wing of yellowWings) {
        const box = wing.getBoundingClientRect();

        const y =
            box.top + box.height / 2 - heroBox.top;

        const previous = positions.get(wing);
        positions.set(wing, y);

        if (
            previous === undefined ||
            elapsed <= 0 ||
            elapsed > 0.3
        ) {
            speeds.set(wing, 0);
            continue;
        }

        /*
         * ეკრანის მასშტაბის გათვალისწინება:
         * მობილურზე პატარა მოძრაობაც სწორად იზომება.
         */
        const matrix = wing.getScreenCTM();

        const scale = matrix
            ? Math.max(Math.hypot(matrix.c, matrix.d), 0.01)
            : 1;

        const rawSpeed =
            (previous - y) / elapsed / scale;

        const oldSpeed = speeds.get(wing) || 0;
        const smoothing = 1 - Math.exp(-elapsed * 8);

        const speed =
            oldSpeed + (rawSpeed - oldSpeed) * smoothing;

        speeds.set(wing, speed);

        const visible =
            box.right > heroBox.left &&
            box.left < heroBox.right &&
            box.bottom > heroBox.top &&
            box.top < heroBox.bottom;

        if (visible) {
            candidates.push({ wing, speed });
        }
    }

    candidates.sort(
        (a, b) => Math.abs(b.speed) - Math.abs(a.speed)
    );

    const strongest = candidates[0];

    if (!strongest) {
        selectedWing = null;
        return 0;
    }

    const current = candidates.find(
        item => item.wing === selectedWing
    );

    if (
        !current ||
        (
            timestamp - selectedAt > 1200 &&
            Math.abs(strongest.speed) >
                Math.abs(current.speed) * 1.4 + 1
        )
    ) {
        selectedWing = strongest.wing;
        selectedAt = timestamp;

        muteAudio();
        nextTone = context.currentTime;

        return strongest.speed;
    }

    return current.speed;
}

function audioLoop(timestamp) {
    if (!enabled) return;

    animationFrame = requestAnimationFrame(audioLoop);

    if (!visibleHero()) {
        muteAudio();
        resetMovement();
        return;
    }

    if (context.state !== "running") {
        resetMovement();
        return;
    }

    const now = context.currentTime;

    if (now < startupUntil) return;
    if (lastSample && timestamp - lastSample < 33) return;

    const speed = measureSpeed(timestamp);
    const level = Number(volume.value) / 100 * 0.10;

    if (level === 0 || Math.abs(speed) < 0.8) {
        muteAudio();
        nextTone = now;
        return;
    }

    if (speed > 0) {
        if (toneMode !== "climb") {
            muteAudio();
            toneMode = "climb";
            nextTone = now;
        }

        /*
         * უფრო მკვეთრი აფრენის ხმა:
         * 1400–2800 Hz და გახშირებული სიგნალები.
         */
        const intensity = Math.min(speed / 65, 1);

        const frequency = 1400 + intensity * 1400;
        const interval = 0.48 - intensity * 0.35;
        const duration = Math.min(0.075, interval * 0.45);

        if (now >= nextTone) {
            beep(frequency, duration, level, true);
            nextTone = now + interval;
        }
    } else {
        const intensity = Math.min(-speed / 65, 1);

        if (toneMode !== "sink") {
            muteAudio();
            toneMode = "sink";
        }

        oscillator.frequency.cancelScheduledValues(now);

        oscillator.frequency.setTargetAtTime(
            380 - intensity * 150,
            now,
            0.06
        );

        output.gain.cancelScheduledValues(now);

        output.gain.setTargetAtTime(
            level * 0.45,
            now,
            0.04
        );

        nextTone = now;
    }
}

button.addEventListener("click", async () => {
    if (busy) return;

    busy = true;
    button.disabled = true;

    try {
        if (enabled) {
            enabled = false;

            cancelAnimationFrame(animationFrame);
            muteAudio();
            resetMovement();

            if (context?.state === "running") {
                await context.suspend();
            }
        } else {
            /*
             * AudioContext იქმნება და resume იძახება
             * უშუალოდ მომხმარებლის დაჭერისას.
             */
            prepareAudio();

            const resumeRequest = context.resume();
            await resumeRequest;

            if (context.state !== "running") {
                throw new Error("Audio suspended");
            }

            enabled = true;
            failed = false;

            resetMovement();

            /*
             * ჩართვისას მოკლე, მკვეთრი საცდელი ხმა.
             */
            beep(
                1600,
                0.12,
                Number(volume.value) / 100 * 0.10,
                true
            );

            startupUntil = context.currentTime + 0.17;
            nextTone = startupUntil;

            animationFrame = requestAnimationFrame(audioLoop);
        }
    } catch (error) {
        enabled = false;
        failed = true;

        cancelAnimationFrame(animationFrame);
        muteAudio();

        console.error("Vario audio:", error);
    } finally {
        busy = false;
        button.disabled = false;
        updateAudioLabels();
    }
});

volume.addEventListener("input", () => {
    if (Number(volume.value) === 0) {
        muteAudio();
    }
});

document.addEventListener("visibilitychange", () => {
    if (document.hidden) muteAudio();
    resetMovement();
});

window.addEventListener("pagehide", () => {
    enabled = false;

    cancelAnimationFrame(animationFrame);
    muteAudio();
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
