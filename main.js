import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import * as THREE from 'three';
import { injectSpeedInsights } from '@vercel/speed-insights';

class AgentManager {
  constructor(mainApp) {
    this.mainApp = mainApp;
    this.container = document.querySelector('#agent-manager');
    this.navBtn = document.querySelector('#nav-agents');
    this.closeBtn = document.querySelector('#close-am');
    this.isVisible = false;
    
    this.setupVisuals();
    this.bindEvents();
  }

  setupVisuals() {
    this.canvasContainer = document.querySelector('#am-canvas-container');
    if (!this.canvasContainer) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.canvasContainer.clientWidth / this.canvasContainer.clientHeight, 0.1, 1000);
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);
    this.canvasContainer.appendChild(this.renderer.domElement);

    // Neural hub particles
    const geometry = new THREE.BufferGeometry();
    const count = 500;
    const positions = new Float32Array(count * 3);
    for(let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 15;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.05,
      transparent: true,
      opacity: 0.5
    });
    
    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);

    // Central Core
    const coreGeom = new THREE.IcosahedronGeometry(1.5, 1);
    const coreMat = new THREE.MeshPhongMaterial({
        color: 0x00f3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    this.core = new THREE.Mesh(coreGeom, coreMat);
    this.scene.add(this.core);

    const light = new THREE.PointLight(0x00f3ff, 2, 20);
    this.scene.add(light);

    this.animate();
  }

  bindEvents() {
    if (!this.navBtn) return;

    this.navBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle(true);
    });

    if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => {
            this.toggle(false);
        });
    }

    window.addEventListener('resize', () => {
        if (this.isVisible && this.canvasContainer) {
            this.camera.aspect = this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);
        }
    });

    // Agent items click
    document.querySelectorAll('.agent-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.agent-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            this.addLog(`> Connecting to ${item.querySelector('h4').textContent}...`);
            this.addLog(`> Handshake established. Access level: FULL.`);
        });
    });
  }

  toggle(show) {
    this.isVisible = show;
    if (show) {
        this.container.classList.remove('hidden');
        setTimeout(() => this.container.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
        this.addLog(`> System accessed at ${new Date().toLocaleTimeString()}`);
    } else {
        this.container.classList.remove('active');
        setTimeout(() => this.container.classList.add('hidden'), 500);
        document.body.style.overflow = 'auto';
    }
  }

  addLog(msg) {
    const logs = document.querySelector('#log-entries');
    if (!logs) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = msg;
    logs.appendChild(entry);
    logs.scrollTop = logs.scrollHeight;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (this.points) this.points.rotation.y += 0.001;
    if (this.core) {
        this.core.rotation.y += 0.005;
        this.core.rotation.x += 0.002;
    }
    if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
    }
  }
}

class PorscheImageSequence {
  constructor() {
    this.canvas = document.querySelector('#hero-canvas');
    this.context = this.canvas.getContext('2d');
    
    this.frameCount = 240;
    this.images = [];
    this.airpods = {
      frame: 0
    };

    this.init();
  }

  async init() {
    this.setupCanvas();
    await this.preloadImages();
    this.setupScrollAnimation();
    this.setupTextAnimations();
    this.setupCursor();
    this.bindEvents();
    
    // Initialize Agent Manager
    this.agentManager = new AgentManager(this);
    
    this.render();
  }

  setupCanvas() {
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * ratio;
    this.canvas.height = window.innerHeight * ratio;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    
    this.context.scale(ratio, ratio);
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';
  }

  async preloadImages() {
    const loadPromises = [];
    for (let i = 1; i <= this.frameCount; i++) {
        const img = new Image();
        // Construct path: public/images/herosection/ezgif-frame-XXX.jpg
        const frameIndex = i.toString().padStart(3, '0');
        img.src = `/images/herosection/ezgif-frame-${frameIndex}.jpg`;
        
        const promise = new Promise((resolve) => {
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Failed to load image: ${img.src}`);
                resolve(null);
            };
        });
        loadPromises.push(promise);
    }
    
    this.images = await Promise.all(loadPromises);
    // Draw first frame
    this.render();
  }

  setupScrollAnimation() {
    // Only animate over the initial scroll sections
    const scrollSections = document.querySelectorAll('.scroll-section');
    const totalHeroScroll = scrollSections.length * window.innerHeight;

    gsap.to(this.airpods, {
      frame: this.frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: ".main-content",
        start: "top top",
        end: `+=${totalHeroScroll}`,
        scrub: 0.5,
      },
      onUpdate: () => this.render()
    });
  }

  setupTextAnimations() {
    const sections = document.querySelectorAll('.scroll-section');
    
    sections.forEach((section, index) => {
      const content = section.querySelector('.content');
      
      gsap.fromTo(content, 
        { 
          opacity: 0, 
          y: 50,
          filter: "blur(10px)"
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
            end: "top 20%",
            scrub: true,
            toggleActions: "play reverse play reverse"
          }
        }
      );

      // Fade out effect
      gsap.to(content, {
        opacity: 0,
        y: -50,
        filter: "blur(10px)",
        scrollTrigger: {
          trigger: section,
          start: "bottom 40%",
          end: "bottom 0%",
          scrub: true
        }
      });
    });

    // Gallery Revelations
    gsap.from(".gallery-item", {
        opacity: 0,
        y: 100,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
        scrollTrigger: {
            trigger: ".gallery",
            start: "top 80%",
        }
    });

    // About Section Revelations
    gsap.from(".about-content > *", {
        opacity: 0,
        x: -50,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".about-container",
            start: "top 70%",
        }
    });

    gsap.from(".visual-card", {
        opacity: 0,
        x: 50,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".about-container",
            start: "top 70%",
        }
    });
  }

  setupCursor() {
    const cursor = document.querySelector('.cursor');
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX - 15,
            y: e.clientY - 15,
            duration: 0.2,
            ease: "power2.out"
        });
    });

    // Hover effect for buttons
    document.querySelectorAll('.btn, .nav a').forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, {
                scale: 2,
                backgroundColor: 'rgba(215, 0, 0, 0.2)',
                borderColor: 'var(--accent-color)',
                duration: 0.3
            });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, {
                scale: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                duration: 0.3
            });
        });
    });
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.render();
    });
  }

  render() {
    const img = this.images[this.airpods.frame];
    if (!img) return;

    // Use logical dimensions for aspect calculation (window size)
    const logicalWidth = window.innerWidth;
    const logicalHeight = window.innerHeight;
    const canvasAspect = logicalWidth / logicalHeight;
    const imgAspect = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
        drawWidth = logicalWidth;
        drawHeight = logicalWidth / imgAspect;
        offsetX = 0;
        offsetY = (logicalHeight - drawHeight) / 2;
    } else {
        drawWidth = logicalHeight * imgAspect;
        drawHeight = logicalHeight;
        offsetX = (logicalWidth - drawWidth) / 2;
        offsetY = 0;
    }

    this.context.clearRect(0, 0, logicalWidth, logicalHeight);
    this.context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    new PorscheImageSequence();
});

// Initialize Vercel Speed Insights
injectSpeedInsights();
