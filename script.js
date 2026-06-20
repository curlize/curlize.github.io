// ── HERO INTERACTIVE CANVAS ──
(function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, mouse = { x: -9999, y: -9999 }, trail = [];
    const PARTICLE_COUNT = 160;
    let particles = [];

    const ORBS = [
        { x: 0.72, y: 0.18, r: 0.40, color: [201,168,76],  speed: 0.00018, phase: 0   },
        { x: 0.18, y: 0.72, r: 0.45, color: [30, 58, 95],  speed: 0.00013, phase: 2.1 },
        { x: 0.50, y: 0.38, r: 0.32, color: [44, 82,130],  speed: 0.00022, phase: 4.3 },
        { x: 0.88, y: 0.80, r: 0.28, color: [13, 27, 42],  speed: 0.00016, phase: 1.1 },
        { x: 0.10, y: 0.22, r: 0.24, color: [201,168,76],  speed: 0.00019, phase: 3.5 },
    ];

    function resize() {
        W = canvas.offsetWidth;
        H = canvas.offsetHeight;
        canvas.width  = W * devicePixelRatio;
        canvas.height = H * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);
        initParticles();
    }

    function rand(min, max) { return min + Math.random() * (max - min); }

    function initParticles() {
        particles = Array.from({ length: PARTICLE_COUNT }, () => ({
            x:    rand(0, W),
            y:    rand(0, H),
            ox:   0, oy: 0,
            vx:   rand(-0.12, 0.12),
            vy:   rand(-0.10, 0.10),
            size: rand(1.2, 3.2),
            alpha: rand(0.18, 0.55),
            hue:  Math.random() < 0.35 ? 'gold' : 'blue',
            speed: rand(0.6, 1.4),
        }));
        particles.forEach(p => { p.ox = p.x; p.oy = p.y; });
    }

    window.addEventListener('resize', resize);
    resize();

    const hero = canvas.parentElement;
    hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        trail.push({ x: mouse.x, y: mouse.y, age: 0 });
        if (trail.length > 28) trail.shift();
    });
    hero.addEventListener('mouseleave', () => {
        mouse.x = -9999; mouse.y = -9999;
        trail = [];
    });

    function drawOrbs(t) {
        for (const orb of ORBS) {
            const fx = Math.sin(t * orb.speed + orb.phase) * 0.06;
            const fy = Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.05;
            let cx = (orb.x + fx) * W;
            let cy = (orb.y + fy) * H;

            const dx = cx - mouse.x, dy = cy - mouse.y;
            const dist = Math.hypot(dx, dy);
            const pr = Math.min(W, H) * 0.22;
            if (dist < pr && dist > 0) {
                const push = (1 - dist / pr) * 70;
                cx += (dx / dist) * push;
                cy += (dy / dist) * push;
            }

            const radius = orb.r * Math.min(W, H);
            const [r, g, b] = orb.color;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            grad.addColorStop(0,   `rgba(${r},${g},${b},0.20)`);
            grad.addColorStop(0.4, `rgba(${r},${g},${b},0.09)`);
            grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    function drawTrail() {
        if (trail.length < 2) return;
        for (let i = 1; i < trail.length; i++) {
            const b = trail[i];
            const progress = i / trail.length;
            const alpha = progress * 0.55;
            const radius = progress * 38;
            const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
            grad.addColorStop(0,   `rgba(201,168,76,${alpha})`);
            grad.addColorStop(0.5, `rgba(201,168,76,${alpha * 0.3})`);
            grad.addColorStop(1,   `rgba(201,168,76,0)`);
            ctx.beginPath();
            ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }

    function drawCursorGlow() {
        if (mouse.x < 0) return;
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 110);
        grad.addColorStop(0,   'rgba(201,168,76,0.18)');
        grad.addColorStop(0.4, 'rgba(201,168,76,0.07)');
        grad.addColorStop(1,   'rgba(201,168,76,0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 110, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    function drawParticles() {
        const ATTRACT_R  = 160;
        const ATTRACT_STR = 0.04;
        const MAX_DRIFT  = 80;

        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;

            const homeDx = p.ox - p.x, homeDy = p.oy - p.y;
            const homeDist = Math.hypot(homeDx, homeDy);
            if (homeDist > MAX_DRIFT) {
                p.vx += homeDx * 0.002;
                p.vy += homeDy * 0.002;
            }

            p.vx *= 0.995;
            p.vy *= 0.995;

            if (mouse.x > 0) {
                const dx = mouse.x - p.x, dy = mouse.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < ATTRACT_R && dist > 1) {
                    const force = (1 - dist / ATTRACT_R) * ATTRACT_STR * p.speed;
                    p.vx += (dx / dist) * force + (-dy / dist) * force * 0.25;
                    p.vy += (dy / dist) * force + ( dx / dist) * force * 0.25;
                }
            }

            if (p.x < -10) p.x = W + 10;
            if (p.x > W + 10) p.x = -10;
            if (p.y < -10) p.y = H + 10;
            if (p.y > H + 10) p.y = -10;

            const isNearMouse = mouse.x > 0 && Math.hypot(mouse.x - p.x, mouse.y - p.y) < ATTRACT_R;
            const boost = isNearMouse ? 1.8 : 1;
            const color = p.hue === 'gold'
                ? `rgba(201,168,76,${p.alpha * boost})`
                : `rgba(150,180,220,${p.alpha * boost * 0.7})`;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (isNearMouse ? 1.3 : 1), 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < 90) {
                    const alpha = (1 - d / 90) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(201,168,76,${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function draw(t) {
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = '#0D1B2A';
        ctx.fillRect(0, 0, W, H);

        drawOrbs(t);
        drawTrail();
        drawCursorGlow();
        drawParticles();

        const vig = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.9);
        vig.addColorStop(0,   'rgba(0,0,0,0)');
        vig.addColorStop(1,   'rgba(0,0,0,0.60)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();

document.addEventListener('DOMContentLoaded', () => {

    // ── Active nav link on scroll ──
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    sections.forEach(s => navObserver.observe(s));

    // Collapse the mobile navbar after a link is tapped
    const navCollapseEl = document.getElementById('navMain');
    if (navCollapseEl && window.bootstrap) {
        const bsCollapse = window.bootstrap.Collapse.getOrCreateInstance(navCollapseEl, { toggle: false });
        navCollapseEl.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => bsCollapse.hide());
        });
    }

    // ── Scroll reveal ──
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        const revealObs = new IntersectionObserver((entries) => {
            const hitting = entries.filter(e => e.isIntersecting);
            hitting
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                .forEach((e, i) => {
                    setTimeout(() => {
                        e.target.classList.add('visible');
                        revealObs.unobserve(e.target);
                    }, i * 90);
                });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(el => revealObs.observe(el));
    }

    // ── 3-D tilt on about photo card ──
    const tilt = document.getElementById('aboutTilt');
    if (tilt) {
        tilt.addEventListener('mousemove', e => {
            const { left, top, width, height } = tilt.getBoundingClientRect();
            const x = (e.clientX - left) / width  - 0.5;
            const y = (e.clientY - top)  / height - 0.5;
            tilt.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg) scale(1.02)`;
        });
        tilt.addEventListener('mouseleave', () => {
            tilt.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
        });
    }

    // ── Floating contact dock ──
    const dockEl = document.getElementById('dock');
    if (dockEl) {
        const toggle = document.getElementById('dockToggle');
        const panel = document.getElementById('dockPanel');

        function openDock() {
            dockEl.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
        }
        function closeDock() {
            dockEl.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dockEl.classList.contains('open') ? closeDock() : openDock();
        });

        document.addEventListener('click', (e) => {
            if (!dockEl.contains(e.target)) closeDock();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDock();
        });
    }

});