import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';

// Transition variables for smooth animations
let transitionStartTime = 0;
let transitionDuration = 1000; // 1 second for transitions
let startRotationY = 0;
let targetRotationY = 0;
let startPosition = new THREE.Vector3();
let targetPosition = new THREE.Vector3();
let startScale = new THREE.Vector3(1, 1, 1);
let targetScale = new THREE.Vector3(1, 1, 1);
// Camera transition variables (horizontal panning)
let cameraBaseX = 0; // Base X position for camera panning
let cameraStartX = 0;
let cameraTargetX = 0;

// Scene setup
const scene = new THREE.Scene();

// Add atmospheric fog for a misty driving scene
scene.fog = new THREE.FogExp2(0xcccccc, 0.125); // Light gray fog with moderate density
let fogStartDensity = 0.125; // Track initial fog density
let fogTargetDensity = 0.0; // Target density when fog clears

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
// Initialize camera base X position
cameraBaseX = 0;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87CEEB, 1); // Dark blue night sky background
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Lighting setup - Dimmed for headlight visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Much dimmer ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.85); // Dimmed sunlight for headlight visibility
directionalLight.position.set(10, 20, 5);
directionalLight.castShadow = true;

// Configure shadow properties
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// Ground plane - Light green grass field
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshLambertMaterial({
    color: 0x90EE90  // Light green color
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Road - Gray asphalt rectangle in the middle (made wider)
const roadGeometry = new THREE.PlaneGeometry(6, 100); // 6 units wide (wider road), 100 units long
const roadMaterial = new THREE.MeshLambertMaterial({
    color: 0x696969  // Dim gray color for asphalt
});
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01; // Slightly above ground to prevent z-fighting
road.receiveShadow = true;
scene.add(road);

// Add dashed center line
const dashLength = 1; // Length of each dash
const gapLength = 1; // Gap between dashes
const dashWidth = 0.1; // Width of the dashed line
const dashColor = 0xFFFFFF; // White dashed line

for (let z = -45; z < 45; z += dashLength + gapLength) {
    const dashGeometry = new THREE.PlaneGeometry(dashWidth, dashLength);
    const dashMaterial = new THREE.MeshLambertMaterial({
        color: dashColor
    });
    const dash = new THREE.Mesh(dashGeometry, dashMaterial);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.02, z); // Center of road, slightly above road surface
    dash.receiveShadow = false; // Dashed lines don't need to receive shadows
    scene.add(dash);
}

// Add some trees for atmosphere
function createTree(x, z) {
    const treeGroup = new THREE.Group();

    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 3, 8);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Tree leaves (cone)
    const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 4;
    leaves.castShadow = true;
    treeGroup.add(leaves);

    treeGroup.position.set(x, 0, z);
    scene.add(treeGroup);
}

// Load deer GLTF model
function loadDeerModel(callback) {
    const loader = new GLTFLoader();
    loader.load(
        '../Model/deer/scene.gltf',
        function (gltf) {
            const deerModel = gltf.scene;
            const animations = gltf.animations; // Get animations from GLTF

            // Scale and position the deer model appropriately
            deerModel.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
            deerModel.position.set(0, 0, 0);

            // Enable shadows and brighten materials for the deer model
            deerModel.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // Brighten the deer materials
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            // Handle multi-material meshes
                            child.material.forEach(mat => brightenMaterial(mat));
                        } else {
                            brightenMaterial(child.material);
                        }
                    }

                }
            });

            // Function to brighten materials
            function brightenMaterial(material) {
                // Increase emissive color to make it self-illuminated
                material.emissive = material.emissive || new THREE.Color(0x000000);
                material.emissive.add(new THREE.Color(0x222222)); // Add subtle self-illumination

                // Boost ambient contribution if it exists
                if (material.color) {
                    material.color.multiplyScalar(1.3); // Make base color 30% brighter
                }

                // Ensure material isn't too dark
                material.needsUpdate = true;
            }

            callback(deerModel, animations);
        },
        function (progress) {
        },
        function (error) {
            console.error('Error loading deer model:', error);
            // Fallback to simple deer if GLTF fails
            const simpleDeer = createSimpleDeer();
            callback(simpleDeer);
        }
    );
}

