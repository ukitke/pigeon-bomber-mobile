// Game Engine principale per Pigeon Bomber
class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver', 'levelComplete'
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 3;
        
        // Game objects
        this.player = null;
        this.enemies = [];
        this.bombs = [];
        this.missiles = [];
        this.sniperBullets = [];
        this.powerups = [];
        this.platforms = [];
        this.boss = null;
        this.particles = [];
        this.chickens = []; // Pollaio chickens
        
        // Input handling
        this.keys = {};
        this.lastKeyPressed = null;
        
        // Game timing
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Camera
        this.camera = { x: 0, y: 0 };
        
        // Level data
        this.levelManager = null;
        
        // UI elements
        this.ui = {
            currentLevel: document.getElementById('current-level'),
            lives: document.getElementById('lives'),
            score: document.getElementById('score'),
            birdType: document.getElementById('bird-type'),
            gameMenu: document.getElementById('gameMenu'),
            gameOver: document.getElementById('gameOver'),
            levelComplete: document.getElementById('levelComplete'),
            instructions: document.getElementById('instructions')
        };
        
        // Evolution system
        this.availableEvolutions = [
            { id: 'pigeon', name: 'Edoardo il Bomber', description: 'Versatile e bilanciato' },
            { id: 'falcon', name: 'Edoardo Falco', description: 'Velocità aumentata del 50%' },
            { id: 'eagle', name: 'Edoardo Aquila', description: 'Danni cacca +100%' },
            { id: 'owl', name: 'Edoardo Gufo', description: 'Invisibilità temporanea' },
            { id: 'crow', name: 'Edoardo Corvo', description: 'Cacche a ricerca' },
            { id: 'flamingo', name: 'Edoardo Fenicottero', description: 'Salto doppio' }
        ];
        
        this.currentBirdType = 'pigeon';
        
        // Game Master mode
        this.gameMasterMode = false;

        // Mobile controls
        this.mobileControls = null;

        // Debug system - DISABLED ON MOBILE
        this.debugMessages = [];
        this.debugEnabled = false;
        // this.createDebugUI(); // Disabled on mobile
    }
    
    // Debug System
    debugLog(message) {
        if (!this.debugEnabled) return;
        const timestamp = new Date().toLocaleTimeString();
        const debugMessage = `[${timestamp}] ${message}`;
        console.log('🐦 DEBUG:', debugMessage);
        this.debugMessages.push(debugMessage);
        this.updateDebugUI();
    }
    
    debugError(message) {
        const timestamp = new Date().toLocaleTimeString();
        const errorMessage = `[${timestamp}] ERROR: ${message}`;
        console.error('🚨 ERROR:', errorMessage);
        this.debugMessages.push(errorMessage);
        this.updateDebugUI();
        alert('ERRORE GIOCO: ' + message);
    }
    
    createDebugUI() {
        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debugPanel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 300px;
            max-height: 400px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 5px;
            overflow-y: auto;
            z-index: 10000;
            display: ${this.debugEnabled ? 'block' : 'none'};
        `;
        
        const debugTitle = document.createElement('div');
        debugTitle.textContent = '🐦 PIGEON BOMBER DEBUG';
        debugTitle.style.cssText = 'color: #ffff00; font-weight: bold; margin-bottom: 10px;';
        debugPanel.appendChild(debugTitle);
        
        const debugContent = document.createElement('div');
        debugContent.id = 'debugContent';
        debugPanel.appendChild(debugContent);
        
        // Add save log button
        const saveButton = document.createElement('button');
        saveButton.textContent = '💾 SALVA LOG';
        saveButton.style.cssText = `
            background: #ff6600;
            color: white;
            border: none;
            padding: 5px 10px;
            margin-top: 10px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
        `;
        saveButton.addEventListener('click', () => this.saveDebugLog());
        debugPanel.appendChild(saveButton);
        
        document.body.appendChild(debugPanel);
        
        // Toggle debug with F12
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                this.debugEnabled = !this.debugEnabled;
                debugPanel.style.display = this.debugEnabled ? 'block' : 'none';
            }
        });
    }
    
    updateDebugUI() {
        const debugContent = document.getElementById('debugContent');
        if (!debugContent) return;
        
        // Keep only last 20 messages for display, but keep all for saving
        const displayMessages = this.debugMessages.slice(-20);
        
        debugContent.innerHTML = displayMessages.map(msg => 
            `<div style="margin-bottom: 2px; ${msg.includes('ERROR') ? 'color: #ff0000;' : ''}">${msg}</div>`
        ).join('');
        
        // Auto scroll to bottom
        debugContent.scrollTop = debugContent.scrollHeight;
    }
    
    saveDebugLog() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `pigeon-bomber-debug-${timestamp}.txt`;
            
            const logContent = [
                '🐦 PIGEON BOMBER DEBUG LOG',
                `Generated: ${new Date().toLocaleString()}`,
                `Game State: ${this.gameState}`,
                `Current Level: ${this.currentLevel}`,
                `Game Master Mode: ${this.gameMasterMode}`,
                `Boss Present: ${this.boss ? 'YES' : 'NO'}`,
                this.boss ? `Boss Health: ${this.boss.health}/${this.boss.maxHealth}` : '',
                `Enemies Count: ${this.enemies.length}`,
                `Player Position: ${this.player ? `${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)}` : 'N/A'}`,
                '',
                '=== DEBUG MESSAGES ===',
                ...this.debugMessages
            ].filter(line => line !== '').join('\n');
            
            // Create and download file
            const blob = new Blob([logContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.debugLog(`💾 Log saved as ${filename}`);
            
        } catch (error) {
            this.debugError(`Failed to save log: ${error.message}`);
        }
    }
    
    init() {
        try {
            console.log('🎮 GAME INIT START');
            this.debugLog('Initializing game...');
            
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas not found!');
            }
            this.debugLog('Canvas found');
            
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Canvas context not found!');
            }
            this.debugLog('Canvas context created');
            
            // Initialize game systems
            this.levelManager = new LevelManager(this);
            this.debugLog('Level manager created');
            
            this.setupEventListeners();
            this.debugLog('Event listeners setup');

            // Initialize mobile controls
            this.mobileControls = new MobileControls(this);
            this.debugLog('Mobile controls initialized');

            this.setupUI();
            this.debugLog('UI setup complete');
            
            // Start game loop
            this.gameLoop();
            this.debugLog('Game loop started');
            
            console.log('🎮 GAME INIT COMPLETE');
        } catch (error) {
            this.debugError('INIT ERROR: ' + error.message);
            console.error('Game initialization failed:', error);
        }
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.lastKeyPressed = e.code;
            
            // Prevent default for game keys
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Menu buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('gameMasterBtn').addEventListener('click', () => this.startGameMaster());
        document.getElementById('instructionsBtn').addEventListener('click', () => this.showInstructions());
        document.getElementById('backBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    setupUI() {
        this.updateUI();
    }
    
    startGame() {
        try {
            this.debugLog('🚀 START GAME clicked');

            this.gameState = 'playing';
            this.debugLog('Game state set to playing');

            this.currentLevel = 1;
            this.score = 0;
            this.lives = 3;
            this.currentBirdType = 'pigeon';
            this.debugLog('Game variables initialized');

            this.hideAllMenus();
            this.debugLog('Menus hidden');

            // Add game-started class to body for mobile
            document.body.classList.add('game-started');
            this.debugLog('Game started class added to body');

            this.initializeLevel();
            this.debugLog('Level initialized');

            // Start background music
            this.startBackgroundMusic();
            this.debugLog('Background music started');

        this.debugLog('✅ START GAME completed successfully');
    } catch (error) {
        this.debugError('START GAME failed: ' + error.message);
        console.error('Start game error:', error);
    }
}

startGameMaster() {
    try {
        this.debugLog('🔥 GAME MASTER MODE activated');
        
        this.gameState = 'playing';
        this.gameMasterMode = true; // Enable Game Master mode
        this.currentLevel = 1;
        this.score = 0;
        this.lives = 999; // Immortal
        this.currentBirdType = 'pigeon';
        
        this.hideAllMenus();
        this.initializeLevel();
        
        // Make player immortal and flying
        if (this.player) {
            this.player.gameMasterMode = true;
            this.player.invulnerable = true;
            this.player.canFly = true;
            this.player.gravity = 0; // No gravity
            this.player.moveSpeed = 300; // Faster movement
            this.debugLog('🔥 Player configured for Game Master mode');
        }
        
        this.startBackgroundMusic();
        this.debugLog('🔥 GAME MASTER MODE ready - Immortal flying mode activated!');
        
    } catch (error) {
        this.debugError('GAME MASTER MODE failed: ' + error.message);
        console.error('Game Master error:', error);
    }
}
    
    restartGame() {
        this.startGame();
    }
    
    showMenu() {
        this.gameState = 'menu';
        this.hideAllMenus();
        this.ui.gameMenu.style.display = 'flex';
    }
    
    showInstructions() {
        this.hideAllMenus();
        this.ui.instructions.style.display = 'flex';
    }
    
    hideAllMenus() {
        this.ui.gameMenu.style.display = 'none';
        this.ui.gameOver.style.display = 'none';
        this.ui.levelComplete.style.display = 'none';
        this.ui.instructions.style.display = 'none';
    }
    
    initializeLevel() {
        // Clear previous level data
        this.enemies = [];
        this.bombs = [];
        this.powerups = [];
        this.particles = [];
        this.boss = null;
        
        // Load level data
        const levelData = this.levelManager.getLevel(this.currentLevel);
        this.platforms = levelData.platforms;
        
        // Create player
        this.player = new Player(levelData.playerStart.x, levelData.playerStart.y, this.currentBirdType);
        
        // Restore Game Master mode if active
        if (this.gameMasterMode) {
            this.player.gameMasterMode = true;
            this.player.invulnerable = true;
            this.player.canFly = true;
            this.player.gravity = 0; // No gravity
            this.player.moveSpeed = 300; // Faster movement
            this.debugLog('🔥 Game Master mode restored for new level');
        }
        
        // Create enemies
        levelData.enemies.forEach(enemyData => {
            this.enemies.push(new Enemy(enemyData.x, enemyData.y, enemyData.type));
        });
        
        // Create powerups - Generate random types from positions
        if (levelData.powerupPositions) {
            const randomPowerups = this.levelManager.generateRandomPowerupsForLevel(levelData.powerupPositions);
            randomPowerups.forEach(powerupData => {
                this.powerups.push(new Powerup(powerupData.x, powerupData.y, powerupData.type));
            });
        } else if (levelData.powerups) {
            // Fallback for any levels that still use fixed powerups
            levelData.powerups.forEach(powerupData => {
                this.powerups.push(new Powerup(powerupData.x, powerupData.y, powerupData.type));
            });
        }
        
        // Create boss if it's a boss level
        if (levelData.boss) {
            this.boss = new Boss(levelData.boss.x, levelData.boss.y, levelData.boss.type);
        }
        
        this.updateUI();
    }
    
    gameLoop(currentTime = 0) {
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Limit delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 0.016);
        
        if (this.gameState === 'playing') {
            this.update();
        }
        
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Update player
        if (this.player) {
            this.player.update(this.deltaTime, this.keys, this);
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.deltaTime, this);
        });
        
        // Update boss
        if (this.boss) {
            this.boss.update(this.deltaTime, this);
        }
        
        // Update bombs
        this.bombs.forEach((bomb, index) => {
            bomb.update(this.deltaTime, this);
            if (bomb.shouldRemove) {
                this.bombs.splice(index, 1);
            }
        });
        
        // Update missiles
        this.missiles.forEach((missile, index) => {
            missile.update(this.deltaTime, this.keys, this);
            if (missile.shouldRemove) {
                this.missiles.splice(index, 1);
            }
        });
        
        // Update sniper bullets
        this.sniperBullets.forEach((bullet, index) => {
            bullet.update(this.deltaTime, this);
            if (bullet.shouldRemove) {
                this.sniperBullets.splice(index, 1);
            }
        });
        
        // Update particles
        this.particles.forEach((particle, index) => {
            particle.update(this.deltaTime);
            if (particle.shouldRemove) {
                this.particles.splice(index, 1);
            }
        });
        
        // Update powerups
        this.powerups.forEach((powerup, index) => {
            powerup.update(this.deltaTime);
            if (powerup.shouldRemove) {
                this.powerups.splice(index, 1);
            }
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Update camera
        this.updateCamera();
        
        // Check win/lose conditions
        this.checkGameConditions();
        
        // Update UI
        this.updateUI();

        // Update mobile controls
        if (this.mobileControls) {
            this.mobileControls.update();
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'linear-gradient(180deg, #87CEEB 0%, #98FB98 100%)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing') {
            this.ctx.save();
            this.ctx.translate(-this.camera.x, -this.camera.y);
            
            // Render special backgrounds
            const currentLevelData = this.levelManager.getLevel(this.currentLevel);
            if (currentLevelData.background === 'pollaio') {
                this.renderPollaioBackground();
            }
            // 'clean' background uses default gradient - no special rendering needed
            
            // Render platforms
            this.platforms.forEach(platform => {
                platform.render(this.ctx);
            });
            
            // Render powerups
            this.powerups.forEach(powerup => {
                powerup.render(this.ctx);
            });
            
            // Render enemies
            this.enemies.forEach(enemy => {
                enemy.render(this.ctx);
            });
            
            // Render boss
            if (this.boss) {
                this.boss.render(this.ctx);
            }
            
            // Render bombs
            this.bombs.forEach(bomb => {
                bomb.render(this.ctx);
            });
            
            // Render missiles
            this.missiles.forEach(missile => {
                missile.render(this.ctx);
            });
            
            // Render sniper bullets
            this.sniperBullets.forEach(bullet => {
                bullet.render(this.ctx);
            });
            
            // Render particles
            this.particles.forEach(particle => {
                particle.render(this.ctx);
            });
            
            // Render player
            if (this.player) {
                this.player.render(this.ctx);
            }
            
            this.ctx.restore();
            
            // Render UI elements (not affected by camera)
            this.renderUI();
        }
    }
    
    renderUI() {
        // Boss health bar
        if (this.boss && this.boss.health > 0) {
            const barWidth = 300;
            const barHeight = 20;
            const x = (this.canvas.width - barWidth) / 2;
            const y = 30;
            
            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);
            
            // Health bar
            const healthPercent = this.boss.health / this.boss.maxHealth;
            this.ctx.fillStyle = healthPercent > 0.3 ? '#e74c3c' : '#f39c12';
            this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
            
            // Border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Boss name
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.boss.name, this.canvas.width / 2, y - 8);
        }
    }
    
    updateCamera() {
        if (this.player) {
            // Follow player with some offset
            const targetX = this.player.x - this.canvas.width / 2;
            const targetY = this.player.y - this.canvas.height / 2;
            
            // Smooth camera movement
            this.camera.x += (targetX - this.camera.x) * 0.1;
            this.camera.y += (targetY - this.camera.y) * 0.1;
            
            // Keep camera within level bounds
            this.camera.x = Math.max(0, Math.min(this.camera.x, 2000 - this.canvas.width));
            this.camera.y = Math.max(0, Math.min(this.camera.y, 1000 - this.canvas.height));
        }
    }
    
    checkCollisions() {
        if (!this.player) return;
        
        // Player vs enemies
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.player.collidesWith(enemy) && !this.player.invulnerable) {
                this.playerHit();
            }
            
            // Game Master laser vs enemies
            if (this.player.gameMasterMode && this.player.laserActive) {
                const distance = Math.sqrt(
                    Math.pow(enemy.x + enemy.width/2 - this.player.x - this.player.width/2, 2) +
                    Math.pow(enemy.y + enemy.height/2 - this.player.y - this.player.height/2, 2)
                );
                
            if (distance <= 150) { // Increased laser range for Game Master
                    enemy.takeDamage(15 * this.deltaTime); // Continuous damage
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.points;
                        this.enemies.splice(enemyIndex, 1);
                        this.createExplosion(enemy.x, enemy.y);
                        return; // Exit early since enemy is removed
                    }
                }
            }
            
            // Bombs vs enemies
            this.bombs.forEach((bomb, bombIndex) => {
                if (bomb.collidesWith(enemy)) {
                    this.createExplosion(bomb.x, bomb.y);
                    enemy.takeDamage(bomb.damage);
                    this.bombs.splice(bombIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.points;
                        this.enemies.splice(enemyIndex, 1);
                        this.createExplosion(enemy.x, enemy.y);
                    }
                }
            });
            
            // Missiles vs enemies
            this.missiles.forEach((missile, missileIndex) => {
                if (missile.collidesWith(enemy)) {
                    this.createExplosion(missile.x, missile.y, 'large');
                    enemy.takeDamage(missile.damage);
                    this.missiles.splice(missileIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.points;
                        this.enemies.splice(enemyIndex, 1);
                        this.createExplosion(enemy.x, enemy.y);
                    }
                }
            });
            
            // Sniper bullets vs enemies
            this.sniperBullets.forEach((bullet, bulletIndex) => {
                if (bullet.collidesWith(enemy)) {
                    enemy.takeDamage(bullet.damage);
                    this.sniperBullets.splice(bulletIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.points;
                        this.enemies.splice(enemyIndex, 1);
                        this.createExplosion(enemy.x, enemy.y);
                    }
                }
            });
        });
        
        // Player vs boss
        if (this.boss && this.player.collidesWith(this.boss) && !this.player.invulnerable) {
            this.playerHit();
        }
        
        // Game Master laser vs boss
        if (this.boss && this.player.gameMasterMode && this.player.laserActive) {
            const distance = Math.sqrt(
                Math.pow(this.boss.x + this.boss.width/2 - this.player.x - this.player.width/2, 2) +
                Math.pow(this.boss.y + this.boss.height/2 - this.player.y - this.player.height/2, 2)
            );
            
            if (distance <= 80) { // Laser range
                // Initialize damage timer if not exists
                if (!this.boss.laserDamageTime) {
                    this.boss.laserDamageTime = 0;
                }
                
                this.boss.takeDamage(10 * this.deltaTime); // Continuous damage
                this.boss.laserDamageTime += this.deltaTime;
                this.debugLog(`🔥 Laser damaging boss: ${this.boss.health}/${this.boss.maxHealth} (${this.boss.laserDamageTime.toFixed(2)}s)`);
                
                // Check if boss is actually dead OR timeout after 3 seconds of laser damage
                if (this.boss && (this.boss.health <= 0 || this.boss.laserDamageTime >= 3)) {
                    this.debugLog(`🔥 Boss defeated by laser! Final health: ${this.boss.health}, Time: ${this.boss.laserDamageTime.toFixed(2)}s`);
                    this.score += this.boss.points || 1000;
                    this.createExplosion(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2, 'large');
                    this.boss = null;
                    this.debugLog(`🔥 Boss removed, checking level completion...`);
                }
            }
        }
        
        // Bombs vs boss
        if (this.boss) {
            this.bombs.forEach((bomb, bombIndex) => {
                if (bomb.collidesWith(this.boss)) {
                    this.createExplosion(bomb.x, bomb.y);
                    this.boss.takeDamage(bomb.damage);
                    this.bombs.splice(bombIndex, 1);
                    
                    if (this.boss.health <= 0) {
                        this.score += this.boss.points;
                        this.boss = null;
                    }
                }
            });
        }
        
        // Missiles vs boss
        if (this.boss) {
            this.missiles.forEach((missile, missileIndex) => {
                if (missile.collidesWith(this.boss)) {
                    this.createExplosion(missile.x, missile.y, 'large');
                    this.boss.takeDamage(missile.damage);
                    this.missiles.splice(missileIndex, 1);
                    
                    if (this.boss.health <= 0) {
                        this.score += this.boss.points;
                        this.boss = null;
                    }
                }
            });
        }
        
        // Sniper bullets vs boss
        if (this.boss) {
            this.sniperBullets.forEach((bullet, bulletIndex) => {
                if (bullet.collidesWith(this.boss)) {
                    this.boss.takeDamage(bullet.damage);
                    this.sniperBullets.splice(bulletIndex, 1);
                    
                    if (this.boss.health <= 0) {
                        this.score += this.boss.points;
                        this.boss = null;
                    }
                }
            });
        }
        
        // Player vs powerups
        this.powerups.forEach((powerup, index) => {
            if (this.player.collidesWith(powerup)) {
                this.collectPowerup(powerup);
                this.powerups.splice(index, 1);
            }
        });
    }
    
    checkGameConditions() {
        // COMPREHENSIVE DEBUG LOGGING
        this.debugLog(`🔍 GAME CONDITIONS CHECK:`);
        this.debugLog(`  - Player exists: ${this.player ? 'YES' : 'NO'}`);
        this.debugLog(`  - Player position: ${this.player ? `${this.player.x.toFixed(2)}, ${this.player.y.toFixed(2)}` : 'N/A'}`);
        this.debugLog(`  - Enemies count: ${this.enemies.length}`);
        this.debugLog(`  - Boss exists: ${this.boss ? 'YES' : 'NO'}`);
        this.debugLog(`  - Boss health: ${this.boss ? `${this.boss.health}/${this.boss.maxHealth}` : 'N/A'}`);
        this.debugLog(`  - Boss laser time: ${this.boss && this.boss.laserDamageTime ? this.boss.laserDamageTime.toFixed(2) : 'N/A'}`);
        this.debugLog(`  - Door opened: ${this.doorOpened ? 'YES' : 'NO'}`);
        this.debugLog(`  - Door animation: ${this.doorAnimation ? this.doorAnimation.toFixed(2) : '0'}`);
        this.debugLog(`  - Game state: ${this.gameState}`);
        this.debugLog(`  - Game Master mode: ${this.gameMasterMode ? 'YES' : 'NO'}`);
        
        // Check if player fell off the map
        if (this.player && this.player.y > 1000) {
            this.debugLog(`🚨 PLAYER FELL OFF MAP at y=${this.player.y}`);
            this.playerHit();
        }
        
        // Check level completion - open escape door when all enemies defeated
        if (this.enemies.length === 0 && (!this.boss || this.boss === null)) {
            this.debugLog(`✅ LEVEL COMPLETION CONDITIONS MET`);
            if (!this.doorOpened) {
                this.doorOpened = true;
                this.doorAnimation = 0;
                this.playSound('doorOpen');
                this.debugLog(`🚪 DOOR OPENED - Starting animation`);
            }
            
            // Complete level after door animation
            if (this.doorOpened && this.doorAnimation > 2) {
                this.debugLog(`🎯 COMPLETING LEVEL ${this.currentLevel} - Animation time: ${this.doorAnimation.toFixed(2)}`);
                this.completeLevel();
                return; // Exit early to prevent further processing
            }
        } else {
            this.debugLog(`❌ LEVEL NOT COMPLETE - Enemies: ${this.enemies.length}, Boss: ${this.boss ? 'alive' : 'null'}`);
        }
        
        // Update door animation
        if (this.doorOpened) {
            this.doorAnimation += this.deltaTime;
            this.debugLog(`🚪 Door animation: ${this.doorAnimation.toFixed(2)}s`);
        }
        
        // Check game over
        if (this.lives <= 0) {
            this.debugLog(`💀 GAME OVER - Lives: ${this.lives}`);
            this.gameOver();
        }
        
        this.debugLog(`🔍 GAME CONDITIONS CHECK COMPLETE`);
    }
    
    playerHit() {
        if (this.player && !this.player.invulnerable) {
            this.lives--;
            this.player.makeInvulnerable();
            
            if (this.lives <= 0) {
                this.gameOver();
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.hideAllMenus();
        this.ui.gameOver.style.display = 'flex';
        document.getElementById('finalScore').textContent = this.score;
    }
    
    completeLevel() {
        this.gameState = 'levelComplete';
        this.hideAllMenus();
        this.ui.levelComplete.style.display = 'flex';

        // Play level complete sound and victory jingle
        this.playSound('levelComplete');
        this.playVictoryJingle();

        // Show evolution options if not max level AND not in Game Master mode
        if (this.currentLevel < 10 && !this.gameMasterMode) {
            this.showEvolutionOptions();
        }

        // EASTER EGGS - Funny messages for each level
        this.showEasterEgg();
    }

    showEasterEgg() {
        const easterEggs = [
            "Bravo mezza sega, ora sei pronto a livello 2. Sei quasi più forte di Pio Esposito o Brikel, vedi tu",
            "Ah ma qui si fa sul serio. Sembri Irdi prima di rompersi a calcetto",
            "Sarai forte ma mai come Bledar quando fa i tunnel",
            "Voglio una tequila subito!",
            "Se avessi gli occhi di Frenki ti avrei già scopato",
            "Sembri SEM a COD, che bravo",
            "Dov'è il mio vodka redbull?",
            "Dammi RUM e lo scoperò...mmm cioè volevo dire berrò",
            "Elci ne sa di calcio più di te",
            "Hai battuto Dio, sei Dionis"
        ];

        const levelIndex = this.currentLevel - 1;
        if (levelIndex < easterEggs.length) {
            const easterEggText = document.createElement('div');
            easterEggText.id = 'easterEgg';
            easterEggText.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 215, 0, 0.95);
                color: #2c3e50;
                padding: 20px 30px;
                border-radius: 15px;
                font-size: 1.2em;
                font-weight: bold;
                text-align: center;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                z-index: 2000;
                max-width: 80%;
                backdrop-filter: blur(10px);
                border: 3px solid #ffd700;
                animation: easterEggAppear 0.5s ease-out;
            `;

            // Add funny animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes easterEggAppear {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);

            easterEggText.innerHTML = `
                <div style="margin-bottom: 10px;">🎉 LIVELLO ${this.currentLevel} COMPLETATO! 🎉</div>
                <div style="font-style: italic; color: #e74c3c;">"${easterEggs[levelIndex]}"</div>
            `;

            document.body.appendChild(easterEggText);

            // Remove after 4 seconds
            setTimeout(() => {
                if (easterEggText.parentNode) {
                    easterEggText.style.animation = 'easterEggAppear 0.3s ease-in reverse';
                    setTimeout(() => {
                        if (easterEggText.parentNode) {
                            easterEggText.parentNode.removeChild(easterEggText);
                        }
                    }, 300);
                }
            }, 4000);
        }
    }
    
    showEvolutionOptions() {
        const evolutionOptions = document.getElementById('evolutionOptions');
        evolutionOptions.innerHTML = '';
        
        // Show 3 random evolution options
        const availableOptions = this.availableEvolutions.filter(evo => evo.id !== this.currentBirdType);
        const shuffled = availableOptions.sort(() => 0.5 - Math.random());
        const options = shuffled.slice(0, 3);
        
        options.forEach(evolution => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'evolution-option';
            optionDiv.innerHTML = `
                <h4>${evolution.name}</h4>
                <p>${evolution.description}</p>
            `;
            optionDiv.addEventListener('click', () => {
                document.querySelectorAll('.evolution-option').forEach(opt => opt.classList.remove('selected'));
                optionDiv.classList.add('selected');
                this.selectedEvolution = evolution.id;
            });
            evolutionOptions.appendChild(optionDiv);
        });
    }
    
    nextLevel() {
        if (this.selectedEvolution) {
            this.currentBirdType = this.selectedEvolution;
            this.selectedEvolution = null;
        }
        
        this.currentLevel++;
        if (this.currentLevel > 10) {
            this.victory();
        } else {
            this.gameState = 'playing';
            this.hideAllMenus();
            this.initializeLevel();
        }
    }
    
    victory() {
        this.gameState = 'victory';
        this.hideAllMenus();
        document.getElementById('gameOverTitle').textContent = 'VITTORIA!';
        document.getElementById('gameOverText').textContent = 'Hai conquistato l\'harem! Il piccione è il nuovo re!';
        this.ui.gameOver.style.display = 'flex';
    }
    
    collectPowerup(powerup) {
        switch (powerup.type) {
            case 'superJump':
                this.player.abilities.superJump = true;
                break;
            case 'clusterBomb':
                this.player.abilities.clusterBomb = true;
                break;
            case 'missile':
                this.player.abilities.missile = true;
                break;
            case 'sniper':
                this.player.abilities.sniper = true;
                // Add 3 sniper bullets every time sniper powerup is collected
                this.player.sniperUsesLeft += 3;
                break;
            case 'nuclearBomb':
                this.player.abilities.nuclearBomb = true;
                break;
            case 'dive':
                this.player.abilities.dive = true;
                break;
        }
        
        this.score += powerup.points;
        this.playSound('evolution'); // Suono quando raccogli powerup
    }
    
    createExplosion(x, y, size = 'normal') {
        const particleCount = size === 'large' ? 20 : 10;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 100 + Math.random() * 100;
            
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#ff6b35',
                0.5 + Math.random() * 0.5
            ));
        }
    }
    
    addBomb(bomb) {
        this.bombs.push(bomb);
    }
    
    addMissile(missile) {
        this.missiles.push(missile);
    }
    
    addSniperBullet(bullet) {
        this.sniperBullets.push(bullet);
    }
    
    // Audio System - COMPLETO
    playSound(soundType) {
        try {
            // Create audio context if not exists
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Resume context if suspended (browser policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Generate different sounds based on type
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            switch (soundType) {
                case 'bomb':
                case 'explosion':
                    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    oscillator.type = 'sawtooth';
                    break;
                    
                case 'jump':
                case 'superJump':
                    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                    oscillator.type = 'sine';
                    break;
                    
                case 'missile':
                    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(300, this.audioContext.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                    oscillator.type = 'sawtooth';
                    break;
                    
                case 'sniper':
                    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.05);
                    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    oscillator.type = 'square';
                    break;
                    
                case 'evolution':
                    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(554, this.audioContext.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    oscillator.type = 'sine';
                    break;
                    
                case 'hit':
                case 'playerHit':
                    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    oscillator.type = 'square';
                    break;
                    
                case 'bossAttack':
                    oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.2);
                    gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                    oscillator.type = 'sawtooth';
                    break;
                    
                case 'bossEnrage':
                    oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.5);
                    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
                    oscillator.type = 'sawtooth';
                    break;
                    
                case 'doorOpen':
                    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                    oscillator.frequency.linearRampToValueAtTime(500, this.audioContext.currentTime + 0.3);
                    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                    oscillator.type = 'triangle';
                    break;
                    
                case 'levelComplete':
                    // Victory fanfare
                    oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
                    oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.2); // E5
                    oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.4); // G5
                    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
                    oscillator.type = 'sine';
                    break;
                    
                default:
                    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    oscillator.type = 'sine';
            }
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.8);
            
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
    
    // Background music
    startBackgroundMusic() {
        if (!this.audioContext || this.backgroundMusic) return;
        
        try {
            this.backgroundMusic = {
                oscillator: this.audioContext.createOscillator(),
                gainNode: this.audioContext.createGain()
            };
            
            this.backgroundMusic.oscillator.connect(this.backgroundMusic.gainNode);
            this.backgroundMusic.gainNode.connect(this.audioContext.destination);
            
            // Simple melody loop
            this.backgroundMusic.oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
            this.backgroundMusic.gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
            this.backgroundMusic.oscillator.type = 'sine';
            
            this.backgroundMusic.oscillator.start();
            
            // Change notes periodically
            this.musicInterval = setInterval(() => {
                if (this.backgroundMusic && this.audioContext) {
                    const notes = [220, 246, 261, 293, 329, 349, 392];
                    const randomNote = notes[Math.floor(Math.random() * notes.length)];
                    this.backgroundMusic.oscillator.frequency.setValueAtTime(randomNote, this.audioContext.currentTime);
                }
            }, 2000);
            
        } catch (error) {
            console.warn('Background music failed:', error);
        }
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.oscillator.stop();
            this.backgroundMusic = null;
        }
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
    
    playVictoryJingle() {
        // Victory jingle instead of speech
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Victory melody: C-E-G-C (major chord progression)
            const notes = [
                { freq: 523, time: 0, duration: 0.3 },    // C5
                { freq: 659, time: 0.3, duration: 0.3 },  // E5
                { freq: 784, time: 0.6, duration: 0.3 },  // G5
                { freq: 1047, time: 0.9, duration: 0.6 }  // C6 (longer)
            ];
            
            notes.forEach(note => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.duration);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + note.duration);
                }, note.time * 1000);
            });
            
        } catch (error) {
            console.warn('Victory jingle failed:', error);
        }
    }
    
    renderPollaioBackground() {
        // Pollaio background with chickens
        const currentLevelData = this.levelManager.getLevel(this.currentLevel);
        
        // Draw chicken coop structure
        this.ctx.fillStyle = '#8B4513'; // Brown wood
        this.ctx.fillRect(0, 500, 2000, 100); // Ground level coop
        
        // Coop roof
        this.ctx.fillStyle = '#654321';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 500);
        this.ctx.lineTo(100, 450);
        this.ctx.lineTo(200, 500);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Render chickens if level has them
        if (currentLevelData.chickens) {
            currentLevelData.chickens.forEach(chicken => {
                this.renderChicken(chicken.x, chicken.y, chicken.type, chicken.color);
            });
        }
        
        // Hay scattered around
        this.ctx.fillStyle = '#DAA520';
        for (let i = 0; i < 10; i++) {
            const x = i * 200 + Math.random() * 50;
            const y = 580 + Math.random() * 10;
            this.ctx.fillRect(x, y, 8, 4);
        }
    }
    
    renderChicken(x, y, type, color) {
        this.ctx.save();
        
        // Chicken body
        let bodyColor = color === 'white' ? '#FFFFFF' : 
                       color === 'brown' ? '#8B4513' : 
                       color === 'red' ? '#DC143C' : 
                       color === 'black' ? '#2F2F2F' : '#FFFF00';
        
        this.ctx.fillStyle = bodyColor;
        
        if (type === 'rooster') {
            // Rooster - larger with comb
            this.ctx.fillRect(x, y - 15, 20, 15); // Body
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(x + 5, y - 20, 10, 5); // Comb
        } else if (type === 'chick') {
            // Small chick
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.beginPath();
            this.ctx.arc(x + 5, y - 5, 5, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // Regular hen
            this.ctx.fillRect(x, y - 12, 15, 12); // Body
        }
        
        // Beak
        this.ctx.fillStyle = '#FFA500';
        this.ctx.fillRect(x + (type === 'chick' ? 8 : 15), y - (type === 'chick' ? 5 : 8), 3, 2);
        
        // Legs
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 5, y);
        this.ctx.lineTo(x + 5, y + 5);
        this.ctx.moveTo(x + 10, y);
        this.ctx.lineTo(x + 10, y + 5);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    updateUI() {
        this.ui.currentLevel.textContent = this.currentLevel;
        this.ui.lives.textContent = this.lives;
        this.ui.score.textContent = this.score;
        this.ui.birdType.textContent = this.availableEvolutions.find(evo => evo.id === this.currentBirdType)?.name || 'Piccione Bomber';
        
        // Update ability indicators
        if (this.player) {
            const abilityJump = document.getElementById('ability-jump');
            const abilityCluster = document.getElementById('ability-cluster');
            const abilityMissile = document.getElementById('ability-missile');
            const abilitySniper = document.getElementById('ability-sniper');
            
            if (abilityJump) abilityJump.className = 'ability ' + (this.player.abilities.superJump ? 'available' : '');
            if (abilityCluster) abilityCluster.className = 'ability ' + (this.player.abilities.clusterBomb ? 'available' : '');
            if (abilityMissile) abilityMissile.className = 'ability ' + (this.player.abilities.missile ? 'available' : '');
            if (abilitySniper) abilitySniper.className = 'ability ' + (this.player.abilities.sniper ? 'available' : '');
        }
    }
}

// Particle system
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = 3 + Math.random() * 3;
        this.shouldRemove = false;
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += 300 * deltaTime; // Gravity
        
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.shouldRemove = true;
        }
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
