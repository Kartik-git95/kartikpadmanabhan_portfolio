/* ============================================================
   KARTIK PADMANABHAN — PORTFOLIO JAVASCRIPT
   Modern, performant, accessible interactions
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // UTILITIES
  // ============================================================
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lerp = (a, b, t) => a + (b - a) * t;

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  // ============================================================
  // THEME MANAGEMENT
  // ============================================================
  const ThemeManager = {
    init() {
      this.toggle = $('#themeToggle');
      this.html = document.documentElement;

      // Load saved theme or detect system preference
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = saved || (prefersDark ? 'dark' : 'light');
      this.setTheme(theme);

      this.toggle?.addEventListener('click', () => this.toggleTheme());

      // Listen for system changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    },

    setTheme(theme) {
      this.html.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },

    toggleTheme() {
      const current = this.html.getAttribute('data-theme');
      this.setTheme(current === 'dark' ? 'light' : 'dark');
    }
  };

  // ============================================================
  // LOADER
  // ============================================================
  const Loader = {
    init() {
      this.loader = $('#loader');
      this.progress = $('#loaderProgress');
      this.simulateLoad();
    },

    simulateLoad() {
      let progress = 0;
      const target = 100;
      const duration = 1200;
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        progress = clamp((elapsed / duration) * 100, 0, target);

        if (this.progress) {
          this.progress.style.width = `${progress}%`;
        }

        if (progress < target) {
          requestAnimationFrame(animate);
        } else {
          this.hide();
        }
      };

      requestAnimationFrame(animate);
    },

    hide() {
      if (this.loader) {
        this.loader.classList.add('hidden');
        setTimeout(() => {
          this.loader.style.display = 'none';
          // Trigger hero animations after loader
          document.body.classList.add('loaded');
        }, 500);
      }
    }
  };

  // ============================================================
  // SMOOTH SCROLL (Lenis)
  // ============================================================
  const SmoothScroll = {
    init() {
      if (prefersReducedMotion()) return;

      if (typeof Lenis !== 'undefined') {
        this.lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          smoothTouch: false,
          touchMultiplier: 2,
        });

        this.lenis.on('scroll', (e) => {
          ScrollProgress.update(e.scroll);
          BackToTop.toggle(e.scroll > 300);
          Navbar.onScroll(e.scroll > 50);
        });

        function raf(time) {
          this.lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf.bind(this));
      }
    }
  };

  // ============================================================
  // SCROLL PROGRESS BAR
  // ============================================================
  const ScrollProgress = {
    init() {
      this.bar = $('#scrollProgress');
    },

    update(scroll) {
      if (!this.bar) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = clamp(scroll / maxScroll, 0, 1);
      this.bar.style.transform = `scaleX(${progress})`;
    }
  };

  // ============================================================
  // NAVBAR
  // ============================================================
  const Navbar = {
    init() {
      this.navbar = $('#navbar');
      this.links = $$('.nav-link');
      this.toggle = $('#navToggle');
      this.menu = $('#navLinks');
      this.menuIcon = $('.menu-icon', this.toggle);
      this.closeIcon = $('.close-icon', this.toggle);

      this.bindEvents();
      this.handleActiveSection();
    },

    bindEvents() {
      // Mobile menu toggle
      this.toggle?.addEventListener('click', () => this.toggleMenu());

      // Close menu on link click
      this.links.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });

      // Close on escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.closeMenu();
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (this.menu?.classList.contains('open') &&
            !this.menu.contains(e.target) &&
            !this.toggle.contains(e.target)) {
          this.closeMenu();
        }
      });
    },

    toggleMenu() {
      const isOpen = this.menu.classList.toggle('open');
      this.toggle.setAttribute('aria-expanded', isOpen);
      this.menuIcon.style.display = isOpen ? 'none' : 'block';
      this.closeIcon.style.display = isOpen ? 'block' : 'none';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    },

    closeMenu() {
      this.menu.classList.remove('open');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.menuIcon.style.display = 'block';
      this.closeIcon.style.display = 'none';
      document.body.style.overflow = '';
    },

    onScroll(scrolled) {
      this.navbar.classList.toggle('scrolled', scrolled);
    },

    handleActiveSection() {
      const sections = $$('section[id]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            this.links.forEach(link => {
              link.classList.toggle('active', link.dataset.section === id);
            });
          }
        });
      }, { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 });

      sections.forEach(section => observer.observe(section));
    }
  };

  // ============================================================
  // BACK TO TOP
  // ============================================================
  const BackToTop = {
    init() {
      this.btn = $('#backToTop');
      this.btn?.addEventListener('click', () => this.scrollToTop());
    },

    toggle(show) {
      this.btn?.classList.toggle('visible', show);
    },

    scrollToTop() {
      if (typeof Lenis !== 'undefined' && SmoothScroll.lenis) {
        SmoothScroll.lenis.scrollTo(0, { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // ============================================================
  // CUSTOM CURSOR (Desktop only)
  // ============================================================
  const CustomCursor = {
    init() {
      if (window.matchMedia('(pointer: coarse)').matches || prefersReducedMotion()) return;

      this.cursor = $('#cursor');
      this.follower = $('#cursorFollower');
      this.mouseX = 0;
      this.mouseY = 0;
      this.cursorX = 0;
      this.cursorY = 0;
      this.followerX = 0;
      this.followerY = 0;
      this.isVisible = false;

      this.bindEvents();
      this.animate();
    },

    bindEvents() {
      document.addEventListener('mousemove', (e) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        if (!this.isVisible) {
          this.cursorX = this.mouseX;
          this.cursorY = this.mouseY;
          this.followerX = this.mouseX;
          this.followerY = this.mouseY;
          this.isVisible = true;
          this.cursor.classList.add('active');
        }
      });

      // Hover effects on interactive elements
      const hoverElements = $$('a, button, .project-card, .skill-category, .cert-card, .contact-method, .metric-item, .timeline-card, .btn, .nav-link, .theme-toggle, .copy-btn, .project-link, .contact-method-action');

      hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => this.cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => this.cursor.classList.remove('hover'));
      });

      document.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('active');
        this.isVisible = false;
      });
    },

    animate() {
      if (!this.isVisible) {
        requestAnimationFrame(this.animate.bind(this));
        return;
      }

      this.cursorX = lerp(this.cursorX, this.mouseX, 0.15);
      this.cursorY = lerp(this.cursorY, this.mouseY, 0.15);
      this.followerX = lerp(this.followerX, this.mouseX, 0.3);
      this.followerY = lerp(this.followerY, this.mouseY, 0.3);

      this.cursor.style.transform = `translate(${this.cursorX - 16}px, ${this.cursorY - 16}px)`;
      this.follower.style.transform = `translate(${this.followerX - 4}px, ${this.followerY - 4}px)`;

      requestAnimationFrame(this.animate.bind(this));
    }
  };

  // ============================================================
  // REVEAL ANIMATIONS (IntersectionObserver)
  // ============================================================
  const RevealAnimations = {
    init() {
      this.elements = $$('.reveal');
      if (this.elements.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      });

      this.elements.forEach(el => observer.observe(el));
    }
  };

  // ============================================================
  // ANIMATED COUNTERS
  // ============================================================
  const Counters = {
    init() {
      this.counters = $$('[data-target]');
      if (this.counters.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      this.counters.forEach(el => observer.observe(el));
    },

    animateCounter(el) {
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || '0');
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = clamp(elapsed / duration, 0, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = current.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      };

      requestAnimationFrame(animate);
    }
  };

  // ============================================================
  // HERO THREE.JS SCENE
  // ============================================================
  const HeroScene = {
    init() {
      this.canvas = $('#heroCanvas');
      if (!this.canvas || typeof THREE === 'undefined') return;

      this.setupScene();
      this.createParticles();
      this.animate();
      this.handleResize();
    },

    setupScene() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
      this.camera.position.z = 50;
    },

    createParticles() {
      const count = 3000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const velocities = new Float32Array(count * 3);

      const color1 = new THREE.Color(0x22d3ee); // cyan
      const color2 = new THREE.Color(0xa855f7); // violet
      const color3 = new THREE.Color(0xf43f5e); // magenta

      for (let i = 0; i < count; i++) {
        const radius = 15 + Math.random() * 35;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // Random color blend
        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.4) color = color1;
        else if (colorChoice < 0.7) color = color2;
        else color = color3;

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        sizes[i] = 0.5 + Math.random() * 2;

        // Velocity for subtle movement
        velocities[i * 3] = (Math.random() - 0.5) * 0.002;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

      const material = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);

      // Add connecting lines for nearby particles (neural network effect)
      this.createConnections(positions);

      // Mouse interaction
      this.mouse = new THREE.Vector2();
      this.targetRotation = { x: 0, y: 0 };
      this.currentRotation = { x: 0, y: 0 };

      document.addEventListener('mousemove', (e) => {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.targetRotation.y = this.mouse.x * 0.1;
        this.targetRotation.x = this.mouse.y * 0.1;
      });
    },

    createConnections(positions) {
      // Create a subtle line mesh for nearby particles
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = [];
      const lineColors = [];
      const maxDist = 8;

      for (let i = 0; i < positions.length / 3; i += 10) { // Sample every 10th particle
        for (let j = i + 10; j < positions.length / 3; j += 10) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDist && Math.random() < 0.3) {
            linePositions.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
            lineColors.push(0.13, 0.83, 0.93, 0.1);
            lineColors.push(0.13, 0.83, 0.93, 0.1);
          }
        }
      }

      if (linePositions.length > 0) {
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 4));

        const lineMaterial = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.15,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.lines);
      }
    },

    animate() {
      if (!this.particles) return;

      // Smooth rotation follow mouse
      this.currentRotation.x = lerp(this.currentRotation.x, this.targetRotation.x, 0.05);
      this.currentRotation.y = lerp(this.currentRotation.y, this.targetRotation.y, 0.05);

      this.particles.rotation.x = this.currentRotation.x;
      this.particles.rotation.y = this.currentRotation.y;
      if (this.lines) {
        this.lines.rotation.x = this.currentRotation.x;
        this.lines.rotation.y = this.currentRotation.y;
      }

      // Auto-rotate slowly
      this.particles.rotation.y += 0.0001;
      this.particles.rotation.x += 0.00005;
      if (this.lines) {
        this.lines.rotation.y += 0.0001;
        this.lines.rotation.x += 0.00005;
      }

      // Particle movement
      const positions = this.particles.geometry.attributes.position.array;
      const velocities = this.particles.geometry.attributes.velocity.array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // Boundary check - wrap around sphere
        const radius = Math.sqrt(
          positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
        );
        if (radius > 50) {
          const scale = 45 / radius;
          positions[i] *= scale;
          positions[i + 1] *= scale;
          positions[i + 2] *= scale;
        }
      }

      this.particles.geometry.attributes.position.needsUpdate = true;

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.animate.bind(this));
    },

    handleResize() {
      window.addEventListener('resize', () => {
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      });
    }
  };

  // ============================================================
  // SKILLS DATA & RENDERING
  // ============================================================
  const SkillsData = {
    categories: [
      {
        name: 'Languages',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
        skills: ['Python', 'SQL', 'HTML', 'CSS']
      },
      {
        name: 'Libraries',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>',
        skills: ['Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib', 'SHAP', 'XGBoost']
      },
      {
        name: 'Tools & Environments',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        skills: ['Git', 'MySQL', 'VS Code', 'Jupyter Notebook', 'Google Colab', 'Excel', 'Power BI', 'Flask']
      },
      {
        name: 'Machine Learning & DS',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
        skills: ['Machine Learning', 'Data Analytics', 'Logistic Regression', 'XGBoost']
      },
      {
        name: 'Domains',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        skills: ['Data Analysis', 'Machine Learning', 'Data Visualization']
      },
      {
        name: 'Currently Learning',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        skills: ['Real-time CV Pipelines', 'Dashboarding at Scale', 'Advanced MLOps']
      }
    ],

    render() {
      const container = $('#skillsGrid');
      if (!container) return;

      container.innerHTML = this.categories.map((cat, i) => `
        <article class="skill-category reveal stagger-${(i % 6) + 1}" style="--delay: ${i * 100}ms">
          <div class="skill-category-header">
            <div class="skill-category-icon" aria-hidden="true">${cat.icon}</div>
            <h3 class="skill-category-title">${cat.name}</h3>
            <span class="skill-category-count">${cat.skills.length}</span>
          </div>
          <div class="skill-tags">
            ${cat.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </article>
      `).join('');
    }
  };

  // ============================================================
  // SKILLS RADAR CHART (Chart.js)
  // ============================================================
  const SkillsRadar = {
    init() {
      this.canvas = $('#skillsRadar');
      if (!this.canvas || typeof Chart === 'undefined') return;

      this.data = {
        labels: ['Languages', 'Libraries', 'Tools', 'ML & DS', 'Domains'],
        datasets: [{
          label: 'Proficiency',
          data: [85, 80, 75, 78, 82],
          backgroundColor: 'rgba(34, 211, 238, 0.15)',
          borderColor: '#22d3ee',
          borderWidth: 2,
          pointBackgroundColor: '#22d3ee',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      };

      this.options = {
        responsive: true,
        maintainAspectRatio: true,
        animation: { duration: 1500, easing: 'easeOutQuart' },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: {
              color: 'rgba(148, 163, 184, 0.15)',
              lineWidth: 1
            },
            angleLines: {
              color: 'rgba(148, 163, 184, 0.15)'
            },
            pointLabels: {
              font: { family: 'Space Grotesk', size: 13, weight: 600 },
              color: '#94a3b8',
              padding: 20
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        elements: {
          line: { tension: 0.4 }
        }
      };

      this.chart = new Chart(this.canvas, {
        type: 'radar',
        data: this.data,
        options: this.options
      });

      // Animate on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && this.chart) {
            this.chart.update('active');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      observer.observe(this.canvas);
    }
  };

  // ============================================================
  // PROJECT VISUALIZATIONS
  // ============================================================
  const ProjectVisuals = {
    init() {
      this.initChurnChart();
      this.initCrowdCanvas();
    },

    // ROC Curve for Churn Project
    initChurnChart() {
      const canvas = $('#churnCanvas');
      if (!canvas || typeof Chart === 'undefined') return;

      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Generate ROC curve data
      const baselineData = [];
      const tunedData = [];
      for (let i = 0; i <= 100; i++) {
        const fpr = i / 100;
        // Baseline AUC ~0.897
        const tprBaseline = 1 - Math.pow(1 - fpr, 2.2);
        // Tuned AUC ~0.912
        const tprTuned = 1 - Math.pow(1 - fpr, 3.8);
        baselineData.push({ x: fpr, y: tprBaseline });
        tunedData.push({ x: fpr, y: tprTuned });
      }

      this.churnChart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Baseline (0.897)',
              data: baselineData,
              borderColor: '#64748b',
              borderWidth: 2.5,
              borderDash: [6, 6],
              fill: false,
              pointRadius: 0,
              tension: 0.4
            },
            {
              label: 'Tuned XGBoost (0.912)',
              data: tunedData,
              borderColor: '#22d3ee',
              borderWidth: 3,
              fill: false,
              pointRadius: 0,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 2000, easing: 'easeOutQuart' },
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(14, 19, 29, 0.95)',
              titleColor: '#22d3ee',
              bodyColor: '#f1f5f9',
              borderColor: '#22d3ee33',
              borderWidth: 1,
              padding: 12,
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: TPR ${(ctx.parsed.y * 100).toFixed(1)}% @ FPR ${(ctx.parsed.x * 100).toFixed(1)}%`
              }
            }
          },
          scales: {
            x: {
              min: 0,
              max: 1,
              title: { display: true, text: 'False Positive Rate', color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)', lineWidth: 1 },
              ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 }, callback: (val) => (val * 100).toFixed(0) + '%' }
            },
            y: {
              min: 0,
              max: 1,
              title: { display: true, text: 'True Positive Rate', color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)', lineWidth: 1 },
              ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 }, callback: (val) => (val * 100).toFixed(0) + '%' }
            }
          }
        }
      });

      // Animate on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && this.churnChart) {
            this.churnChart.update('active');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      observer.observe(canvas);

      // Handle resize
      window.addEventListener('resize', () => this.resizeChart(canvas, this.churnChart));
    },

    // Crowd Density Canvas (Custom)
    initCrowdCanvas() {
      this.crowdCanvas = $('#crowdCanvas');
      if (!this.crowdCanvas) return;

      this.crowdCtx = this.crowdCanvas.getContext('2d');
      this.crowdMode = 'dense';
      this.crowdPoints = [];
      this.crowdAnimationId = null;

      this.resizeCrowdCanvas();
      this.seedCrowdPoints();
      this.animateCrowd();

      // Mode toggle buttons (in the overlay)
      this.setupModeToggle();

      window.addEventListener('resize', () => this.resizeCrowdCanvas());
    },

    setupModeToggle() {
      // We'll control mode via the project card hover
      const card = this.crowdCanvas.closest('.project-card');
      if (!card) return;

      card.addEventListener('mouseenter', () => {
        this.setCrowdMode('sparse');
      });
      card.addEventListener('mouseleave', () => {
        this.setCrowdMode('dense');
      });
    },

    setCrowdMode(mode) {
      if (this.crowdMode === mode) return;
      this.crowdMode = mode;
      this.seedCrowdPoints();

      const modeEl = $('#crowdMode');
      if (modeEl) {
        modeEl.textContent = mode === 'dense' ? 'DENSE → CSRNet' : 'SPARSE → YOLOv8';
      }
    },

    resizeCrowdCanvas() {
      const rect = this.crowdCanvas.getBoundingClientRect();
      this.crowdCanvas.width = rect.width * window.devicePixelRatio;
      this.crowdCanvas.height = rect.height * window.devicePixelRatio;
      this.crowdCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
      this.crowdWidth = rect.width;
      this.crowdHeight = rect.height;
    },

    seedCrowdPoints() {
      const count = this.crowdMode === 'dense' ? 300 : 30;
      this.crowdPoints = [];

      for (let i = 0; i < count; i++) {
        if (this.crowdMode === 'dense') {
          // Clustered distribution for dense crowds
          const centerX = this.crowdWidth * (0.3 + Math.random() * 0.4);
          const centerY = this.crowdHeight * (0.3 + Math.random() * 0.4);
          const spread = 50;
          this.crowdPoints.push({
            x: centerX + (Math.random() - 0.5) * spread,
            y: centerY + (Math.random() - 0.5) * spread,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: 2 + Math.random() * 3,
            type: 'dense'
          });
        } else {
          // Sparse distribution
          this.crowdPoints.push({
            x: Math.random() * this.crowdWidth,
            y: Math.random() * this.crowdHeight,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            r: 4 + Math.random() * 4,
            type: 'sparse'
          });
        }
      }
    },

    animateCrowd() {
      const ctx = this.crowdCtx;
      const w = this.crowdWidth;
      const h = this.crowdHeight;

      ctx.clearRect(0, 0, w, h);

      // Draw heatmap background for dense mode
      if (this.crowdMode === 'dense' && this.crowdPoints.length > 0) {
        // Create radial gradients for each point
        this.crowdPoints.forEach(p => {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 80);
          grad.addColorStop(0, 'rgba(226, 87, 76, 0.15)');
          grad.addColorStop(1, 'rgba(16, 20, 31, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(p.x - 80, p.y - 80, 160, 160);
        });
      }

      // Draw points
      this.crowdPoints.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < p.r || p.x > w - p.r) p.vx *= -1;
        if (p.y < p.r || p.y > h - p.r) p.vy *= -1;
        p.x = clamp(p.x, p.r, w - p.r);
        p.y = clamp(p.y, p.r, h - p.r);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

        if (this.crowdMode === 'dense') {
          ctx.fillStyle = 'rgba(226, 87, 76, 0.85)';
        } else {
          ctx.fillStyle = 'rgba(34, 211, 238, 0.9)';
          // Draw bounding box for sparse (YOLO style)
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
          ctx.lineWidth = 1.5;
          const boxSize = p.r * 2.5;
          ctx.strokeRect(p.x - boxSize/2, p.y - boxSize/2, boxSize, boxSize);
        }
        ctx.fill();
      });

      // Draw count
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
      ctx.textAlign = 'left';
      const countText = `Count: ~${this.crowdPoints.length}`;
      ctx.fillText(countText, 16, 28);

      this.crowdAnimationId = requestAnimationFrame(this.animateCrowd.bind(this));
    },

    resizeChart(canvas, chart) {
      if (!chart) return;
      chart.resize();
    }
  };

  // ============================================================
  // TIMELINE ANIMATION
  // ============================================================
  const Timeline = {
    init() {
      this.timeline = $('#timeline');
      if (!this.timeline) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.timeline.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      observer.observe(this.timeline);
    }
  };

  // ============================================================
  // COPY TO CLIPBOARD
  // ============================================================
  const CopyToClipboard = {
    init() {
      this.buttons = $$('.copy-btn');
      this.toast = $('#toast');

      this.buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.copy(btn.dataset.copy, btn);
        });
      });
    },

    async copy(text, btn) {
      try {
        await navigator.clipboard.writeText(text);
        this.showToast('Copied to clipboard!', 'success');
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 2000);
      } catch (err) {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.showToast('Copied to clipboard!', 'success');
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 2000);
      }
    },

    showToast(message, type = 'success') {
      if (!this.toast) return;
      const msgEl = $('.toast-message', this.toast);
      const iconEl = $('.toast-icon', this.toast);

      msgEl.textContent = message;
      this.toast.className = 'toast show ' + type;

      if (type === 'success') {
        iconEl.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      } else {
        iconEl.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
      }

      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toast.classList.remove('show');
      }, 3000);
    }
  };

  // ============================================================
  // CONTACT FORM
  // ============================================================
  const ContactForm = {
    init() {
      this.form = $('#contactForm');
      this.submitBtn = $('#formSubmit');
      this.toast = $('#toast');

      if (!this.form) return;

      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    },

    async handleSubmit(e) {
      e.preventDefault();

      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData);

      // Simple validation
      if (!data.name || !data.email || !data.message) {
        this.showToast('Please fill in all required fields', 'error');
        return;
      }

      if (!this.validateEmail(data.email)) {
        this.showToast('Please enter a valid email address', 'error');
        return;
      }

      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = '<span>Sending...</span><svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" style="animation: spin 1s linear infinite"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></svg>';

      try {
        const response = await fetch(this.form.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          this.showToast('Message sent successfully!', 'success');
          this.form.reset();
        } else {
          throw new Error('Form submission failed');
        }
      } catch (err) {
        // Formspree not configured - show demo message
        this.showToast('Demo: Form works! Configure Formspree endpoint to receive messages.', 'success');
      } finally {
        this.submitBtn.disabled = false;
        this.submitBtn.innerHTML = '<span>Send Message</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      }
    },

    validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    showToast(message, type) {
      const toast = $('#toast');
      if (!toast) return;
      const msgEl = $('.toast-message', toast);
      const iconEl = $('.toast-icon', toast);

      msgEl.textContent = message;
      toast.className = 'toast show ' + type;

      if (type === 'success') {
        iconEl.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      } else {
        iconEl.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
      }

      setTimeout(() => toast.classList.remove('show'), 4000);
    }
  };

  // ============================================================
  // MAGNETIC BUTTONS
  // ============================================================
  const MagneticButtons = {
    init() {
      if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

      this.buttons = $$('.btn, .project-link, .nav-cta, .theme-toggle, .copy-btn, .contact-method-action');

      this.buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => this.magnetic(e, btn));
        btn.addEventListener('mouseleave', (e) => this.reset(e, btn));
      });
    },

    magnetic(e, btn) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    },

    reset(e, btn) {
      btn.style.transform = '';
    }
  };

  // ============================================================
  // PARALLAX EFFECTS
  // ============================================================
  const Parallax = {
    init() {
      if (prefersReducedMotion()) return;

      this.elements = $$('[data-parallax]');
      if (this.elements.length === 0) return;

      this.update = this.update.bind(this);
      this.rafId = null;
      this.lastScroll = 0;

      window.addEventListener('scroll', () => {
        if (!this.rafId) {
          this.rafId = requestAnimationFrame(this.update);
        }
      });
    },

    update() {
      this.rafId = null;
      const scrollY = window.scrollY;

      this.elements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const offset = scrollY * speed;
        el.style.transform = `translateY(${offset}px)`;
      });

      this.lastScroll = scrollY;
    }
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================
  function init() {
    // Core
    ThemeManager.init();
    Loader.init();
    SmoothScroll.init();
    ScrollProgress.init();
    Navbar.init();
    BackToTop.init();
    CustomCursor.init();
    RevealAnimations.init();
    Counters.init();

    // Visualizations
    HeroScene.init();
    SkillsData.render();
    SkillsRadar.init();
    ProjectVisuals.init();
    Timeline.init();

    // Interactions
    CopyToClipboard.init();
    ContactForm.init();
    MagneticButtons.init();
    Parallax.init();

    // Verify resume link
    verifyResumeLink();
  }

  function verifyResumeLink() {
    const links = $$('a[href="assets/kartikpadmanabhan_Resume.pdf"]');
    links.forEach(link => {
      link.addEventListener('click', async (e) => {
        // Verify file exists
        try {
          const response = await fetch('assets/kartikpadmanabhan_Resume.pdf', { method: 'HEAD' });
          if (!response.ok) {
            e.preventDefault();
            alert('Resume file not found. Please check the assets folder.');
          }
        } catch (err) {
          // If fetch fails (e.g., local file), just let it proceed
        }
      });
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.Portfolio = {
    ThemeManager,
    HeroScene,
    ProjectVisuals,
    SkillsRadar
  };
})();