// Fallback simple deer (same as before)
function createSimpleDeer() {
    const deerGroup = new THREE.Group();

    // Body (elongated ellipsoid)
    const bodyGeometry = new THREE.SphereGeometry(0.8, 8, 6);
    bodyGeometry.scale(1, 0.6, 1.8); // Make it more elongated
    const bodyMaterial = new THREE.MeshLambertMaterial({
        color: 0xCD853F, // Lighter brown (sandy brown)
        emissive: 0x331100 // Add subtle self-illumination
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.5, 0);
    body.castShadow = true;
    deerGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.4, 8, 6);
    const headMaterial = new THREE.MeshLambertMaterial({
        color: 0xCD853F, // Lighter brown
        emissive: 0x331100 // Add subtle self-illumination
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.8, 1.0);
    head.castShadow = true;
    deerGroup.add(head);

    // Legs (4 legs)
    const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 6);
    const legMaterial = new THREE.MeshLambertMaterial({
        color: 0x8B7355, // Medium brown (lighter than before)
        emissive: 0x221100 // Add subtle self-illumination
    });

    const legPositions = [
        [-0.3, 0.4, 0.6],   // Front left
        [0.3, 0.4, 0.6],    // Front right
        [-0.3, 0.4, -0.6],  // Back left
        [0.3, 0.4, -0.6]    // Back right
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        deerGroup.add(leg);
    });

    // Antlers (simple)
    const antlerGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4);
    const antlerMaterial = new THREE.MeshLambertMaterial({
        color: 0xF5DEB3, // Wheat color (light beige)
        emissive: 0x221100 // Add subtle self-illumination
    });

    // Left antler
    const leftAntler = new THREE.Mesh(antlerGeometry, antlerMaterial);
    leftAntler.position.set(-0.15, 1.0, 0.9);
    leftAntler.rotation.z = Math.PI / 6;
    deerGroup.add(leftAntler);

    // Right antler
    const rightAntler = new THREE.Mesh(antlerGeometry, antlerMaterial);
    rightAntler.position.set(0.15, 1.0, 0.9);
    rightAntler.rotation.z = -Math.PI / 6;
    deerGroup.add(rightAntler);

    return deerGroup;
}

// Add trees around the field
createTree(-15, -10);
createTree(15, 5);
createTree(-20, 15);
createTree(25, -20);
createTree(-5, 25);

// Create and add deer (using GLTF model)
let deer;
let deerMixer; // Animation mixer for deer
let deerAnimations = []; // Store available animations
loadDeerModel(function(deerModel, animations) {
    deer = deerModel;
    deer.position.set(-8, 0, 5); // Start position (left side of road)
    deer.rotation.y = Math.PI / 2; // Face the direction of crossing
    scene.add(deer);

    // Set up animations if available
    if (animations && animations.length > 0) {
        deerMixer = new THREE.AnimationMixer(deer);
        deerAnimations = animations;


        deerAnimationState = 'walking'; // Set initial state

        // Start with the walking animation (animation 2, index 2 - "Walk") - faster
        if (animations.length > 2) {
            const action = deerMixer.clipAction(animations[2]);
            action.timeScale = 2.0; // 2x speed for faster walking
            action.play();
        } else if (animations.length > 1) {
            // Fallback to Eat animation if Walk not available
            const action = deerMixer.clipAction(animations[1]);
            action.timeScale = 2.0; // 2x speed for faster animation
            action.play();
        } else if (animations[0]) {
            // Final fallback to Die animation
            const action = deerMixer.clipAction(animations[0]);
            action.timeScale = 1.5; // Slightly faster for die animation
            action.play();
        }
    } else {
    }


    // Add keyboard controls for deer animations
    window.addEventListener('keydown', function(event) {
        if (!deerMixer || !deerAnimations.length) return;

        let animationIndex = -1;

        switch(event.key) {
            case '1':
                animationIndex = 0;
                break;
            case '2':
                animationIndex = 1;
                break;
            case '3':
                animationIndex = 2;
                break;
        }

        if (animationIndex >= 0 && animationIndex < deerAnimations.length) {
            // Stop all current animations
            deerMixer.stopAllAction();

            // Play the selected animation
            const action = deerMixer.clipAction(deerAnimations[animationIndex]);
            action.play();
        }
    });

});

// Car headlights setup
let leftHeadlight, rightHeadlight;
// Headlight intensity tracking for transitions
let leftHeadlightStartIntensity = 8;
let rightHeadlightStartIntensity = 8;
let headlightTargetIntensity = 0;

