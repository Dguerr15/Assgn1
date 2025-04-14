class Circle {
    constructor(position, color, size, segments) {
        this.position = position;  // center position [x, y]
        this.color = color;        // [r, g, b, a]
        this.size = size;          // size factor
        this.segments = segments;  // number of segments
    
        this.vertices = this.calculateVertices();
    }
    
    calculateVertices() {
        const vertices = [];
        const radius = this.size / 150;
        
        // add center point
        vertices.push(this.position[0], this.position[1]);
        
        for (let i = 0; i <= this.segments; i++) {
            const angle = i * 2 * Math.PI / this.segments;
            const x = this.position[0] + radius * Math.cos(angle);
            const y = this.position[1] + radius * Math.sin(angle);
            vertices.push(x, y);
        }
        
        return vertices;
    }
    
    render(gl, a_Position, u_FragColor, u_PointSize) {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        
        const vertexBuffer = gl.createBuffer();
        if (!vertexBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        
        // bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        
        // write data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        
        // assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        
        // enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);
        
        // draw the circle as a triangle fan
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.segments + 2);
    }
}