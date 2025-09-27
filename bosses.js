// Boss battles per Pigeon Bomber - Creature mitologiche greche

class Boss {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 64;
        this.height = 64;
        this.health = 10;
        this.maxHealth = 10;
        this.points = 1000;
        this.shouldRemove = false;
        
        // Physics
        this.vx = 0;
        this.vy = 0;
        this.gravity = 400;
        this.onGround = false;
        
        // AI and attacks
        this.aiTimer = 0;
        this.attackTimer = 0;
        this.phase = 1;
        this.direction = 1;
        this.attackCooldown = 0;
        this.specialAttackCooldown = 0;
        
        // Animation
        this.animationFrame = 0;
        this.animationTime = 0;
        this.animationSpeed = 6;
        
        // Boss-specific properties
        this.projectiles = [];
        this.minions = [];
        
        this.initializeByType();
    }
    
    initializeByType() {
        switch (this.type) {
            case 'harpy':
                this.name = "Arpia Regina";
                this.health = 8;
                this.maxHealth = 8;
                this.canFly = true;
                this.gravity = 0;
                this.moveSpeed = 60;
                break;
                
            case 'minotaur':
                this.name = "Minotauro";
                this.health = 15;
                this.maxHealth = 15;
                this.width = 80;
                this.height = 80;
                this.moveSpeed = 40;
                this.isCharging = false;
                break;
                
            case 'medusa':
                this.name = "Medusa";
                this.health = 12;
                this.maxHealth = 12;
                this.moveSpeed = 30;
                this.petrifyRadius = 150;
                break;
                
            case 'hydra':
                this.name = "Idra di Lerna";
                this.health = 20;
                this.maxHealth = 20;
                this.width = 100;
                this.height = 80;
                this.moveSpeed = 20;
                this.heads = 3;
                this.maxHeads = 5;
                break;
                
            case 'zeus':
                this.name = "Zeus Re degli Dei";
                this.health = 30;
                this.maxHealth = 30;
                this.width = 120;
                this.height = 120;
                this.moveSpeed = 50;
                this.canFly = true;
                this.gravity = 0;
                break;
        }
    }
    
    update(deltaTime, game) {
        this.updateAI(deltaTime, game);
        this.updatePhysics(deltaTime, game);
        this.updateAnimation(deltaTime);
        
        // Check if health is yellow (30% or less) for enhanced attacks
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent <= 0.3 && !this.enhancedMode) {
            this.enhancedMode = true;
            this.attackSpeed *= 0.5; // Attack twice as fast
            this.moveSpeed *= 1.5; // Move faster
            game.playSound('bossEnrage'); // Play enrage sound
        }
        
        // Linear attack pattern - attack every 2-3 seconds
        this.attackTimer += deltaTime;
        if (this.attackTimer >= (this.enhancedMode ? 1.5 : 3)) {
            this.performLinearAttack(game);
            this.attackTimer = 0;
        }
        
        // Update projectiles
        this.projectiles.forEach((projectile, index) => {
            projectile.update(deltaTime, game);
            if (projectile.shouldRemove) {
                this.projectiles.splice(index, 1);
            }
        });
        
        // Check platform collisions if not flying
        if (!this.canFly) {
            this.checkPlatformCollisions(game.platforms);
        }
    }
    
    updateAI(deltaTime, game) {
        this.aiTimer += deltaTime;
        this.attackTimer += deltaTime;
        
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.specialAttackCooldown > 0) this.specialAttackCooldown -= deltaTime;
        
        // Phase transitions based on health
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < 0.3 && this.phase < 3) {
            this.phase = 3;
        } else if (healthPercent < 0.6 && this.phase < 2) {
            this.phase = 2;
        }
        
        if (!game.player) return;
        
        switch (this.type) {
            case 'harpy':
                this.updateHarpyAI(deltaTime, game);
                break;
            case 'minotaur':
                this.updateMinotaurAI(deltaTime, game);
                break;
            case 'medusa':
                this.updateMedusaAI(deltaTime, game);
                break;
            case 'hydra':
                this.updateHydraAI(deltaTime, game);
                break;
            case 'zeus':
                this.updateZeusAI(deltaTime, game);
                break;
        }
    }
    
    updateHarpyAI(deltaTime, game) {
        const playerX = game.player.x;
        const playerY = game.player.y;
        
        // Circle around player
        const angle = this.aiTimer * 2;
        this.vx = Math.cos(angle) * this.moveSpeed;
        this.vy = Math.sin(angle) * this.moveSpeed * 0.5;
        
        // Dive attack
        if (this.attackTimer > 3 && this.attackCooldown <= 0) {
            this.diveAttack(game);
            this.attackCooldown = 4;
            this.attackTimer = 0;
        }
        
        // Wind projectiles in phase 2+
        if (this.phase >= 2 && this.specialAttackCooldown <= 0) {
            this.windAttack(game);
            this.specialAttackCooldown = 2;
        }
    }
    
    updateMinotaurAI(deltaTime, game) {
        const playerX = game.player.x;
        
        if (!this.isCharging) {
            // Normal movement
            if (Math.abs(this.x - playerX) > 50) {
                this.direction = this.x < playerX ? 1 : -1;
                this.vx = this.direction * this.moveSpeed;
            } else {
                this.vx = 0;
            }
            
            // Start charge attack
            if (this.attackTimer > 3 && this.attackCooldown <= 0) {
                this.startCharge();
                this.attackCooldown = 5;
                this.attackTimer = 0;
            }
        } else {
            // Charging behavior
            this.vx = this.direction * this.moveSpeed * 3;
            
            // Stop charging after hitting wall or timeout
            if (Math.abs(this.vx) < this.moveSpeed || this.attackTimer > 2) {
                this.isCharging = false;
            }
        }
        
        // Ground slam in phase 2+
        if (this.phase >= 2 && this.specialAttackCooldown <= 0) {
            this.groundSlam(game);
            this.specialAttackCooldown = 4;
        }
    }
    
    updateMedusaAI(deltaTime, game) {
        const playerX = game.player.x;
        
        // Slow movement
        if (Math.abs(this.x - playerX) > 100) {
            this.direction = this.x < playerX ? 1 : -1;
            this.vx = this.direction * this.moveSpeed;
        } else {
            this.vx = 0;
        }
        
        // Petrify gaze
        if (this.attackTimer > 2 && this.attackCooldown <= 0) {
            this.petrifyGaze(game);
            this.attackCooldown = 3;
            this.attackTimer = 0;
        }
        
        // Snake projectiles
        if (this.aiTimer > 1.5) {
            this.launchSnake(game);
            this.aiTimer = 0;
        }
    }
    
    updateHydraAI(deltaTime, game) {
        const playerX = game.player.x;
        
        // Slow movement
        if (Math.abs(this.x - playerX) > 150) {
            this.direction = this.x < playerX ? 1 : -1;
            this.vx = this.direction * this.moveSpeed;
        } else {
            this.vx = 0;
        }
        
        // Multi-head attacks
        if (this.attackTimer > 2) {
            this.multiHeadAttack(game);
            this.attackTimer = 0;
        }
    }
    
    updateZeusAI(deltaTime, game) {
        const playerX = game.player.x;
        const playerY = game.player.y;
        
        // Stay above player
        const targetX = playerX;
        const targetY = playerY - 200;
        
        this.vx = (targetX - this.x) * 0.5;
        this.vy = (targetY - this.y) * 0.5;
        
        // Lightning attacks
        if (this.attackTimer > 1.5) {
            this.lightningStrike(game);
            this.attackTimer = 0;
        }
        
        // Lightning storm in phase 2+
        if (this.phase >= 2 && this.specialAttackCooldown <= 0) {
            this.lightningStorm(game);
            this.specialAttackCooldown = 6;
        }
    }
    
    // Attack methods
    diveAttack(game) {
        if (!game.player) return;
        
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.vx = (dx / distance) * 200;
        this.vy = (dy / distance) * 200;
    }
    
    windAttack(game) {
        for (let i = 0; i < 3; i++) {
            const angle = (i - 1) * 0.5;
            const projectile = new BossProjectile(
                this.x + this.width/2,
                this.y + this.height/2,
                Math.cos(angle) * 120,
                Math.sin(angle) * 120,
                'wind'
            );
            this.projectiles.push(projectile);
        }
    }
    
    startCharge() {
        this.isCharging = true;
        this.attackTimer = 0;
    }
    
    groundSlam(game) {
        // Create shockwave effect
        game.createExplosion(this.x, this.y + this.height, 'large');
        
        // Damage player if close
        if (game.player && Math.abs(game.player.x - this.x) < 150) {
            game.playerHit();
        }
    }
    
    petrifyGaze(game) {
        if (!game.player) return;
        
        const distance = Math.abs(game.player.x - this.x);
        if (distance < this.petrifyRadius && !game.player.invulnerable) {
            // Slow down player temporarily
            game.player.moveSpeed *= 0.3;
            setTimeout(() => {
                if (game.player) game.player.moveSpeed = 200;
            }, 2000);
        }
    }
    
    launchSnake(game) {
        if (!game.player) return;
        
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const projectile = new BossProjectile(
            this.x + this.width/2,
            this.y + this.height/2,
            (dx / distance) * 100,
            (dy / distance) * 100,
            'snake'
        );
        this.projectiles.push(projectile);
    }
    
    multiHeadAttack(game) {
        if (!game.player) return;
        
        for (let i = 0; i < this.heads; i++) {
            const angle = (i / this.heads) * Math.PI * 2;
            const projectile = new BossProjectile(
                this.x + this.width/2 + Math.cos(angle) * 30,
                this.y + this.height/2 + Math.sin(angle) * 30,
                Math.cos(angle) * 80,
                Math.sin(angle) * 80,
                'acid'
            );
            this.projectiles.push(projectile);
        }
    }
    
    lightningStrike(game) {
        if (!game.player) return;
        
        const projectile = new BossProjectile(
            game.player.x,
            0,
            0,
            300,
            'lightning'
        );
        this.projectiles.push(projectile);
    }
    
    lightningStorm(game) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = Math.random() * 1200;
                const projectile = new BossProjectile(x, 0, 0, 250, 'lightning');
                this.projectiles.push(projectile);
            }, i * 200);
        }
    }
    
    // Linear attack pattern - simple direct attacks
    performLinearAttack(game) {
        if (!game.player) return;
        
        // Play boss attack sound
        game.playSound('bossAttack');
        
        switch (this.type) {
            case 'harpy':
                // Simple wind projectile towards player
                const dx1 = game.player.x - this.x;
                const dy1 = game.player.y - this.y;
                const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                const projectile1 = new BossProjectile(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    (dx1 / dist1) * 150,
                    (dy1 / dist1) * 150,
                    'wind'
                );
                this.projectiles.push(projectile1);
                break;
                
            case 'minotaur':
                // Charge towards player
                if (!this.isCharging) {
                    this.direction = this.x < game.player.x ? 1 : -1;
                    this.startCharge();
                }
                break;
                
            case 'medusa':
                // Snake projectile towards player
                const dx2 = game.player.x - this.x;
                const dy2 = game.player.y - this.y;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                const projectile2 = new BossProjectile(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    (dx2 / dist2) * 120,
                    (dy2 / dist2) * 120,
                    'snake'
                );
                this.projectiles.push(projectile2);
                break;
                
            case 'hydra':
                // Single acid projectile from random head
                const randomHead = Math.floor(Math.random() * this.heads);
                const angle = (randomHead / this.heads) * Math.PI * 2;
                const headX = this.x + this.width/2 + Math.cos(angle) * 30;
                const headY = this.y + this.height/2 + Math.sin(angle) * 30;
                
                const dx3 = game.player.x - headX;
                const dy3 = game.player.y - headY;
                const dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
                
                const projectile3 = new BossProjectile(
                    headX, headY,
                    (dx3 / dist3) * 100,
                    (dy3 / dist3) * 100,
                    'acid'
                );
                this.projectiles.push(projectile3);
                break;
                
            case 'zeus':
                // Lightning strike at player position
                const projectile4 = new BossProjectile(
                    game.player.x,
                    0,
                    0,
                    400,
                    'lightning'
                );
                this.projectiles.push(projectile4);
                break;
        }
        
        // Enhanced mode - additional attacks
        if (this.enhancedMode) {
            setTimeout(() => {
                this.performEnhancedAttack(game);
            }, 500); // 0.5 seconds later
        }
    }
    
    // Enhanced attack pattern when health is yellow
    performEnhancedAttack(game) {
        if (!game.player) return;
        
        switch (this.type) {
            case 'harpy':
                // Triple wind attack
                for (let i = 0; i < 3; i++) {
                    const angle = (i - 1) * 0.4;
                    const projectile = new BossProjectile(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        Math.cos(angle) * 180,
                        Math.sin(angle) * 180,
                        'wind'
                    );
                    this.projectiles.push(projectile);
                }
                break;
                
            case 'minotaur':
                // Ground slam
                this.groundSlam(game);
                break;
                
            case 'medusa':
                // Petrify gaze
                this.petrifyGaze(game);
                break;
                
            case 'hydra':
                // All heads attack
                this.multiHeadAttack(game);
                break;
                
            case 'zeus':
                // Lightning storm
                for (let i = 0; i < 3; i++) {
                    const x = game.player.x + (Math.random() - 0.5) * 200;
                    const projectile = new BossProjectile(x, 0, 0, 350, 'lightning');
                    this.projectiles.push(projectile);
                }
                break;
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
        
        // Ground collision for non-flying bosses
        if (!this.canFly && this.y > 580 - this.height) {
            this.y = 580 - this.height;
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
                // Side collisions - stop charging
                else if (this.isCharging && 
                         ((this.vx > 0 && this.x < platform.x) || 
                          (this.vx < 0 && this.x > platform.x))) {
                    this.isCharging = false;
                    this.vx = 0;
                }
            }
        });
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.shouldRemove = true;
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
        
        // Draw boss based on type
        switch (this.type) {
            case 'harpy':
                this.renderHarpy(ctx);
                break;
            case 'minotaur':
                this.renderMinotaur(ctx);
                break;
            case 'medusa':
                this.renderMedusa(ctx);
                break;
            case 'hydra':
                this.renderHydra(ctx);
                break;
            case 'zeus':
                this.renderZeus(ctx);
                break;
        }
        
        // Render projectiles
        this.projectiles.forEach(projectile => {
            projectile.render(ctx);
        });
        
        ctx.restore();
    }
    
    renderHarpy(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Body
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 10, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Wings (animated)
        const wingFlap = Math.sin(this.animationFrame * Math.PI) * 0.8;
        ctx.fillStyle = '#654321';
        
        // Left wing
        ctx.beginPath();
        ctx.ellipse(centerX - 25, centerY - 5, 15, 8 + wingFlap * 3, -0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.ellipse(centerX + 25, centerY - 5, 15, 8 + wingFlap * 3, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 15, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(centerX - 5, centerY - 18, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 5, centerY - 18, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Talons
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 8, centerY + 25);
        ctx.lineTo(centerX - 8, centerY + 35);
        ctx.moveTo(centerX + 8, centerY + 25);
        ctx.lineTo(centerX + 8, centerY + 35);
        ctx.stroke();
    }
    
    renderMinotaur(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Body
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 10, this.y + 20, this.width - 20, this.height - 30);
        
        // Head (bull)
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + 15, 25, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Horns
        ctx.fillStyle = '#FFFACD';
        ctx.beginPath();
        ctx.ellipse(centerX - 15, this.y + 5, 3, 12, -0.3, 0, Math.PI * 2);
        ctx.ellipse(centerX + 15, this.y + 5, 3, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(centerX - 8, this.y + 12, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 8, this.y + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 15, this.y + this.height - 10, 8, 10);
        ctx.fillRect(this.x + this.width - 23, this.y + this.height - 10, 8, 10);
        
        // Charging effect
        if (this.isCharging) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    renderMedusa(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Body
        ctx.fillStyle = '#9370DB';
        ctx.fillRect(this.x + 8, this.y + 20, this.width - 16, this.height - 25);
        
        // Head
        ctx.fillStyle = '#98FB98';
        ctx.beginPath();
        ctx.arc(centerX, this.y + 15, 18, 0, Math.PI * 2);
        ctx.fill();
        
        // Snake hair (animated)
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const waveOffset = Math.sin(this.animationFrame * Math.PI / 2 + i) * 3;
            ctx.beginPath();
            ctx.moveTo(centerX + Math.cos(angle) * 15, this.y + 15 + Math.sin(angle) * 15);
            ctx.lineTo(centerX + Math.cos(angle) * (25 + waveOffset), this.y + 15 + Math.sin(angle) * (25 + waveOffset));
            ctx.stroke();
        }
        
        // Eyes (glowing)
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(centerX - 6, this.y + 12, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 6, this.y + 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    renderHydra(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Main body
        ctx.fillStyle = '#006400';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 20, 40, 25, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Multiple heads
        for (let i = 0; i < this.heads; i++) {
            const angle = (i / this.heads) * Math.PI * 2;
            const headX = centerX + Math.cos(angle) * 30;
            const headY = centerY + Math.sin(angle) * 20 - 10;
            
            // Neck
            ctx.strokeStyle = '#228B22';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(headX, headY);
            ctx.stroke();
            
            // Head
            ctx.fillStyle = '#32CD32';
            ctx.beginPath();
            ctx.ellipse(headX, headY, 12, 8, angle, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(headX - 4, headY - 2, 2, 0, Math.PI * 2);
            ctx.arc(headX + 4, headY - 2, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderZeus(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Divine aura
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Body (robes)
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(this.x + 20, this.y + 40, this.width - 40, this.height - 50);
        
        // Head
        ctx.fillStyle = '#FDBCB4';
        ctx.beginPath();
        ctx.arc(centerX, this.y + 25, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Beard
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + 35, 15, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(centerX - 8, this.y + 20, 3, 0, Math.PI * 2);
        ctx.arc(centerX + 8, this.y + 20, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Lightning bolt
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX + 30, this.y + 30);
        ctx.lineTo(centerX + 35, this.y + 50);
        ctx.lineTo(centerX + 25, this.y + 60);
        ctx.lineTo(centerX + 30, this.y + 80);
        ctx.stroke();
        
        // Crown
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(centerX - 25, this.y + 5, 50, 8);
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(centerX - 20 + i * 10, this.y, 4, 10);
        }
    }
}

// Boss projectile class
class BossProjectile {
    constructor(x, y, vx, vy, type) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 12;
        this.height = 12;
        this.type = type;
        this.shouldRemove = false;
        this.life = 5;
        this.damage = 1;
    }
    
    update(deltaTime, game) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.shouldRemove = true;
        }
        
        // Check collision with player
        if (game.player && this.collidesWith(game.player) && !game.player.invulnerable) {
            game.playerHit();
            this.shouldRemove = true;
        }
        
        // Check bounds
        if (this.x < 0 || this.x > 2000 || this.y < 0 || this.y > 600) {
            this.shouldRemove = true;
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
        
        switch (this.type) {
            case 'wind':
                ctx.fillStyle = '#00FFFF';
                ctx.shadowColor = '#00FFFF';
                ctx.shadowBlur = 15;
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 2, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'snake':
                ctx.fillStyle = '#FF4500';
                ctx.shadowColor = '#FF4500';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2 + 3, this.height/3 + 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'acid':
                ctx.fillStyle = '#00FF00';
                ctx.shadowColor = '#00FF00';
                ctx.shadowBlur = 15;
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 3, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'lightning':
                ctx.strokeStyle = '#FFFF00';
                ctx.lineWidth = 8;
                ctx.shadowColor = '#FFFF00';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.stroke();
                // Add zigzag effect
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width/2, this.y + this.height/2);
                ctx.lineTo(this.x + this.width, this.y + this.height);
                ctx.stroke();
                break;
                
            default:
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        ctx.restore();
    }
}