// Create car headlights
function createHeadlights() {
    // Left headlight - more intense and visible
    leftHeadlight = new THREE.SpotLight(0xffffff, 3, 0, Math.PI / 3, 0.3, 1);
    leftHeadlight.position.set(-1, 1.2, -2.8); // Position at front-left of car
    leftHeadlight.target.position.set(0, 1, -20); // Point further downward and forward
    leftHeadlight.castShadow = true;

    // Configure shadow properties
    leftHeadlight.shadow.mapSize.width = 1024;
    leftHeadlight.shadow.mapSize.height = 1024;
    leftHeadlight.shadow.camera.near = 0.5;
    leftHeadlight.shadow.camera.far = 30;

    // Right headlight - more intense and visible
    rightHeadlight = new THREE.SpotLight(0xffffff, 3, 0, Math.PI / 3, 0.3, 1);
    rightHeadlight.position.set(1, 1.2, -2.8); // Position at front-right of car
    rightHeadlight.target.position.set(0, 1, -20); // Point further downward and forward
    rightHeadlight.castShadow = true;

    // Configure shadow properties
    rightHeadlight.shadow.mapSize.width = 1024;
    rightHeadlight.shadow.mapSize.height = 1024;
    rightHeadlight.shadow.camera.near = 0.5;
    rightHeadlight.shadow.camera.far = 30;

    // Add visible light helpers for debugging
    // const leftHelper = new THREE.SpotLightHelper(leftHeadlight);
    // const rightHelper = new THREE.SpotLightHelper(rightHeadlight);
    // scene.add(leftHelper);
    // scene.add(rightHelper);

}

// Barn setup
let barn;
const barnLoader = new GLTFLoader();
barnLoader.load(
    '../Model/barn/scene.gltf',
    function (gltf) {
        barn = gltf.scene;

        // Scale and position the barn appropriately for background
        barn.scale.set(0.09, 0.09, 0.09); // Small scale for background element
        barn.position.set(15, 0, 1); // Position far to the left and behind the road
        barn.rotation.y = Math.PI; // Slight rotation for visual interest

        // Enable shadows for barn
        barn.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(barn);
    },
    function (progress) {
        // Loading progress can be logged if needed
    },
    function (error) {
        console.error('Error loading barn model:', error);
        // Could add a fallback simple barn here if needed
    }
);

// Car setup
let car;
const loader = new GLTFLoader();

// Create headlights first
createHeadlights();

// First create a simple visible car as placeholder
createSimpleCar();

loader.load(
    '../Model/car/car_model.gltf',
    function (gltf) {
        // Remove the simple car placeholder.
        if (car && car.userData.isPlaceholder) {
            scene.remove(car);
        }

        car = gltf.scene;

        // Try different scale - GLTF models can be very large or small
        car.scale.set(0.75, 0.75, 0.75); // Increased scale
        car.position.set(1.5, 0.0, -20); // Position above ground
        car.rotation.y = Math.PI; // Face the camera (no rotation)

        // Enable shadows for car
        car.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Attach headlights to the car
        car.add(leftHeadlight);
        car.add(rightHeadlight);
        car.add(leftHeadlight.target);
        car.add(rightHeadlight.target);

        scene.add(car);
    },
    function (progress) {
    },
    function (error) {
        console.error('Error loading car model:', error);
    }
);

// Fallback simple car (placeholder)
function createSimpleCar() {
    const carGeometry = new THREE.BoxGeometry(2, 1, 4);
    const carMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.set(0, 0.5, -20); // Position above ground
    car.rotation.y = 0; // Face the camera (no rotation)
    car.castShadow = true;
    car.userData.isPlaceholder = true; // Mark as placeholder
    // Attach headlights to placeholder car
    car.add(leftHeadlight);
    car.add(rightHeadlight);
    car.add(leftHeadlight.target);
    car.add(rightHeadlight.target);

    scene.add(car);
}

// Animation variables
let carSpeed = 0.05;
let carPosition = -20;
let originalCarSpeed = 0.05;
let carStopped = false;

// Deer animation variables
let deerCrossing = false;
let deerStartTime = 0;
let deerCrossDuration = 3000; // 3 seconds to cross (slower physical movement)
let deerStartX = -8;
let deerEndX = 8;
let deerSpeed = 2; // Normal deer walking speed
let deerIsDead = false; // Track if deer has been hit and should stay dead
let deerReverseDieTimeout = null; // Track reverse animation timeout
let deerAnimationState = 'walking'; // Track current animation state: 'walking', 'dying', 'recovering', 'standing_after_recovery', 'facing_car', 'retreating', 'scaling', 'eating', 'charging', 'victorious', 'rescaling', 'rotating_to_grass', 'peaceful_crossing'

