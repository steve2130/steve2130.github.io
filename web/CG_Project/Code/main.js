// WebGL Rural Car Scene
// COMP4422 Computer Graphics Project

class WebGLApp {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');

        if (!this.gl) {
            alert('WebGL not supported');
            return;
        }

        this.init();
        this.setupShaders();
        this.setupLighting();
        this.setupCamera();
        this.initializeApp();
    }

    async initializeApp() {
        await this.setupGeometry();
        this.animate();
    }

    init() {
        // Set canvas size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Enable depth testing
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);

        // Clear color (sky blue)
        this.gl.clearColor(0.53, 0.81, 0.92, 1.0);

        // Animation variables
        this.carPosition = -20.0;
        this.carSpeed = 0.05;
        this.time = 0.0;

        // Camera variables
        this.cameraAngleX = Math.PI / 4; // 45 degrees
        this.cameraAngleY = 0.0;
        this.cameraDistance = 25.0;
        this.cameraTarget = [0, 0, 0];

        // Mouse controls
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse controls for camera
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown) return;

            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            this.cameraAngleY += deltaX * 0.01;
            this.cameraAngleX += deltaY * 0.01;

            // Clamp vertical angle
            this.cameraAngleX = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraAngleX));

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraDistance += e.deltaY * 0.01;
            this.cameraDistance = Math.max(5, Math.min(50, this.cameraDistance));
        });
    }

    setupShaders() {
        // Vertex shader
        const vertexShaderSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;
            attribute vec3 aVertexNormal;
            attribute vec2 aTextureCoord;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            uniform mat4 uNormalMatrix;

            varying lowp vec4 vColor;
            varying highp vec3 vLighting;
            varying highp vec2 vTextureCoord;

            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

                vTextureCoord = aTextureCoord;

                // Transform normal
                highp vec3 transformedNormal = normalize((uNormalMatrix * vec4(aVertexNormal, 1.0)).xyz);

                // Lighting calculation (Phong)
                highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
                highp vec3 directionalLightColor = vec3(1.0, 1.0, 0.9);
                highp vec3 directionalVector = normalize(vec3(0.5, 0.7, 0.5));

                highp float directional = max(dot(transformedNormal, directionalVector), 0.0);
                vLighting = ambientLight + (directionalLightColor * directional);

                vColor = aVertexColor;
            }
        `;

        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;

            varying lowp vec4 vColor;
            varying highp vec3 vLighting;
            varying highp vec2 vTextureCoord;

            uniform sampler2D uSampler;
            uniform bool uUseTexture;

            void main(void) {
                if (uUseTexture) {
                    vec4 texColor = texture2D(uSampler, vTextureCoord);
                    gl_FragColor = vec4(texColor.rgb * vLighting, texColor.a);
                } else {
                    gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);
                }
            }
        `;

        // Create shaders
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.deleteShader(vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.deleteShader(fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.program));
            return;
        }

        this.gl.useProgram(this.program);

        // Get attribute locations
        this.programInfo = {
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(this.program, 'aVertexPosition'),
                vertexColor: this.gl.getAttribLocation(this.program, 'aVertexColor'),
                vertexNormal: this.gl.getAttribLocation(this.program, 'aVertexNormal'),
                textureCoord: this.gl.getAttribLocation(this.program, 'aTextureCoord'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(this.program, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(this.program, 'uModelViewMatrix'),
                normalMatrix: this.gl.getUniformLocation(this.program, 'uNormalMatrix'),
                uSampler: this.gl.getUniformLocation(this.program, 'uSampler'),
                uUseTexture: this.gl.getUniformLocation(this.program, 'uUseTexture'),
            },
        };
    }

    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    async setupGeometry() {
        // Create ground plane (grass field with road)
        this.groundBuffers = this.createGroundGeometry();
        // Create car (now async due to GLTF loading)
        this.carBuffers = await this.createCarGeometry();
        // Create simple trees
        this.treeBuffers = this.createTreeGeometry();
    }

    createGroundGeometry() {
        // Ground plane: -50 to 50 in x, -50 to 50 in z, y=0
        const positions = [];
        const colors = [];
        const normals = [];
        const textureCoords = [];

        const size = 50;
        const segments = 100;

        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j <= segments; j++) {
                const x = (i / segments - 0.5) * size * 2;
                const z = (j / segments - 0.5) * size * 2;
                const y = 0;

                positions.push(x, y, z);

                // Road texture: gray asphalt in middle, green grass on sides
                let r, g, b;
                if (Math.abs(z) < 2) { // Road along Z axis now
                    r = 0.3; g  = 0.3; b = 0.3; // Gray asphalt
                } else { // Grass
                    r = 0.2; g = 0.8; b = 0.2; // Light green grass
                }
                colors.push(r, g, b, 1.0);

                normals.push(0, 1, 0); // Upward normal

                // Simple texture coordinates
                textureCoords.push(i / segments, j / segments);
            }
        }

        // Create indices for triangles
        const indices = [];
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const topLeft = i * (segments + 1) + j;
                const topRight = topLeft + 1;
                const bottomLeft = (i + 1) * (segments + 1) + j;
                const bottomRight = bottomLeft + 1;

                indices.push(topLeft, topRight, bottomLeft);
                indices.push(topRight, bottomRight, bottomLeft);
            }
        }

        return {
            position: this.createBuffer(positions, 3),
            color: this.createBuffer(colors, 4),
            normal: this.createBuffer(normals, 3),
            textureCoord: this.createBuffer(textureCoords, 2),
            indices: this.createIndexBuffer(indices),
            vertexCount: indices.length
        };
    }

    async createCarGeometry() {
        try {
            // Load GLTF file
            const gltfResponse = await fetch('../Model/car_model.gltf');
            this.gltf = await gltfResponse.json();

            // Handle embedded binary data (GLTF with embedded buffers)
            let binData = null;
            if (this.gltf.buffers && this.gltf.buffers[0].uri && this.gltf.buffers[0].uri.startsWith('data:')) {
                // Extract base64 binary data from embedded URI
                const uri = this.gltf.buffers[0].uri;
                const base64Data = uri.split(',')[1];
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                binData = bytes.buffer;
            } else {
                // Fallback: try to load separate BIN file
                const binResponse = await fetch('../Model/scene.bin');
                binData = await binResponse.arrayBuffer();
            }

            // Combine all car meshes into one geometry
            const allPositions = [];
            const allColors = [];
            const allNormals = [];
            const allTextureCoords = [];
            const allIndices = [];
            let vertexOffset = 0;

            // Car mesh indices to load (main body parts)
            // Try loading first 10 meshes to see what's available
            const carMeshIndices = [];
            for (let i = 0; i < Math.min(20, this.gltf.meshes.length); i++) {
                carMeshIndices.push(i);
            }

            console.log('GLTF loaded successfully. Meshes available:', this.gltf.meshes.length);
            console.log('Trying to load mesh indices:', carMeshIndices);

            for (const meshIndex of carMeshIndices) {
                const mesh = this.gltf.meshes[meshIndex];
                if (!mesh || !mesh.primitives || mesh.primitives.length === 0) {
                    console.log(`Skipping mesh ${meshIndex} - not found or no primitives`);
                    continue;
                }

                console.log(`Processing mesh ${meshIndex}: ${mesh.name || 'unnamed'}`);

                const primitive = mesh.primitives[0];
                const material = this.gltf.materials ? this.gltf.materials[primitive.material] : null;

                // Get vertex data
                const positionAccessor = this.gltf.accessors[primitive.attributes.POSITION];
                const normalAccessor = this.gltf.accessors[primitive.attributes.NORMAL];
                const texCoordAccessor = primitive.attributes.TEXCOORD_0 !== undefined ? this.gltf.accessors[primitive.attributes.TEXCOORD_0] : null;

                // Get material color
                let materialColor = [0.8, 0.2, 0.2, 1.0]; // Default red
                if (material && material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorFactor) {
                    materialColor = material.pbrMetallicRoughness.baseColorFactor;
                }

                // Read positions
                const positions = this.readAccessorData(binData, positionAccessor);
                for (let i = 0; i < positions.length; i += 3) {
                    allPositions.push(positions[i], positions[i+1], positions[i+2]);
                    allColors.push(materialColor[0], materialColor[1], materialColor[2], materialColor[3]);
                }

                // Read normals
                const normals = this.readAccessorData(binData, normalAccessor);
                allNormals.push(...normals);

                // Read texture coordinates (or generate defaults)
                if (texCoordAccessor) {
                    const texCoords = this.readAccessorData(binData, texCoordAccessor);
                    allTextureCoords.push(...texCoords);
                } else {
                    // Generate default texture coordinates
                    for (let i = 0; i < positions.length / 3; i++) {
                        allTextureCoords.push(0, 0);
                    }
                }

                // Read indices
                if (primitive.indices !== undefined) {
                    const indexAccessor = this.gltf.accessors[primitive.indices];
                    const indices = this.readAccessorData(binData, indexAccessor);
                    for (let i = 0; i < indices.length; i++) {
                        allIndices.push(indices[i] + vertexOffset);
                    }
                }

                vertexOffset += positions.length / 3;
            }

            console.log(`GLTF loading complete: ${allPositions.length / 3} vertices, ${allIndices.length} indices`);

            if (allPositions.length === 0) {
                throw new Error('No vertices loaded from GLTF - all meshes may be invalid');
            }

            console.log('GLTF car model loaded successfully!');
            return {
                position: this.createBuffer(allPositions, 3),
                color: this.createBuffer(allColors, 4),
                normal: this.createBuffer(allNormals, 3),
                textureCoord: this.createBuffer(allTextureCoords, 2),
                indices: this.createIndexBuffer(allIndices),
                vertexCount: allIndices.length
            };

        } catch (error) {
            console.error('Failed to load GLTF car model:', error);
            console.log('Falling back to simple car geometry');
            // Fallback to simple car if GLTF loading fails
            return this.createSimpleCarGeometry();
        }
    }

    readAccessorData(binData, accessor) {
        const bufferView = this.gltf.bufferViews[accessor.bufferView];
        const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
        const componentSize = this.getComponentSize(accessor.componentType);
        const elementSize = componentSize * this.getElementCount(accessor.type);
        const count = accessor.count;

        const data = new DataView(binData, byteOffset, count * elementSize);
        const result = [];

        for (let i = 0; i < count; i++) {
            const elementOffset = i * elementSize;
            for (let j = 0; j < this.getElementCount(accessor.type); j++) {
                const componentOffset = elementOffset + j * componentSize;

                let value;
                switch (accessor.componentType) {
                    case 5120: value = data.getInt8(componentOffset); break;
                    case 5121: value = data.getUint8(componentOffset); break;
                    case 5122: value = data.getInt16(componentOffset, true); break;
                    case 5123: value = data.getUint16(componentOffset, true); break;
                    case 5125: value = data.getUint32(componentOffset, true); break;
                    case 5126: value = data.getFloat32(componentOffset, true); break;
                    default: value = 0;
                }
                result.push(value);
            }
        }

        return result;
    }

    getComponentSize(componentType) {
        switch (componentType) {
            case 5120: case 5121: return 1; // BYTE, UNSIGNED_BYTE
            case 5122: case 5123: return 2; // SHORT, UNSIGNED_SHORT
            case 5125: return 4; // UNSIGNED_INT
            case 5126: return 4; // FLOAT
            default: return 4;
        }
    }

    getElementCount(type) {
        switch (type) {
            case 'SCALAR': return 1;
            case 'VEC2': return 2;
            case 'VEC3': return 3;
            case 'VEC4': return 4;
            default: return 1;
        }
    }

    createSimpleCarGeometry() {
        // Fallback simple car geometry
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];

        // Car body (rectangular prism)
        const bodyWidth = 2, bodyHeight = 1, bodyLength = 4;
        const bodyVertices = [
            // Front face
            -bodyWidth/2, -bodyHeight/2, bodyLength/2,
             bodyWidth/2, -bodyHeight/2, bodyLength/2,
             bodyWidth/2,  bodyHeight/2, bodyLength/2,
            -bodyWidth/2,  bodyHeight/2, bodyLength/2,
            // Back face
            -bodyWidth/2, -bodyHeight/2, -bodyLength/2,
            -bodyWidth/2,  bodyHeight/2, -bodyLength/2,
             bodyWidth/2,  bodyHeight/2, -bodyLength/2,
             bodyWidth/2, -bodyHeight/2, -bodyLength/2,
            // Left face
            -bodyWidth/2, -bodyHeight/2, -bodyLength/2,
            -bodyWidth/2,  bodyHeight/2, -bodyLength/2,
            -bodyWidth/2,  bodyHeight/2,  bodyLength/2,
            -bodyWidth/2, -bodyHeight/2,  bodyLength/2,
            // Right face
             bodyWidth/2, -bodyHeight/2, -bodyLength/2,
             bodyWidth/2, -bodyHeight/2,  bodyLength/2,
             bodyWidth/2,  bodyHeight/2,  bodyLength/2,
             bodyWidth/2,  bodyHeight/2, -bodyLength/2,
            // Top face
            -bodyWidth/2,  bodyHeight/2, -bodyLength/2,
            -bodyWidth/2,  bodyHeight/2,  bodyLength/2,
             bodyWidth/2,  bodyHeight/2,  bodyLength/2,
             bodyWidth/2,  bodyHeight/2, -bodyLength/2,
            // Bottom face
            -bodyWidth/2, -bodyHeight/2, -bodyLength/2,
             bodyWidth/2, -bodyHeight/2, -bodyLength/2,
             bodyWidth/2, -bodyHeight/2,  bodyLength/2,
            -bodyWidth/2, -bodyHeight/2,  bodyLength/2,
        ];

        // Add body vertices
        for (let i = 0; i < bodyVertices.length; i += 3) {
            positions.push(bodyVertices[i], bodyVertices[i+1], bodyVertices[i+2]);
            colors.push(0.8, 0.2, 0.2, 1.0); // Red car
            normals.push(0, 1, 0);
        }

        // Body indices (cube)
        const bodyIndices = [
            0, 1, 2,    0, 2, 3,    // front
            4, 5, 6,    4, 6, 7,    // back
            8, 9, 10,   8, 10, 11,  // left
            12, 13, 14, 12, 14, 15, // right
            16, 17, 18, 16, 18, 19, // top
            20, 21, 22, 20, 22, 23  // bottom
        ];
        indices.push(...bodyIndices);

        // Texture coordinates
        const textureCoords = [];
        for (let i = 0; i < positions.length / 3; i++) {
            textureCoords.push(0, 0);
        }

        return {
            position: this.createBuffer(positions, 3),
            color: this.createBuffer(colors, 4),
            normal: this.createBuffer(normals, 3),
            textureCoord: this.createBuffer(textureCoords, 2),
            indices: this.createIndexBuffer(indices),
            vertexCount: indices.length
        };
    }

    createTreeGeometry() {
        // Simple tree: trunk + leaves (cones)
        const positions = [];
        const colors = [];
        const normals = [];
        const indices = [];

        // Create 5 trees at different positions
        const treePositions = [
            [-15, 0, -10], [15, 0, 5], [-20, 0, 15],
            [25, 0, -20], [-5, 0, 25]
        ];

        treePositions.forEach((treePos, treeIndex) => {
            const trunkHeight = 3, trunkRadius = 0.3;
            const leavesHeight = 4, leavesRadius = 2;

            // Trunk (cylinder)
            const startIndex = positions.length / 3;
            const segments = 8;

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * trunkRadius;
                const z = Math.sin(angle) * trunkRadius;

                positions.push(treePos[0] + x, treePos[1], treePos[2] + z);
                positions.push(treePos[0] + x, treePos[1] + trunkHeight, treePos[2] + z);
                colors.push(0.4, 0.2, 0.1, 1.0); // Brown trunk
                colors.push(0.4, 0.2, 0.1, 1.0);
                normals.push(x/trunkRadius, 0, z/trunkRadius);
                normals.push(x/trunkRadius, 0, z/trunkRadius);
            }

            // Trunk indices
            for (let i = 0; i < segments; i++) {
                const base = startIndex + i * 2;
                indices.push(base, base + 1, base + 2);
                indices.push(base + 1, base + 3, base + 2);
            }

            // Leaves (cone)
            const leavesStartIndex = positions.length / 3;
            const leavesSegments = 12;

            // Base of leaves
            for (let i = 0; i < leavesSegments; i++) {
                const angle = (i / leavesSegments) * Math.PI * 2;
                const x = Math.cos(angle) * leavesRadius;
                const z = Math.sin(angle) * leavesRadius;
                positions.push(treePos[0] + x, treePos[1] + trunkHeight, treePos[2] + z);
                colors.push(0.1, 0.5, 0.1, 1.0); // Green leaves
                normals.push(0, 1, 0);
            }
            // Top of leaves
            positions.push(treePos[0], treePos[1] + trunkHeight + leavesHeight, treePos[2]);
            colors.push(0.1, 0.5, 0.1, 1.0);
            normals.push(0, 1, 0);

            // Leaves indices
            const topVertex = leavesStartIndex + leavesSegments;
            for (let i = 0; i < leavesSegments; i++) {
                const current = leavesStartIndex + i;
                const next = leavesStartIndex + ((i + 1) % leavesSegments);
                indices.push(current, next, topVertex);
            }
        });

        // Texture coordinates (simple)
        const textureCoords = [];
        for (let i = 0; i < positions.length / 3; i++) {
            textureCoords.push(0, 0);
        }

        return {
            position: this.createBuffer(positions, 3),
            color: this.createBuffer(colors, 4),
            normal: this.createBuffer(normals, 3),
            textureCoord: this.createBuffer(textureCoords, 2),
            indices: this.createIndexBuffer(indices),
            vertexCount: indices.length
        };
    }

    createBuffer(data, size) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        buffer.size = size;
        return buffer;
    }

    createIndexBuffer(data) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), this.gl.STATIC_DRAW);
        return buffer;
    }

    setupLighting() {
        // Lighting is handled in shaders
        // Sun light (directional) and ambient light
    }

    setupCamera() {
        // Perspective projection
        const fieldOfView = 45 * Math.PI / 180;
        const aspect = this.canvas.width / this.canvas.height;
        const zNear = 0.1;
        const zFar = 100.0;
        this.projectionMatrix = this.createPerspectiveMatrix(fieldOfView, aspect, zNear, zFar);
    }

    createPerspectiveMatrix(fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ];
    }

    animate() {
        this.time += 0.016; // ~60fps

        // Move car
        this.carPosition += this.carSpeed;
        if (this.carPosition > 30) {
            this.carPosition = -30;
        }

        this.render();
        requestAnimationFrame(() => this.animate());
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Set up camera view
        const cameraX = this.cameraTarget[0] + this.cameraDistance * Math.sin(this.cameraAngleY) * Math.cos(this.cameraAngleX);
        const cameraY = this.cameraTarget[1] + this.cameraDistance * Math.sin(this.cameraAngleX);
        const cameraZ = this.cameraTarget[2] + this.cameraDistance * Math.cos(this.cameraAngleY) * Math.cos(this.cameraAngleX);

        const viewMatrix = this.createLookAtMatrix(
            [cameraX, cameraY, cameraZ],
            this.cameraTarget,
            [0, 1, 0]
        );

        // Render trees first
        this.renderObject(this.treeBuffers, viewMatrix, this.createIdentityMatrix());

        // Render car (moving along Z axis instead of X axis)
        const carTranslation = this.createTranslationMatrix(0, 0.0, this.carPosition);
        // Rotate car 90 degrees around Y axis to face direction of travel
        const carRotationY = this.createRotationYMatrix(Math.PI / 2);
        const carModelMatrix = this.multiplyMatrices(carTranslation, carRotationY);
        this.renderObject(this.carBuffers, viewMatrix, carModelMatrix);

        // Render ground last (so it appears on top if needed, but depth testing should handle it)
        this.renderObject(this.groundBuffers, viewMatrix, this.createIdentityMatrix());
    }

    renderObject(buffers, viewMatrix, modelMatrix) {
        // Bind buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, buffers.position.size, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexColor, buffers.color.size, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.normal);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.vertexNormal, buffers.normal.size, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexNormal);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.textureCoord);
        this.gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, buffers.textureCoord.size, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // Set matrices
        const modelViewMatrix = this.multiplyMatrices(viewMatrix, modelMatrix);
        const normalMatrix = this.createNormalMatrix(modelViewMatrix);

        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, this.projectionMatrix);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.normalMatrix, false, normalMatrix);

        // Disable texture for now
        this.gl.uniform1i(this.programInfo.uniformLocations.uUseTexture, false);

        // Draw
        this.gl.drawElements(this.gl.TRIANGLES, buffers.vertexCount, this.gl.UNSIGNED_SHORT, 0);
    }

    createLookAtMatrix(cameraPos, target, up) {
        const zAxis = this.normalize(this.subtractVectors(cameraPos, target));
        const xAxis = this.normalize(this.crossProduct(up, zAxis));
        const yAxis = this.crossProduct(zAxis, xAxis);

        return [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            -this.dotProduct(xAxis, cameraPos), -this.dotProduct(yAxis, cameraPos), -this.dotProduct(zAxis, cameraPos), 1
        ];
    }

    createIdentityMatrix() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    createTranslationMatrix(x, y, z) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ];
    }

    createScalingMatrix(x, y, z) {
        return [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ];
    }

    createRotationYMatrix(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
            cos, 0, sin, 0,
            0, 1, 0, 0,
            -sin, 0, cos, 0,
            0, 0, 0, 1
        ];
    }

    multiplyMatrices(a, b) {
        const result = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[i * 4 + k] * b[k * 4 + j];
                }
                result[i * 4 + j] = sum;
            }
        }
        return result;
    }

    createNormalMatrix(modelViewMatrix) {
        // Extract 3x3 rotation part and invert/transpose
        const normalMatrix = [
            modelViewMatrix[0], modelViewMatrix[1], modelViewMatrix[2],
            modelViewMatrix[4], modelViewMatrix[5], modelViewMatrix[6],
            modelViewMatrix[8], modelViewMatrix[9], modelViewMatrix[10]
        ];
        return this.invertMatrix3x3(this.transposeMatrix3x3(normalMatrix));
    }

    transposeMatrix3x3(m) {
        return [
            m[0], m[3], m[6],
            m[1], m[4], m[7],
            m[2], m[5], m[8]
        ];
    }

    invertMatrix3x3(m) {
        // Simplified 3x3 matrix inversion for normal matrix
        const det = m[0] * (m[4] * m[8] - m[5] * m[7]) -
                   m[1] * (m[3] * m[8] - m[5] * m[6]) +
                   m[2] * (m[3] * m[7] - m[4] * m[6]);

        if (Math.abs(det) < 0.00001) return m; // Singular matrix

        const invDet = 1 / det;
        return [
            (m[4] * m[8] - m[5] * m[7]) * invDet,
            (m[2] * m[5] - m[1] * m[8]) * invDet,
            (m[1] * m[7] - m[2] * m[4]) * invDet,
            (m[5] * m[6] - m[3] * m[8]) * invDet,
            (m[0] * m[8] - m[2] * m[6]) * invDet,
            (m[2] * m[3] - m[0] * m[5]) * invDet,
            (m[3] * m[7] - m[4] * m[6]) * invDet,
            (m[1] * m[6] - m[0] * m[7]) * invDet,
            (m[0] * m[4] - m[1] * m[3]) * invDet
        ];
    }

    // Vector math utilities
    normalize(v) {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return length > 0 ? [v[0] / length, v[1] / length, v[2] / length] : [0, 0, 0];
    }

    subtractVectors(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    crossProduct(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }

    dotProduct(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
}

// Initialize the app when page loads
window.addEventListener('load', () => {
    new WebGLApp();
});
