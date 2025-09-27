// Classe Player - Il piccione protagonista
class Player {
    constructor(x, y, birdType = 'pigeon') {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;
        
        // Physics
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;
        this.gravity = 800;
        this.jumpPower = -400;
        this.moveSpeed = 200;
        
        // Bird type and stats
        this.birdType = birdType;
        this.applyBirdStats();
        
        // State
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        this.facing = 1; // 1 = right, -1 = left
        
        // Abilities
        this.abilities = {
            superJump: false,
            clusterBomb: false,
            missile: false,
            sniper: false
        };
        
        // Ability cooldowns
        this.cooldowns = {
            bomb: 0,
            superJump: 0,
            clusterBomb: 0,
            missile: 0,
            sniper: 0,
            evolution: 0
        };
        
        // Sniper mode - NEW SYSTEM
        this.sniperMode = false;
        this.sniperCrosshair = { x: 0, y: 0 };
        this.sniperUsesLeft = 0;
        this.maxSniperUses = 3;
        
        // Missile control
        this.controllingMissile = null;
        
        // Animation
        this.animationFrame = 0;
        this.animationTime = 0;
        this.animationSpeed = 8; // frames per second
        
        // Dive attack
        this.isDiving = false;
        this.diveSpeed = 600;
        
        // Double jump (for flamingo)
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        
        // Game Master mode
        this.gameMasterMode = false;
        this.canFly = false;
        this.laserActive = false;
    }
    
    applyBirdStats() {
        switch (this.birdType) {
            case 'falcon':
                this.moveSpeed = 300; // +50% speed
                break;
            case 'eagle':
                this.bombDamage = 2; // Double damage
                break;
            case 'owl':
                this.canStealth = true;
                break;
            case 'crow':
                this.smartBombs = true;
                break;
            case 'flamingo':
                this.canDoubleJump = true;
                break;
            default: // pigeon
                this.bombDamage = 1;
                break;
        }
    }
    
    update(deltaTime, keys, game) {
        this.handleInput(keys, game, deltaTime);
        this.updatePhysics(deltaTime, game);
        this.updateCooldowns(deltaTime);
        this.updateAnimation(deltaTime);
        this.updateInvulnerability(deltaTime);
        
        // Check platform collisions
        this.checkPlatformCollisions(game.platforms);
    }
    
