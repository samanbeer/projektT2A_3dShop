/**
 * BEER 3D - Cyberpunk Immersive 3D Experience Engine
 * Powered by Three.js & GSAP
 * 
 * Cyberpunk Features:
 * 1. Hexagonal Sci-Fi Energy Canister procedural modeling.
 * 2. Carbon-Fiber top & bottom shields.
 * 3. Glowing copper wire loops wrapped around bounds.
 * 4. High-detail cyber-handle with integrated glowing neon core.
 * 5. Orbiting holographic tech-rings with active rotation.
 * 6. Central neon-light plasma reactor rod inside liquid.
 * 7. Particle system rendering floating binary-data packets (3D cubes).
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

    initCyberExperience();
});

function initCyberExperience() {
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

    // Cyberpunk Neon Variants
    const cyberVariants = {
        pilsner: {
            color: 0x39ff14,       // Neon Acid Green
            emissive: 0x1f9e0b,    // Emerald glow
            glowColor: 0x39ff14,
            speed: 1.0
        },
        ipa: {
            color: 0xff007f,       // Neon Hot Pink
            emissive: 0x99004c,    // Magenta glow
            glowColor: 0xff007f,
            speed: 1.4
        },
        stout: {
            color: 0x00d0ff,       // Electric Cobalt Blue
            emissive: 0x006699,    // Deep cyan glow
            glowColor: 0x00d0ff,
            speed: 0.7
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

    // --- High-Tech Lighting Rig ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    // Dynamic front spotlight reflecting neon
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.5);
    frontLight.position.set(5, 5, 4);
    scene.add(frontLight);

    // Left neon fill light
    const leftFill = new THREE.PointLight(0xff007f, 3.5, 12);
    leftFill.position.set(-5, 2, 2);
    scene.add(leftFill);

    // Right neon fill light
    const rightFill = new THREE.PointLight(0x39ff14, 3.5, 12);
    rightFill.position.set(5, -2, 2);
    scene.add(rightFill);

    // Backlight for ultimate liquid translucency
    const backLight = new THREE.DirectionalLight(0x00d0ff, 4.0);
    backLight.position.set(0, -1, -6);
    scene.add(backLight);

    // --- Procedural Cyberpunk Energy Canister Modeling ---
    const beerMug = new THREE.Group();
    scene.add(beerMug);

    // 1. Hexagonal Outer Protective Shell (MeshPhysicalMaterial)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        roughness: 0.08,
        metalness: 0.9,
        transmission: 0.92,
        ior: 1.55,
        thickness: 0.16,
        depthWrite: false,
        specularIntensity: 1.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    });

    // 6-sided cylinder makes it a gorgeous hexagon!
    const glassGeometry = new THREE.CylinderGeometry(1.68, 1.42, 4.25, 6, 6);
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    beerMug.add(glassMesh);

    // 2. Heavy Carbon-Fiber Cap Shields (Top & Bottom)
    const metalCapMaterial = new THREE.MeshStandardMaterial({
        color: 0x161515,
        roughness: 0.45,
        metalness: 0.95
    });

    // Top metal cap
    const topCapGeometry = new THREE.CylinderGeometry(1.73, 1.69, 0.4, 6);
    const topCap = new THREE.Mesh(topCapGeometry, metalCapMaterial);
    topCap.position.y = 2.15;
    beerMug.add(topCap);

    // Bottom metal cap
    const bottomCapGeometry = new THREE.CylinderGeometry(1.41, 1.45, 0.4, 6);
    const bottomCap = new THREE.Mesh(bottomCapGeometry, metalCapMaterial);
    bottomCap.position.y = -2.15;
    beerMug.add(bottomCap);

    // 3. Exposed Copper Core Wire Loops (Neck & Base)
    const copperMaterial = new THREE.MeshStandardMaterial({
        color: 0xe67e22,
        emissive: 0xd35400,
        emissiveIntensity: 1.2,
        roughness: 0.15,
        metalness: 0.95
    });

    // Top coil
    const topCoilGeo = new THREE.TorusGeometry(1.42, 0.075, 8, 24);
    const topCoil = new THREE.Mesh(topCoilGeo, copperMaterial);
    topCoil.position.y = 1.75;
    topCoil.rotation.x = Math.PI / 2;
    beerMug.add(topCoil);

    // Bottom coil
    const bottomCoilGeo = new THREE.TorusGeometry(1.23, 0.075, 8, 24);
    const bottomCoil = new THREE.Mesh(bottomCoilGeo, copperMaterial);
    bottomCoil.position.y = -1.75;
    bottomCoil.rotation.x = Math.PI / 2;
    beerMug.add(bottomCoil);

    // 4. Integrated Cyber Handle
    const cyberHandle = new THREE.Group();

    // Structural bracket
    const bracketGeo = new THREE.BoxGeometry(0.28, 3.2, 0.2);
    const bracket = new THREE.Mesh(bracketGeo, metalCapMaterial);
    bracket.position.set(-1.42, 0, 0);
    cyberHandle.add(bracket);

    // Solid metal grip panel
    const gripGeo = new THREE.BoxGeometry(0.24, 2.8, 0.32);
    const grip = new THREE.Mesh(gripGeo, metalCapMaterial);
    grip.position.set(-1.95, 0, 0);
    cyberHandle.add(grip);

    // Connectors
    const connGeo = new THREE.BoxGeometry(0.62, 0.22, 0.2);
    
    const connTop = new THREE.Mesh(connGeo, metalCapMaterial);
    connTop.position.set(-1.68, 1.2, 0);
    cyberHandle.add(connTop);

    const connBottom = new THREE.Mesh(connGeo, metalCapMaterial);
    connBottom.position.set(-1.68, -1.2, 0);
    cyberHandle.add(connBottom);

    // Integrated neon handle strip
    const handleNeonMat = new THREE.MeshStandardMaterial({
        color: cyberVariants.pilsner.glowColor,
        emissive: cyberVariants.pilsner.glowColor,
        emissiveIntensity: 2.2
    });
    const handleNeon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.3, 0.35), handleNeonMat);
    handleNeon.position.set(-1.98, 0, 0);
    cyberHandle.add(handleNeon);

    beerMug.add(cyberHandle);

    // 5. Central glowing neon rod reactor core
    const coreRodMat = new THREE.MeshStandardMaterial({
        color: cyberVariants.pilsner.glowColor,
        emissive: cyberVariants.pilsner.glowColor,
        emissiveIntensity: 3.0
    });
    const coreRodGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 12);
    const coreRod = new THREE.Mesh(coreRodGeo, coreRodMat);
    beerMug.add(coreRod);

    // 6. Translucent Neon Plasma core liquid
    const liquidGeometry = new THREE.CylinderGeometry(1.58, 1.34, 3.75, 6, 2);
    const liquidMaterial = new THREE.MeshPhysicalMaterial({
        color: cyberVariants.pilsner.color,
        emissive: cyberVariants.pilsner.emissive,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.76,
        roughness: 0.08,
        metalness: 0.1,
        transmission: 0.55,
        ior: 1.45,
        clearcoat: 0.6
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.position.y = -0.15;
    beerMug.add(liquidMesh);

    // 7. Dynamic Rotating Hologram Ticks Rings
    const ringMat = new THREE.MeshBasicMaterial({
        color: cyberVariants.pilsner.glowColor,
        transparent: true,
        opacity: 0.45,
        wireframe: true
    });
    
    const holoRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.016, 6, 32), ringMat);
    holoRing1.position.y = 0.85;
    holoRing1.rotation.x = Math.PI / 2;
    beerMug.add(holoRing1);

    const holoRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.016, 6, 32), ringMat);
    holoRing2.position.y = -0.85;
    holoRing2.rotation.x = Math.PI / 2;
    beerMug.add(holoRing2);

    // --- Dynamic Glowing Data Cubes (Binary Packets Particle Engine) ---
    const bitsCount = isMobile ? 25 : 55;
    const bitGeometry = new THREE.BoxGeometry(0.09, 0.09, 0.09);
    const bitMaterial = new THREE.MeshStandardMaterial({
        color: cyberVariants.pilsner.glowColor,
        emissive: cyberVariants.pilsner.glowColor,
        emissiveIntensity: 2.5
    });

    const bits = [];
    const clock = new THREE.Clock();

    function resetBit(mesh) {
        const angle = Math.random() * Math.PI * 2;
        // Keep between rod core and glass shell boundary
        const radius = 0.22 + Math.random() * 0.95;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = -1.95;
        mesh.position.z = Math.sin(angle) * radius;
        
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        
        mesh.userData = {
            speed: 0.012 + Math.random() * 0.018,
            rotSpeedX: 0.01 + Math.random() * 0.03,
            rotSpeedY: 0.01 + Math.random() * 0.03,
            size: 0.04 + Math.random() * 0.06
        };
        mesh.scale.setScalar(mesh.userData.size / 0.09);
    }

    for (let i = 0; i < bitsCount; i++) {
        const bit = new THREE.Mesh(bitGeometry, bitMaterial);
        resetBit(bit);
        bit.position.y = -1.95 + (Math.random() * 3.65);
        beerMug.add(bit);
        bits.push(bit);
    }

    // --- Default Coordinates & Positioning ---
    beerMug.position.set(isMobile ? 0 : 1.7, isMobile ? -0.8 : -0.3, 0);
    beerMug.rotation.set(0.12, -0.4, 0);

    if (isMobile) {
        beerMug.scale.setScalar(1.0);
    } else if (isTablet) {
        beerMug.scale.setScalar(1.25);
    } else {
        beerMug.scale.setScalar(1.45);
    }

    // --- Mouse Follow & Parallax ---
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        targetRotationY = mouseX * 0.32;
        targetRotationX = -mouseY * 0.22;
    });

    // --- GSAP ScrollTrigger Coordinates Bindings ---
    gsap.registerPlugin(ScrollTrigger);

    const scrollTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#page-home",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.0,
            onUpdate: (self) => {
                speedMultiplier = 1.0 + Math.abs(self.getVelocity() * 0.002);
            }
        }
    });

    const positions = {
        heroX: isMobile ? 0 : 1.7,
        heroY: isMobile ? -0.8 : -0.3,
        heroScale: isMobile ? 0.95 : 1.45,
        
        featX: isMobile ? 0 : -2.0,
        featY: isMobile ? -1.0 : -0.15,
        featScale: isMobile ? 1.05 : 1.75,
        featRotY: Math.PI * 1.5 - 0.4,
        
        portX: 0,
        portY: isMobile ? 1.6 : 1.25,
        portZ: isMobile ? -1.2 : -1.8,
        portScale: isMobile ? 1.0 : 1.5,
        portRotY: Math.PI * 3.0,
        
        faqX: isMobile ? 0 : 1.7,
        faqY: isMobile ? -1.2 : -1.05,
        faqScale: isMobile ? 0.75 : 1.15,
        faqRotY: Math.PI * 4.25
    };

    // Step 1: Slide to features
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

    // Step 2: Center & Zoom into reactor core for portfolio variants
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

    // Step 3: Anchor bottom-right for FAQ
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
            if (variant && cyberVariants[variant] && variant !== activeVariant) {
                changeCyberVariant(variant);
            }
        });
    });

    function changeCyberVariant(variantName) {
        activeVariant = variantName;
        const info = cyberVariants[variantName];

        // 1. Dynamic document root overrides to change whole CSS color variables
        const root = document.documentElement;
        let hexColorString = "#39ff14"; // Default green
        let glowColorString = "rgba(57, 255, 20, 0.45)";
        
        if (variantName === 'ipa') {
            hexColorString = "#ff007f";
            glowColorString = "rgba(255, 0, 127, 0.45)";
        } else if (variantName === 'stout') {
            hexColorString = "#00d0ff";
            glowColorString = "rgba(0, 208, 255, 0.45)";
        }

        root.style.setProperty('--active-neon', hexColorString);
        root.style.setProperty('--active-neon-glow', glowColorString);

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

        // Reactor Core glowing rod color swap
        gsap.to(coreRod.material.color, {
            r: new THREE.Color(info.glowColor).r,
            g: new THREE.Color(info.glowColor).g,
            b: new THREE.Color(info.glowColor).b,
            duration: 0.6,
            ease: "power2.out"
        });
        gsap.to(coreRod.material.emissive, {
            r: new THREE.Color(info.glowColor).r,
            g: new THREE.Color(info.glowColor).g,
            b: new THREE.Color(info.glowColor).b,
            duration: 0.6,
            ease: "power2.out"
        });

        // Cyber Handle neon core color swap
        gsap.to(handleNeon.material.color, {
            r: new THREE.Color(info.glowColor).r,
            g: new THREE.Color(info.glowColor).g,
            b: new THREE.Color(info.glowColor).b,
            duration: 0.6,
            ease: "power2.out"
        });
        gsap.to(handleNeon.material.emissive, {
            r: new THREE.Color(info.glowColor).r,
            g: new THREE.Color(info.glowColor).g,
            b: new THREE.Color(info.glowColor).b,
            duration: 0.6,
            ease: "power2.out"
        });

        // Orbiting holo rings color swap
        gsap.to(holoRing1.material.color, {
            r: new THREE.Color(info.glowColor).r,
            g: new THREE.Color(info.glowColor).g,
            b: new THREE.Color(info.glowColor).b,
            duration: 0.6,
            ease: "power2.out"
        });
        gsap.to(holoRing2.material.color, {
            r: new THREE.Color(info.glowColor).r,
            g: new THREE.Color(info.glowColor).g,
            b: new THREE.Color(info.glowColor).b,
            duration: 0.6,
            ease: "power2.out"
        });

        // Floating digital bits color swap
        bits.forEach(bit => {
            gsap.to(bit.material.color, {
                r: new THREE.Color(info.glowColor).r,
                g: new THREE.Color(info.glowColor).g,
                b: new THREE.Color(info.glowColor).b,
                duration: 0.6,
                ease: "power2.out"
            });
            gsap.to(bit.material.emissive, {
                r: new THREE.Color(info.glowColor).r,
                g: new THREE.Color(info.glowColor).g,
                b: new THREE.Color(info.glowColor).b,
                duration: 0.6,
                ease: "power2.out"
            });
        });
    }

    // --- Main Animation loop ---
    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // 1. Canister floating bobbing physics
        const bobbing = Math.sin(elapsedTime * 1.8) * 0.055;
        // Inject to local visual without breaking timeline offset
        keyLight.position.x = 5 + Math.sin(elapsedTime * 0.4) * 2.5;

        // 2. Hologram tech rings spinning active rotation
        holoRing1.rotation.z += 0.007;
        holoRing2.rotation.z -= 0.011;

        // 3. Smooth mouse tilt (Desktop only)
        if (!isMobile) {
            beerMug.rotation.y += (targetRotationY - (beerMug.rotation.y % (Math.PI * 2))) * 0.08;
            beerMug.rotation.x += (targetRotationX - beerMug.rotation.x) * 0.08;
        }

        // 4. Rising glowing data packets (cubes) loop
        const activeSpeed = cyberVariants[activeVariant].speed;
        bits.forEach(b => {
            b.position.y += b.userData.speed * speedMultiplier * activeSpeed;
            b.rotation.x += b.userData.rotSpeedX;
            b.rotation.y += b.userData.rotSpeedY;

            // Side-to-side drift
            b.position.x += Math.sin((elapsedTime * 2.0) + b.position.y) * 0.002;
            b.position.z += Math.cos((elapsedTime * 2.0) + b.position.y) * 0.002;

            // Reset at top neck barrier (y ≈ 1.7)
            if (b.position.y >= 1.7) {
                resetBit(b);
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
            beerMug.scale.setScalar(1.0);
        } else if (isTabletNow) {
            beerMug.scale.setScalar(1.25);
        } else {
            beerMug.scale.setScalar(1.45);
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
