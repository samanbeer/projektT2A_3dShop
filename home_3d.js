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

    // --- Bottle Model Loader Architecture ---
    let bottleBodyMesh = null;
    let capMesh = null;
    let labelMesh = null;
    let dropsMesh = null;
    let bottleBodyMaterial = null;
    let capMaterial = null;
    let labelMaterial = null;
    let dropsMaterial = null;

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
        
        // Find bounding box in raw local coords
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
        const sizeX = maxX - minX;
        const sizeY = maxY - minY;
        const sizeZ = maxZ - minZ;
        
        // Determine the height axis (Y or Z) based on the largest dimension
        const useYAsHeight = sizeY > sizeZ;
        const heightVal = useYAsHeight ? sizeY : sizeZ;
        const minH = useYAsHeight ? minY : minZ;
        const cupRadius = useYAsHeight ? sizeZ / 2 : sizeY / 2;
        
        // Find which candidate X center is closer to the average X of all vertices
        const candidateX1 = minX + cupRadius; // Handle on positive X (right)
        const candidateX2 = maxX - cupRadius; // Handle on negative X (left)
        
        const centerX = Math.abs(avgX - candidateX1) < Math.abs(avgX - candidateX2) ? candidateX1 : candidateX2;
        const centerY = useYAsHeight ? (minZ + maxZ) / 2 : (minY + maxY) / 2;
        
        // Inner radius of the glass cylinder to isolate beer liquid from the glass wall
        const innerRadius = cupRadius * 0.86; 
        
        const colorArray = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const x = position.getX(i);
            const y = position.getY(i);
            const z = position.getZ(i);
            
            // Measure horizontal distance of vertex from cylinder axis
            const dx = x - centerX;
            const dy = useYAsHeight ? (z - centerY) : (y - centerY);
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const hVal = useYAsHeight ? y : z;
            const relHeight = (hVal - minH) / heightVal; // Relative vertical height (0.0 at bottom, 1.0 at top)
            
            let r = glassColor.r, g = glassColor.g, b = glassColor.b;
            
            if (dist <= innerRadius) {
                // Inside the main cup cylinder
                if (relHeight < 0.15) {
                    // Glass base (bottom 15%)
                    r = glassColor.r; g = glassColor.g; b = glassColor.b;
                } else if (relHeight >= 0.15 && relHeight < 0.76) {
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

    // Load custom GLB/GLTF model
    const loader = new THREE.GLTFLoader();
    loader.load('beer_mug_glass.glb', function (gltf) {
        const object = gltf.scene;
        console.log("GLTF model loaded successfully:", gltf);

        // Gather and enable shadow casting/receiving on all sub-meshes
        object.traverse(child => {
            console.log(`Traversed child: name="${child.name || 'unnamed'}", type="${child.type}", isMesh=${child.isMesh}`);
            if (child.isMesh || child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                const meshName = (child.name || '').toLowerCase();
                const matName = (child.material && child.material.name ? child.material.name : '').toLowerCase();
                
                if (meshName.includes('cap') || matName.includes('cap')) {
                    capMesh = child;
                } else if (meshName.includes('lable') || meshName.includes('label') || matName.includes('lable') || matName.includes('label')) {
                    labelMesh = child;
                } else if (meshName.includes('drop') || meshName.includes('sphere') || matName.includes('drop')) {
                    dropsMesh = child;
                } else if (meshName.includes('bottle') || matName.includes('beer_bottle') || matName.includes('glass') || matName.includes('liquid')) {
                    bottleBodyMesh = child;
                } else {
                    if (!bottleBodyMesh) {
                        bottleBodyMesh = child;
                    }
                }
            }
        });

        // Apply premium physical and standard PBR materials to the bottle parts
        const info = beerTypes[activeVariant];

        if (bottleBodyMesh) {
            if (bottleBodyMesh.geometry) {
                bottleBodyMesh.geometry.computeVertexNormals();
            }
            const originalMap = (bottleBodyMesh.material && bottleBodyMesh.material.map) ? bottleBodyMesh.material.map : null;
            bottleBodyMaterial = new THREE.MeshPhysicalMaterial({
                map: originalMap,
                transparent: true,
                opacity: 0.9,
                roughness: 0.08,
                metalness: 0.1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.08,
                depthWrite: true,
                transmission: 0.3,
                ior: 1.5,
                color: info.color,
                emissive: info.emissive,
                emissiveIntensity: 0.25
            });
            bottleBodyMesh.material = bottleBodyMaterial;
            console.log("Premium glass bottle body material applied.");
        }

        if (capMesh) {
            if (capMesh.geometry) {
                capMesh.geometry.computeVertexNormals();
            }
            const originalMap = (capMesh.material && capMesh.material.map) ? capMesh.material.map : null;
            capMaterial = new THREE.MeshStandardMaterial({
                map: originalMap,
                metalness: 1.0,
                roughness: 0.2,
                color: 0xffffff
            });
            capMesh.material = capMaterial;
            console.log("Premium metallic cap material applied.");
        }

        if (labelMesh) {
            if (labelMesh.geometry) {
                labelMesh.geometry.computeVertexNormals();
            }
            const originalMap = (labelMesh.material && labelMesh.material.map) ? labelMesh.material.map : null;
            labelMaterial = new THREE.MeshStandardMaterial({
                map: originalMap,
                roughness: 0.8,
                metalness: 0.1,
                color: 0xffffff
            });
            labelMesh.material = labelMaterial;
            console.log("Premium matte label material applied.");
        }

        if (dropsMesh) {
            if (dropsMesh.geometry) {
                dropsMesh.geometry.computeVertexNormals();
            }
            dropsMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                roughness: 0.05,
                metalness: 0.1,
                transmission: 0.95,
                ior: 1.333,
                depthWrite: false,
                clearcoat: 1.0,
                clearcoatRoughness: 0.05
            });
            dropsMesh.material = dropsMaterial;
            console.log("Premium refractive water droplets material applied.");
        }

        // Align coordinates: GLTF/GLB files are standard Y-up, so rotation.x is 0 by default.
        object.rotation.x = 0;
        
        // Force immediate local matrix update so bounding box is measured in coordinate space
        object.updateMatrix();

        // Auto centering & dynamic scaling bounds
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log("Loaded model dimensions - width:", size.x, "height:", size.y, "depth:", size.z);

        // Center the object locally inside the wrapper (centering X, Y, and Z)
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
        console.error("GLTF loader encountered an error:", error);
        if (loaderText) {
            loaderText.innerText = "Chyba při přípravě 3D zobrazení.";
        }
        setTimeout(() => {
            if (loaderOverlay) loaderOverlay.classList.add('loaded');
        }, 1500);
    });

    // --- Default Coordinates & Positioning (Scaled up for prominent display) ---
    beerMug.position.set(isMobile ? 0.6 : 1.8, isMobile ? -0.8 : -0.2, 0);
    
    if (isMobile) {
        beerMug.scale.setScalar(0.55);
    } else if (isTablet) {
        beerMug.scale.setScalar(0.68);
    } else {
        beerMug.scale.setScalar(0.78);
    }

    // --- Mouse Follow & Parallax (Increased rotation tilt to look more dynamic) ---
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

        targetRotationY = mouseX * 0.48; // Significantly increased tilt range
        targetRotationX = -mouseY * 0.38; // Significantly increased tilt range

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
        heroX: isMobile ? 0.6 : 1.8,
        heroY: isMobile ? -0.8 : -0.2,
        heroScale: isMobile ? 0.55 : 0.78,
        
        featX: isMobile ? -0.8 : -2.2,
        featY: isMobile ? -0.9 : -0.1,
        featScale: isMobile ? 0.60 : 0.85,
        
        portX: 0,
        portY: isMobile ? 1.5 : 1.25,
        portZ: isMobile ? -0.8 : -1.2,
        portScale: isMobile ? 0.62 : 0.88,
        
        faqX: isMobile ? 0.8 : 2.0,
        faqY: isMobile ? -1.1 : -0.95,
        faqScale: isMobile ? 0.42 : 0.60
    };

    // Step 1: Slide left for features section and rotate
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
    scrollTimeline.to(beerMug.rotation, {
        y: Math.PI * 1.5,
        x: 0.2,
        duration: 1.0,
        ease: "power2.inOut"
    }, 0);

    // Step 2: Center & Zoom for portfolio variants showcase and rotate further
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
    scrollTimeline.to(beerMug.rotation, {
        y: Math.PI * 3.0,
        x: -0.3,
        duration: 1.0,
        ease: "power2.inOut"
    }, 1.0);

    // Step 3: Anchor bottom-right for FAQ section and complete spin
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
    scrollTimeline.to(beerMug.rotation, {
        y: Math.PI * 4.5,
        x: 0,
        z: 0,
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

        if (bottleBodyMaterial) {
            gsap.to(bottleBodyMaterial.color, {
                r: new THREE.Color(info.color).r,
                g: new THREE.Color(info.color).g,
                b: new THREE.Color(info.color).b,
                duration: 0.6,
                ease: "power2.out"
            });
            if (bottleBodyMaterial.emissive) {
                gsap.to(bottleBodyMaterial.emissive, {
                    r: new THREE.Color(info.emissive).r,
                    g: new THREE.Color(info.emissive).g,
                    b: new THREE.Color(info.emissive).b,
                    duration: 0.6,
                    ease: "power2.out"
                });
            }
        }
    }

    // --- Main Animation loop ---
    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // 1. Slow continuous spin on the model subgroup (made faster and more active)
        mugModelGroup.rotation.y = elapsedTime * 0.45;

        // 2. Bobbing floating effect (made wider and more noticeable)
        const bobbing = Math.sin(elapsedTime * 2.2) * 0.22;
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
            beerMug.scale.setScalar(0.55);
        } else if (isTabletNow) {
            beerMug.scale.setScalar(0.68);
        } else {
            beerMug.scale.setScalar(0.78);
        }
    });

    animate();
}
