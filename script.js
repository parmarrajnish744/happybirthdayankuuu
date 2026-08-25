/* ==========================================================================
   ROMANTIC BIRTHDAY SURPRISE - JAVASCRIPT ENGINE
   Interactive Features, Web Audio Synthesizer, Canvas Particles & Story Controller
   For: Ankuuu | From: Rajnish
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. STATE & STORAGE CONTROLLER
    // ==========================================
    const state = {
        currentChapter: 1,
        totalChapters: 10,
        musicPlaying: false,
        bucketCount: 0,
        totalBucket: 7,
        balloonPopCount: 0,
        wishesFoundCount: 0,
        activePhraseIndex: 0
    };

    // ==========================================
    // 2. MP3 AUDIO TRACK & PROCEDURAL SYNTHESIZER
    // ==========================================
    let audioCtx = null;
    let musicInterval = null;

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(e => console.log('Audio resume error:', e));
        }
    }

    // Unlock audio context automatically on any user gesture (Android & iOS)
    function unlockAudioOnInteraction() {
        initAudio();
        const bgAudio = document.getElementById('bg-audio');
        if (state.musicPlaying && bgAudio && bgAudio.paused) {
            bgAudio.play().catch(e => console.log('Audio autoplay blocked:', e));
        }
    }
    window.addEventListener('touchstart', unlockAudioOnInteraction, { passive: true, once: true });
    window.addEventListener('click', unlockAudioOnInteraction, { passive: true, once: true });

    // Gentle Romantic Arpeggio Music Synthesizer (Fallback)
    const romanticNotes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 493.88];
    let noteIdx = 0;

    function playNextNote() {
        if (!state.musicPlaying || !audioCtx) return;
        
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(romanticNotes[noteIdx], audioCtx.currentTime);
            
            gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 1.2);
            
            noteIdx = (noteIdx + 1) % romanticNotes.length;
        } catch (e) {
            console.log('Audio synth playback:', e);
        }
    }

    function syncPlayerUI() {
        const miniPlayer = document.getElementById('mini-music-player');
        const miniPlayIcon = document.getElementById('mini-play-icon');
        const statusLabel = document.getElementById('audio-status-label');
        
        if (state.musicPlaying) {
            if (statusLabel) statusLabel.textContent = 'Music: ON 💖';
            if (miniPlayer) miniPlayer.classList.add('playing');
            if (miniPlayIcon) miniPlayIcon.textContent = '⏸';
        } else {
            if (statusLabel) statusLabel.textContent = 'Music: Off';
            if (miniPlayer) miniPlayer.classList.remove('playing');
            if (miniPlayIcon) miniPlayIcon.textContent = '▶';
        }
    }

    function toggleMusic() {
        initAudio();
        state.musicPlaying = !state.musicPlaying;
        
        const bgAudio = document.getElementById('bg-audio');
        if (state.musicPlaying) {
            if (bgAudio) {
                bgAudio.play().then(() => {
                    console.log('Playing Agar Tum Saath Ho audio track');
                }).catch(err => {
                    console.log('MP3 Playback blocked/failed, using synth fallback:', err);
                    if (!musicInterval) musicInterval = setInterval(playNextNote, 600);
                });
            } else {
                if (!musicInterval) musicInterval = setInterval(playNextNote, 600);
            }
        } else {
            if (bgAudio) bgAudio.pause();
            if (musicInterval) {
                clearInterval(musicInterval);
                musicInterval = null;
            }
        }
        syncPlayerUI();
    }

    // Sound FX: Chime
    function playSoundChime() {
        if (!audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        } catch(e) {}
    }

    // Sound FX: Pop / Flip
    function playSoundPop() {
        if (!audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } catch(e) {}
    }

    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    if (audioToggleBtn) audioToggleBtn.addEventListener('click', toggleMusic);

    // ==========================================
    // 3. BACKGROUND CANVAS PARTICLE SYSTEM
    // ==========================================
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    
    let isTabActive = true;
    document.addEventListener('visibilitychange', () => {
        isTabActive = !document.hidden;
    });

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    function resizeCanvas() {
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, isMobileDevice ? 1.5 : 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        if (ctx) ctx.scale(dpr, dpr);
    }
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (canvas) resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    // Particle Array
    const particles = [];
    const confetti = [];

    class HeartParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = height + 20;
            this.size = Math.random() * (isMobileDevice ? 10 : 14) + 6;
            this.speedY = Math.random() * 1.5 + 0.5;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.8;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.color = ['#ff6584', '#ff85a1', '#c77dff', '#ffd700'][Math.floor(Math.random() * 4)];
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            if (this.y < -20) this.reset();
        }
        draw() {
            if (!ctx) return;
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.font = `${this.size}px serif`;
            ctx.fillText('❤️', this.x, this.y);
            ctx.restore();
        }
    }

    class ConfettiParticle {
        constructor(x, y) {
            this.x = x || width / 2;
            this.y = y || height / 2;
            this.size = Math.random() * 8 + 4;
            this.speedX = (Math.random() - 0.5) * 12;
            this.speedY = (Math.random() - 0.5) * 12 - 4;
            this.gravity = 0.2;
            this.opacity = 1;
            this.color = ['#ff4d6d', '#ffd700', '#c77dff', '#ffffff', '#ff85a1'][Math.floor(Math.random() * 5)];
        }
        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= 0.015;
        }
        draw() {
            if (!ctx) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Init Floating Hearts (reduced particle count on mobile for smooth performance)
    const particleCount = isMobileDevice ? 18 : 35;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new HeartParticle());
    }

    function spawnConfettiBurst(x, y, count = (isMobileDevice ? 30 : 60)) {
        for (let i = 0; i < count; i++) {
            confetti.push(new ConfettiParticle(x, y));
        }
    }

    function animateParticles() {
        if (!ctx) return;
        if (!isTabActive) {
            requestAnimationFrame(animateParticles);
            return;
        }
        ctx.clearRect(0, 0, width, height);

        // Update & draw hearts
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Update & draw confetti
        for (let i = confetti.length - 1; i >= 0; i--) {
            const c = confetti[i];
            c.update();
            c.draw();
            if (c.opacity <= 0) confetti.splice(i, 1);
        }

        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ==========================================
    // 4. STORY NAVIGATION & CHAPTER MANAGER
    // ==========================================
    function updateProgressNav(ch) {
        const text = document.getElementById('nav-progress-text');
        if (text) text.textContent = `Chapter ${ch} of ${state.totalChapters}`;

        // Update 10 Love Progress Hearts
        document.querySelectorAll('.love-heart-step').forEach(heartBtn => {
            const num = parseInt(heartBtn.dataset.chapter);
            heartBtn.classList.remove('active', 'completed');
            if (num === ch) {
                heartBtn.classList.add('active');
            } else if (num < ch) {
                heartBtn.classList.add('completed');
            }
        });

        document.querySelectorAll('.chapter-card-btn').forEach(btn => {
            const num = parseInt(btn.dataset.chapter);
            btn.classList.toggle('active', num === ch);
        });
    }

    // Attach click listeners to Love Progress heart icons
    document.querySelectorAll('.love-heart-step').forEach(heartBtn => {
        heartBtn.addEventListener('click', () => {
            const ch = parseInt(heartBtn.dataset.chapter);
            goToChapter(ch);
            playSoundPop();
        });
    });

    function goToChapter(targetCh) {
        if (targetCh < 1 || targetCh > state.totalChapters) return;

        const currentEl = document.getElementById(`page-${state.currentChapter}`);
        const targetEl = document.getElementById(`page-${targetCh}`);

        if (currentEl) currentEl.classList.remove('active');
        
        state.currentChapter = targetCh;
        updateProgressNav(targetCh);

        if (targetEl) {
            targetEl.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Trigger special chapter initializers
        if (targetCh === 1) runNameRevealSequence();
        if (targetCh === 8) initBalloonScene();
        if (targetCh === 10) initTypewriterSequence();
    }

    // Next buttons event listeners
    document.querySelectorAll('.next-chapter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nextNum = parseInt(btn.dataset.next);
            goToChapter(nextNum);
            playSoundPop();
        });
    });

    // Drawer menu listeners
    const drawer = document.getElementById('chapters-drawer');
    document.getElementById('menu-toggle-btn').addEventListener('click', () => {
        drawer.classList.add('active');
    });
    document.getElementById('close-drawer-btn').addEventListener('click', () => {
        drawer.classList.remove('active');
    });

    document.querySelectorAll('.chapter-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ch = parseInt(btn.dataset.chapter);
            goToChapter(ch);
            drawer.classList.remove('active');
        });
    });

    // ==========================================
    // 5. PAGE 1 — THE GRAND REVEAL & CAKE
    // ==========================================
    const openSurpriseBtn = document.getElementById('open-surprise-btn');
    const heroInitialCard = document.getElementById('hero-initial-card');
    const heroRevealedCard = document.getElementById('hero-revealed-card');

    openSurpriseBtn.addEventListener('click', (e) => {
        initAudio();
        if (!state.musicPlaying) {
            toggleMusic();
        }
        heroInitialCard.classList.add('hidden');
        heroRevealedCard.classList.remove('hidden');
        spawnConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
        playSoundChime();
    });

    // Blow Out Candles
    const blowBtn = document.getElementById('blow-candles-btn');
    blowBtn.addEventListener('click', () => {
        document.querySelectorAll('.candle').forEach(candle => {
            candle.classList.remove('lit');
            candle.classList.add('out');
        });
        blowBtn.textContent = '🎂 Candles Blown! Make A Wish! ✨';
        spawnConfettiBurst(window.innerWidth / 2, window.innerHeight / 3, 50);
        playSoundChime();
    });

    // Real-Time Birthday Countdown to 28-08-2026
    function updateCountdown() {
        const targetDate = new Date('2026-08-28T00:00:00');
        const now = new Date();
        const diff = targetDate - now;

        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / 1000 / 60) % 60);
            const secs = Math.floor((diff / 1000) % 60);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(mins).padStart(2, '0');
            document.getElementById('seconds').textContent = String(secs).padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ==========================================
    // 6. PAGE 3 — 10 REASONS 3D FLIP CARDS
    // ==========================================
    document.querySelectorAll('.reason-card').forEach(card => {
        card.addEventListener('click', (e) => {
            card.classList.toggle('flipped');
            playSoundPop();
            const rect = card.getBoundingClientRect();
            spawnConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
        });
    });

    // ==========================================
    // 7. PAGE 4 — POLAROID SCRAPBOOK & QUOTE POPUP LIGHTBOX
    // ==========================================
    const memoryData = [
        {
            id: 1,
            img: 'assets/images/couple_filter_hearts.jpg',
            tag: '🌸 Emojis & Hearts',
            title: 'Cute Emojis & Hearts 🌸💕',
            quote: '“You bring all the bright colors, sweet flowers, and rainbows into my world ❤️”',
            desc: 'Surrounded by flowers, hearts, and cute filters — your adorable face is my favorite sight in the universe.'
        },
        {
            id: 2,
            img: 'assets/images/couple_warm_smile.jpg',
            tag: '🌅 Golden Hour Joy',
            title: 'Warm Golden Smile 🌅✨',
            quote: '“Your radiant smile is my daily dose of sunshine and pure warmth ☀️💖”',
            desc: 'Under warm golden bokeh lights, seeing you smile so brightly makes my heart fill with pure happiness.'
        },
        {
            id: 3,
            img: 'assets/images/couple_floral_traditional.jpg',
            tag: '🌸 Floral Cuddles',
            title: 'Floral Traditional Love 🌸💙',
            quote: '“In your eyes and in your arms, I have found my home forever 🏡❤️”',
            desc: 'Dressed in traditional floral patterns, holding you close and sharing quiet moments of pure love.'
        },
        {
            id: 4,
            img: 'assets/images/couple_black_hearts.jpg',
            tag: '🖤 Black Hearts Vibe',
            title: 'Black Hearts Filter 🖤✨',
            quote: '“You stole my heart from day one, and I\'ll love you for a million lifetimes 🖤♾️”',
            desc: 'Floating black hearts framing our silly faces — no filter in the world could capture how deep my love is for you.'
        },
        {
            id: 5,
            img: 'assets/images/couple_alien_fun.jpg',
            tag: '👽 Goofy Cinema Night',
            title: 'Goofy Alien Cuddles 👽🍿',
            quote: '“We might be goofy aliens, but we are perfect soulmates in our magical world 🤪❤️”',
            desc: 'Lying back together with silly alien face filters, laughing endlessly — being goofy with you is true love!'
        },
        {
            id: 6,
            img: 'assets/images/holding_hands_red_thread.jpg',
            tag: '🤝 Sacred Red Thread',
            title: 'Promised Hand In Hand 🤝❤️',
            quote: '“Wrapped around my fingers, your hand is my favorite place in the world 🔴❤️”',
            desc: 'The moment we held hands and tied our hearts together with a sacred promise that will never fade.'
        },
        {
            id: 7,
            img: 'assets/images/couple_smiling_selfie.jpg',
            tag: '😊 Pure Radiant Joy',
            title: 'Pure Joy & Smiles 😊💖',
            quote: '“Whenever I look at your radiant smile, all my worries disappear into pure bliss 🌸”',
            desc: 'Making you smile is my daily mission, and seeing you happy is my greatest reward in life.'
        },
        {
            id: 8,
            img: 'assets/images/couple_peek_selfie.jpg',
            tag: '😜 Playful Tease',
            title: 'My Favorite Tease 📸😜',
            quote: '“Peeking into your frame & stealing your heart — you are my favorite mischief 😜❤️”',
            desc: 'No matter how silly we get, every moment with you is filled with genuine laughter.'
        },
        {
            id: 9,
            img: 'assets/images/couple_sneakers_theater.jpg',
            tag: '👟 Matching Steps',
            title: 'Matching Shoes & Theater 👟🎬',
            quote: '“Side by side, step by step — walking into every adventure together 🍿✨”',
            desc: 'Kicking back at our favorite movie dates, matching our steps side-by-side as we walk life\'s journey.'
        },
        {
            id: 10,
            img: 'assets/images/couple_theater_cuddle.jpg',
            tag: '🌙 Theater Cuddles',
            title: 'Cozy Cinema Cuddles 🌙✨',
            quote: '“Snuggled close under starry lights — you are my peace and my forever home 🌙❤️”',
            desc: 'Snuggled close under the stars and theater lights. You are my home, my peace, and my forever love.'
        }
    ];

    let currentLightboxIdx = 0;
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDate = document.getElementById('lightbox-date');
    const lightboxQuote = document.getElementById('lightbox-quote');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxCountBadge = document.getElementById('lightbox-count-badge');
    const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
    const lightboxNextBtn = document.getElementById('lightbox-next-btn');

    function openLightboxModal(idx, clickX, clickY) {
        if (idx < 0) idx = memoryData.length - 1;
        if (idx >= memoryData.length) idx = 0;
        currentLightboxIdx = idx;

        const data = memoryData[idx];
        if (lightboxImg) lightboxImg.src = data.img;
        if (lightboxTitle) lightboxTitle.textContent = data.title;
        if (lightboxDate) lightboxDate.textContent = data.tag;
        if (lightboxQuote) lightboxQuote.textContent = data.quote;
        if (lightboxDesc) lightboxDesc.textContent = data.desc;
        if (lightboxCountBadge) lightboxCountBadge.textContent = `${idx + 1} of ${memoryData.length}`;

        lightboxModal.classList.add('active');
        playSoundChime();

        if (clickX && clickY) {
            spawnConfettiBurst(clickX, clickY, 35);
        } else {
            spawnConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
        }
    }

    // Attach listeners to Interactive Quote Buttons
    document.querySelectorAll('.quote-popup-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.photoIdx || 0);
            const rect = btn.getBoundingClientRect();
            openLightboxModal(idx, rect.left + rect.width / 2, rect.top + rect.height / 2);
        });
    });

    // Attach listeners to Polaroid Cards
    document.querySelectorAll('.polaroid-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const idx = parseInt(card.dataset.photoIdx || 0);
            const rect = card.getBoundingClientRect();
            openLightboxModal(idx, rect.left + rect.width / 2, rect.top + rect.height / 2);
        });
    });

    // Next / Previous Lightbox Popup Buttons
    if (lightboxPrevBtn) {
        lightboxPrevBtn.addEventListener('click', () => {
            openLightboxModal(currentLightboxIdx - 1);
        });
    }
    if (lightboxNextBtn) {
        lightboxNextBtn.addEventListener('click', () => {
            openLightboxModal(currentLightboxIdx + 1);
        });
    }

    // Close Modal
    document.getElementById('lightbox-modal-close').addEventListener('click', () => {
        lightboxModal.classList.remove('active');
    });

    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
            lightboxModal.classList.remove('active');
        }
    });

    // Keyboard Arrow navigation for Lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') {
            openLightboxModal(currentLightboxIdx - 1);
        } else if (e.key === 'ArrowRight') {
            openLightboxModal(currentLightboxIdx + 1);
        } else if (e.key === 'Escape') {
            lightboxModal.classList.remove('active');
        }
    });

    // ==========================================
    // 8. PAGE 5 — 3D LOVE LETTER ENVELOPE
    // ==========================================
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const openLetterBtn = document.getElementById('open-letter-btn');

    openLetterBtn.addEventListener('click', () => {
        envelopeWrapper.classList.toggle('open');
        if (envelopeWrapper.classList.contains('open')) {
            openLetterBtn.textContent = 'Close Letter 💌';
            playSoundChime();
        } else {
            openLetterBtn.textContent = 'Open My Letter 💌';
        }
    });

    // ==========================================
    // 9. PAGE 6 — STARGAZING WISH UNIVERSE
    // ==========================================
    const wishModal = document.getElementById('wish-modal');
    const wishTitle = document.getElementById('wish-modal-title');
    const wishBody = document.getElementById('wish-modal-body');

    const starWishes = {
        1: { title: "Smile Wish ✨", body: "“May Your Smile Always Shine Bright & Light Up Every Room!”" },
        2: { title: "Dreams Wish 🌟", body: "“May Every Dream You Hold In Your Heart Come True This Year!”" },
        3: { title: "Happiness Wish ⭐", body: "“May You Always Stay Happy, Loved, Carefree & Cherished!”" },
        4: { title: "Our Love Wish 💫", body: "“May Our Love Keep Growing Stronger With Each Passing Day ♾️”" },
        5: { title: "Beauty Wish ✨", body: "“May This Year Bring You Everything Pure, Beautiful & Magical!”" }
    };

    document.querySelectorAll('.cosmic-star').forEach(star => {
        star.addEventListener('click', () => {
            const id = star.dataset.wishId;
            const wish = starWishes[id];

            wishTitle.textContent = wish.title;
            wishBody.textContent = wish.body;

            wishModal.classList.add('active');
            playSoundChime();
            const rect = star.getBoundingClientRect();
            spawnConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);
        });
    });

    document.getElementById('wish-modal-close').addEventListener('click', () => wishModal.classList.remove('active'));
    document.getElementById('wish-modal-ok').addEventListener('click', () => wishModal.classList.remove('active'));

    // ==========================================
    // 10. PAGE 7 — FUTURE BUCKET LIST
    // ==========================================
    document.querySelectorAll('.bucket-card').forEach(card => {
        const btn = card.querySelector('.bucket-check-btn');
        btn.addEventListener('click', () => {
            card.classList.toggle('checked');
            if (card.classList.contains('checked')) {
                btn.textContent = 'Checked! ❤️';
                state.bucketCount++;
                playSoundPop();
                const rect = card.getBoundingClientRect();
                spawnConfettiBurst(rect.right - 40, rect.top + rect.height / 2, 20);
            } else {
                btn.textContent = 'Let\'s Do It!';
                state.bucketCount--;
            }

            document.getElementById('bucket-count').textContent = `${state.bucketCount} of ${state.totalBucket}`;
            document.getElementById('bucket-progress-fill').style.width = `${(state.bucketCount / state.totalBucket) * 100}%`;
        });
    });

    // ==========================================
    // 11. MULTIPLE ROTATING TEXT CONTROLLERS
    // ==========================================
    
    // A. Hero Banner Rotator (Page 1)
    function initHeroTextRotator() {
        const textItems = document.querySelectorAll('#hero-rotating-text-box .rotate-item');
        if (!textItems.length) return;
        let idx = 0;
        setInterval(() => {
            textItems[idx].classList.remove('active');
            idx = (idx + 1) % textItems.length;
            textItems[idx].classList.add('active');
        }, 5000);
    }
    initHeroTextRotator();

    // B. Large Rotating Phrase Showcase (Page 8)
    const phraseItems = document.querySelectorAll('.rotating-phrase-item');
    const phraseDots = document.querySelectorAll('.phrase-dots .dot');

    function setPhraseIndex(newIdx) {
        if (!phraseItems.length) return;
        state.activePhraseIndex = (newIdx + phraseItems.length) % phraseItems.length;

        phraseItems.forEach((item, i) => {
            item.classList.toggle('active', i === state.activePhraseIndex);
        });
        phraseDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === state.activePhraseIndex);
        });

        const stage = document.getElementById('large-rotating-stage');
        if (stage) {
            const rect = stage.getBoundingClientRect();
            spawnConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
        }
    }

    const prevPhraseBtn = document.getElementById('prev-phrase-btn');
    const nextPhraseBtn = document.getElementById('next-phrase-btn');

    if (prevPhraseBtn && nextPhraseBtn) {
        prevPhraseBtn.addEventListener('click', () => {
            setPhraseIndex(state.activePhraseIndex - 1);
            playSoundPop();
        });
        nextPhraseBtn.addEventListener('click', () => {
            setPhraseIndex(state.activePhraseIndex + 1);
            playSoundPop();
        });
        phraseDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.idx);
                setPhraseIndex(idx);
                playSoundPop();
            });
        });
    }

    // Auto rotate showcase every 6.5s when on chapter 8
    setInterval(() => {
        if (state.currentChapter === 8) {
            setPhraseIndex(state.activePhraseIndex + 1);
        }
    }, 6500);

    // ==========================================
    // 12. INTERACTIVE BALLOON BLAST SCENE ENGINE
    // ==========================================
    const secretWishes = [
        "Happy Birthday Ansoya! You have my whole heart ❤️",
        "Happy Birthday My Ankuuu! May your year be as cute as you 💖",
        "Happy Birthday Betu (Ansoya)! Sending you a million hugs 🥰",
        "My Everything Ansoya (Ankuuu)! You mean the world to me ♾️",
        "Wishing my favorite person Ansoya infinite joy and laughter 🌟",
        "Ankuuu, you are my sunshine on every single day ☀️",
        "Ansoya, I love you more than words can ever express 💖",
        "Every moment spent with you, Ankuuu, is pure magic 🌸",
        "Happy Birthday Beautiful Ansoya! Shine bright always ✨",
        "Forever & Always Yours, My Ansoya (Ankuuu) ❤️"
    ];

    let balloonWishIndex = 0;

    function initBalloonScene() {
        const stage = document.getElementById('balloon-stage');
        if (!stage || stage.querySelectorAll('.floating-balloon').length > 0) return;
        spawnBalloons(10);
    }

    function spawnBalloons(count = 10) {
        const stage = document.getElementById('balloon-stage');
        if (!stage) return;

        const instr = stage.querySelector('.stage-instructions');
        if (instr) instr.remove();

        const colors = [
            'linear-gradient(135deg, #ff4d6d, #ff85a1)',
            'linear-gradient(135deg, #ffd700, #ff9e00)',
            'linear-gradient(135deg, #c77dff, #7b2cbf)',
            'linear-gradient(135deg, #4ea8de, #5e60ce)',
            'linear-gradient(135deg, #ff6b6b, #ff8e72)',
            'linear-gradient(135deg, #f72585, #7209b7)',
            'linear-gradient(135deg, #3a0ca3, #4cc9f0)'
        ];

        const icons = ['🎈', '💖', '🎁', '✨', '🎂', '💕', '⭐'];

        for (let i = 0; i < count; i++) {
            const balloon = document.createElement('div');
            balloon.className = 'floating-balloon';

            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const randomIcon = icons[Math.floor(Math.random() * icons.length)];
            const size = Math.floor(Math.random() * 25) + 65;
            const leftPercent = Math.floor(Math.random() * 85) + 5;
            const duration = (Math.random() * 5 + 8).toFixed(1);
            const delay = (Math.random() * 2).toFixed(1);

            balloon.style.background = randomColor;
            balloon.style.width = `${size}px`;
            balloon.style.height = `${size * 1.25}px`;
            balloon.style.left = `${leftPercent}%`;
            balloon.style.animationDuration = `${duration}s`;
            balloon.style.animationDelay = `${delay}s`;

            balloon.innerHTML = `
                <div class="balloon-gloss"></div>
                <span class="balloon-emoji">${randomIcon}</span>
                <div class="balloon-string"></div>
            `;

            balloon.addEventListener('click', (e) => {
                e.stopPropagation();
                popBalloon(balloon);
            });

            stage.appendChild(balloon);
        }
    }

    function popBalloon(balloon) {
        if (!balloon || balloon.classList.contains('popping')) return;

        balloon.classList.add('popping');
        const rect = balloon.getBoundingClientRect();
        
        playSoundPop();
        spawnConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);

        state.balloonPopCount++;
        const popCounter = document.getElementById('balloon-pop-count');
        if (popCounter) popCounter.textContent = `${state.balloonPopCount} 🎈`;

        const wish = secretWishes[balloonWishIndex % secretWishes.length];
        balloonWishIndex++;

        if (state.wishesFoundCount < secretWishes.length) {
            state.wishesFoundCount++;
            const wishesCounter = document.getElementById('wishes-found-count');
            if (wishesCounter) wishesCounter.textContent = `${state.wishesFoundCount} / ${secretWishes.length} 💌`;
        }

        showBalloonToastWish(wish);

        setTimeout(() => {
            if (balloon.parentNode) balloon.parentNode.removeChild(balloon);
        }, 300);
    }

    function showBalloonToastWish(msg) {
        const toast = document.getElementById('balloon-wish-toast');
        const toastMsg = document.getElementById('toast-msg');
        if (!toast || !toastMsg) return;

        toastMsg.textContent = `"${msg}"`;
        toast.classList.remove('hidden');
        toast.classList.add('show-toast');

        playSoundChime();

        setTimeout(() => {
            toast.classList.remove('show-toast');
            setTimeout(() => toast.classList.add('hidden'), 400);
        }, 4800);
    }

    function blastAllBalloons() {
        const balloons = document.querySelectorAll('.floating-balloon:not(.popping)');
        if (!balloons.length) {
            spawnBalloons(12);
            setTimeout(blastAllBalloons, 300);
            return;
        }

        balloons.forEach((balloon, idx) => {
            setTimeout(() => {
                popBalloon(balloon);
            }, idx * 120);
        });

        setTimeout(() => {
            spawnConfettiBurst(window.innerWidth / 2, window.innerHeight / 3, 120);
            playSoundChime();
        }, balloons.length * 120 + 200);
    }

    const spawnBtn = document.getElementById('spawn-balloons-btn');
    const blastBtn = document.getElementById('blast-all-btn');
    const resetBtn = document.getElementById('reset-balloons-btn');

    if (spawnBtn) spawnBtn.addEventListener('click', () => { spawnBalloons(10); playSoundPop(); });
    if (blastBtn) blastBtn.addEventListener('click', () => blastAllBalloons());
    if (resetBtn) resetBtn.addEventListener('click', () => {
        const stage = document.getElementById('balloon-stage');
        if (stage) stage.innerHTML = '';
        spawnBalloons(8);
        playSoundPop();
    });

    // ==========================================
    // 12. PAGE 9 — SURPRISE GIFT BOX
    // ==========================================
    const giftBox = document.getElementById('interactive-gift-box');
    const openGiftBtn = document.getElementById('open-gift-btn');
    const revealedCard = document.getElementById('revealed-surprise-card');
    const giftHamperPhoto = document.getElementById('gift-hamper-photo');

    openGiftBtn.addEventListener('click', () => {
        giftBox.classList.add('open');
        openGiftBtn.classList.add('hidden');
        playSoundChime();
        spawnConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 120);

        setTimeout(() => {
            const cardToReveal = document.getElementById('revealed-surprise-card');
            if (cardToReveal) {
                cardToReveal.classList.remove('hidden');
            }
        }, 600);
    });

    if (giftHamperPhoto) {
        giftHamperPhoto.addEventListener('click', (e) => {
            const rect = giftHamperPhoto.getBoundingClientRect();
            if (lightboxImg) lightboxImg.src = 'assets/images/birthday_gift_box.jpg';
            if (lightboxTitle) lightboxTitle.textContent = 'Luxury Birthday Gift Hamper 🎁❤️';
            if (lightboxDate) lightboxDate.textContent = 'Curated with Love for Ansoya (Ankuuu)';
            if (lightboxQuote) lightboxQuote.textContent = '“You deserve all the sparkle, elegance, and sweetness in the world!”';
            if (lightboxDesc) lightboxDesc.textContent = 'Your special gift box includes: Natural 2-minute press-on nail art set, 12-month birthstone stud earrings display card, golden butterfly pendant necklace with matching pearl earrings, aesthetic bow hair claw clip, and silky satin scrunchie!';
            if (lightboxCountBadge) lightboxCountBadge.textContent = 'Special Gift 🎁';
            
            lightboxModal.classList.add('active');
            playSoundChime();
            spawnConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);
        });
    }

    // ==========================================
    // 13. PAGE 10 — CINEMATIC TYPEWRITER & REPLAY
    // ==========================================
    let typewriterTimeouts = [];

    function clearTypewriterTimeouts() {
        typewriterTimeouts.forEach(t => clearTimeout(t));
        typewriterTimeouts = [];
    }

    function revealPage10FinalWish() {
        clearTypewriterTimeouts();
        
        const lines = document.querySelectorAll('.typewriter-line');
        lines.forEach(line => line.classList.add('show'));

        const finalGrandReveal = document.getElementById('final-grand-reveal');
        if (finalGrandReveal) {
            finalGrandReveal.classList.remove('hidden');
        }

        const skipBtn = document.getElementById('skip-typewriter-btn');
        if (skipBtn) skipBtn.classList.add('hidden');

        spawnConfettiBurst(window.innerWidth / 2, window.innerHeight / 3, 150);
        playSoundChime();
    }

    function initTypewriterSequence() {
        clearTypewriterTimeouts();

        const lines = document.querySelectorAll('.typewriter-line');
        lines.forEach(line => line.classList.remove('show'));

        const finalGrandReveal = document.getElementById('final-grand-reveal');
        if (finalGrandReveal) finalGrandReveal.classList.add('hidden');

        const skipBtn = document.getElementById('skip-typewriter-btn');
        if (skipBtn) skipBtn.classList.remove('hidden');

        lines.forEach((line) => {
            const delay = parseInt(line.dataset.delay || 500);
            const t = setTimeout(() => {
                line.classList.add('show');
                playSoundPop();
            }, delay);
            typewriterTimeouts.push(t);
        });

        const revealTimeout = setTimeout(() => {
            revealPage10FinalWish();
        }, 12500);

        typewriterTimeouts.push(revealTimeout);
    }

    const skipTypewriterBtn = document.getElementById('skip-typewriter-btn');
    if (skipTypewriterBtn) {
        skipTypewriterBtn.addEventListener('click', () => {
            revealPage10FinalWish();
        });
    }

    document.getElementById('replay-story-btn').addEventListener('click', () => {
        goToChapter(1);
    });

    document.getElementById('fireworks-btn').addEventListener('click', () => {
        spawnConfettiBurst(window.innerWidth / 4, window.innerHeight / 2, 80);
        spawnConfettiBurst((window.innerWidth / 4) * 3, window.innerHeight / 2, 80);
        playSoundChime();
    });



    // ==========================================
    // 15. MULTIPLE HOVER EFFECTS & CURSOR TRAIL
    // ==========================================
    
    // A. Floating Heart Cursor Trail
    let lastTrailTime = 0;
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTrailTime < 60) return;
        lastTrailTime = now;
        createCursorParticle(e.clientX, e.clientY);
    });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            createCursorParticle(e.touches[0].clientX, e.touches[0].clientY);
        }
    });

    function createCursorParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'cursor-trail-particle';
        const symbols = ['❤️', '✨', '💖', '⭐', '🌸', '💫'];
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.fontSize = `${Math.random() * 10 + 12}px`;
        
        document.body.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, 800);
    }

    // B. 3D Perspective Tilt Effect on Glass Cards
    const tiltableCards = document.querySelectorAll('.glass-card, .polaroid-card, .reason-card, .bucket-card, .timeline-card');

    tiltableCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });


    // ==========================================
    // 16. FEATURE 1: SECRET EASTER EGG SYSTEM ❤️
    // ==========================================
    const eggModal = document.getElementById('easter-egg-modal');
    const closeEggBtn = document.getElementById('close-egg-modal');
    const claimEggBtn = document.getElementById('claim-egg-btn');

    document.querySelectorAll('.secret-easter-egg').forEach(egg => {
        egg.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = egg.getBoundingClientRect();
            spawnConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
            playSoundChime();
            
            if (eggModal) eggModal.classList.add('active');
        });
    });

    if (closeEggBtn) closeEggBtn.addEventListener('click', () => {
        if (eggModal) eggModal.classList.remove('active');
    });

    if (claimEggBtn) claimEggBtn.addEventListener('click', () => {
        spawnConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
        playSoundChime();
        if (eggModal) eggModal.classList.remove('active');
    });

    if (eggModal) {
        eggModal.addEventListener('click', (e) => {
            if (e.target === eggModal) eggModal.classList.remove('active');
        });
    }

    // ==========================================
    // 17. FEATURE 2: ELEGANT MINI MUSIC PLAYER 🎵
    // ==========================================
    const miniPlayBtn = document.getElementById('mini-play-btn');

    if (miniPlayBtn) {
        miniPlayBtn.addEventListener('click', () => {
            toggleMusic();
        });
    }

    // ==========================================
    // 18. FEATURE 4: CINEMATIC NAME REVEAL ✨
    // ==========================================
    function runNameRevealSequence() {
        const letters = document.querySelectorAll('.reveal-letter');
        const mergedName = document.getElementById('final-merged-name');
        const wrapper = document.getElementById('name-letters-wrapper');

        if (wrapper) wrapper.classList.remove('merged');
        if (mergedName) mergedName.classList.add('hidden');

        letters.forEach((letter, idx) => {
            letter.classList.remove('revealed');
            setTimeout(() => {
                letter.classList.add('revealed');
                playSoundPop();
            }, (idx + 1) * 650);
        });

        const totalDelay = (letters.length + 1) * 650 + 600;
        setTimeout(() => {
            if (wrapper) wrapper.classList.add('merged');
            if (mergedName) mergedName.classList.remove('hidden');
            spawnConfettiBurst(window.innerWidth / 2, window.innerHeight / 3, 70);
            playSoundChime();
        }, totalDelay);
    }

    const replayNameBtn = document.getElementById('replay-name-btn');
    if (replayNameBtn) {
        replayNameBtn.addEventListener('click', () => {
            runNameRevealSequence();
        });
    }

    // Automatically trigger name reveal when opening Page 1 surprise card
    if (openSurpriseBtn) {
        openSurpriseBtn.addEventListener('click', () => {
            setTimeout(runNameRevealSequence, 400);
        });
    }

    // Trigger initial reveal if page 1 is active on load
    if (state.currentChapter === 1) {
        setTimeout(runNameRevealSequence, 800);
    }

    // ==========================================
    // 19. FEATURE 5: MEMORY UNLOCK SYSTEM 🔐
    // ==========================================
    document.querySelectorAll('.unlock-memory-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.dataset.target;
            const targetCard = document.getElementById(targetId);
            const lockOverlay = targetCard ? targetCard.querySelector('.lock-overlay') : null;
            const lockIcon = lockOverlay ? lockOverlay.querySelector('.lock-icon') : null;

            if (lockOverlay) lockOverlay.classList.add('opening');
            playSoundPop();

            const rect = btn.getBoundingClientRect();
            spawnConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 60);

            setTimeout(() => {
                if (lockIcon) lockIcon.textContent = '🔓';
                playSoundChime();
            }, 600);

            setTimeout(() => {
                if (targetCard) targetCard.classList.add('unlocked');
            }, 1000);
        });
    });

});
