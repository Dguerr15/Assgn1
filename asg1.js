// Vertex shader program
const VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_PointSize;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_PointSize;
    }`;

// Fragment shader program
const FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`;

// Global variables
let gl;
let canvas;
let a_Position;
let u_FragColor;
let u_PointSize;
let shapesList = []; // Array to store all shapes
let currentShapeType = 'point'; // Default shape type
let dog;
let brushPreviewElement;
let particles = [];
let isAnimating = false;
let animationId = null;

// Current color and size values
let currentColor = [1.0, 0.0, 0.0, 1.0]; // RGBA, default red
let currentSize = 10.0;
let currentSegments = 12;
let dogDisplayed = false;

function main() {
    // Set up WebGL context
    setupWebGL();
    
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    
    // Initialize variables and connect to GLSL
    connectVariablesToGLSL();

    dog = new Dog();
    
    // Set up canvas background color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Set up event listeners
    setupEventListeners();

    // Initialize UI state
    updateButtonState();

    // Create brush preview element
    createBrushPreview();
    
    // Set up slider colors
    document.getElementById('redSlider').style.accentColor = '#f44336';
    document.getElementById('greenSlider').style.accentColor = '#4CAF50';
    document.getElementById('blueSlider').style.accentColor = '#2196F3';
    document.getElementById('sizeSlider').style.accentColor = '#9C27B0';
    document.getElementById('segmentsSlider').style.accentColor = '#9C27B0';
}

function setupWebGL() {
    // Get the canvas element
    canvas = document.getElementById('webgl');
    
    // Get the WebGL context
    gl = getWebGLContext(canvas, { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return null;
    }
    return gl;
}

function connectVariablesToGLSL() {
    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    
    // Get the storage location of u_PointSize
    u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
    if (!u_PointSize) {
        console.log('Failed to get the storage location of u_PointSize');
        return;
    }
}

function setupEventListeners() {
    // Canvas mouse events
    canvas.onmousedown = function(ev) { 
        handleClick(ev); 
    };
    
    canvas.onmousemove = function(ev) {
        if (ev.buttons == 1) {
            handleClick(ev);
        }
        updateBrushPreview(ev);
    };

    canvas.onmouseenter = function(ev) {
        if (brushPreviewElement) {
            brushPreviewElement.style.display = 'block';
        }
        updateBrushPreview(ev);
    };
    
    canvas.onmouseleave = function() {
        if (brushPreviewElement) {
            brushPreviewElement.style.display = 'none';
        }
    };
    
    // Button events
    document.getElementById('clearBtn').onclick = function() { 
        shapesList = []; 
        dogDisplayed = false;
        gl.clear(gl.COLOR_BUFFER_BIT);
        createExplosion();
    };
    
    document.getElementById('pointBtn').onclick = function() { 
        currentShapeType = 'point';
        updateButtonState();
    };
    
    document.getElementById('triangleBtn').onclick = function() { 
        currentShapeType = 'triangle';
        updateButtonState();
    };
    
    document.getElementById('circleBtn').onclick = function() { 
        currentShapeType = 'circle';
        updateButtonState();
    };

    document.getElementById('drawDogBtn').onclick = function() { 
        // Toggle the dog display state
        dogDisplayed = true; 
        renderAllShapes();
        createConfetti();
    };
    
    // Slider events
    document.getElementById('redSlider').oninput = function() {
        currentColor[0] = this.value;
        document.getElementById('redValue').textContent = parseFloat(this.value).toFixed(1);
        updateBrushPreviewStyle();
    };
    
    document.getElementById('greenSlider').oninput = function() {
        currentColor[1] = this.value;
        document.getElementById('greenValue').textContent = parseFloat(this.value).toFixed(1);
        updateBrushPreviewStyle();
    };
    
    document.getElementById('blueSlider').oninput = function() {
        currentColor[2] = this.value;
        document.getElementById('blueValue').textContent = parseFloat(this.value).toFixed(1);
        updateBrushPreviewStyle();
    };
    
    document.getElementById('sizeSlider').oninput = function() {
        currentSize = parseFloat(this.value);
        document.getElementById('sizeValue').textContent = this.value;
        updateBrushPreviewStyle();
    };
    
    document.getElementById('segmentsSlider').oninput = function() {
        currentSegments = parseInt(this.value);
        document.getElementById('segmentsValue').textContent = this.value;
        updateBrushPreviewStyle();
    };
}

function updateButtonState() {
    // Remove active class from all buttons
    document.getElementById('pointBtn').classList.remove('active');
    document.getElementById('triangleBtn').classList.remove('active');
    document.getElementById('circleBtn').classList.remove('active');
    
    // Add active class to current button
    const currentButton = document.getElementById(currentShapeType + 'Btn');
    currentButton.classList.add('active');

    // Add subtle animation for selection effect
    currentButton.style.transform = 'scale(1.15)';
    setTimeout(() => {
        currentButton.style.transform = 'scale(1.1)';  // Return to slightly enlarged state
    }, 150);
    
    // Update brush preview for new shape type
    updateBrushPreviewStyle();
}

function handleClick(ev) {
    // Get click coordinates
    const rect = ev.target.getBoundingClientRect();
    
    // WebGL coordinates are from -1 to 1 in both x and y
    const x = ((ev.clientX - rect.left) / canvas.width) * 2 - 1;
    const y = (1 - (ev.clientY - rect.top) / canvas.height) * 2 - 1;
    
    // Create appropriate shape based on current selection
    let shape;
    
    switch(currentShapeType) {
        case 'point':
            shape = new Point([x, y], [...currentColor], currentSize);
            break;
        case 'triangle':
            shape = new Triangle([x, y], [...currentColor], currentSize);
            break;
        case 'circle':
            shape = new Circle([x, y], [...currentColor], currentSize, currentSegments);
            break;
    }
    
    // Add shape to list
    shapesList.push(shape);
    
    // Render all shapes
    renderAllShapes();
}

function renderAllShapes() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // First draw the dog (if it should be displayed)
    if (dogDisplayed) {
        dog.render(gl, a_Position, u_FragColor);
    }

    // Draw each shape
    for (let i = 0; i < shapesList.length; i++) {
        shapesList[i].render(gl, a_Position, u_FragColor, u_PointSize);
    }
}

