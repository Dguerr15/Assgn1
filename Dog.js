// dog.js - Code to draw a geometric German Shepherd using triangles
class Dog {
    constructor() {
        // Define dog colors - German Shepherd palette
        this.darkColor = [0.2, 0.2, 0.2, 1.0];       // Black for dark parts
        this.mainColor = [0.4, 0.25, 0.05, 1.0];     // Brown for main body
        this.lightColor = [0.7, 0.5, 0.2, 1.0];      // Light tan for highlights
        
        // Define triangles that make up the geometric dog
        this.triangles = [
            // Face
            { vertices: [.25, 0.75, 0.25, 0.45, .45, 0.65], color: this.mainColor },
            { vertices: [.45, 0.65, .5, 0.55, .35, 0.55], color: this.darkColor },
            { vertices: [.5, 0.55, .6, 0.4, .65, 0.45], color: this.darkColor },
            { vertices: [.6, 0.4, .35, 0.55, .5, 0.55], color: this.mainColor },
            { vertices: [0.25, 0.45, .35, 0.55, .37, 0.4], color: this.lightColor },
            { vertices: [.37, 0.4, .35, 0.55, .5, 0.45], color: this.lightColor },
            { vertices: [.37, 0.4, .5, 0.45, .55, 0.35], color: this.mainColor },

            // Body
            { vertices: [.10, 0.1, .22, 0.6, .45, 0.05], color: this.lightColor },
            { vertices: [.45, 0.05, .4, 0.4, .3, 0.42], color: this.mainColor },
            { vertices: [.45, 0.05, .1, 0.1, .4, -0.10], color: this.mainColor },
            { vertices: [.1, .1, .4, -0.1, .1, -0.35], color: this.lightColor },
            { vertices: [.1, -0.35, .1, 0.1, -.15, -0.1], color: this.mainColor },
            { vertices: [.1, -0.35, -.15, -0.35, -.15, -0.1], color: this.lightColor },
            { vertices: [-.4, -0.35, -.15, -0.35, -.15, -0.1], color: this.lightColor },

            // Back legs
            { vertices: [-.4, -0.35, -.15, -0.35, -.4, -0.5], color: this.mainColor },
            { vertices: [-.15, -0.35, -.15, -0.5, -.4, -0.5], color: this.lightColor },
            { vertices: [-.4, -0.5, -.15, -0.5, -.4, -0.65], color: this.mainColor },
            { vertices: [-.15, -0.5, -.15, -0.65, -.4, -0.65], color: this.lightColor },
            { vertices: [0.02, -0.45, -.15, -0.65, -.15, -0.35], color: this.mainColor },
            { vertices: [0.02, -0.45, .10, -0.35, -.15, -0.35], color: this.lightColor },
            { vertices: [-.15, -0.65, -.05, -0.55, .1, -0.55], color: this.lightColor },
            { vertices: [-.15, -0.65, .15, -0.65, .1, -0.55], color: this.darkColor },

            // Front legs
            { vertices: [.1, -0.35, .35, -0.65, .3, -0.18], color: this.mainColor },
            { vertices: [.4, -.1, .35, -0.45, .3, -0.18], color: this.mainColor },
            { vertices: [.37, -.35, .33, -0.45, .4, -0.55], color: this.lightColor },
            { vertices: [.5, -.65, .33, -0.65, .4, -0.55], color: this.darkColor },

            // Tail
            { vertices: [-.4, -0.65, -.6, -0.35, -.55, -0.25], color: this.darkColor },

            // Ears 
            { vertices: [.25, 0.4, .25, 0.75, 0.1, 0.6], color: this.darkColor }



        ]
            
        //     // Neck/chest diamond
        //     { vertices: [-0.15, 0.3, 0.0, 0.45, 0.15, 0.3], color: this.mainColor },
        //     { vertices: [-0.15, 0.3, 0.0, 0.15, 0.15, 0.3], color: this.mainColor },
            
        //     // Body center diamond
        //     { vertices: [-0.25, 0.0, 0.0, 0.15, 0.25, 0.0], color: this.mainColor },
        //     { vertices: [-0.25, 0.0, 0.0, -0.15, 0.25, 0.0], color: this.mainColor },
            
        //     // Small connecting diamond
        //     { vertices: [-0.1, -0.15, 0.0, -0.1, 0.1, -0.15], color: this.darkColor },
        //     { vertices: [-0.1, -0.15, 0.0, -0.2, 0.1, -0.15], color: this.darkColor },
            
        //     // Lower body structure (larger trapezoid)
        //     { vertices: [-0.35, -0.2, -0.15, -0.15, 0.15, -0.15], color: this.mainColor },
        //     { vertices: [0.35, -0.2, 0.15, -0.15, -0.15, -0.15], color: this.mainColor },
        //     { vertices: [-0.35, -0.2, -0.35, -0.4, 0.0, -0.25], color: this.mainColor },
        //     { vertices: [0.35, -0.2, 0.35, -0.4, 0.0, -0.25], color: this.mainColor },
            
        //     // Front left leg
        //     { vertices: [-0.35, -0.2, -0.35, -0.4, -0.25, -0.3], color: this.mainColor },
            
        //     // Front right leg
        //     { vertices: [0.35, -0.2, 0.35, -0.4, 0.25, -0.3], color: this.mainColor },
            
        //     // Back legs (crossing triangles in center)
        //     { vertices: [-0.1, -0.3, 0.1, -0.3, 0.0, -0.45], color: this.mainColor },
        //     { vertices: [-0.2, -0.3, 0.2, -0.3, 0.0, -0.5], color: this.mainColor },
            
        //     // Tail
        //     { vertices: [0.2, -0.3, 0.1, -0.4, 0.4, -0.5], color: this.darkColor },
            
        //     // Highlight triangles (lighter color)
        //     { vertices: [-0.1, 0.4, 0.0, 0.35, 0.1, 0.4], color: this.lightColor },
        //     { vertices: [-0.15, 0.25, 0.0, 0.3, 0.15, 0.25], color: this.lightColor },
            
        //     // Additional detail triangles (dark)
        //     { vertices: [-0.05, 0.45, 0.0, 0.4, 0.05, 0.45], color: this.darkColor },
        //     { vertices: [-0.05, -0.25, 0.0, -0.2, 0.05, -0.25], color: this.darkColor }
        // ];
    }
    
    render(gl, a_Position, u_FragColor) {
        // For each triangle in the dog
        for (const triangle of this.triangles) {
            // Set the color for this triangle
            gl.uniform4fv(u_FragColor, triangle.color);
            
            // Create a buffer for position
            const vertexBuffer = gl.createBuffer();
            if (!vertexBuffer) {
                console.log('Failed to create the buffer object');
                return -1;
            }
            
            // Bind the buffer object to target
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            
            // Write data into the buffer object
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangle.vertices), gl.STATIC_DRAW);
            
            // Assign the buffer object to a_Position variable
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            
            // Enable the assignment to a_Position variable
            gl.enableVertexAttribArray(a_Position);
            
            // Draw the filled triangle
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
    }
}