    handleInput(keys, game, deltaTime) {
        // NEW SNIPER CONTROLS - Move crosshair with ARROW KEYS
        if (this.sniperMode && this.sniperUsesLeft > 0) {
            // Move crosshair with ARROW KEYS
            const crosshairSpeed = 300;
            if (keys['ArrowUp']) this.sniperCrosshair.y -= crosshairSpeed * deltaTime;
            if (keys['ArrowDown']) this.sniperCrosshair.y += crosshairSpeed * deltaTime;
            if (keys['ArrowLeft']) this.sniperCrosshair.x -= crosshairSpeed * deltaTime;
            if (keys['ArrowRight']) this.sniperCrosshair.x += crosshairSpeed * deltaTime;
            
            // Keep crosshair within bounds
            this.sniperCrosshair.x = Math.max(0, Math.min(this.sniperCrosshair.x, 2000));
            this.sniperCrosshair.y = Math.max(0, Math.min(this.sniperCrosshair.y, 600));
            
            // Shoot with SPACE
            if (keys['Space'] && this.cooldowns.bomb <= 0) {
                this.fireSniperShot(game);
                this.cooldowns.bomb = 0.3; // Short cooldown between shots
            }
            
            // Exit sniper mode with ESC
            if (keys['Escape']) {
                this.sniperMode = false;
            }
            
            return; // Skip normal movement when in sniper mode
        }
        
        // MISSILE CONTROLS - Arrow keys control missile when active
        // But WASD movement should always work
        const missileActive = this.controllingMissile !== null;
        
        // Game Master Mode - Free flight controls
        if (this.gameMasterMode && this.canFly) {
            // Free movement in all directions
            if (keys['KeyA']) {
                this.vx = -this.moveSpeed;
                this.facing = -1;
            } else if (keys['KeyD']) {
                this.vx = this.moveSpeed;
                this.facing = 1;
            } else {
                this.vx *= 0.9; // Less friction for flying
            }
            
            // Vertical movement (flying)
            if (keys['KeyW']) {
                this.vy = -this.moveSpeed; // Fly up
            } else if (keys['KeyS']) {
                this.vy = this.moveSpeed; // Fly down
            } else {
                this.vy *= 0.9; // Less friction for flying
            }
            
            // Activate laser around player
            this.laserActive = true;
            
        } else {
            // Normal movement
            if (keys['KeyA']) {
                this.vx = -this.moveSpeed;
                this.facing = -1;
            } else if (keys['KeyD']) {
                this.vx = this.moveSpeed;
                this.facing = 1;
            } else {
                this.vx *= 0.8; // Friction
            }
            
            // Jumping
            if (keys['KeyW'] && (this.onGround || (this.canDoubleJump && !this.hasDoubleJumped))) {
                if (this.onGround) {
                    this.vy = this.jumpPower;
                    this.onGround = false;
                    game.playSound('jump');
                } else if (this.canDoubleJump && !this.hasDoubleJumped) {
                    this.vy = this.jumpPower * 0.8; // Slightly weaker double jump
                    this.hasDoubleJumped = true;
                    game.playSound('jump');
                }
            }
        }
        
        // Reset double jump when on ground
        if (this.onGround) {
            this.hasDoubleJumped = false;
        }
        
        // Crouching (for stealth)
        if (keys['KeyS'] && this.canStealth) {
            this.activateStealth();
        }
        
        // Main bomb (Space) - or Flames in Game Master mode
        if (keys['Space'] && this.cooldowns.bomb <= 0) {
            if (this.gameMasterMode) {
                this.launchFlames(game);
                this.cooldowns.bomb = 0.1; // Faster cooldown for flames
                game.playSound('explosion');
            } else {
                this.dropBomb(game);
                this.cooldowns.bomb = 0.5; // 0.5 second cooldown
                game.playSound('bomb');
            }
        }
        
        // Special abilities (Arrow keys only) - Disabled when missile is active
        if (!missileActive) {
            if (keys['ArrowUp'] && this.abilities.superJump && this.cooldowns.superJump <= 0) {
                this.superJump(game);
                this.cooldowns.superJump = 3;
            }
            
            if (keys['ArrowRight'] && this.abilities.clusterBomb && this.cooldowns.clusterBomb <= 0) {
                this.dropClusterBomb(game);
                this.cooldowns.clusterBomb = 2;
                game.playSound('bomb');
            }
            
            if (keys['ArrowDown'] && this.abilities.missile && this.cooldowns.missile <= 0) {
                this.launchMissile(game);
                this.cooldowns.missile = 4;
            }
            
            if (keys['ArrowLeft'] && this.abilities.sniper && this.cooldowns.sniper <= 0) {
                this.activateSniper(game);
                this.cooldowns.sniper = 6;
            }
        }
        
        // Evolution abilities (Shift key)
        if (keys['ShiftLeft'] || keys['ShiftRight']) {
            this.activateEvolutionAbility(game);
        }
    }
    
    updatePhysics(deltaTime, game) {
        // Apply gravity
        if (!this.onGround) {
            this.vy += this.gravity * deltaTime;
        }
        
        // Dive attack physics
        if (this.isDiving) {
            this.vy = this.diveSpeed;
            this.vx *= 0.5; // Reduce horizontal movement during dive
        }
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Keep player within screen bounds (horizontally)
        this.x = Math.max(0, Math.min(this.x, 2000 - this.width));
        
        // Reset dive if hit ground
        if (this.onGround && this.isDiving) {
            this.isDiving = false;
            game.createExplosion(this.x + this.width/2, this.y + this.height, 'large');
        }
    }
    
    updateCooldowns(deltaTime) {
        Object.keys(this.cooldowns).forEach(key => {
            if (this.cooldowns[key] > 0) {
                this.cooldowns[key] -= deltaTime;
            }
        });
    }
    