// Charging and car flight variables
let deerChargeTarget; // Position the deer is charging toward
let deerChargeSpeed; // Speed of deer charge
let carIsFlying = false; // Track if car is in flight
let carFlightStartTime; // When car flight started
let carInitialPosition; // Car position when flight started
let carFlightVelocity; // Initial velocity vector for car flight
let carRotationVelocity; // Rotation speed vector
let carGravity; // Gravity acceleration

// Camera zoom variables
let cameraZoomStart; // Camera Z position before zoom
let cameraZoomTarget; // Camera Z position after zoom

// Scene reset function for rewind button
function resetScene() {

    // Reset deer state
    if (deer) {
        // Clear any pending reverse animation timeout
        if (deerReverseDieTimeout) {
            clearTimeout(deerReverseDieTimeout);
            deerReverseDieTimeout = null;
        }

        deerIsDead = false;
        deerCrossing = false;
        deerAnimationState = 'walking'; // Reset to walking state
        deer.position.set(deerStartX, 0, 5); // Reset position
        deer.rotation.y = Math.PI / 2; // Face the direction of crossing
        deer.scale.set(1.0, 1.0, 1.0); // Reset scale
    }

    // Reset car state
    carStopped = false;
    carPosition = -20; // Reset to initial starting position
    carSpeed = 0.05; // Ensure speed is set
    if (car) {
        if (car.userData.isPlaceholder) {
            // Placeholder car positioning
            car.position.set(0, 0.5, carPosition);
            car.rotation.y = 0;
        } else {
            // GLTF car positioning
            car.position.set(1.5, 0.0, carPosition);
            car.rotation.y = Math.PI; // 180 degrees
        }
    }

    // Reset camera
    cameraBaseX = 0;
    camera.position.set(cameraBaseX, 5, 10);
    camera.lookAt(0, 0, 0);

    // Reset fog
    scene.fog.density = fogStartDensity;

    // Reset headlights
    if (leftHeadlight) {
        leftHeadlight.intensity = 8;
        leftHeadlight.castShadow = true;
    }
    if (rightHeadlight) {
        rightHeadlight.intensity = 8;
        rightHeadlight.castShadow = true;
    }

    // Reset flight physics
    carIsFlying = false;

    // Reset timing and transition variables
    animationTime = 0;
    lastTime = 0;
    transitionStartTime = 0;
    transitionDuration = 1000; // Reset to default

    // Restart walking animation
    if (deerMixer && deerAnimations.length > 2) {
        deerMixer.stopAllAction();
        const walkAction = deerMixer.clipAction(deerAnimations[2]);
        walkAction.timeScale = 2.0;
        walkAction.setLoop(THREE.LoopRepeat);
        walkAction.play();
    }

}

