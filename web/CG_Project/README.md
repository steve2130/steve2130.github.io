## Project Overview

This WebGL application creates a 3D rural scene featuring a car driving across a grass field with a paved road. The scene includes:

- **Ground Plane**: Grass field with a gray asphalt road running through the middle
- **Car**: Detailed 3D car model loaded from GLTF file, driving across the scene
- **Trees**: Five simple trees scattered around the rural area
- **Lighting**: Directional sunlight with Phong shading
- **Camera**: 45-degree angled view with interactive mouse controls

## Current Features

✅ **Pure WebGL Implementation (Final Project):**
- At least 3 distinct 3D objects (ground, car, trees)
- Ground plane/environmental base
- Background elements (trees, sky gradient)
- Basic animation (car translation)
- Lighting with directional light + ambient
- Camera controls (mouse rotation, zoom)
- Phong shading implementation
- **GLTF Model Loading**: Detailed car model loaded from scene.gltf

✅ **Three.js Prototype (Development Tool):**
- Complete scene recreation with Three.js for rapid prototyping
- Grass field with paved road
- GLTF car model loading with proper scaling
- Dynamic shadows and lighting
- Atmospheric elements (trees, sunny weather)
- Camera following car movement
- Available at: `Code/threejs_prototype.html`

## How to Run

### Pure WebGL Version (Final Project)
1. Start a local HTTP server:
   ```bash
   python server.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000/Code/
   ```

### Three.js Prototype (For Development)
1. Start the server as above
2. Navigate to:
   ```
   http://localhost:8000/Code/threejs_prototype.html
   ```

**⚠️ IMPORTANT:** The Three.js version is only a prototype for testing concepts. The final project submission must use pure WebGL as required by the assignment.

## Controls

- **Mouse Drag**: Rotate camera around the scene
- **Mouse Wheel**: Zoom in/out
- **Auto Animation**: Car continuously moves across the scene

## Technical Implementation

### WebGL Features Used:
- Vertex and Fragment Shaders with Phong lighting
- 3D transformations (model, view, projection matrices)
- Index buffers for efficient geometry rendering
- Depth testing and face culling
- Interactive camera system
- GLTF/GLB model loading and parsing (binary buffer reading)

### Geometry:
- **Ground**: 100x100 segment plane with road texture simulation
- **Car**: Detailed 3D model loaded from GLTF (scene.gltf/scene.bin) with multiple meshes
- **Trees**: Cylindrical trunks + conical leaves

### Lighting:
- Directional light simulating sunlight
- Ambient lighting for overall illumination
- Phong reflection model (ambient + diffuse)

## Project Requirements Progress

### Basic Level (20%): ✅ Complete
- [x] At least 3 distinct 3D objects
- [x] Ground plane/environmental base
- [x] Background elements
- [x] Basic animations (translation)
- [x] Lighting with at least 2 light sources
- [x] Camera controls

### Middle Level (20%): 🔄 In Progress
- [ ] Object interactions and synchronized movements
- [ ] Hierarchical transformations
- [ ] Multiple light sources (3+)
- [ ] Enhanced lighting with materials

### Advanced Level (20%): ⏳ Planned
- [ ] Advanced visual effects (fog, reflections)
- [ ] Storytelling elements
- [ ] Interactive controls

## File Structure

```
CG_Project/
├── Code/
│   ├── index.html          # Main HTML file
│   ├── main.js            # Pure WebGL application code
│   ├── three.js           # Three.js prototype (development tool)
│   └── threejs_prototype.html  # Three.js demo page
├── Model/
│   ├── car/
│   │   ├── car_model.gltf    # Car 3D model
│   │   └── scene.bin        # Car model binary data
│   └── deer/
│       ├── scene.gltf       # Deer 3D model
│       ├── scene.bin        # Deer model binary data
│       ├── license.txt      # Model licensing info
│       └── textures/        # Deer model textures
├── README.md               # This documentation
├── server.py              # Local development server
└── COMP4422 (2025) Group Project v2b.pdf  # Project requirements
```

## Next Steps

1. **Enhanced Animations**: Add rotation and scaling animations
2. **Improved Lighting**: Add point lights and material properties
3. **Textures**: Implement texture mapping for realistic surfaces
4. **Atmospheric Effects**: Add fog for sunny weather ambiance
5. **Car Animation**: Add wheel rotation and more realistic movement
6. **Interactive Elements**: Camera fly-through and object focus
7. **Character Animation**: Bonus 3D character with articulated movement

## Dependencies

- WebGL 2.0 compatible browser
- No external libraries (pure WebGL implementation as required)

## Browser Compatibility

Tested on:
- Chrome 120+
- Firefox 115+
- Edge 120+

Requires WebGL 2.0 support.

