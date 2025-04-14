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

// Current color and size values
let currentColor = [1.0, 0.0, 0.0, 1.0]; // RGBA, default red
let currentSize = 10.0;
let currentSegments = 12;

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
    };
    
    // Button events
    document.getElementById('clearBtn').onclick = function() { 
        shapesList = []; 
        gl.clear(gl.COLOR_BUFFER_BIT);
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
        // Clear the canvas first for a clean drawing
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Draw the dog
        dog.render(gl, a_Position, u_FragColor);
        
        // If you want the dog to be part of the shapes list (optional):
        // This would make it possible to paint over the dog and keep 
        // it when doing other operations
        // shapesList = []; // Clear the shapes list if you want a fresh canvas with just the dog
        
        // Note: we're not adding the dog triangles to the shapesList as per the requirement
        // that you don't need to integrate the picture with your painting
    };
    
    // Slider events
    document.getElementById('redSlider').oninput = function() {
        currentColor[0] = this.value;
        document.getElementById('redValue').textContent = parseFloat(this.value).toFixed(1);
    };
    
    document.getElementById('greenSlider').oninput = function() {
        currentColor[1] = this.value;
        document.getElementById('greenValue').textContent = parseFloat(this.value).toFixed(1);
    };
    
    document.getElementById('blueSlider').oninput = function() {
        currentColor[2] = this.value;
        document.getElementById('blueValue').textContent = parseFloat(this.value).toFixed(1);
    };
    
    document.getElementById('sizeSlider').oninput = function() {
        currentSize = parseFloat(this.value);
        document.getElementById('sizeValue').textContent = this.value;
    };
    
    document.getElementById('segmentsSlider').oninput = function() {
        currentSegments = parseInt(this.value);
        document.getElementById('segmentsValue').textContent = this.value;
    };
}

function updateButtonState() {
    // Remove active class from all buttons
    document.getElementById('pointBtn').classList.remove('active');
    document.getElementById('triangleBtn').classList.remove('active');
    document.getElementById('circleBtn').classList.remove('active');
    
    // Add active class to current button
    document.getElementById(currentShapeType + 'Btn').classList.add('active');
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
    
    // Draw each shape
    for (let i = 0; i < shapesList.length; i++) {
        shapesList[i].render(gl, a_Position, u_FragColor, u_PointSize);
    }
}