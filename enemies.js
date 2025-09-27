// Sistema nemici per Pigeon Bomber

// Classe base Enemy
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 24;
        this.height = 24;
        this.health = 1;
        this.maxHealth = 1;
        this.points = 50;
        this.shouldRemove = false;
        
        // Physics
        this.vx = 0;
        this.vy = 0;
        this.gravity = 600;
        this.onGround = false;
        
        // AI
        this.aiTimer = 0;
        this.direction = 1; // 1 = right, -1 = left
        this.patrolDistance = 100;
        this.startX = x;
        
        // Animation
        this.animationFrame = 0;
        this.animationTime = 0;
        this.animationSpeed = 4;
        
        // Attack
        this.attackCooldown = 0;
        this.canAttack = false;
        
        this.initializeByType();
    }
    
    initializeByType() {
        switch (this.type) {
            case 'goblin':
                this.health = 1;
                this.maxHealth = 1;
                this.points = 50;
                this.moveSpeed = 50;
                this.color = '#228B22';
                break;
                
            case 'bat':
                this.health = 1;
                this.maxHealth = 1;
                this.points = 75;
                this.moveSpeed = 80;
                this.canFly = true;
                this.gravity = 0;
                this.color = '#4B0082';
                this.flyPattern = 'sine';
                this.flyTime = 0;
                break;
                
            case 'dragon':
                this.health = 2;
                this.maxHealth = 2;
                this.points = 100;
                this.moveSpeed = 30;
                this.canAttack = true;
                this.attackRange = 200;
                this.color = '#DC143C';
                this.projectiles = [];
                break;
        }
    }
    
    update(deltaTime, game) {
        this.updateAI(deltaTime, game);
        this.updatePhysics(deltaTime, game);
        this.updateAnimation(deltaTime);
        this.updateAttack(deltaTime, game);
        
        // Check platform collisions if not flying
        if (!this.canFly) {
            this.checkPlatformCollisions(game.platforms);
        }
        
        // Update projectiles for dragons
        if (this.projectiles) {
            this.projectiles.forEach((projectile, index) => {
                projectile.update(deltaTime, game);
                if (projectile.shouldRemove) {
                    this.projectiles.splice(index, 1);
                }
            });
        }
    }
    
    updateAI(deltaTime, game) {
        this.aiTimer += deltaTime;
        
        switch (this.type) {
            case 'goblin':
                this.updateGoblinAI(deltaTime, game);
                break;
            case 'bat':
                this.updateBatAI(deltaTime, game);
                break;
            case 'dragon':
                this.updateDragonAI(deltaTime, game);
                break;
        }
    }
    
    updateGoblinAI(deltaTime, game) {
        // Simple patrol behavior
        const distanceFromStart = Math.abs(this.x - this.startX);
        
        if (distanceFromStart > this.patrolDistance) {
            this.direction *= -1; // Turn around
        }
        
        // Move horizontally
        this.vx = this.direction * this.moveSpeed;
        
        // Jump if there's an obstacle ahead
        if (this.onGround && this.aiTimer > 2) {
            this.vy = -300; // Jump
            this.aiTimer = 0;
        }
    }
    
    updateBatAI(deltaTime, game) {
        this.flyTime += deltaTime;
        
        // Sine wave flight pattern
        if (this.flyPattern === 'sine') {
            this.vx = this.direction * this.moveSpeed;
            this.vy = Math.sin(this.flyTime * 3) * 50;
        }
        
        // Change direction occasionally
        if (this.aiTimer > 3) {
            this.direction *= -1;
            this.aiTimer = 0;
        }
        
        // Try to stay near player height
        if (game.player) {
            const playerY = game.player.y;
            const heightDiff = this.y - playerY;
            
            if (Math.abs(heightDiff) > 100) {
                this.vy += heightDiff > 0 ? -20 : 20;
            }
        }
    }
    
    updateDragonAI(deltaTime, game) {
        // Slower, more deliberate movement
        const distanceFromStart = Math.abs(this.x - this.startX);
        
        if (distanceFromStart > this.patrolDistance) {
            this.direction *= -1;
        }
        
        this.vx = this.direction * this.moveSpeed;
        
        // Attack player if in range
        if (game.player && this.canAttack) {
            const distanceToPlayer = Math.abs(this.x - game.player.x);
            
            if (distanceToPlayer < this.attackRange && this.attackCooldown <= 0) {
                this.fireProjectile(game);
                this.attackCooldown = 2; // 2 second cooldown
            }
        }
    }
    
    updatePhysics(deltaTime, game) {
        // Apply gravity if not flying
        if (!this.canFly && !this.onGround) {
            this.vy += this.gravity * deltaTime;
        }
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Keep within level bounds
        this.x = Math.max(0, Math.min(this.x, 2000 - this.width));
        
        // Ground collision for non-flying enemies
        if (!this.canFly && this.y > 580) {
            this.y = 580;
            this.vy = 0;
            this.onGround = true;
        }
    }
    
    updateAnimation(deltaTime) {
        this.animationTime += deltaTime;
        if (this.animationTime >= 1 / this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTime = 0;
        }
    }
    
    updateAttack(deltaTime, game) {
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
    }
    
    checkPlatformCollisions(platforms) {
        this.onGround = false;
        
        platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                // Top collision (landing on platform)
                if (this.vy > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.vy = 0;
                    this.onGround = true;
                }
                // Side collisions - turn around
                else if ((this.vx > 0 && this.x < platform.x) || 
                         (this.vx < 0 && this.x > platform.x)) {
                    this.direction *= -1;
                }
            }
        });
    }
    
    fireProjectile(game) {
        if (!game.player) return;
        
        // Calculate direction to player
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Create projectile
        const projectile = new Projectile(
            this.x + this.width/2,
            this.y + this.height/2,
            dirX * 150, // velocity
            dirY * 150,
            'fireball'
        );
        
        this.projectiles.push(projectile);
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        // Play hit sound
        if (this.game && this.game.playSound) {
            this.game.playSound('hit');
        }
        
        // Create hit particles
        if (this.game && this.game.createExplosion) {
            this.game.createExplosion(this.x + this.width/2, this.y + this.height/2, 'small');
        }
        
        if (this.health <= 0) {
            this.shouldRemove = true;
            
            // Enhanced death effects
            if (this.game && this.game.createExplosion) {
                this.game.createExplosion(this.x + this.width/2, this.y + this.height/2, 'normal');
            }
        }
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    render(ctx) {
        ctx.save();
        
        // Health bar for stronger enemies
        if (this.maxHealth > 1) {
            this.renderHealthBar(ctx);
        }
        
        // Draw enemy based on type
        switch (this.type) {
            case 'goblin':
                this.renderGoblin(ctx);
                break;
            case 'bat':
                this.renderBat(ctx);
                break;
            case 'dragon':
                this.renderDragon(ctx);
                break;
        }
        
        // Render projectiles
        if (this.projectiles) {
            this.projectiles.forEach(projectile => {
                projectile.render(ctx);
            });
        }
        
        ctx.restore();
    }
    
    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 4;
        const x = this.x;
        const y = this.y - 8;
        
        // Background
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : '#ff8800';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
    
    renderGoblin(ctx) {
        // Body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 4, this.y + 8, 16, 16);
        
        // Head
        ctx.fillStyle = '#90EE90';
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x + 9, this.y + 4, 1, 0, Math.PI * 2);
        ctx.arc(this.x + 15, this.y + 4, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs (animated)
        const legOffset = Math.sin(this.animationFrame * Math.PI / 2) * 2;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 6, this.y + 20 + legOffset, 4, 4);
        ctx.fillRect(this.x + 14, this.y + 20 - legOffset, 4, 4);
    }
    
    renderBat(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings (animated)
        const wingFlap = Math.sin(this.animationFrame * Math.PI) * 0.5 + 0.5;
        ctx.fillStyle = '#2F4F4F';
        
        // Left wing
        ctx.beginPath();
        ctx.ellipse(centerX - 8, centerY - 2, 6, 3 + wingFlap * 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.ellipse(centerX + 8, centerY - 2, 6, 3 + wingFlap * 2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(centerX - 2, centerY - 2, 1, 0, Math.PI * 2);
        ctx.arc(centerX + 2, centerY - 2, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderDragon(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 4, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#B22222';
        ctx.beginPath();
        ctx.ellipse(centerX + (this.direction * 8), centerY - 2, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings
        ctx.fillStyle = '#8B0000';
        const wingFlap = Math.sin(this.animationFrame * Math.PI / 2) * 2;
        ctx.beginPath();
        ctx.ellipse(centerX - 6, centerY + wingFlap, 4, 8, -0.2, 0, Math.PI * 2);
        ctx.ellipse(centerX + 6, centerY - wingFlap, 4, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(centerX + (this.direction * 6), centerY - 4, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(centerX - (this.direction * 12), centerY + 2, 3, 6, 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Projectile class for dragon attacks
class Projectile {
    constructor(x, y, vx, vy, type = 'fireball') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 8;
        this.height = 8;
        this.type = type;
        this.shouldRemove = false;
        this.life = 3; // 3 seconds lifetime
        this.damage = 1;
        
        // Visual effects
        this.animationTime = 0;
        this.particles = [];
    }
    
    update(deltaTime, game) {
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Update lifetime
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.shouldRemove = true;
            return;
        }
        
        // Check collision with player
        if (game.player && this.collidesWith(game.player) && !game.player.invulnerable) {
            game.playerHit();
            this.shouldRemove = true;
            game.createExplosion(this.x, this.y, 'normal');
            return;
        }
        
        // Check collision with platforms
        game.platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                this.shouldRemove = true;
                game.createExplosion(this.x, this.y, 'normal');
            }
        });
        
        // Check bounds
        if (this.x < 0 || this.x > 2000 || this.y < 0 || this.y > 600) {
            this.shouldRemove = true;
        }
        
        // Create trail particles
        this.animationTime += deltaTime;
        if (this.animationTime > 0.1) {
            this.createTrailParticle(game);
            this.animationTime = 0;
        }
    }
    
    createTrailParticle(game) {
        const particle = new Particle(
            this.x + this.width/2,
            this.y + this.height/2,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            this.type === 'fireball' ? '#ff6600' : '#00ff00',
            0.3
        );
        game.particles.push(particle);
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    render(ctx) {
        ctx.save();
        
        switch (this.type) {
            case 'fireball':
                // Fireball with glow effect
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#ff3300';
                ctx.beginPath();
                ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Inner core
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/4, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            default:
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}

// Special enemy pairs (Goblin Twins)
class GoblinPair {
    constructor(x, y) {
        this.goblin1 = new Enemy(x, y, 'goblin');
        this.goblin2 = new Enemy(x + 40, y, 'goblin');
        
        // Synchronize their movement
        this.goblin1.pairPartner = this.goblin2;
        this.goblin2.pairPartner = this.goblin1;
        
        // Override AI for synchronized movement
        this.goblin1.updateGoblinAI = this.createSyncAI(this.goblin1);
        this.goblin2.updateGoblinAI = this.createSyncAI(this.goblin2);
    }
    
    createSyncAI(goblin) {
        return function(deltaTime, game) {
            // Move together
            const distanceFromStart = Math.abs(goblin.x - goblin.startX);
            
            if (distanceFromStart > goblin.patrolDistance) {
                goblin.direction *= -1;
                if (goblin.pairPartner) {
                    goblin.pairPartner.direction = goblin.direction;
                }
            }
            
            goblin.vx = goblin.direction * goblin.moveSpeed;
            
            // Jump together
            if (goblin.onGround && goblin.aiTimer > 2) {
                goblin.vy = -300;
                if (goblin.pairPartner && goblin.pairPartner.onGround) {
                    goblin.pairPartner.vy = -300;
                }
                goblin.aiTimer = 0;
            }
        };
    }
    
    update(deltaTime, game) {
        this.goblin1.update(deltaTime, game);
        this.goblin2.update(deltaTime, game);
    }
    
    render(ctx) {
        this.goblin1.render(ctx);
        this.goblin2.render(ctx);
    }
    
    // Check if both goblins are defeated
    shouldRemove() {
        return this.goblin1.shouldRemove && this.goblin2.shouldRemove;
    }
    
    // Get both goblins for collision detection
    getEnemies() {
        const enemies = [];
        if (!this.goblin1.shouldRemove) enemies.push(this.goblin1);
        if (!this.goblin2.shouldRemove) enemies.push(this.goblin2);
        return enemies;
    }
}
