const GHOST_LOGINS = [
    "Nerozc", "Cultist_404", "Azathoth_Eye", "Necro_Mancer", "Void_Walker_00", 
    "[alt]", "Shadow_Priest", "Dagon_Worshipper", "Rune_Keeper", "Soul_Eater", 
    "Blood_Scribe", "Temir", "Abyss_Gazer", "Dark_Matter", "Entropy_Lord", 
    "Phantom_User", "Specter_X", "Joijkrk", "Grim_Reaper", "Night_Shade", 
    "Bone_Collector", "Spirit_Guide", "Astral_Traveler", "Witch_Doctor", "Hex_Master", 
    "Cipher_Demon", "Null_Pointer", "POLYTECH2025{f1nd_t4e_s3cr3333t}", "System_Decay", "Last_Hope"
];
const GHOST_PASSWORDS = [
    "0x666_BEAST", "sanguine_rite", "memento_mori", "lux_aeterna", "ad_astra_per_aspera", 
    "cthulhu_fhtagn", "password123_lol", "incorrect_syntax", "altaltalt", "segmentation_fault", 
    "kernel_panic", "access_denied", "darkness_falls", "blood_sacrifice", "ancient_ones", 
    "shub_niggurath", "nerozc", "yog_sothoth", "insanity_check", "sanity_0", 
    "fear_the_old_blood", "if_you_see_this_slap_me", "cosmos_is_dead", "temir228", "eternal_slumber", 
    "joijkrk", "follow_the_rabbit", "polytech2025{r3v3al_t4e_s3cr3333t}", "matrix_glitch", "end_of_line"
];

let currentGlyphs = { user: null, pass: null };
let hesitationTimeout; 
let candleLit = false; 
let isAlarmActive = false;
let isGhostStreamRunning = false;

const STORAGE_KEY = 'cult_doom_start_time';

document.addEventListener('DOMContentLoaded', async () => {
    const storedStartTime = localStorage.getItem(STORAGE_KEY);

    if (storedStartTime) {
        const elapsedSeconds = Math.floor((Date.now() - parseInt(storedStartTime)) / 1000);
        const remaining = 300 - elapsedSeconds;

        if (remaining > 0) {
            igniteCandle(remaining);
            document.getElementById('message').innerText = "Вы не можете сбежать от судьбы...";
        } else {
            window.location.href = '/oblivion';
            return;
        }
    } else {
        hesitationTimeout = setTimeout(triggerHesitationAlarm, 120000); 
    }
    
    try {
        const response = await fetch('/api/divination');
        const data = await response.json();
        
        if (data.status === "divination_success") {
            currentGlyphs.user = data.glyphs.primary;
            currentGlyphs.pass = data.glyphs.secondary;
            document.getElementById('ritual-form').classList.remove('loading');
            if (!candleLit) document.getElementById('message').innerText = "";
        }
    } catch (e) {
        document.getElementById('message').innerText = "Связь с астралом нарушена.";
    }

    const alertBox = document.getElementById('hesitation-alert');
    document.addEventListener('keydown', (e) => {
        if(e.key === "Escape" && isAlarmActive) alertBox.style.display = 'none';
    });
    alertBox.addEventListener('click', () => {
        alertBox.style.display = 'none';
    });
});

function startGhostStream() {
    if (isGhostStreamRunning) return; 
    isGhostStreamRunning = true;
    ghostLoop();
}

function ghostLoop() {
    const glow = document.getElementById('doom-glow');
    if (glow.style.display === 'none') {
        isGhostStreamRunning = false;
        return;
    }

    const randomInterval = Math.random() * 2000 + 500; 
    
    setTimeout(() => {

        spawnGhost();
        
        ghostLoop();
    }, randomInterval);
}

function spawnGhost() {
    const isLogin = Math.random() > 0.5;
    const text = isLogin 
        ? GHOST_LOGINS[Math.floor(Math.random() * GHOST_LOGINS.length)] 
        : GHOST_PASSWORDS[Math.floor(Math.random() * GHOST_PASSWORDS.length)];

    const el = document.createElement('div');
    el.classList.add('ghost-word');
    el.classList.add(isLogin ? 'ghost-login' : 'ghost-pass');
    el.innerText = text;

    const topPos = Math.floor(Math.random() * 80) + 10;
    el.style.top = `${topPos}%`;

    el.style.animationName = isLogin ? 'float-from-left, tremble' : 'float-from-right, tremble';
    const duration = Math.random() * 5 + 5; 
    el.style.animationDuration = `${duration}s, 0.1s`;

    document.body.appendChild(el);
    
    setTimeout(() => { el.remove(); }, duration * 1000);
}

function triggerHesitationAlarm() {
    if (candleLit) return; 
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    isAlarmActive = true;
    document.getElementById('hesitation-alert').style.display = 'flex';
    igniteCandle(300);
}

async function castSpell() {
    if (hesitationTimeout) clearTimeout(hesitationTimeout);

    const userInp = document.getElementById('inp_user').value;
    const passInp = document.getElementById('inp_pass').value;
    const msg = document.getElementById('message');

    if (!currentGlyphs.user || !currentGlyphs.pass) {
        msg.innerText = "Руны еще не проявились.";
        return;
    }

    const payload = {};
    payload[currentGlyphs.user] = userInp;
    payload[currentGlyphs.pass] = passInp;

    try {
        const response = await fetch('/api/invoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            if (window.deathInterval) clearInterval(window.deathInterval);
            localStorage.removeItem(STORAGE_KEY);
            
            document.getElementById('doom-glow').style.display = 'none';
            
            document.body.innerHTML = `
                <div style="text-align:center; color: #d4af37; padding-top: 100px;">
                    <h1>ПЕЧАТЬ СНЯТА</h1>
                    <div style="border: 2px solid #d4af37; padding: 30px; display:inline-block; background:#1a1010;">
                        ${data.secret}
                    </div>
                </div>`;
        } else {
            msg.innerText = data.message;
            if (!candleLit) {
                localStorage.setItem(STORAGE_KEY, Date.now().toString());
                igniteCandle(300);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

function igniteCandle(secondsLeft = 300) {
    if (candleLit) return;
    candleLit = true;
    isAlarmActive = true;

    startGhostStream();

    const timerContainer = document.getElementById('timer-container');
    const glow = document.getElementById('doom-glow');
    const countdownEl = document.getElementById('countdown');

    timerContainer.style.display = 'block';
    glow.style.opacity = '1';
    glow.classList.add('pulsing');
    
    let timeLeft = secondsLeft;
    updateTimerDisplay(timeLeft, countdownEl, glow);
    
    window.deathInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timeLeft, countdownEl, glow);

        if (timeLeft <= 0) {
            clearInterval(window.deathInterval);
            window.location.href = '/oblivion';
        }
    }, 1000);
}

function updateTimerDisplay(time, displayEl, glowEl) {
    const m = Math.floor(time / 60);
    const s = time % 60;
    displayEl.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;

    let speed = (time / 300) * 1.8 + 0.2;
    if (speed > 2) speed = 2;
    if (speed < 0.2) speed = 0.2;
    
    glowEl.style.animationDuration = `${speed}s`;

    if (time < 60) {
        glowEl.style.background = `radial-gradient(circle, rgba(0,0,0,0) 20%, rgba(200, 0, 0, 0.8) 90%)`;
    }
}