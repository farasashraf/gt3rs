import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
        img.src = `./public/images/herosection/ezgif-frame-${frameIndex}.jpg`;
        
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
