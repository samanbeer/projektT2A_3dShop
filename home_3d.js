/**
 * BEER 3D - Immersive Draught Beer Engine
 * Powered by Three.js & GSAP
 * 
 * Realistic Features:
 * 1. Traditional Faceted Beer Mug (10 rounded glass columns) procedural modeling.
 * 2. Solid curved glass handle with physical refraction index.
 * 3. Translucent, highly glowing golden liquid (Pilsner, IPA, Stout).
 * 4. Rich, frothy, double-layered foam head (Collar + Overflowing Dome).
 * 5. High-performance particle engine rendering rising natural air bubbles.
 * 6. Mouse parallax tilting physics and GSAP ScrollTrigger coordination.
 */

function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js and GSAP are loaded
    if (typeof THREE === 'undefined' || typeof gsap === 'undefined') {
        console.warn('Three.js or GSAP is not loaded. Reverting to static design.');
        const loader = document.querySelector('.loader-overlay-3d');
        if (loader) loader.classList.add('loaded');
        const wrapper = document.querySelector('.canvas-3d-wrapper');
        if (wrapper) wrapper.style.display = 'none';
        return;
    }

    if (!isWebGLAvailable()) {
        console.warn('WebGL not available. Reverting to static design.');
        const loader = document.querySelector('.loader-overlay-3d');
        if (loader) loader.classList.add('loaded');
        const wrapper = document.querySelector('.canvas-3d-wrapper');
        if (wrapper) wrapper.style.display = 'none';
        return;
    }

    initDraughtBeerExperience();
});

