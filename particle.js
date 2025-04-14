class Particle {
    constructor(x, y, color, size, velocityX, velocityY, gravity, life) {
        // Store initial WebGL coordinates directly
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        
        // Store velocities in WebGL coordinate space - make them larger
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.gravity = gravity;
        this.life = life;
        this.originalLife = life;
        
        // Debug tracking
        this.startX = x;
        this.startY = y;
    }
    
    update() {
        // Update position in WebGL space
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Apply gravity
        this.velocityY -= this.gravity;
        
        // Decrease life
        this.life--;
        
        // Track distance moved for debugging
        const distanceMoved = Math.sqrt(
            Math.pow(this.x - this.startX, 2) + 
            Math.pow(this.y - this.startY, 2)
        );
        
        // Log movement every few frames
        if (this.life % 10 === 0) {
            console.log(`Particle moved: ${distanceMoved.toFixed(4)} units`);
        }
        
        return this.life > 0;
    }
    
    render(gl, a_Position, u_FragColor, u_PointSize) {
        // Calculate fade based on remaining life
        const fadeMultiplier = this.life / this.originalLife;
        
        // Set point size with fade effect
        gl.uniform1f(u_PointSize, this.size * fadeMultiplier);
        
        // Set color with fade effect for alpha
        const fadeColor = [...this.color];
        fadeColor[3] = fadeColor[3] * fadeMultiplier;
        gl.uniform4fv(u_FragColor, fadeColor);
        
        // Set vertex position directly
        gl.vertexAttrib3f(a_Position, this.x, this.y, 0.0);
        
        // Draw the point
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}