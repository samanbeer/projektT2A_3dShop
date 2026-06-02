/**
 * BEER 3D - High-Fidelity Draught Beer Experience Engine
 * Metaprogamming Architecture following Web 3D Integration Patterns
 * 
 * Core Architectural Implementations:
 * 1. Layered Group Separation:
 *    - beerMug (Master Group): Bound solely to GSAP ScrollTrigger timeline (position, scale).
 *    - mugModelGroup (Inner Model Group): Handles continuous slow showcase spin and mouse parallax tilt.
 *    - This completely prevents animation conflicts and guarantees butter-smooth performance.
 * 2. Bubble Containment Physics:
 *    - Solves the random-walk drift bug by calculating offsets relative to fixed baseX/baseZ.
 *    - Bubbles rise inside the glass boundaries without ever clipping out.
 * 3. Translucency & Condensation Detailing:
 *    - Custom dropletMaterial with water refractive index (ior: 1.333) for visible water droplets.
 *    - Frothy dome bubbles on top of the foam collar for organic texture.
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

    // --- Responsive Constants ---
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
            color: 0xf5b041,       // Rich Pilsner Gold
            emissive: 0xd4af37,    // Warm golden back-glow
            foamColor: 0xffffff,   // Pure white frothy head
            speed: 1.0
        },
        ipa: {
            color: 0xe67e22,       // Deep copper orange
            emissive: 0xd35400,    // Amber back-glow
            foamColor: 0xfbf9f5,   // Off-white head
            speed: 1.3
        },
        stout: {
            color: 0x110a05,       // Near black Stout/Porter
            emissive: 0x361f0d,    // Roasted dark brown back-glow
            foamColor: 0xdfd3c3,   // Oatmeal creamy head
            speed: 0.55
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
    renderer.toneMappingExposure = 1.4;

    // --- Warm Studio Lighting Rig ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.42);
    scene.add(ambientLight);

    // Keylight from front-right
    const frontLight = new THREE.DirectionalLight(0xfff5e6, 1.85);
    frontLight.position.set(5, 5, 4);
    scene.add(frontLight);

    // High gloss highlight from front-left
    const pointHighlight = new THREE.PointLight(0xffffff, 2.4, 12);
    pointHighlight.position.set(-4, 3, 3);
    scene.add(pointHighlight);

    // Backlight for ultimate liquid glow
    const backLight = new THREE.DirectionalLight(0xf39c12, 4.0);
    backLight.position.set(0, -1, -6);
    scene.add(backLight);

    // --- Layered Group Architecture ---
    // beerMug: Controlled solely by GSAP ScrollTrigger (for scroll coordinates & scaling)
    const beerMug = new THREE.Group();
    scene.add(beerMug);

    // mugModelGroup: Holds all meshes; handles continuous showcase spin & mouse parallax tilt
    const mugModelGroup = new THREE.Group();
    beerMug.add(mugModelGroup);

    // --- Procedural Glass & Liquid Meshes ---
    
    // 1. Crystal Physical Glass Material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.08,
        roughness: 0.04,
        metalness: 0.05,
        transmission: 0.95, // High physical transparency
        ior: 1.52,          // Index of refraction of glass
        thickness: 0.24,    // Physical wall thickness
        depthWrite: false,
        specularIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04
    });

    // Main Cylindrical Cup Body
    const glassGeometry = new THREE.CylinderGeometry(1.5, 1.45, 3.8, 30);
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    mugModelGroup.add(glassMesh);

    // Solid Glass Bottom Disk
    const bottomGeometry = new THREE.CylinderGeometry(1.45, 1.45, 0.35, 30);
    const bottomMesh = new THREE.Mesh(bottomGeometry, glassMaterial);
    bottomMesh.position.y = -1.9;
    mugModelGroup.add(bottomMesh);

    // Traditional Facets (10 rounded glass columns wrapped around)
    const ribCount = 10;
    const ribGeometry = new THREE.CylinderGeometry(0.18, 0.18, 3.4, 12);
    for (let i = 0; i < ribCount; i++) {
        const rib = new THREE.Mesh(ribGeometry, glassMaterial);
        const angle = (i / ribCount) * Math.PI * 2;
        rib.position.x = Math.cos(angle) * 1.48;
        rib.position.z = Math.sin(angle) * 1.48;
        rib.position.y = -0.05;
        mugModelGroup.add(rib);
    }

    // Authentic Curved Glass Handle
    const handleGeometry = new THREE.TorusGeometry(0.85, 0.22, 16, 32, Math.PI);
    const handleMesh = new THREE.Mesh(handleGeometry, glassMaterial);
    handleMesh.position.set(-1.42, 0.05, 0);
    handleMesh.rotation.z = Math.PI / 2;
    mugModelGroup.add(handleMesh);

    // 2. Condensation Droplets (Water drops with dedicated material for hyper-realism)
    const dropletMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.65, // Highly visible condensation
        roughness: 0.0,
        metalness: 0.1,
        transmission: 0.9,
        ior: 1.333, // Water refractive index
        clearcoat: 1.0,
        clearcoatRoughness: 0.0
    });

    const dropletGeo = new THREE.SphereGeometry(0.025, 6, 6);
    const dropletsCount = isMobile ? 25 : 45;
    for (let i = 0; i < dropletsCount; i++) {
        const droplet = new THREE.Mesh(dropletGeo, dropletMaterial);
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

        // Stretch teardrops vertically to look like drips
        droplet.scale.set(
            0.6 + Math.random() * 0.8,
            0.6 + Math.random() * 1.8,
            0.6 + Math.random() * 0.8
        );
        mugModelGroup.add(droplet);
    }

    // 3. Translucent Beer Liquid Cylinder
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
    mugModelGroup.add(liquidMesh);

    // 4. Double-Layer Creamy Foam Head
    const foamMaterial = new THREE.MeshStandardMaterial({
        color: beerTypes.pilsner.foamColor,
        roughness: 0.95,
        metalness: 0.02
    });

    // Lower Foam Collar
    const foamGeometry = new THREE.CylinderGeometry(1.46, 1.42, 0.8, 24, 2);
    const foamMesh = new THREE.Mesh(foamGeometry, foamMaterial);
    foamMesh.position.y = 1.85;
    mugModelGroup.add(foamMesh);

    // Fluffy Dome Top (representing overflowing head)
    const foamDomeGeo = new THREE.SphereGeometry(1.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const foamDome = new THREE.Mesh(foamDomeGeo, foamMaterial);
    foamDome.position.y = 2.25;
    foamDome.scale.y = 0.5; // Flatten slightly
    mugModelGroup.add(foamDome);

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
        mugModelGroup.add(foamBubble);
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
        
        mesh.userData = {
            baseX: Math.cos(angle) * radius,
            baseZ: Math.sin(angle) * radius,
            speed: 0.015 + Math.random() * 0.022,
            wobbleSpeed: 2.5 + Math.random() * 4.5,
            wobbleAmount: 0.02 + Math.random() * 0.035,
            wobbleOffset: Math.random() * 200,
            size: 0.025 + Math.random() * 0.035
        };
        mesh.position.x = mesh.userData.baseX;
        mesh.position.y = -1.9;
        mesh.position.z = mesh.userData.baseZ;
        mesh.scale.setScalar(mesh.userData.size / 0.038);
    }

    for (let i = 0; i < bubblesCount; i++) {
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        resetBubble(bubble);
        bubble.position.y = -1.9 + (Math.random() * 3.35);
        mugModelGroup.add(bubble);
        bubbles.push(bubble);
    }

    // --- Default Coordinates & Positioning ---
    // Clean sizing: reduced scale by 30% for high elegance
    beerMug.position.set(isMobile ? 0 : 1.8, isMobile ? -0.7 : -0.2, 0);
    
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

        // subtle coordinate bounds
        targetRotationY = mouseX * 0.18;
        targetRotationX = -mouseY * 0.12;
    });

    // --- GSAP ScrollTrigger Integration ---
    gsap.registerPlugin(ScrollTrigger);

    // Highly smoothed scroll scrub (1.8s) for buttery smooth clean scroll
    const scrollTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#page-home",
            start: "top top",
            end: "bottom bottom",
            scrub: 2.0, // High scrub factor
            onUpdate: (self) => {
                speedMultiplier = 1.0 + Math.abs(self.getVelocity() * 0.0025);
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
        
        portX: 0,
        portY: isMobile ? 1.8 : 1.35,
        portZ: isMobile ? -1.0 : -1.6,
        portScale: isMobile ? 0.72 : 1.05,
        
        faqX: isMobile ? 0 : 1.8,
        faqY: isMobile ? -1.0 : -0.95,
        faqScale: isMobile ? 0.52 : 0.78
    };

    // Step 1: Slide left for features section (Scale & Position only!)
    scrollTimeline.to(beerMug.position, {
        x: positions.featX,
        y: positions.featY,
        z: 0,
        duration: 1.0,
        ease: "power2.inOut"
    }, 0);
    scrollTimeline.to(beerMug.scale, {
        x: positions.featScale,
        y: positions.featScale,
        z: positions.featScale,
        duration: 1.0,
        ease: "power2.inOut"
    }, 0);

    // Step 2: Center & Zoom for portfolio variants showcase
    scrollTimeline.to(beerMug.position, {
        x: positions.portX,
        y: positions.portY,
        z: positions.portZ,
        duration: 1.0,
        ease: "power2.inOut"
    }, 1.0);
    scrollTimeline.to(beerMug.scale, {
        x: positions.portScale,
        y: positions.portScale,
        z: positions.portScale,
        duration: 1.0,
        ease: "power2.inOut"
    }, 1.0);

    // Step 3: Anchor bottom-right for FAQ section
    scrollTimeline.to(beerMug.position, {
        x: positions.faqX,
        y: positions.faqY,
        z: 0,
        duration: 1.0,
        ease: "power2.inOut"
    }, 2.0);
    scrollTimeline.to(beerMug.scale, {
        x: positions.faqScale,
        y: positions.faqScale,
        z: positions.faqScale,
        duration: 1.0,
        ease: "power2.inOut"
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

        // 2. Mesh color transitions via GSAP
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

        // 1. Gentle continuous showcase rotation (applied ONLY to the model subgroup)
        mugModelGroup.rotation.y = elapsedTime * 0.16; // Perfectly slow continuous rotation

        // 2. Bobbing floating effect
        const bobbing = Math.sin(elapsedTime * 1.5) * 0.055;
        mugModelGroup.position.y = bobbing;

        // 3. Smooth mouse tilt (Desktop only)
        if (!isMobile) {
            mugModelGroup.rotation.x += (targetRotationX - mugModelGroup.rotation.x) * 0.08;
            mugModelGroup.rotation.z += (targetRotationY - mugModelGroup.rotation.z) * 0.08;
        }

        // 4. Oscillating Keylight position
        frontLight.position.x = 5 + Math.sin(elapsedTime * 0.4) * 2.5;

        // 5. Rising air bubbles loop (with absolute wobble boundaries)
        const activeSpeed = beerTypes[activeVariant].speed;
        bubbles.forEach(b => {
            b.position.y += b.userData.speed * speedMultiplier * activeSpeed;

            // Wobble calculated relative to baseX/baseZ (NO ACCUMULATION DRIFT BUG!)
            const wobbleX = Math.sin((elapsedTime * b.userData.wobbleSpeed) + b.userData.wobbleOffset) * b.userData.wobbleAmount;
            const wobbleZ = Math.cos((elapsedTime * b.userData.wobbleSpeed) + b.userData.wobbleOffset) * b.userData.wobbleAmount;

            b.position.x = b.userData.baseX + wobbleX;
            b.position.z = b.userData.baseZ + wobbleZ;

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
            // Epic slow back entry
            gsap.from(beerMug.position, {
                y: 6,
                duration: 1.8,
                ease: "power3.out"
            });
        }
    }, 850);
}
