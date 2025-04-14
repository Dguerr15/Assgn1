// Point.js - Class to represent a point shape
class Point {
    constructor(position, color, size) {
        this.position = position;  // [x, y]
        this.color = color;        // [r, g, b, a]
        this.size = size;          // point size
    }
    
    render(gl, a_Position, u_FragColor, u_PointSize) {
        // Set the color for this point
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        
        // Set the point size
        gl.uniform1f(u_PointSize, this.size);
        
        // Create a buffer for position
        const vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        
        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        
        // Write data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([this.position[0], this.position[1]]), gl.STATIC_DRAW);
        
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);
        
        // Draw the point
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}