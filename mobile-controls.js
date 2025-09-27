// Mobile Controls System for Pigeon Bomber - PLAYSTATION STYLE
class MobileControls {
    constructor(game) {
        this.game = game;
        this.activeButtons = new Set();

        // Analog stick variables (PlayStation style)
        this.analogStick = {
            element: null,
            thumb: null,
            active: false,
            centerX: 0,
            centerY: 0,
            currentX: 0,
            currentY: 0,
            maxDistance: 30,
            deadzone: 5
        };

        this.setupEventListeners();
        this.hideOnDesktop();
        this.initializeAnalogStick();
    }

    setupEventListeners() {
        // Support both touch and mouse events for all controls
        const buttons = document.querySelectorAll('.control-btn');

        buttons.forEach(button => {
            // Touch events for mobile - optimized for fluidity
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonPress(button.dataset.action);
                button.classList.add('active');
            }, { passive: false });

            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleButtonRelease(button.dataset.action);
                button.classList.remove('active');
            }, { passive: false });

            // Mouse events for desktop testing
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.handleButtonPress(button.dataset.action);
                button.classList.add('active');
            });

            button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.handleButtonRelease(button.dataset.action);
                button.classList.remove('active');
            });

            button.addEventListener('mouseleave', (e) => {
                this.handleButtonRelease(button.dataset.action);
                button.classList.remove('active');
            });

            // Keyboard events for virtual controls
            const keyMap = {
                'superJumpBtn': 'KeyW',
                'sniperBtn': 'KeyA',
                'missileBtn': 'KeyS',
                'clusterBtn': 'KeyD',
                'spaceBtn': 'Space',
                'abilityBtn': 'ShiftLeft',
                'escBtn': 'Escape'
            };

            const key = keyMap[button.id];
            if (key) {
                document.addEventListener('keydown', (e) => {
                    if (e.code === key && this.isVisible()) {
                        e.preventDefault();
                        this.handleButtonPress(button.dataset.action);
                        button.classList.add('active');
                    }
                });

                document.addEventListener('keyup', (e) => {
                    if (e.code === key && this.isVisible()) {
                        e.preventDefault();
                        this.handleButtonRelease(button.dataset.action);
                        button.classList.remove('active');
                    }
                });
            }
        });

        // Global touch event handlers for multi-touch support
        this.setupGlobalTouchHandlers();

        // Prevent default touch behaviors on controls
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('control-btn')) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (e.target.classList.contains('control-btn')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    setupGlobalTouchHandlers() {
        // Handle touch end globally to catch missed releases
        document.addEventListener('touchend', (e) => {
            // Check if touch ended outside any control button
            const endedOutside = !e.target.classList.contains('control-btn');
            if (endedOutside) {
                // Release all buttons when touch ends outside
                this.activeButtons.forEach(action => {
                    this.executeAction(action, false);
                });
                this.activeButtons.clear();

                // Remove active class from all buttons
                document.querySelectorAll('.control-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
            }
        }, { passive: false });
    }

    handleButtonPress(action) {
        if (!this.activeButtons.has(action)) {
            this.activeButtons.add(action);
            this.executeAction(action, true);
        }
    }

    handleButtonRelease(action) {
        if (this.activeButtons.has(action)) {
            this.activeButtons.delete(action);
            this.executeAction(action, false);
        }
    }

    executeAction(action, pressed) {
        if (!this.game.player || !this.game.keys) return;

        switch (action) {
            case 'superJump':
                this.game.keys['KeyW'] = pressed;
                break;
            case 'sniper':
                this.game.keys['KeyA'] = pressed;
                if (pressed) this.game.player.facing = -1;
                break;
            case 'missile':
                this.game.keys['KeyS'] = pressed;
                break;
            case 'cluster':
                this.game.keys['KeyD'] = pressed;
                if (pressed) this.game.player.facing = 1;
                break;
            case 'space':
                this.game.keys['Space'] = pressed;
                break;
            case 'ability':
                // Toggle evolution ability
                if (pressed) {
                    this.game.player.activateEvolutionAbility(this.game);
                }
                break;
            case 'esc':
                if (pressed) {
                    // Exit sniper mode or pause game
                    if (this.game.player && this.game.player.sniperMode) {
                        this.game.player.sniperMode = false;
                    }
                    // Could add pause functionality here
                }
                break;
        }
    }

    hideOnDesktop() {
        // Hide mobile controls on desktop
        const checkScreenSize = () => {
            const mobileControls = document.getElementById('mobileControls');
            if (window.innerWidth >= 769) {
                mobileControls.style.display = 'none';
            } else {
                mobileControls.style.display = 'flex';
            }
        };

        window.addEventListener('resize', checkScreenSize);
        checkScreenSize();
    }

    initializeAnalogStick() {
        // Initialize analog stick functionality
        const analogContainer = document.querySelector('.analog-container');
        const analogStick = document.querySelector('.analog-stick');
        const analogThumb = document.querySelector('.analog-thumb');

        if (!analogContainer || !analogStick || !analogThumb) return;

        this.analogStick.element = analogStick;
        this.analogStick.thumb = analogThumb;

        // Set initial position
        this.analogStick.thumb.style.left = '50%';
        this.analogStick.thumb.style.top = '50%';
        this.analogStick.thumb.style.transform = 'translate(-50%, -50%)';

        // Add event listeners for analog stick
        analogContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.analogStick.active = true;
            this.updateAnalogStick(e.touches[0]);
        });

        analogContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.analogStick.active) {
                this.updateAnalogStick(e.touches[0]);
            }
        });

        analogContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.analogStick.active = false;
            this.resetAnalogStick();
        });
    }

    updateAnalogStick(touch) {
        const rect = this.analogStick.element.getBoundingClientRect();
        this.analogStick.centerX = rect.left + rect.width / 2;
        this.analogStick.centerY = rect.top + rect.height / 2;

        const touchX = touch.clientX;
        const touchY = touch.clientY;

        const deltaX = touchX - this.analogStick.centerX;
        const deltaY = touchY - this.analogStick.centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > this.analogStick.maxDistance) {
            this.analogStick.currentX = (deltaX / distance) * this.analogStick.maxDistance;
            this.analogStick.currentY = (deltaY / distance) * this.analogStick.maxDistance;
        } else {
            this.analogStick.currentX = deltaX;
            this.analogStick.currentY = deltaY;
        }

        // Update thumb position
        const thumbX = 45 + this.analogStick.currentX; // 45 = half of analog-base width
        const thumbY = 45 + this.analogStick.currentY;
        this.analogStick.thumb.style.left = thumbX + 'px';
        this.analogStick.thumb.style.top = thumbY + 'px';
        this.analogStick.thumb.style.transform = 'translate(-50%, -50%)';

        // Update game keys based on analog stick position
        this.updateKeysFromAnalogStick();
    }

    resetAnalogStick() {
        this.analogStick.currentX = 0;
        this.analogStick.currentY = 0;
        this.analogStick.thumb.style.left = '50%';
        this.analogStick.thumb.style.top = '50%';
        this.analogStick.thumb.style.transform = 'translate(-50%, -50%)';

        // Reset keys when analog stick is released
        if (this.game && this.game.keys) {
            this.game.keys['KeyA'] = false;
            this.game.keys['KeyD'] = false;
            this.game.keys['KeyW'] = false;
            this.game.keys['KeyS'] = false;
        }
    }

    updateKeysFromAnalogStick() {
        if (!this.game || !this.game.keys) return;

        // Update horizontal movement
        if (Math.abs(this.analogStick.currentX) > this.analogStick.deadzone) {
            if (this.analogStick.currentX < 0) {
                this.game.keys['KeyA'] = true;
                this.game.keys['KeyD'] = false;
                if (this.game.player) this.game.player.facing = -1;
            } else {
                this.game.keys['KeyD'] = true;
                this.game.keys['KeyA'] = false;
                if (this.game.player) this.game.player.facing = 1;
            }
        } else {
            this.game.keys['KeyA'] = false;
            this.game.keys['KeyD'] = false;
        }

        // Update vertical movement
        if (Math.abs(this.analogStick.currentY) > this.analogStick.deadzone) {
            if (this.analogStick.currentY < 0) {
                this.game.keys['KeyW'] = true;
                this.game.keys['KeyS'] = false;
            } else {
                this.game.keys['KeyS'] = true;
                this.game.keys['KeyW'] = false;
            }
        } else {
            this.game.keys['KeyW'] = false;
            this.game.keys['KeyS'] = false;
        }
    }

    update() {
        // Update analog stick continuously
        if (this.analogStick.active) {
            this.updateKeysFromAnalogStick();
        }
    }

    // Method to check if mobile controls are visible
    isVisible() {
        return window.innerWidth < 769;
    }

    // Method to get active buttons for debugging
    getActiveButtons() {
        return Array.from(this.activeButtons);
    }
}