function createBrushPreview() {
    brushPreviewElement = document.createElement('div');
    brushPreviewElement.className = 'brush-preview';
    document.body.appendChild(brushPreviewElement);
    
    // Style it based on current settings
    updateBrushPreviewStyle();
}

function updateBrushPreviewStyle() {
    if (!brushPreviewElement) return;
    
    // Get preview size - converting from WebGL units to pixels
    // Note that WebGL size units need to be converted to screen pixels
    let size;
    
    if (currentShapeType === 'point') {
        // Point size directly maps to pixel size in WebGL
        size = currentSize;
        brushPreviewElement.style.width = size + 'px';
        brushPreviewElement.style.height = size + 'px';
        brushPreviewElement.style.borderRadius = '50%';
        brushPreviewElement.style.clipPath = '';
    } else if (currentShapeType === 'triangle') {
        // For triangle, size determines the scale
        size = currentSize * 3;
        brushPreviewElement.style.width = size + 'px';
        brushPreviewElement.style.height = size + 'px';
        brushPreviewElement.style.borderRadius = '0';
        brushPreviewElement.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } else if (currentShapeType === 'circle') {
        // For circle, we need to match the radius calculation in Circle.js
        const radius = currentSize / 150; // This matches Circle.js
        // Convert WebGL units to pixels (approximation: canvas is 400x400 pixels, WebGL is -1 to 1)
        size = radius * 400; // Scale WebGL coordinates to canvas pixels
        brushPreviewElement.style.width = size + 'px';
        brushPreviewElement.style.height = size + 'px';
        brushPreviewElement.style.borderRadius = '50%';
        brushPreviewElement.style.clipPath = '';
    }
    
    // Set the color - same as before
    brushPreviewElement.style.backgroundColor = `rgba(${currentColor[0]*255}, ${currentColor[1]*255}, ${currentColor[2]*255}, 0.5)`;
}