function initDraughtBeerExperience() {
    const container = document.getElementById('canvas-3d-container');
    const canvas = document.getElementById('canvas-3d');
    if (!container || !canvas) return;

    // --- State Variables ---
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    
    let speedMultiplier = 1.0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Realistic Beer Types Configurations
    const beerTypes = {
        pilsner: {
            color: 0xf39c12,       // Golden amber
            emissive: 0xd4af37,    // Warm gold back-glow
            foamColor: 0xffffff,   // Pure white creamy head
            speed: 1.0
        },
        ipa: {
            color: 0xe67e22,       // Deep copper orange
            emissive: 0xd35400,    // Rich amber back-glow
            foamColor: 0xfbf9f5,   // Off-white head
            speed: 1.3
        },
        stout: {
            color: 0x110a05,       // Near black Stout
            emissive: 0x361f0d,    // Roasted dark brown back-glow
            foamColor: 0xdfd3c3,   // Oatmeal creamy head
            speed: 0.6
        }
    };

    let activeVariant = 'pilsner';

    // --- Three.js Core Setup ---
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // --- Warm Lighting Rig ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Primary gold-amber keylight from front-right
    const frontLight = new THREE.DirectionalLight(0xfff5e6, 1.8);
    frontLight.position.set(5, 5, 4);
    scene.add(frontLight);

    // High gloss highlight pointlight from left
    const pointHighlight = new THREE.PointLight(0xffffff, 2.2, 12);
    pointHighlight.position.set(-4, 3, 3);
    scene.add(pointHighlight);

    // Backlight for gorgeous beer translucency / glow
    const backLight = new THREE.DirectionalLight(0xf39c12, 3.8);
    backLight.position.set(0, -1, -6);
    scene.add(backLight);

    // --- Procedural 3D Beer Mug (Krýgl) Modeling ---
    const beerMug = new THREE.Group();
    scene.add(beerMug);

    // Glass Material (Physical glass with reflection, transmission & index of refraction)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08,
        roughness: 0.04,
        metalness: 0.05,
        transmission: 0.95, // Highly transparent
        ior: 1.52,          // Glass refractive index
        thickness: 0.24,    // Thick wall look
        depthWrite: false,
        specularIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04
    });

    // Main Cylindrical Cup Body
    const glassGeometry = new THREE.CylinderGeometry(1.5, 1.45, 3.8, 30);
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    beerMug.add(glassMesh);

    // Solid Glass Bottom Disk
    const bottomGeometry = new THREE.CylinderGeometry(1.45, 1.45, 0.35, 30);
    const bottomMesh = new THREE.Mesh(bottomGeometry, glassMaterial);
    bottomMesh.position.y = -1.9;
    beerMug.add(bottomMesh);

    // Traditional Facets (10 rounded glass columns wrapped around)
    const ribCount = 10;
    const ribGeometry = new THREE.CylinderGeometry(0.18, 0.18, 3.4, 12);
    for (let i = 0; i < ribCount; i++) {
        const rib = new THREE.Mesh(ribGeometry, glassMaterial);
        const angle = (i / ribCount) * Math.PI * 2;
        rib.position.x = Math.cos(angle) * 1.48;
        rib.position.z = Math.sin(angle) * 1.48;
        rib.position.y = -0.05;
        beerMug.add(rib);
    }

    // Authentic Curved Glass Handle
    const handleGeometry = new THREE.TorusGeometry(0.85, 0.22, 16, 32, Math.PI);
    const handleMesh = new THREE.Mesh(handleGeometry, glassMaterial);
    handleMesh.position.set(-1.42, 0.05, 0);
    handleMesh.rotation.z = Math.PI / 2;
    beerMug.add(handleMesh);

    // Condensation droplets on the outer glass surface for hyper-realism
    const dropletGeo = new THREE.SphereGeometry(0.025, 6, 6);
    const dropletsCount = 45;
    for (let i = 0; i < dropletsCount; i++) {
        const droplet = new THREE.Mesh(dropletGeo, glassMaterial);
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() * 3.1) - 1.55;

        // Skip handle area to avoid clipping
        if (angle > 2.8 && angle < 3.5) {
            i--;
            continue;
        }

        droplet.position.x = Math.cos(angle) * 1.51;
        droplet.position.z = Math.sin(angle) * 1.51;
        droplet.position.y = height;

        // Irregular teardrop stretching
        droplet.scale.set(
            0.6 + Math.random() * 0.8,
            0.6 + Math.random() * 1.8, // Drips
            0.6 + Math.random() * 0.8
        );
        beerMug.add(droplet);
    }

    // Translucent Beer Liquid Cylinder
    const liquidGeometry = new THREE.CylinderGeometry(1.42, 1.37, 3.35, 24);
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
        color: beerTypes.pilsner.color,
        emissive: beerTypes.pilsner.emissive,
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.92,
        roughness: 0.08,
        metalness: 0.05,
        transmission: 0.55,
        ior: 1.343,
        clearcoat: 0.5
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.position.y = -0.22;
    beerMug.add(liquidMesh);

    // Double-Layer Creamy Foam Head
    const foamMaterial = new THREE.MeshStandardMaterial({
        color: beerTypes.pilsner.foamColor,
        roughness: 0.95,
        metalness: 0.02
    });

    // 1. Lower Foam Collar
    const foamGeometry = new THREE.CylinderGeometry(1.46, 1.42, 0.8, 24, 2);
    const foamMesh = new THREE.Mesh(foamGeometry, foamMaterial);
    foamMesh.position.y = 1.85;
    beerMug.add(foamMesh);

    // 2. Fluffy Dome Top (representing overflowing head)
    const foamDomeGeo = new THREE.SphereGeometry(1.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const foamDome = new THREE.Mesh(foamDomeGeo, foamMaterial);
    foamDome.position.y = 2.25;
    foamDome.scale.y = 0.5; // Flatten slightly
    beerMug.add(foamDome);

    // Tiny frothy foam bubbles on top of the dome for textured foam realism
    const foamBubbleGeo = new THREE.SphereGeometry(0.11, 8, 8);
    for (let i = 0; i < 18; i++) {
        const foamBubble = new THREE.Mesh(foamBubbleGeo, foamMaterial);
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 1.15;
        foamBubble.position.x = Math.cos(angle) * radius;
        foamBubble.position.z = Math.sin(angle) * radius;
        const height = 2.05 + Math.sqrt(Math.max(0, 1.42 * 1.42 - radius * radius)) * 0.5;
        foamBubble.position.y = height + (Math.random() * 0.06);
        
        const size = 0.5 + Math.random() * 0.8;
        foamBubble.scale.set(size, size * 0.7, size);
        beerMug.add(foamBubble);
    }

    // --- Dynamic Bubbles Engine (Natural Air Bubbles) ---
    const bubblesCount = isMobile ? 35 : 75;
    const bubbleGeometry = new THREE.SphereGeometry(0.038, 8, 8);
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.72,
        roughness: 0.02,
        metalness: 0.2,
        transmission: 0.92,
        ior: 1.2
    });

    const bubbles = [];
    const clock = new THREE.Clock();

    function resetBubble(mesh) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 1.15;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = -1.9;
        mesh.position.z = Math.sin(angle) * radius;
        
        mesh.userData = {
            speed: 0.015 + Math.random() * 0.022,
            wobbleSpeed: 2.5 + Math.random() * 4.5,
            wobbleAmount: 0.02 + Math.random() * 0.035,
            wobbleOffset: Math.random() * 200,
            size: 0.025 + Math.random() * 0.035
        };
        mesh.scale.setScalar(mesh.userData.size / 0.038);
    }

    for (let i = 0; i < bubblesCount; i++) {
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        resetBubble(bubble);
        bubble.position.y = -1.9 + (Math.random() * 3.35);
        beerMug.add(bubble);
        bubbles.push(bubble);
    }

    // --- Default Coordinates & Positioning ---
    beerMug.position.set(isMobile ? 0 : 1.8, isMobile ? -0.7 : -0.2, 0);
    beerMug.rotation.set(0.12, -0.4, 0);

    if (isMobile) {
        beerMug.scale.setScalar(0.7);
    } else if (isTablet) {
        beerMug.scale.setScalar(0.85);
    } else {
        beerMug.scale.setScalar(1.0);
    }

    // --- Mouse Follow & Parallax ---
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        targetRotationY = mouseX * 0.32;
        targetRotationX = -mouseY * 0.22;
    });

    // --- GSAP ScrollTrigger Integration ---
    gsap.registerPlugin(ScrollTrigger);

    const scrollTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#page-home",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.8, // High scrub factor for buttery smooth "clean scroll" transitions
            onUpdate: (self) => {
                speedMultiplier = 1.0 + Math.abs(self.getVelocity() * 0.002);
            }
        }
    });

    const positions = {
        heroX: isMobile ? 0 : 1.8,
        heroY: isMobile ? -0.7 : -0.2,
        heroScale: isMobile ? 0.65 : 1.0,
        
        featX: isMobile ? 0 : -2.2,
        featY: isMobile ? -0.8 : -0.1,
        featScale: isMobile ? 0.75 : 1.2,
        featRotY: Math.PI * 1.5 - 0.4,
        
        portX: 0,
        portY: isMobile ? 1.8 : 1.35,
        portZ: isMobile ? -1.0 : -1.6,
        portScale: isMobile ? 0.72 : 1.05,
        
        faqX: isMobile ? 0 : 1.8,
        faqY: isMobile ? -1.0 : -0.95,
        faqScale: isMobile ? 0.52 : 0.78,
        faqRotY: Math.PI * 4.25
    };

    // Step 1: Slide left features
    scrollTimeline.to(beerMug.position, {
        x: positions.featX,
        y: positions.featY,
        z: 0,
        duration: 1.0,
        ease: "power1.inOut"
    }, 0);
    scrollTimeline.to(beerMug.scale, {
        x: positions.featScale,
        y: positions.featScale,
        z: positions.featScale,
        duration: 1.0,
        ease: "power1.inOut"
    }, 0);
    scrollTimeline.to(beerMug.rotation, {
        y: positions.featRotY,
        x: 0.1,
        z: -0.05,
        duration: 1.0,
        ease: "power1.inOut"
    }, 0);

    // Step 2: Center & Zoom portfolio variants
    scrollTimeline.to(beerMug.position, {
        x: positions.portX,
        y: positions.portY,
        z: positions.portZ,
        duration: 1.0,
        ease: "power1.inOut"
    }, 1.0);
    scrollTimeline.to(beerMug.scale, {
        x: positions.portScale,
        y: positions.portScale,
        z: positions.portScale,
        duration: 1.0,
        ease: "power1.inOut"
    }, 1.0);
    scrollTimeline.to(beerMug.rotation, {
        y: positions.portRotY,
        x: -0.15,
        z: 0.05,
        duration: 1.0,
        ease: "power1.inOut"
    }, 1.0);

    // Step 3: Anchor bottom-right FAQ
    scrollTimeline.to(beerMug.position, {
        x: positions.faqX,
        y: positions.faqY,
        z: 0,
        duration: 1.0,
        ease: "power1.inOut"
    }, 2.0);
    scrollTimeline.to(beerMug.scale, {
        x: positions.faqScale,
        y: positions.faqScale,
        z: positions.faqScale,
        duration: 1.0,
        ease: "power1.inOut"
    }, 2.0);
    scrollTimeline.to(beerMug.rotation, {
        y: positions.faqRotY,
        x: 0.15,
        z: 0.0,
        duration: 1.0,
        ease: "power1.inOut"
    }, 2.0);

    // --- Interactive Hover Variant Swapping ---
    const portfolioCards = document.querySelectorAll('.portfolio-card-premium');
    
    portfolioCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            portfolioCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const variant = card.getAttribute('data-variant');
            if (variant && beerTypes[variant] && variant !== activeVariant) {
                changeBeerVariant(variant);
            }
        });
    });

    function changeBeerVariant(variantName) {
        activeVariant = variantName;
        const info = beerTypes[variantName];

        // 1. Dynamic document root overrides to change whole CSS color variables
        const root = document.documentElement;
        let hexColorString = "#f39c12"; // Pilsner
        let glowColorString = "rgba(243, 156, 18, 0.4)";
        
        if (variantName === 'ipa') {
            hexColorString = "#e67e22";
            glowColorString = "rgba(230, 126, 34, 0.4)";
        } else if (variantName === 'stout') {
            hexColorString = "#4a2c11";
            glowColorString = "rgba(74, 44, 17, 0.4)";
        }

        root.style.setProperty('--active-beer', hexColorString);
        root.style.setProperty('--active-beer-glow', glowColorString);

        // 2. Liquid color transitions via GSAP
        gsap.to(liquidMaterial.color, {
            r: new THREE.Color(info.color).r,
            g: new THREE.Color(info.color).g,
            b: new THREE.Color(info.color).b,
            duration: 0.6,
            ease: "power2.out"
        });

        gsap.to(liquidMaterial.emissive, {
            r: new THREE.Color(info.emissive).r,
            g: new THREE.Color(info.emissive).g,
            b: new THREE.Color(info.emissive).b,
            duration: 0.6,
            ease: "power2.out"
        });

        // Foam color transition
        gsap.to(foamMaterial.color, {
            r: new THREE.Color(info.foamColor).r,
            g: new THREE.Color(info.foamColor).g,
            b: new THREE.Color(info.foamColor).b,
            duration: 0.6,
            ease: "power2.out"
        });
    }

    // --- Main Animation loop ---
    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // 1. Glass mug floating bobbing physics
        const bobbing = Math.sin(elapsedTime * 1.5) * 0.055;
        // Inject to local visual without breaking timeline offset
        frontLight.position.x = 5 + Math.sin(elapsedTime * 0.4) * 2.5;

        // 2. Smooth mouse tilt (Desktop only)
        if (!isMobile) {
            beerMug.rotation.y += (targetRotationY - (beerMug.rotation.y % (Math.PI * 2))) * 0.08;
            beerMug.rotation.x += (targetRotationX - beerMug.rotation.x) * 0.08;
        }

        // 3. Rising air bubbles loop
        const activeSpeed = beerTypes[activeVariant].speed;
        bubbles.forEach(b => {
            b.position.y += b.userData.speed * speedMultiplier * activeSpeed;

            // Side-to-side drift
            b.position.x += Math.sin((elapsedTime * b.userData.wobbleSpeed) + b.userData.wobbleOffset) * b.userData.wobbleAmount * 0.25;
            b.position.z += Math.cos((elapsedTime * b.userData.wobbleSpeed) + b.userData.wobbleOffset) * b.userData.wobbleAmount * 0.25;

            // Reset at foam collar boundary (y ≈ 1.45)
            if (b.position.y >= 1.45) {
                resetBubble(b);
            }
        });

        renderer.render(scene, camera);
    }

    // --- Window Resize Engine ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 768 ? 1 : 2));

        const isMobileNow = window.innerWidth <= 768;
        const isTabletNow = window.innerWidth <= 1024 && window.innerWidth > 768;
        
        if (isMobileNow) {
            beerMug.scale.setScalar(0.7);
        } else if (isTabletNow) {
            beerMug.scale.setScalar(0.85);
        } else {
            beerMug.scale.setScalar(1.0);
        }
    });

    animate();

    // Hide loader overlay
    setTimeout(() => {
        const loader = document.querySelector('.loader-overlay-3d');
        if (loader) {
            loader.classList.add('loaded');
            // Epic slide-in entry
            gsap.from(beerMug.position, {
                y: 6,
                duration: 1.6,
                ease: "back.out(1.1)"
            });
        }
    }, 850);
}
