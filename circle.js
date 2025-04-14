// Circle.js - Class to represent a circle shape
class Circle {
    constructor(position, color, size, segments) {
        this.position = position;  // center position [x, y]
        this.color = color;        // [r, g, b, a]
        this.size = size;          // size factor
        this.segments = segments;  // number of segments
        
        // Calculate vertices for the circle
        this.vertices = this.calculateVertices();
    }
    
    calculateVertices() {
        const vertices = [];
        const radius = this.size / 150; // Scale down for better visibility
        
        // Always include center point
        vertices.push(this.position[0], this.position[1]);
        
        // Calculate points on the circle
        for (let i = 0; i <= this.segments; i++) {
            const angle = i * 2 * Math.PI / this.segments;
            const x = this.position[0] + radius * Math.cos(angle);
            const y = this.position[1] + radius * Math.sin(angle);
            vertices.push(x, y);
        }
        
        return vertices;
    }
    
    render(gl, a_Position, u_FragColor, u_PointSize) {
        // Set the color for this circle
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        
        // Create a buffer for position
        const vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        
        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        
        // Write data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);
        
        // Draw the circle as a triangle fan
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.segments + 2);
    }
}