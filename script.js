document.addEventListener('DOMContentLoaded', () => {
    // Mobile nav toggle
    const burger = document.getElementById('burger');
    const navMobile = document.getElementById('navMobile');
    burger.addEventListener('click', () => {
        navMobile.classList.toggle('open');
    });
    // Close on link click
    document.querySelectorAll('.nm-link').forEach(link => {
        link.addEventListener('click', () => navMobile.classList.remove('open'));
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.style.color = link.getAttribute('href') === `#${id}`
                        ? 'var(--gold)' : '';
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    sections.forEach(s => observer.observe(s));

    // Skill bar animation on scroll
    const fills = document.querySelectorAll('.skill-fill');
    const widths = Array.from(fills).map(f => f.style.width);
    fills.forEach(f => f.style.width = '0');
    const skillObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fills.forEach((f, i) => {
                    setTimeout(() => { f.style.transition = 'width 0.8s ease'; f.style.width = widths[i]; }, i * 80);
                });
                skillObs.disconnect();
            }
        });
    }, { threshold: 0.3 });
    const skillSec = document.querySelector('#skills');
    if (skillSec) skillObs.observe(skillSec);
});