function updateBrushPreview(ev) {
    if (!brushPreviewElement) {
        createBrushPreview();
        return;
    }
    
    // Apply current style - this includes size and shape
    updateBrushPreviewStyle();
    
    // Update position to follow mouse cursor
    // We need to center the preview on the cursor
    let previewWidth = parseFloat(brushPreviewElement.style.width);
    let previewHeight = parseFloat(brushPreviewElement.style.height);
    
    brushPreviewElement.style.left = (ev.clientX - previewWidth / 2) + 'px';
    brushPreviewElement.style.top = (ev.clientY - previewHeight / 2) + 'px';
    brushPreviewElement.style.display = 'block';
}


function createExplosion() {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + canvas.width / 2;
    const centerY = rect.top + canvas.height / 2;
    const particleCount = 100;
    
    // Clear any existing animation/particles
    stopAnimation();
    clearParticles();
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const size = 3 + Math.random() * 7;
        const life = 50 + Math.random() * 1000; // milliseconds
        
        // Add some variety in colors for explosion
        const r = 200 + Math.floor(Math.random() * 55);
        const g = Math.floor(Math.random() * 100);
        const b = Math.floor(Math.random() * 50);
        
        createDOMParticle(
            centerX,
            centerY,
            `rgb(${r}, ${g}, ${b})`,
            size,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            0.05,
            life
        );
    }
}

// Function to create confetti effect (random colored particles)
function createConfetti() {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + canvas.width / 2;
    const centerY = rect.top + canvas.height / 2;
    const particleCount = 100;
    
    // Clear any existing animation/particles
    stopAnimation();
    clearParticles();
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const size = 3 + Math.random() * 7;
        const life = 50 + Math.random() * 1000; // milliseconds
        
        // Random color for confetti
        const color = `rgb(
            ${Math.floor(Math.random() * 255)},
            ${Math.floor(Math.random() * 255)},
            ${Math.floor(Math.random() * 255)}
        )`;
        
        createDOMParticle(
            centerX,
            centerY,
            color,
            size,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            0.05,
            life
        );
    }
}

// Stop any ongoing animation
function clearParticles() {
    // Remove all existing particles
    const particles = document.querySelectorAll('.dom-particle');
    particles.forEach(p => p.remove());
}

function createDOMParticle(x, y, color, size, vx, vy, gravity, life) {
    // Create a DOM element for the particle
    const particle = document.createElement('div');
    particle.className = 'dom-particle';
    
    // Style the particle
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';
    
    // Add to document
    document.body.appendChild(particle);
    
    // Animation properties
    const startTime = Date.now();
    const endTime = startTime + life;
    
    // Set the animation flag
    isAnimating = true;
    
    // Animation function
    function animate() {
        const now = Date.now();
        if (now >= endTime) {
            particle.remove();
            return;
        }
        
        // Calculate position
        const elapsed = now - startTime;
        const currentX = parseFloat(particle.style.left) + vx;
        const currentY = parseFloat(particle.style.top) + vy;
        
        // Update position
        particle.style.left = `${currentX}px`;
        particle.style.top = `${currentY}px`;
        
        // Apply gravity
        vy += gravity;
        
        // Fade based on lifetime
        const lifeRatio = 1 - (now - startTime) / life;
        particle.style.opacity = lifeRatio;
        
        // Continue animation if still animating
        if (isAnimating) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    // Start animation
    animationId = requestAnimationFrame(animate);
    
    // Also add some CSS to ensure particles are visible
    const style = document.createElement('style');
    style.textContent = `
        .dom-particle {
            position: absolute;
            pointer-events: none;
            z-index: 1000;
        }
    `;
    document.head.appendChild(style);
}


function stopAnimation() {
    isAnimating = false;
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}