// Animation loop
let lastTime = 0;
let animationTime = 0; // Consistent time base for transitions
function animate(currentTime = 0) {
    requestAnimationFrame(animate);
    const deltaTime = (currentTime - lastTime) * 0.001; // Convert to seconds
    animationTime += deltaTime * 1000; // Keep consistent time in milliseconds
    lastTime = currentTime;

    // Handle deer crossing start (only if deer can walk)
    if (deer && !deerCrossing && carPosition > -5 && carPosition < 15 && (deerAnimationState === 'walking' || deerAnimationState === 'standing_after_recovery' || deerAnimationState === 'retreating')) {
        // Start deer crossing when car is approaching
        deerCrossing = true;
        deerStartTime = currentTime;
        deerAnimationState = 'walking'; // Set to walking state

        // Switch to walking animation (animation 2, index 2 - "Walk") - faster
        if (deerMixer && deerAnimations.length > 2) {
            deerMixer.stopAllAction();
            const walkAction = deerMixer.clipAction(deerAnimations[2]);
            walkAction.timeScale = 2.0; // 2x speed for faster walking
            walkAction.play();
        } else if (deerMixer && deerAnimations.length > 1) {
            // Fallback to Eat animation if Walk not available
            deerMixer.stopAllAction();
            const walkAction = deerMixer.clipAction(deerAnimations[1]);
            walkAction.timeScale = 2.0; // 2x speed for faster animation
            walkAction.play();
        } else {
        }
    }

    // Animate deer crossing (only if deer is loaded and in walking state)
    if (deer && deerCrossing && deerAnimationState === 'walking') {
        const elapsed = currentTime - deerStartTime;
        const progress = Math.min(elapsed / deerCrossDuration, 1);  

        // Move deer from left to right across the road
        const currentX = deerStartX + (deerEndX - deerStartX) * progress;
        deer.position.x = currentX;
        deer.position.z = 5; // Keep deer at road crossing point

        // Add slight bobbing motion
        deer.position.y = Math.sin(progress * Math.PI * 4) * 0.1;

        // Check for collision with car
        const deerDistance = Math.abs(deer.position.z - carPosition);
        const deerXDistance = Math.abs(deer.position.x - car.position.x);

        if (!carStopped && deerDistance < 2.5 && deerXDistance < 1.5 && progress < 0.8 && deerAnimationState === 'walking') {
            // Car hits deer - stop suddenly!
            carSpeed = 0;
            carStopped = true;
            deerAnimationState = 'dying'; // Change state to dying

            // Switch to hit/fall animation (animation 0, index 0 - "Die") - play once only
            if (deerMixer && deerAnimations.length > 0) {
                deerMixer.stopAllAction();
                const hitAction = deerMixer.clipAction(deerAnimations[0]);
                hitAction.timeScale = 2.5; // Speed up the die animation (2.5x speed for more dramatic effect)
                hitAction.setLoop(THREE.LoopOnce); // Play only once, don't loop
                hitAction.clampWhenFinished = true; // Stay at final pose when finished
                hitAction.play();

                // Schedule reverse animation after forward animation completes
                deerReverseDieTimeout = setTimeout(() => {
                    if (deerAnimationState === 'dying') {
                        deerAnimationState = 'recovering';

                        // Stop all current animations first
                        deerMixer.stopAllAction();

                        // Create and play reverse animation
                        const reverseAction = deerMixer.clipAction(deerAnimations[0]);
                        reverseAction.reset(); // Reset the animation state
                        reverseAction.time = deerAnimations[0].duration; // Start from the end
                        reverseAction.timeScale = -1.0; // Normal speed reverse playback
                        reverseAction.setLoop(THREE.LoopOnce); // Play only once
                        reverseAction.clampWhenFinished = true; // Stay at start pose when finished


                        reverseAction.play();

                        // After reverse animation completes, keep deer in standing pose
                        const reverseDuration = deerAnimations[0].duration / Math.abs(reverseAction.timeScale);

                        setTimeout(() => {
                            if (deerAnimationState === 'recovering') {
                                deerAnimationState = 'standing_after_recovery';
                                deerIsDead = false; // Deer is back to normal but stays in pose

                                // After a brief pause, face the car
                                setTimeout(() => {
                                    if (deerAnimationState === 'standing_after_recovery') {
                                        deerAnimationState = 'facing_car';

                                        // Calculate direction to car and set up smooth rotation
                                        if (car) {
                                            const deerPos = deer.position.clone();
                                            const carPos = car.position.clone();

                                            // Calculate direction vector from deer to car
                                            const direction = new THREE.Vector3().subVectors(carPos, deerPos);
                                            direction.y = 0; // Keep rotation only on Y axis (horizontal)
                                            direction.normalize();

                                            // Calculate target rotation angle
                                            const targetAngle = Math.atan2(direction.x, direction.z);

                                            // Set up smooth rotation transition
                                            transitionStartTime = animationTime;
                                            startRotationY = deer.rotation.y;
                                            targetRotationY = targetAngle;

                                        // After facing the car, retreat away from it (with smooth transition)
                                        setTimeout(() => {
                                            if (deerAnimationState === 'facing_car') {
                                                deerAnimationState = 'retreating';

                                                // Move deer parallel to the road (along Z-axis) to get head-on with car
                                                // Determine if deer should move forward or backward along the road
                                                const deerZ = deerPos.z;
                                                const carZ = carPos.z;

                                                // If car is behind deer, move deer forward to face car
                                                // If car is ahead of deer, move deer backward to face car
                                                const zOffset = (carZ < deerZ) ? 5 : -5; // Move toward car along road

                                                // Keep deer on the same X position (same side of road) but adjust Z
                                                const targetZ = deerZ + zOffset;

                                                // Set up smooth transition
                                                transitionStartTime = animationTime;
                                                startPosition.copy(deer.position);
                                                targetPosition.copy(new THREE.Vector3(deerPos.x, deerPos.y, targetZ));
                                            }
                                        }, 1500); // Wait 1.5 seconds before retreating
                                        }
                                    }
                                }, 1000); // Wait 1 second before facing car
                            }
                        }, reverseDuration * 1000 + 200); // Wait for animation duration + small buffer
                    }
                }, 1000); // Wait 1 second for forward animation to complete
            } else {
            }
        }

        // Reset deer after crossing (only if not dead)
        if (progress >= 1) {
            deerCrossing = false;
            deer.position.set(deerStartX, 0, 5); // Reset position

            // Switch back to walking animation for next crossing (animation 2 - "Walk") - faster
            if (deerMixer && deerAnimations.length > 2) {
                deerMixer.stopAllAction();
                const walkAction = deerMixer.clipAction(deerAnimations[2]);
                walkAction.timeScale = 2.0; // 2x speed for faster walking
                walkAction.play();
            } else if (deerMixer && deerAnimations.length > 1) {
                // Fallback to Eat animation
                deerMixer.stopAllAction();
                const walkAction = deerMixer.clipAction(deerAnimations[1]);
                walkAction.timeScale = 2.0; // 2x speed for faster animation
                walkAction.play();
            }

            // Car can start moving again after a delay
            setTimeout(() => {
                carSpeed = originalCarSpeed;
                carStopped = false;
            }, 2000);
        }
    }

    // Update deer animations
    if (deerMixer) {
        deerMixer.update(deltaTime);

        // Handle deer charging toward car
        if (deerAnimationState === 'charging') {
            // Move deer rapidly toward the car
            const direction = new THREE.Vector3().subVectors(deerChargeTarget, deer.position).normalize();
            deer.position.add(direction.multiplyScalar(deerChargeSpeed * deltaTime));

            // Check if deer has reached the car (collision detection)
            const distanceToCar = deer.position.distanceTo(deerChargeTarget);
            if (distanceToCar < 2.0) { // Close enough to "hit" the car

                // Stop deer charging
                deerAnimationState = 'victorious';
                deer.position.copy(deerChargeTarget); // Position deer at car location

                // Trigger car flight physics
                carIsFlying = true;
                carFlightStartTime = animationTime;
                carInitialPosition = car.position.clone();
                carFlightVelocity = new THREE.Vector3(2, 20, 15); // Initial velocity: slight side, high up, strong forward along road
                carRotationVelocity = new THREE.Vector3(
                    Math.random() * 15 - 7.5, // Stronger X rotation for tumbling
                    Math.random() * 20 - 10, // Very strong Y rotation for flipping
                    Math.random() * 15 - 7.5  // Stronger Z rotation for rolling
                );
                carGravity = -20; // Gravity acceleration
            }
        }

        // Handle car flight physics
        if (carIsFlying) {
            const flightTime = (animationTime - carFlightStartTime) / 1000; // Convert to seconds

            // Apply gravity to vertical velocity
            const verticalVelocity = carFlightVelocity.y + carGravity * flightTime;

            // Calculate new position using physics
            const newPosition = carInitialPosition.clone();
            newPosition.x += carFlightVelocity.x * flightTime;
            newPosition.y += carFlightVelocity.y * flightTime + 0.5 * carGravity * flightTime * flightTime; // s = ut + 0.5at²
            newPosition.z += carFlightVelocity.z * flightTime;

            car.position.copy(newPosition);

            // Apply rotation (spinning in air)
            car.rotation.x += carRotationVelocity.x * deltaTime;
            car.rotation.y += carRotationVelocity.y * deltaTime;
            car.rotation.z += carRotationVelocity.z * deltaTime;


            // Check if car has landed (hit ground)
            if (car.position.y <= 1.0 && flightTime > 0.5) { // Give it time to get airborne first
                carIsFlying = false;
                car.position.y = 1.0; // Reset to ground level
                car.rotation.set(0, 0, 0); // Reset rotation

                // Trigger deer rescaling sequence after car crash
                if (deerAnimationState === 'victorious') {
                    deerAnimationState = 'rescaling';
                    transitionStartTime = animationTime;
                    startScale.copy(deer.scale); // Current 2x scale
                    targetScale.set(1.0, 1.0, 1.0); // Back to normal 1x scale
                    transitionDuration = 2000; // 2 second rescale

                    // Set up camera zoom after rescaling
                    cameraZoomStart = camera.position.z;
                    cameraZoomTarget = camera.position.z * 0.01; // Zoom in to 40% of current distance
                }
            }
        }

        // Peaceful crossing after rescaling (deer walks across road normally at 1x scale)
        if (deer && deerCrossing && deerAnimationState === 'peaceful_crossing') {
            const elapsed = animationTime - transitionStartTime;
            const progress = Math.min(elapsed / 8000, 1); // 8 second crossing duration (much slower)

            // Move deer from current position to right side of road
            const startX = deer.position.x;
            const endX = 20; // Just beyond the right side of road
            const currentX = startX + (endX - startX) * progress * 0.008;
            deer.position.x = currentX;
            deer.position.z = 2.5; // Keep deer at road crossing point


            // Deer peacefully completes crossing
            if (progress >= 1) {
                deerCrossing = false;
                // Scene will reset naturally on next loop
            }
        }

        // Handle smooth transitions for rotation, movement, and scaling
        if (deerAnimationState === 'facing_car' || deerAnimationState === 'retreating' || deerAnimationState === 'scaling' || deerAnimationState === 'rescaling' || deerAnimationState === 'rotating_to_grass') {
            const elapsed = animationTime - transitionStartTime;
            const progress = Math.min(elapsed / transitionDuration, 1);


            // Smooth rotation transition
            if (deerAnimationState === 'facing_car' || deerAnimationState === 'rotating_to_grass') {
                deer.rotation.y = startRotationY + (targetRotationY - startRotationY) * progress;
            }

            // Smooth position transition
            if (deerAnimationState === 'retreating') {
                deer.position.lerpVectors(startPosition, targetPosition, progress);
            }

            // Smooth scaling transition
            if (deerAnimationState === 'scaling') {
                deer.scale.lerpVectors(startScale, targetScale, progress);
                // Smooth horizontal camera pan during scaling
                cameraBaseX = cameraStartX + (cameraTargetX - cameraStartX) * progress;
                // Smooth fog clearing during scaling
                scene.fog.density = fogStartDensity + (fogTargetDensity - fogStartDensity) * progress;

            // Smooth rescaling transition (back to normal size)
            if (deerAnimationState === 'rescaling') {
                deer.scale.lerpVectors(startScale, targetScale, progress);
            }
            }

            // Transition complete
            if (progress >= 1) {
                if (deerAnimationState === 'facing_car') {
                    deer.rotation.y = targetRotationY; // Ensure final rotation
                } else if (deerAnimationState === 'rotating_to_grass') {
                    deer.rotation.y = targetRotationY; // Ensure final rotation

                    // Add a pause before starting peaceful crossing
                    setTimeout(() => {
                        if (deerAnimationState === 'rotating_to_grass') { // Check if still in this state
                            // Now start peaceful crossing
                            deerAnimationState = 'peaceful_crossing';
                            deerCrossing = true; // Enable crossing logic
                            deerSpeed = 2; // Normal walking speed
                            transitionStartTime = animationTime; // Reset timing for peaceful crossing
                        }
                    }, 1500); // 1.5 second pause
                } else if (deerAnimationState === 'retreating') {
                    deer.position.copy(targetPosition); // Ensure final position

                    // Start scaling animation and horizontal camera pan
                    deerAnimationState = 'scaling';
                    transitionStartTime = animationTime;
                    startScale.copy(deer.scale);
                    targetScale.set(2.0, 2.0, 2.0); // 2x scale for dramatic effect

                    // Set up horizontal camera pan (to the left)
                    cameraStartX = cameraBaseX;
                    cameraTargetX = cameraBaseX - 10; // Pan 8 units to the left

                    // Set up fog density transition (fog clears during scaling)
                    fogStartDensity = scene.fog.density;
                    fogTargetDensity = 0.0; // Fog completely clears

                    // Set up headlight intensity transition (headlights dim during scaling)
                    leftHeadlightStartIntensity = leftHeadlight.intensity;
                    rightHeadlightStartIntensity = rightHeadlight.intensity;
                    headlightTargetIntensity = 0.0; // Headlights turn off

                } else if (deerAnimationState === 'scaling') {
                    deer.scale.copy(targetScale); // Ensure final scale
                    cameraBaseX = cameraTargetX; // Ensure final camera position
                    scene.fog.density = fogTargetDensity; // Ensure final fog density (cleared)
                    // Ensure headlights are completely off and shadows disabled
                    if (leftHeadlight) {
                        leftHeadlight.intensity = 0;
                        leftHeadlight.castShadow = false;
                    }
                    if (rightHeadlight) {
                        rightHeadlight.intensity = 0;
                        rightHeadlight.castShadow = false;
                    }

                    // Switch to "Eat" animation after scaling completes
                    deerAnimationState = 'eating';
                    if (deerMixer && deerAnimations.length > 1) {
                        deerMixer.stopAllAction();
                        const eatAction = deerMixer.clipAction(deerAnimations[1]); // Eat animation (index 1)
                        eatAction.timeScale = 1.0; // Normal speed
                        eatAction.setLoop(THREE.LoopRepeat); // Loop continuously
                        eatAction.play();
                    }

                    // Set up charging sequence after a brief eating period
                    setTimeout(() => {
                        if (deerAnimationState === 'eating') {
                            deerAnimationState = 'charging';
                            // Store the car's position as the target
                            deerChargeTarget = car.position.clone();
                            deerChargeSpeed = 15; // Very fast charging speed
                        }
                    }, 2000); // Eat for 2 seconds before charging
                } else if (deerAnimationState === 'rescaling') {
                    deer.scale.copy(targetScale); // Ensure final scale (back to 1x)
                    // Start camera zoom in
                    camera.position.z = cameraZoomTarget;

                    // First rotate to face the grass field, then start crossing
                    deerAnimationState = 'rotating_to_grass';
                    transitionStartTime = animationTime;
                    startRotationY = deer.rotation.y;
                    targetRotationY = Math.PI / 2; // Face positive Z direction (grass field)
                    transitionDuration = 1000; // 1 second rotation

                    if (deerMixer && deerAnimations.length > 2) {
                        deerMixer.stopAllAction();
                        const walkAction = deerMixer.clipAction(deerAnimations[2]); // Walk animation (index 2)
                        walkAction.timeScale = 1.0;
                        walkAction.setLoop(THREE.LoopRepeat);
                        walkAction.play();
                    }
                }
            }
        }

    }

    // Move car along the road (Z-axis)
    if (car && !carStopped) {
        carPosition += carSpeed;
        if (carPosition > 30) {
            carPosition = -30; // Loop back

            // Reset deer when car loops back to beginning
            if (deer) {
                // Clear any pending reverse animation timeout
                if (deerReverseDieTimeout) {
                    clearTimeout(deerReverseDieTimeout);
                    deerReverseDieTimeout = null;
                }

                deerIsDead = false;
                deerCrossing = false;
                deerAnimationState = 'walking'; // Reset to walking state
                deer.position.set(deerStartX, 0, 5); // Reset position
                cameraBaseX = 0; // Reset camera to center position
                scene.fog.density = fogStartDensity; // Reset fog density
                // Reset headlights to initial intensity and enable shadows
                if (leftHeadlight) {
                    leftHeadlight.intensity = 8;
                    leftHeadlight.castShadow = true;
                }
                if (rightHeadlight) {
                    rightHeadlight.intensity = 8;
                    rightHeadlight.castShadow = true;
                }
                // Reset car flight physics
                carIsFlying = false;
                car.position.set(0, 1.0, -15); // Reset car position
                car.rotation.set(0, 0, 0); // Reset car rotation
                // Reset camera to original position (undo zoom)
                camera.position.z = 10; // Reset to original camera distance

                // Switch back to walking animation
                if (deerMixer && deerAnimations.length > 2) {
                    deerMixer.stopAllAction();
                    const walkAction = deerMixer.clipAction(deerAnimations[2]);
                    walkAction.timeScale = 2.0; // 2x speed for faster walking
                    walkAction.play();
                }
            }
        }
        car.position.z = carPosition;

    }

    // Camera positioning with horizontal panning capability
    // Use base X position instead of sine wave during transitions
    camera.position.x = cameraBaseX;
    camera.position.z = carPosition + 8;

    camera.lookAt(0, 0, carPosition);

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add rewind button functionality
const rewindButton = document.getElementById('rewindButton');
if (rewindButton) {
    rewindButton.addEventListener('click', () => {
        resetScene();
    });
}

// Start animation
animate();