    updateAnimation(deltaTime) {
        this.animationTime += deltaTime;
        if (this.animationTime >= 1 / this.animationSpeed) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTime = 0;
        }
    }
    
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
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
                // Bottom collision (hitting platform from below)
                else if (this.vy < 0 && this.y > platform.y) {
                    this.y = platform.y + platform.height;
                    this.vy = 0;
                }
                // Side collisions
                else if (this.vx > 0 && this.x < platform.x) {
                    this.x = platform.x - this.width;
                    this.vx = 0;
                } else if (this.vx < 0 && this.x > platform.x) {
                    this.x = platform.x + platform.width;
                    this.vx = 0;
                }
            }
        });
    }
    
    dropBomb(game) {
        const bomb = new Bomb(
            this.x + this.width/2,
            this.y + this.height,
            this.facing * 100, // Horizontal velocity based on facing direction
            50, // Slight downward velocity
            this.bombDamage || 1
        );
        game.addBomb(bomb);
    }
    
    dropClusterBomb(game) {
        // First drop main bomb that hits directly below
        const mainBomb = new Bomb(
            this.x + this.width/2,
            this.y + this.height,
            this.facing * 50,
            100,
            this.bombDamage || 1,
            'cluster'
        );
        game.addBomb(mainBomb);
    }
    
    dropNuclearBomb(game) {
        const bomb = new Bomb(
            this.x + this.width/2,
            this.y + this.height,
            this.facing * 50,
            100,
            (this.bombDamage || 1) * 5, // 5x damage
            'nuclear'
        );
        game.addBomb(bomb);
    }
    
    superJump(game) {
        this.vy = this.jumpPower * 1.8; // Much higher jump
        this.onGround = false;
        game.playSound('superJump');
    }
    
    startDiveAttack() {
        if (!this.onGround) {
            this.isDiving = true;
            this.vy = 0; // Reset vertical velocity
        }
    }
    
    launchMissile(game) {
        const missile = new Missile(
            this.x + this.width/2,
            this.y + this.height/2,
            this.facing * 200,
            0,
            (this.bombDamage || 1) * 1.25 // 25% more damage than bombs
        );
        this.controllingMissile = missile;
        game.addMissile(missile);
    }
    
    activateSniper(game) {
        // NEW SNIPER SYSTEM - Activate crosshair mode
        if (!this.sniperMode) {
            // If no uses left, give new ammo
            if (this.sniperUsesLeft <= 0) {
                this.sniperUsesLeft = this.maxSniperUses;
            }
            // Activate sniper mode
            this.sniperMode = true;
            this.sniperCrosshair.x = this.x + this.width/2;
            this.sniperCrosshair.y = this.y + this.height/2;
            game.playSound('sniper');
        }
    }
    
    fireSniperShot(game) {
        if (this.sniperUsesLeft > 0) {
            // Calculate angle from player to crosshair
            const dx = this.sniperCrosshair.x - (this.x + this.width/2);
            const dy = this.sniperCrosshair.y - (this.y + this.height/2);
            const angle = Math.atan2(dy, dx);
            
            // Create sniper bullet
            const bullet = new SniperBullet(
                this.x + this.width/2,
                this.y + this.height/2,
                angle,
                (this.bombDamage || 1) * 3 // 3x damage
            );
            game.addSniperBullet(bullet);
            game.playSound('sniper');
            
            // Decrease uses
            this.sniperUsesLeft--;
            
            // Deactivate sniper mode when out of uses
            if (this.sniperUsesLeft <= 0) {
                this.sniperMode = false;
            }
        }
    }
    
    activateEvolutionAbility(game) {
        if (this.cooldowns.evolution > 0) return;
        
        // Play evolution sound
        game.playSound('evolution');
        
        switch (this.birdType) {
            case 'falcon':
                // Speed boost - FIXED
                const originalSpeed = this.moveSpeed;
                this.moveSpeed = originalSpeed * 2.5; // 2.5x speed boost
                this.evolutionActive = 'speed';
                setTimeout(() => {
                    this.moveSpeed = originalSpeed;
                    this.evolutionActive = null;
                }, 4000); // 4 seconds
                break;
                
            case 'eagle':
                // Damage boost - FIXED
                const originalDamage = this.bombDamage || 1;
                this.bombDamage = originalDamage * 4; // 4x damage boost
                this.evolutionActive = 'damage';
                setTimeout(() => {
                    this.bombDamage = originalDamage;
                    this.evolutionActive = null;
                }, 6000); // 6 seconds
                break;
                
            case 'owl':
                // Stealth mode - FIXED
                this.activateStealth();
                this.evolutionActive = 'stealth';
                setTimeout(() => this.evolutionActive = null, 3000);
                break;
                
            case 'crow':
                // Smart bombs - FIXED
                this.smartBombsActive = 5; // Next 5 bombs are smart
                this.evolutionActive = 'smart';
                break;
                
            case 'flamingo':
                // Multi-jump ability - FIXED
                this.multiJumpCount = 0;
                this.maxJumps = 4; // Can jump 4 times in air
                this.evolutionActive = 'multijump';
                setTimeout(() => {
                    this.maxJumps = 1;
                    this.evolutionActive = null;
                }, 8000); // 8 seconds
                break;
                
            default: // pigeon
                // Pigeon gets temporary invincibility
                this.makeInvulnerable();
                this.invulnerabilityTime = 3; // 3 seconds
                this.evolutionActive = 'invincible';
                setTimeout(() => this.evolutionActive = null, 3000);
                break;
        }
        
        this.cooldowns.evolution = 10; // 10 second cooldown
    }
    
    launchFlames(game) {
        // Game Master flames - wide area attack
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const distance = 60 + Math.random() * 40;
            const flame = new Bomb(
                this.x + this.width/2 + Math.cos(angle) * distance,
                this.y + this.height/2 + Math.sin(angle) * distance,
                Math.cos(angle) * 150,
                Math.sin(angle) * 150,
                5, // High damage
                'flame'
            );
            flame.fuseTime = 0.1; // Explode almost immediately
            flame.explosionRadius = 60; // Large explosion
            game.addBomb(flame);
        }
    }
    
    activateStealth() {
        // Stealth ability for owl
        this.invulnerable = true;
        this.invulnerabilityTime = 2; // 2 seconds of stealth
    }
    
    makeInvulnerable() {
        this.invulnerable = true;
        this.invulnerabilityTime = 2; // 2 seconds of invulnerability
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    render(ctx) {
        ctx.save();
        
        // Flicker effect when invulnerable
        if (this.invulnerable && Math.floor(this.invulnerabilityTime * 10) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw bird based on type
        this.drawBird(ctx);
        
        ctx.restore();
        
        // Draw dive effect
        if (this.isDiving) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, this.y + this.height/2, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Draw Game Master laser
        if (this.gameMasterMode && this.laserActive) {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 10;
            
            // Rotating laser beams around player
            const time = Date.now() * 0.005;
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8 + time;
                const startX = this.x + this.width/2;
                const startY = this.y + this.height/2;
                const endX = startX + Math.cos(angle) * 80;
                const endY = startY + Math.sin(angle) * 80;
                
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            ctx.restore();
        }
        
        // Draw Sniper Crosshair
        if (this.sniperMode && this.sniperUsesLeft > 0) {
            ctx.save();
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 5;
            
            // Crosshair lines
            const crosshairSize = 20;
            ctx.beginPath();
            // Horizontal line
            ctx.moveTo(this.sniperCrosshair.x - crosshairSize, this.sniperCrosshair.y);
            ctx.lineTo(this.sniperCrosshair.x + crosshairSize, this.sniperCrosshair.y);
            // Vertical line
            ctx.moveTo(this.sniperCrosshair.x, this.sniperCrosshair.y - crosshairSize);
            ctx.lineTo(this.sniperCrosshair.x, this.sniperCrosshair.y + crosshairSize);
            ctx.stroke();
            
            // Center dot
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(this.sniperCrosshair.x, this.sniperCrosshair.y, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Uses left indicator
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.sniperUsesLeft}`, this.sniperCrosshair.x, this.sniperCrosshair.y - 30);
            
            // Aiming line from player to crosshair
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
            ctx.lineTo(this.sniperCrosshair.x, this.sniperCrosshair.y);
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    drawBird(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Get bird colors based on type
        const colors = this.getBirdColors();
        
        // Body
        ctx.fillStyle = colors.body;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 5, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = colors.head;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 5, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Wing (animated)
        const wingOffset = Math.sin(this.animationFrame * Math.PI / 2) * 3;
        ctx.fillStyle = colors.wing;
        ctx.beginPath();
        ctx.ellipse(centerX - 5 * this.facing, centerY + wingOffset, 6, 4, -0.3 * this.facing, 0, Math.PI * 2);
        ctx.fill();
        
        // Beak
        ctx.fillStyle = colors.beak;
        ctx.beginPath();
        ctx.moveTo(centerX + 8 * this.facing, centerY - 5);
        ctx.lineTo(centerX + 12 * this.facing, centerY - 3);
        ctx.lineTo(centerX + 8 * this.facing, centerY - 1);
        ctx.closePath();
        ctx.fill();
        
        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX + 3 * this.facing, centerY - 7, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye highlight
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX + 4 * this.facing, centerY - 8, 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.fillStyle = colors.tail;
        ctx.beginPath();
        ctx.ellipse(centerX - 12 * this.facing, centerY + 3, 4, 6, 0.5 * this.facing, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs
        ctx.strokeStyle = colors.legs;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 3, centerY + 13);
        ctx.lineTo(centerX - 3, centerY + 18);
        ctx.moveTo(centerX + 3, centerY + 13);
        ctx.lineTo(centerX + 3, centerY + 18);
        ctx.stroke();
    }
    
    getBirdColors() {
        switch (this.birdType) {
            case 'falcon':
                return {
                    body: '#8B4513',
                    head: '#A0522D',
                    wing: '#654321',
                    beak: '#FFD700',
                    tail: '#654321',
                    legs: '#FF8C00'
                };
            case 'eagle':
                return {
                    body: '#8B4513',
                    head: '#FFFFFF',
                    wing: '#654321',
                    beak: '#FFD700',
                    tail: '#FFFFFF',
                    legs: '#FFD700'
                };
            case 'owl':
                return {
                    body: '#8B7355',
                    head: '#A0522D',
                    wing: '#696969',
                    beak: '#FFD700',
                    tail: '#8B7355',
                    legs: '#FFD700'
                };
            case 'crow':
                return {
                    body: '#2F4F4F',
                    head: '#000000',
                    wing: '#1C1C1C',
                    beak: '#FFD700',
                    tail: '#2F4F4F',
                    legs: '#000000'
                };
            case 'flamingo':
                return {
                    body: '#FF69B4',
                    head: '#FF1493',
                    wing: '#FF69B4',
                    beak: '#000000',
                    tail: '#FF69B4',
                    legs: '#FF1493'
                };
            default: // pigeon
                return {
                    body: '#808080',
                    head: '#A9A9A9',
                    wing: '#696969',
                    beak: '#FFD700',
                    tail: '#808080',
                    legs: '#FF8C00'
                };
        }
    }
}

// Bomb class
class Bomb {
    constructor(x, y, vx, vy, damage = 1, type = 'normal') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 8;
        this.height = 8;
        this.damage = damage;
        this.type = type;
        this.gravity = 400;
        this.bounces = 0;
        this.maxBounces = 2;
        this.shouldRemove = false;
        this.fuseTime = 3; // 3 seconds before explosion
        this.explosionRadius = type === 'nuclear' ? 80 : 
                              type === 'cluster' ? 70 : 
                              type === 'mini' ? 50 : 40;
    }
    
    update(deltaTime, game) {
        // Physics
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += this.gravity * deltaTime;
        
        // Fuse countdown
        this.fuseTime -= deltaTime;
        if (this.fuseTime <= 0) {
            this.explode(game);
            return;
        }
        
        // Ground collision
        if (this.y > 580) { // Ground level
            this.y = 580;
            this.vy = -this.vy * 0.6; // Bounce with energy loss
            this.vx *= 0.8; // Friction
            this.bounces++;
            
            if (this.bounces >= this.maxBounces) {
                this.explode(game);
            }
        }
        
        // Platform collisions
        game.platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                this.explode(game);
            }
        });
    }
    
    explode(game) {
        game.createExplosion(this.x, this.y, this.type === 'nuclear' ? 'large' : 'normal');
        
        // If cluster bomb, create mini-bombs in nearby area
        if (this.type === 'cluster') {
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 * i) / 6; // 6 mini-bombs in circle
                const distance = 30 + Math.random() * 20; // Random distance 30-50 pixels
                const subBomb = new Bomb(
                    this.x + Math.cos(angle) * distance,
                    this.y + Math.sin(angle) * distance,
                    Math.cos(angle) * 80 + (Math.random() - 0.5) * 40, // Some randomness
                    Math.sin(angle) * 80 + (Math.random() - 0.5) * 40,
                    this.damage * 0.7, // Slightly less damage per mini-bomb
                    'mini' // Mini-bomb type
                );
                subBomb.fuseTime = 0.8 + Math.random() * 0.4; // 0.8-1.2 seconds
                subBomb.width = 6; // Smaller mini-bombs
                subBomb.height = 6;
                game.addBomb(subBomb);
            }
        }
        
        this.shouldRemove = true;
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    render(ctx) {
        ctx.save();
        
        // Cacca body (brown and lumpy)
        const color = this.type === 'nuclear' ? '#8B4513' : '#654321';
        ctx.fillStyle = color;
        
        // Main body (oval shape)
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Top lump
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2 - 1, this.y + this.height/2 - 2, this.width/3, this.height/4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Side lump
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2 + 2, this.y + this.height/2 + 1, this.width/4, this.height/5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Stink lines (blinking when about to explode)
        if (this.fuseTime < 1 && Math.floor(this.fuseTime * 10) % 2) {
            ctx.strokeStyle = '#90EE90';
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Wavy stink lines
            for (let i = 0; i < 3; i++) {
                const startX = this.x + this.width/2 - 3 + i * 3;
                const startY = this.y - 5;
                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(startX + 2, startY - 3, startX, startY - 6);
                ctx.quadraticCurveTo(startX - 2, startY - 9, startX, startY - 12);
            }
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Powerup class
class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.type = type;
        this.shouldRemove = false;
        this.animationTime = 0;
        this.points = 100;
    }
    
    update(deltaTime) {
        this.animationTime += deltaTime;
        // Floating animation
        this.y += Math.sin(this.animationTime * 3) * 0.5;
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    render(ctx) {
        ctx.save();
        
        // Glow effect
        ctx.shadowColor = this.getColor();
        ctx.shadowBlur = 10;
        
        // Powerup icon
        ctx.fillStyle = this.getColor();
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Icon symbol
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.getSymbol(), this.x + this.width/2, this.y + this.height/2 + 6);
        
        ctx.restore();
    }
    
    getColor() {
        switch (this.type) {
            case 'superJump': return '#00ff00';
            case 'clusterBomb': return '#ff8800';
            case 'missile': return '#ff3300';
            case 'sniper': return '#ffff00';
            case 'nuclearBomb': return '#ff0000';
            case 'dive': return '#0088ff';
            default: return '#ffff00';
        }
    }
    
    getSymbol() {
        switch (this.type) {
            case 'superJump': return '↑';
            case 'clusterBomb': return '💥';
            case 'missile': return '🚀';
            case 'sniper': return '🎯';
            case 'nuclearBomb': return '☢';
            case 'dive': return '↓';
            default: return '?';
        }
    }
}

// Missile class
class Missile {
    constructor(x, y, vx, vy, damage = 2) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.width = 12;
        this.height = 4;
        this.damage = damage;
        this.shouldRemove = false;
        this.speed = 300;
        this.trail = [];
        this.explosionRadius = 60; // Larger explosion radius than bombs
    }
    
    update(deltaTime, keys, game) {
        // Player can control missile with Arrow Keys
        if (keys['ArrowUp']) this.vy -= 200 * deltaTime;
        if (keys['ArrowDown']) this.vy += 200 * deltaTime;
        if (keys['ArrowLeft']) this.vx -= 200 * deltaTime;
        if (keys['ArrowRight']) this.vx += 200 * deltaTime;
        
        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.speed) {
            this.vx = (this.vx / speed) * this.speed;
            this.vy = (this.vy / speed) * this.speed;
        }
        
        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Add to trail
        this.trail.push({x: this.x, y: this.y, life: 0.5});
        if (this.trail.length > 10) this.trail.shift();
        
        // Update trail
        this.trail.forEach(point => point.life -= deltaTime);
        this.trail = this.trail.filter(point => point.life > 0);
        
        // Check bounds
        if (this.x < 0 || this.x > 2000 || this.y < 0 || this.y > 600) {
            this.explode(game);
        }
        
        // Check collisions
        game.platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                this.explode(game);
            }
        });
    }
    
    explode(game) {
        game.createExplosion(this.x, this.y, 'large');
        this.shouldRemove = true;
        if (game.player.controllingMissile === this) {
            game.player.controllingMissile = null;
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
        
        // Draw trail
        this.trail.forEach((point, index) => {
            ctx.globalAlpha = point.life;
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        
        // Missile body
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Missile tip
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height/2);
        ctx.lineTo(this.x + this.width + 4, this.y + this.height/2);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Sniper Bullet class
class SniperBullet {
    constructor(x, y, angle, damage = 3) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * 800;
        this.vy = Math.sin(angle) * 800;
        this.width = 2;
        this.height = 8;
        this.damage = damage;
        this.shouldRemove = false;
    }
    
    update(deltaTime, game) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // Check bounds
        if (this.x < 0 || this.x > 2000 || this.y < 0 || this.y > 600) {
            this.shouldRemove = true;
        }
        
        // Check collisions
        game.platforms.forEach(platform => {
            if (this.collidesWith(platform)) {
                this.shouldRemove = true;
            }
        });
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

// Platform class
class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }
    
    render(ctx) {
        ctx.save();
        
        // Platform color based on type
        switch (this.type) {
            case 'grass':
                ctx.fillStyle = '#228B22';
                break;
            case 'stone':
                ctx.fillStyle = '#696969';
                break;
            case 'cloud':
                ctx.fillStyle = '#F0F8FF';
                break;
            default:
                ctx.fillStyle = '#8B4513';
        }
        
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add some texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(this.x, this.y, this.width, 2);
        
        ctx.restore();
    }
}