// Touch Joystick for advanced movement (optional)
class TouchJoystick {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.stick = document.createElement('div');
        this.isDragging = false;
        this.centerX = 0;
        this.centerY = 0;
        this.currentX = 0;
        this.currentY = 0;

        this.setupJoystick();
    }

    setupJoystick() {
        if (!this.container) return;

        this.container.style.position = 'relative';
        this.container.style.width = '120px';
        this.container.style.height = '120px';

        this.stick.style.position = 'absolute';
        this.stick.style.width = '40px';
        this.stick.style.height = '40px';
        this.stick.style.background = 'rgba(255, 255, 255, 0.8)';
        this.stick.style.borderRadius = '50%';
        this.stick.style.border = '2px solid #3498db';
        this.stick.style.left = '40px';
        this.stick.style.top = '40px';
        this.stick.style.transition = 'all 0.1s ease';

        this.container.appendChild(this.stick);

        this.setupEvents();
    }

    setupEvents() {
        this.container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDragging = true;
            this.updateJoystick(e.touches[0]);
        });

        this.container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDragging) {
                this.updateJoystick(e.touches[0]);
            }
        });

        this.container.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDragging = false;
            this.resetJoystick();
        });
    }

    updateJoystick(touch) {
        const rect = this.container.getBoundingClientRect();
        this.centerX = rect.left + rect.width / 2;
        this.centerY = rect.top + rect.height / 2;

        const touchX = touch.clientX;
        const touchY = touch.clientY;

        const deltaX = touchX - this.centerX;
        const deltaY = touchY - this.centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 40;

        if (distance > maxDistance) {
            this.currentX = (deltaX / distance) * maxDistance;
            this.currentY = (deltaY / distance) * maxDistance;
        } else {
            this.currentX = deltaX;
            this.currentY = deltaY;
        }

        this.stick.style.left = (40 + this.currentX) + 'px';
        this.stick.style.top = (40 + this.currentY) + 'px';
    }

    resetJoystick() {
        this.currentX = 0;
        this.currentY = 0;
        this.stick.style.left = '40px';
        this.stick.style.top = '40px';
    }

    getDirection() {
        const threshold = 10;
        return {
            left: this.currentX < -threshold,
            right: this.currentX > threshold,
            up: this.currentY < -threshold,
            down: this.currentY > threshold,
            intensity: Math.sqrt(this.currentX * this.currentX + this.currentY * this.currentY) / 40
        };
    }
}

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MobileControls, TouchJoystick };
}
