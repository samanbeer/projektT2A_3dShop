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

    // --- 3MF Custom Model Loader Architecture ---
    let glassMaterial = null;
    let glassMesh = null;

    const clock = new THREE.Clock();

    // Programmatic real-time vertex color painter for uncolored single-mesh prints
    function generateVertexColors(mesh, variantName) {
        if (!mesh || !mesh.geometry) return;
        
        const position = mesh.geometry.attributes.position;
        if (!position) return;
        
        const count = position.count;
        const info = beerTypes[variantName];
        const beerColor = new THREE.Color(info.color);
        const foamColor = new THREE.Color(info.foamColor);
        const glassColor = new THREE.Color(0xdceef2); // Premium semi-translucent glass tint
        
        // Find bounding box in raw local coords (Z-up is standard in CAD/3MF)
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;
        let sumX = 0;
        
        for (let i = 0; i < count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const z = position.getZ(i);
            
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
            sumX += x;
        }
        
        const avgX = sumX / count;
        const depthY = maxY - minY;
        const cupRadius = depthY / 2;
        
        // Find which candidate X center is closer to the average X of all vertices
        const candidateX1 = minX + cupRadius; // Handle on positive X (right)
        const candidateX2 = maxX - cupRadius; // Handle on negative X (left)
        
        const centerX = Math.abs(avgX - candidateX1) < Math.abs(avgX - candidateX2) ? candidateX1 : candidateX2;
        const centerY = (minY + maxY) / 2;
        const heightZ = maxZ - minZ;
        
        // Inner radius of the glass cylinder to isolate beer liquid from the glass wall
        const innerRadius = cupRadius * 0.86; 
        
        const colorArray = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const z = position.getZ(i);
            
            // Measure horizontal distance of vertex from cylinder axis
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const relZ = (z - minZ) / heightZ; // Relative vertical height (0.0 at bottom, 1.0 at top)
            
            let r = glassColor.r, g = glassColor.g, b = glassColor.b;
            
            if (dist <= innerRadius) {
                // Inside the main cup cylinder
                if (relZ < 0.15) {
                    // Glass base (bottom 15%)
                    r = glassColor.r; g = glassColor.g; b = glassColor.b;
                } else if (relZ >= 0.15 && relZ < 0.76) {
                    // Glowing beer liquid body (middle 61%)
                    r = beerColor.r; g = beerColor.g; b = beerColor.b;
                } else {
                    // White creamy foam head (top 24%)
                    r = foamColor.r; g = foamColor.g; b = foamColor.b;
                }
            } else {
                // Outside cylinder (Glass handle and outer glass walls)
                r = glassColor.r; g = glassColor.g; b = glassColor.b;
            }
            
            colorArray[i * 3] = r;
            colorArray[i * 3 + 1] = g;
            colorArray[i * 3 + 2] = b;
        }
        
        mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        mesh.geometry.attributes.color.needsUpdate = true;
    }

    // Access dynamic loading screen text
    const loaderOverlay = document.querySelector('.loader-overlay-3d');
    const loaderText = document.querySelector('.loader-text');

    if (loaderText) {
        loaderText.innerText = 'Nahrávám kybernetický 3D model...';
    }

    // Load custom multi-color beer mug model
    const loader = new THREE.ThreeMFLoader();
    loader.load('beer_2_colours.3mf', function (object) {
        console.log("3MF model loaded successfully:", object);

        // Gather and enable shadow casting/receiving on all sub-meshes
        const meshes = [];
        object.traverse(child => {
            console.log(`Traversed child: name="${child.name || 'unnamed'}", type="${child.type}", isMesh=${child.isMesh}`);
            if (child.isMesh || child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                meshes.push(child);
            }
        });

        console.log(`Parsed ${meshes.length} sub-meshes from 3MF.`);

        let glassMesh = null;
        let liquidMesh = null;
        let foamMesh = null;

        // Dynamic, robust volume and height-based classification for multi-color models
        if (meshes.length === 1) {
            glassMesh = meshes[0];
        } else if (meshes.length === 2) {
            const boxA = new THREE.Box3().setFromObject(meshes[0]);
            const boxB = new THREE.Box3().setFromObject(meshes[1]);
            const volA = (boxA.max.x - boxA.min.x) * (boxA.max.y - boxA.min.y) * (boxA.max.z - boxA.min.z);
            const volB = (boxB.max.x - boxB.min.x) * (boxB.max.y - boxB.min.y) * (boxB.max.z - boxB.min.z);
            
            console.log(`2 meshes found. Mesh 0 vol: ${volA}, Mesh 1 vol: ${volB}`);
            if (volA > volB) {
                glassMesh = meshes[0];
                liquidMesh = meshes[1];
            } else {
                glassMesh = meshes[1];
                liquidMesh = meshes[0];
            }
        } else if (meshes.length >= 3) {
            let maxVol = -1;
            let glassIndex = -1;
            const volumes = meshes.map((m, i) => {
                const box = new THREE.Box3().setFromObject(m);
                const vol = (box.max.x - box.min.x) * (box.max.y - box.min.y) * (box.max.z - box.min.z);
                if (vol > maxVol) {
                    maxVol = vol;
                    glassIndex = i;
                }
                return { index: i, vol: vol, box: box, center: box.getCenter(new THREE.Vector3()) };
            });
            
            console.log("3+ meshes found, sorted volumes:", volumes);
            glassMesh = meshes[glassIndex];
            
            const remaining = volumes.filter(v => v.index !== glassIndex);
            remaining.sort((a, b) => a.center.y - b.center.y);
            
            if (remaining.length === 1) {
                liquidMesh = meshes[remaining[0].index];
            } else {
                // In single-mesh mode, just fallback to first mesh
                glassMesh = meshes[0];
            }
        } else {
            // Handle fallback if no meshes at all
            glassMesh = meshes[0];
        }

        // Apply physical materials to the classified parts (optimized for maximum WebGL compatibility)
        if (glassMesh) {
            // Ensure normals are computed correctly so physical materials don't render black
            if (glassMesh.geometry) {
                glassMesh.geometry.computeVertexNormals();
            }
            
            glassMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                vertexColors: true, // Crucial! Enables programmatic vertex coloring
                transparent: true,
                opacity: 0.88, // Solid glossy glass and liquid body
                roughness: 0.08,
                metalness: 0.12,
                depthWrite: true,
                clearcoat: 1.0,
                clearcoatRoughness: 0.08
            });
            glassMesh.material = glassMaterial;
            
            // Programmatically color the model vertices in real-time!
            generateVertexColors(glassMesh, activeVariant);
            console.log("Programmatic multi-color vertex styling mounted to 3D model.");
        }

        // Align coordinates: Rotate from CAD/3D printing Z-up standard to WebGL Y-up standard
        object.rotation.x = -Math.PI / 2;
        
        // Force immediate local matrix update so bounding box is measured in rotated coordinate space
        object.updateMatrix();

        // Auto centering & dynamic scaling bounds
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log("Rotated model dimensions - width:", size.x, "height:", size.y, "depth:", size.z);

        // Center the rotated object locally inside the wrapper (centering X, Y, and Z)
        object.position.set(-center.x, -center.y, -center.z);

        const modelWrapper = new THREE.Group();
        modelWrapper.add(object);

        // Normalize size dynamically to fit perfectly into camera viewport (target height 4.0 units)
        const targetHeight = 4.0;
        const scaleFactor = targetHeight / size.y;
        modelWrapper.scale.setScalar(scaleFactor);

        mugModelGroup.add(modelWrapper);

        // Smoothly dismiss the loading overlay and execute slow epic entry
        setTimeout(() => {
            if (loaderOverlay) {
                loaderOverlay.classList.add('loaded');
            }
            gsap.from(beerMug.position, {
                y: 6,
                duration: 1.8,
                ease: "power3.out"
            });
        }, 500);

    }, function (xhr) {
        if (xhr.total) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            if (loaderText) {
                loaderText.innerText = `Čepujeme 3D model (${percent}%)...`;
            }
        }
    }, function (error) {
        console.error("3MF loader encountered an error:", error);
        if (loaderText) {
            loaderText.innerText = "Chyba při přípravě 3D zobrazení.";
        }
        setTimeout(() => {
            if (loaderOverlay) loaderOverlay.classList.add('loaded');
        }, 1500);
    });

    // --- Default Coordinates & Positioning ---
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

        targetRotationY = mouseX * 0.18;
        targetRotationX = -mouseY * 0.12;

        // Smoothly glide the neon glowing orb to track the cursor coordinates (Lepshee-style energy)
        const orb = document.getElementById('glow-orb');
        if (orb) {
            gsap.to(orb, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.8,
                ease: "power2.out"
            });
        }
    });

    // --- GSAP ScrollTrigger Integration ---
    gsap.registerPlugin(ScrollTrigger);

    const scrollTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#page-home",
            start: "top top",
            end: "bottom bottom",
            scrub: 2.0, // Buttery smooth GSAP scroll inertia
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

    // Step 1: Slide left for features section
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

        // Regenerate vertex colors with the new variant beer colors dynamically in real-time!
        if (glassMesh) {
            generateVertexColors(glassMesh, variantName);
        }
    }

    // --- Main Animation loop ---
    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // 1. Slow continuous spin on the model subgroup
        mugModelGroup.rotation.y = elapsedTime * 0.16;

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
}
