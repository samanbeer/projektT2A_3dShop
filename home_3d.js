/**
 * BEER 3D - Immersive 3D Experience Engine
 * Powered by Three.js & GSAP
 * 
 * Includes:
 * 1. WebGL Support Verification
 * 2. Procedural Beer Mug Modeling (Zero external GLTF assets needed, 100% offline support)
 * 3. High-Performance Particle Engine (Rising bubbles)
 * 4. Cursor Parallax / Tilt Physics
 * 5. Interactive Liquid Variants (Pilsner, IPA, Stout)
 * 6. GSAP ScrollTrigger Coordinates Bindings
 */

// WebGL Compatibility check
function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // WebGL Fallback handling
    if (!isWebGLAvailable()) {
        console.warn('WebGL is not supported or disabled on this device.');
        const loader = document.querySelector('.loader-overlay-3d');
        if (loader) loader.classList.add('loaded');
        
        // Hide canvas wrapper and display static graphics
        const wrapper = document.querySelector('.canvas-3d-wrapper');
        if (wrapper) wrapper.style.display = 'none';
        return;
    }

    init3DExperience();
});

function init3DExperience() {
    const container = document.getElementById('canvas-3d-container');
    const canvas = document.getElementById('canvas-3d');
    if (!container || !canvas) return;

    // --- State Variables ---
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
    
    let bubbleSpeedMultiplier = 1.0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Beer Variants (Hex Color Codes)
    const beerTypes = {
        pilsner: {
            color: 0xf39c12,     // Golden amber
            emissive: 0xd4af37,  // Bright gold
            foamColor: 0xffffff, // Cream white
            speed: 1.0
        },
        ipa: {
            color: 0xe67e22,     // Deeper copper
            emissive: 0xd35400,  // Rich orange
            foamColor: 0xfbf9f5, // Slightly off-white
            speed: 1.5
        },
        stout: {
            color: 0x1d140e,     // Near black
            emissive: 0x4a2c11,  // Dark roast brown
            foamColor: 0xdfd3c3, // Oatmeal head
            speed: 0.6
        }
    };

    let activeVariant = 'pilsner';

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8.5);

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
    renderer.toneMappingExposure = 1.25;

    // --- Lighting Rig ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Stout-gold keylight from front-right
    const keyLight = new THREE.DirectionalLight(0xffd700, 1.8);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    // High reflection spot light
    const pointHighlight = new THREE.PointLight(0xffffff, 2.5, 15);
    pointHighlight.position.set(-4, 3, 3);
    scene.add(pointHighlight);

    // Dynamic backlight (creates gorgeous beer translucency)
    const backLight = new THREE.DirectionalLight(0xf39c12, 3.5);
    backLight.position.set(0, -2, -6);
    scene.add(backLight);

    // --- Procedural 3D Beer Mug Creation ---
    const beerMug = new THREE.Group();
    scene.add(beerMug);

    // 1. Outer Glass Body Material (MeshPhysicalMaterial for real transmission)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.95, // Premium transparency
        ior: 1.52,          // Index of refraction of glass
        thickness: 0.18,    // Physical wall thickness
        depthWrite: false,
        specularIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    });

    // Elegant pint shape (tapered cylinder)
    const glassGeometry = new THREE.CylinderGeometry(1.65, 1.35, 4.2, 24, 6);
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    beerMug.add(glassMesh);

    // Solid glass bottom disk
    const bottomGeometry = new THREE.CylinderGeometry(1.35, 1.35, 0.25, 24);
    const bottomMesh = new THREE.Mesh(bottomGeometry, glassMaterial);
    bottomMesh.position.y = -2.1;
    beerMug.add(bottomMesh);

    // Solid Glass Handle
    const handleGeometry = new THREE.TorusGeometry(0.9, 0.18, 12, 24, Math.PI);
    const handleMesh = new THREE.Mesh(handleGeometry, glassMaterial);
    handleMesh.position.set(-1.45, 0.05, 0);
    handleMesh.rotation.z = Math.PI / 2;
    beerMug.add(handleMesh);

    // 2. Liquid Mesh (Fits snugly inside the glass mesh)
    const liquidGeometry = new THREE.CylinderGeometry(1.58, 1.3, 3.75, 24, 4);
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
        color: beerTypes.pilsner.color,
        emissive: beerTypes.pilsner.emissive,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.88,
        roughness: 0.15,
        metalness: 0.05,
        transmission: 0.45,
        ior: 1.343, // Index of refraction of beer/water
        clearcoat: 0.5
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.position.y = -0.15;
    beerMug.add(liquidMesh);

    // 3. Thick Foam Head (bumpy cylinder to look frothy)
    const foamGeometry = new THREE.CylinderGeometry(1.62, 1.56, 0.65, 24, 3);
    const foamMaterial = new THREE.MeshStandardMaterial({
        color: beerTypes.pilsner.foamColor,
        roughness: 0.9,
        metalness: 0.02,
        flatShading: true // Creates polygonal bubble appearance
    });
    const foamMesh = new THREE.Mesh(foamGeometry, foamMaterial);
    foamMesh.position.y = 1.9;
    beerMug.add(foamMesh);

    // 4. Foam Overlap Ring (overflow detailing)
    const foamRingGeometry = new THREE.TorusGeometry(1.6, 0.12, 8, 24);
    const foamRingMesh = new THREE.Mesh(foamRingGeometry, foamMaterial);
    foamRingMesh.position.y = 1.6;
    foamRingMesh.rotation.x = Math.PI / 2;
    beerMug.add(foamRingMesh);

    // --- Dynamic Bubbles Engine (Particles System) ---
    const bubblesCount = isMobile ? 35 : 75; // Performance scaling
    const bubbleGeometry = new THREE.SphereGeometry(0.045, 8, 8);
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        roughness: 0.02,
        metalness: 0.2,
        transmission: 0.92,
        ior: 1.2
    });

    const bubbles = [];
    const clock = new THREE.Clock();

    function resetBubble(mesh) {
        const angle = Math.random() * Math.PI * 2;
        // Keep inside the tapered liquid boundaries
        const radius = Math.random() * 1.15;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = -1.95; // Bottom of liquid
        mesh.position.z = Math.sin(angle) * radius;
        
        mesh.userData = {
            speed: 0.016 + Math.random() * 0.024,
            wobbleSpeed: 2.5 + Math.random() * 4.5,
            wobbleAmount: 0.02 + Math.random() * 0.035,
            wobbleOffset: Math.random() * 200,
            size: 0.025 + Math.random() * 0.035
        };
        mesh.scale.setScalar(mesh.userData.size / 0.045);
    }

    for (let i = 0; i < bubblesCount; i++) {
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        resetBubble(bubble);
        // stagger initial heights so they are spaced out at startup
        bubble.position.y = -1.95 + (Math.random() * 3.65);
        beerMug.add(bubble);
        bubbles.push(bubble);
    }

    // --- Default Coordinates & Positioning ---
    // In Hero: Float right, slightly tilted
    beerMug.position.set(isMobile ? 0 : 1.7, isMobile ? -0.8 : -0.3, 0);
    beerMug.rotation.set(0.12, -0.4, 0);

    if (isMobile) {
        beerMug.scale.setScalar(1.0);
    } else if (isTablet) {
        beerMug.scale.setScalar(1.25);
    } else {
        beerMug.scale.setScalar(1.45);
    }

    // --- Mouse Follow & Parallax Physics ---
    document.addEventListener('mousemove', (e) => {
        // Map cursor coordinates from -1 to 1
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        // Determine target tilt
        targetRotationY = mouseX * 0.28;
        targetRotationX = -mouseY * 0.20;
    });

    // --- GSAP ScrollTrigger Integration ---
    gsap.registerPlugin(ScrollTrigger);

    // We tie the properties of beerMug to the global scroll trigger timeline
    const scrollTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#page-home",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.0, // Smooth interpolation
            onUpdate: (self) => {
                // Increase bubble speed dynamically when scrolling quickly
                bubbleSpeedMultiplier = 1.0 + Math.abs(self.getVelocity() * 0.002);
            }
        }
    });

    // Define responsive layout positions for scroll phases
    const positions = {
        // Hero Section (Scroll = 0)
        heroX: isMobile ? 0 : 1.7,
        heroY: isMobile ? -0.8 : -0.3,
        heroScale: isMobile ? 0.95 : 1.45,
        
        // Features Section (Scroll = 1)
        featX: isMobile ? 0 : -2.0,
        featY: isMobile ? -1.0 : -0.15,
        featScale: isMobile ? 1.05 : 1.75,
        featRotY: Math.PI * 1.5 - 0.4,
        
        // Portfolio Showcase (Scroll = 2)
        portX: 0,
        portY: isMobile ? 1.6 : 1.25,
        portZ: isMobile ? -1.2 : -1.8,
        portScale: isMobile ? 1.0 : 1.5,
        portRotY: Math.PI * 3.0,
        
        // FAQ & Footer (Scroll = 3)
        faqX: isMobile ? 0 : 1.7,
        faqY: isMobile ? -1.2 : -1.05,
        faqScale: isMobile ? 0.75 : 1.15,
        faqRotY: Math.PI * 4.25
    };

    // Step 1: Slide to left features
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

    // Step 2: Center & Zoom into liquid for Portfolio showreel
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

    // Step 3: Anchor bottom-right for FAQ section
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


    // --- Interactive Hover Variants (Pilsner, IPA, Stout) ---
    const portfolioCards = document.querySelectorAll('.portfolio-card-premium');
    
    portfolioCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Remove active state from all other cards
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

        // Animate color transition using GSAP for buttery smooth transitions
        gsap.to(liquidMaterial.color, {
            r: new THREE.Color(info.color).r,
            g: new THREE.Color(info.color).g,
            b: new THREE.Color(info.color).b,
            duration: 0.8,
            ease: "power2.out"
        });

        gsap.to(liquidMaterial.emissive, {
            r: new THREE.Color(info.emissive).r,
            g: new THREE.Color(info.emissive).g,
            b: new THREE.Color(info.emissive).b,
            duration: 0.8,
            ease: "power2.out"
        });

        gsap.to(foamMaterial.color, {
            r: new THREE.Color(info.foamColor).r,
            g: new THREE.Color(info.foamColor).g,
            b: new THREE.Color(info.foamColor).b,
            duration: 0.8,
            ease: "power2.out"
        });
    }


    // --- Main Animation & Render Loop ---
    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // 1. Liquid bobbing physics (gentle floating motion)
        const bobbing = Math.sin(elapsedTime * 1.5) * 0.065;
        // We inject the bobbing only to the local visual, leaving timeline values clean
        keyLight.position.x = 5 + Math.sin(elapsedTime * 0.5) * 2;

        // 2. Smooth interpolation (lerp) for Mouse Follow tilt
        // Only apply mouse follow parallax if not on mobile (better touch performance)
        if (!isMobile) {
            beerMug.rotation.y += (targetRotationY - (beerMug.rotation.y % (Math.PI * 2))) * 0.08;
            beerMug.rotation.x += (targetRotationX - beerMug.rotation.x) * 0.08;
        }

        // 3. Bubbles floating system loop
        const activeSpeed = beerTypes[activeVariant].speed;
        bubbles.forEach(b => {
            b.position.y += b.userData.speed * bubbleSpeedMultiplier * activeSpeed;
            
            // Side-to-side wavy wiggle
            b.position.x += Math.sin((elapsedTime * b.userData.wobbleSpeed) + b.userData.wobbleOffset) * b.userData.wobbleAmount * 0.2;
            b.position.z += Math.cos((elapsedTime * b.userData.wobbleSpeed) + b.userData.wobbleOffset) * b.userData.wobbleAmount * 0.2;

            // Reset bubble when it meets the foam cap barrier (y ≈ 1.7)
            if (b.position.y >= 1.72) {
                resetBubble(b);
            }
        });

        renderer.render(scene, camera);
    }

    // --- Responsive Window Resize Engine ---
    window.addEventListener('resize', () => {
        // Adjust camera & aspect ratio
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Resize renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth <= 768 ? 1 : 2));

        // Re-align responsive timeline multipliers
        const isMobileNow = window.innerWidth <= 768;
        const isTabletNow = window.innerWidth <= 1024 && window.innerWidth > 768;
        
        if (isMobileNow) {
            beerMug.scale.setScalar(1.0);
        } else if (isTabletNow) {
            beerMug.scale.setScalar(1.25);
        } else {
            beerMug.scale.setScalar(1.45);
        }
    });

    // Start rendering loop
    animate();

    // Hide loader overlay after scene has successfully mounted and rendered
    setTimeout(() => {
        const loader = document.querySelector('.loader-overlay-3d');
        if (loader) {
            loader.classList.add('loaded');
            // Animate initial entry of the hero mug
            gsap.from(beerMug.position, {
                y: 5,
                duration: 1.5,
                ease: "back.out(1.2)"
            });
        }
    }, 800);
}
