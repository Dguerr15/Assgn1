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
let shapesList = [];
let currentShapeType = 'point'; 
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
    // set up webGL context
    setupWebGL();
    
    // initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    
    connectVariablesToGLSL();

    dog = new Dog();
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    setupEventListeners();

    updateButtonState();

    createBrushPreview();
    
    document.getElementById('redSlider').style.accentColor = '#f44336';
    document.getElementById('greenSlider').style.accentColor = '#4CAF50';
    document.getElementById('blueSlider').style.accentColor = '#2196F3';
    document.getElementById('sizeSlider').style.accentColor = '#9C27B0';
    document.getElementById('segmentsSlider').style.accentColor = '#9C27B0';
}

function setupWebGL() {
    // get the canvas element
    canvas = document.getElementById('webgl');
    
    // get the webGL context
    gl = getWebGLContext(canvas, { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return null;
    }
    return gl;
}

// connect js variables to glsl
function connectVariablesToGLSL() {
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    
    u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
    if (!u_PointSize) {
        console.log('Failed to get the storage location of u_PointSize');
        return;
    }
}

// set up event listeners
function setupEventListeners() {
    // canvas mouse events
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
    
    // button events
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
        // toggle the dog display state
        dogDisplayed = true; 
        renderAllShapes();
        createConfetti();
    };
    
    // slider events
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

// update active shape button state
function updateButtonState() {
    document.getElementById('pointBtn').classList.remove('active');
    document.getElementById('triangleBtn').classList.remove('active');
    document.getElementById('circleBtn').classList.remove('active');
    
    const currentButton = document.getElementById(currentShapeType + 'Btn');
    currentButton.classList.add('active');

    currentButton.style.transform = 'scale(1.15)';
    setTimeout(() => {
        currentButton.style.transform = 'scale(1.1)';
    }, 150);
    
    updateBrushPreviewStyle();
}

// handle shape placement
function handleClick(ev) {
    const rect = ev.target.getBoundingClientRect();
    
    const x = ((ev.clientX - rect.left) / canvas.width) * 2 - 1;
    const y = (1 - (ev.clientY - rect.top) / canvas.height) * 2 - 1;
    
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
    
    shapesList.push(shape);
    
    renderAllShapes();
}

// render all shapes
function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (dogDisplayed) {
        dog.render(gl, a_Position, u_FragColor);
    }

    for (let i = 0; i < shapesList.length; i++) {
        shapesList[i].render(gl, a_Position, u_FragColor, u_PointSize);
    }
}

// create brush preview element
function createBrushPreview() {
    brushPreviewElement = document.createElement('div');
    brushPreviewElement.className = 'brush-preview';
    document.body.appendChild(brushPreviewElement);
    
    updateBrushPreviewStyle();
}

// style the brush preview
function updateBrushPreviewStyle() {
    if (!brushPreviewElement) return;
    
    let size;
    
    if (currentShapeType === 'point') {
        size = currentSize;
        brushPreviewElement.style.width = size + 'px';
        brushPreviewElement.style.height = size + 'px';
        brushPreviewElement.style.borderRadius = '50%';
        brushPreviewElement.style.clipPath = '';
    } 
    else if (currentShapeType === 'triangle') {
        size = currentSize * 3;
        brushPreviewElement.style.width = size + 'px';
        brushPreviewElement.style.height = size + 'px';
        brushPreviewElement.style.borderRadius = '0';
        brushPreviewElement.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
    } 
    else if (currentShapeType === 'circle') {
        const radius = currentSize / 150;
        size = radius * 400;
        brushPreviewElement.style.width = size + 'px';
        brushPreviewElement.style.height = size + 'px';
        brushPreviewElement.style.borderRadius = '50%';
        brushPreviewElement.style.clipPath = '';
    }
    
    brushPreviewElement.style.backgroundColor = `rgba(${currentColor[0]*255}, ${currentColor[1]*255}, ${currentColor[2]*255}, 0.5)`;
}

// update brush preview position
function updateBrushPreview(ev) {
    if (!brushPreviewElement) {
        createBrushPreview();
        return;
    }
    
    updateBrushPreviewStyle();
    
    let previewWidth = parseFloat(brushPreviewElement.style.width);
    let previewHeight = parseFloat(brushPreviewElement.style.height);
    
    brushPreviewElement.style.left = (ev.clientX - previewWidth / 2) + 'px';
    brushPreviewElement.style.top = (ev.clientY - previewHeight / 2) + 'px';
    brushPreviewElement.style.display = 'block';
}

// create explosion particles
function createExplosion() {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + canvas.width / 2;
    const centerY = rect.top + canvas.height / 2;
    const particleCount = 100;
    
    stopAnimation();
    clearParticles();
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const size = 3 + Math.random() * 7;
        const life = 50 + Math.random() * 1000; // milliseconds
        
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

// create confetti particles
function createConfetti() {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.left + canvas.width / 2;
    const centerY = rect.top + canvas.height / 2;
    const particleCount = 100;
    
    stopAnimation();
    clearParticles();
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const size = 3 + Math.random() * 7;
        const life = 50 + Math.random() * 1000; // milliseconds
        
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

// clear all dom particles
function clearParticles() {
    const particles = document.querySelectorAll('.dom-particle');
    particles.forEach(p => p.remove());
}

// create a single dom particle
function createDOMParticle(x, y, color, size, vx, vy, gravity, life) {
    const particle = document.createElement('div');
    particle.className = 'dom-particle';
    
    particle.style.position = 'absolute';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1000';
    
    document.body.appendChild(particle);
    
    const startTime = Date.now();
    const endTime = startTime + life;
    
    isAnimating = true;
    
    function animate() {
        const now = Date.now();
        if (now >= endTime) {
            particle.remove();
            return;
        }
        
        const elapsed = now - startTime;
        const currentX = parseFloat(particle.style.left) + vx;
        const currentY = parseFloat(particle.style.top) + vy;
        
        particle.style.left = `${currentX}px`;
        particle.style.top = `${currentY}px`;
        
        vy += gravity;
        
        const lifeRatio = 1 - (now - startTime) / life;
        particle.style.opacity = lifeRatio;
        
        if (isAnimating) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    // start the animation
    animationId = requestAnimationFrame(animate);
    
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

// stop animation
function stopAnimation() {
    isAnimating = false;
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}