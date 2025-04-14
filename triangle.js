// Triangle.js - Class to represent a triangle shape
class Triangle {
    constructor(position, color, size) {
        this.position = position;  // center position [x, y]
        this.color = color;        // [r, g, b, a]
        this.size = size;          // size factor
        
        // Calculate the vertices of the triangle based on center position and size
        const halfSize = this.size / 50; // Scale down for better visibility
        
        this.vertices = [
            // Center top
            position[0], position[1] + halfSize,
            // Bottom left
            position[0] - halfSize, position[1] - halfSize,
            // Bottom right
            position[0] + halfSize, position[1] - halfSize
        ];
    }
    
    render(gl, a_Position, u_FragColor, u_PointSize) {
        // Set the color for this triangle
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
        
        // Draw the triangle
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}