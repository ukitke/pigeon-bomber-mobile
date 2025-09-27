// Level Manager per Pigeon Bomber
class LevelManager {
    constructor(game) {
        this.game = game;
        this.levels = this.createLevels();
        this.powerupTypes = ['superJump', 'clusterBomb', 'missile', 'sniper'];
    }
    
    generateRandomPowerups(count, positions) {
        const powerups = [];
        for (let i = 0; i < count; i++) {
            const randomType = this.powerupTypes[Math.floor(Math.random() * this.powerupTypes.length)];
            powerups.push({
                x: positions[i].x,
                y: positions[i].y,
                type: randomType
            });
        }
        return powerups;
    }
    
    generateRandomPowerupsForLevel(positions) {
        // Generate completely random powerups for each position
        const powerups = [];
        positions.forEach(pos => {
            const randomType = this.powerupTypes[Math.floor(Math.random() * this.powerupTypes.length)];
            powerups.push({
                x: pos.x,
                y: pos.y,
                type: randomType
            });
        });
        return powerups;
    }
    
    getLevel(levelNumber) {
        if (levelNumber < 1 || levelNumber > 10) {
            return this.levels[0]; // Default to level 1
        }
        return this.levels[levelNumber - 1];
    }
    
    createLevels() {
        return [
            this.createLevel1(),
            this.createLevel2(),
            this.createLevel3(),
            this.createLevel4(),
            this.createLevel5(),
            this.createLevel6(),
            this.createLevel7(),
            this.createLevel8(),
            this.createLevel9(),
            this.createLevel10()
        ];
    }
    
    // Livello 1 - Tutorial Base
    createLevel1() {
        return {
            name: "Il Primo Volo",
            playerStart: { x: 50, y: 500 },
            background: 'clean',
            platforms: [
                new Platform(0, 580, 2000, 20, 'grass'),
                new Platform(200, 480, 150, 20, 'grass'),
                new Platform(450, 380, 150, 20, 'grass'),
                new Platform(700, 280, 150, 20, 'grass'),
                new Platform(950, 380, 150, 20, 'grass'),
                new Platform(1200, 480, 150, 20, 'grass'),
                new Platform(1500, 380, 150, 20, 'grass')
            ],
            enemies: [
                { x: 300, y: 450, type: 'goblin' },
                { x: 800, y: 250, type: 'goblin' },
                { x: 1300, y: 450, type: 'goblin' }
            ],
            powerupPositions: [
                { x: 500, y: 340 },
                { x: 1000, y: 340 }
            ],
            boss: null,
            escapeDoor: { x: 1800, y: 500, width: 60, height: 80 }
        };
    }
    
    // Livello 2 - Boss: Arpie
    createLevel2() {
        return {
            name: "Le Arpie Volanti",
            playerStart: { x: 50, y: 500 },
            platforms: [
                new Platform(0, 580, 2000, 20, 'stone'),
                new Platform(150, 480, 100, 20, 'cloud'),
                new Platform(350, 400, 100, 20, 'cloud'),
                new Platform(550, 320, 100, 20, 'cloud'),
                new Platform(750, 400, 100, 20, 'cloud'),
                new Platform(950, 480, 100, 20, 'cloud'),
                new Platform(1150, 400, 100, 20, 'cloud'),
                new Platform(1350, 320, 100, 20, 'cloud'),
                new Platform(1550, 400, 100, 20, 'cloud')
            ],
            enemies: [
                { x: 200, y: 300, type: 'bat' },
                { x: 400, y: 200, type: 'bat' },
                { x: 600, y: 150, type: 'bat' },
                { x: 800, y: 200, type: 'bat' },
                { x: 1000, y: 300, type: 'bat' }
            ],
            powerupPositions: [
                { x: 600, y: 210 },
                { x: 1200, y: 310 }
            ],
            boss: { x: 1600, y: 200, type: 'harpy' }
        };
    }
    
    // Livello 3 - Foresta Incantata
    createLevel3() {
        return {
            name: "Foresta Incantata",
            playerStart: { x: 50, y: 500 },
            platforms: [
                new Platform(0, 580, 2000, 20, 'grass'),
                new Platform(100, 500, 80, 20, 'grass'),
                new Platform(250, 420, 80, 20, 'grass'),
                new Platform(400, 340, 80, 20, 'grass'),
                new Platform(550, 420, 80, 20, 'grass'),
                new Platform(700, 500, 80, 20, 'grass'),
                new Platform(850, 420, 80, 20, 'grass'),
                new Platform(1000, 340, 80, 20, 'grass'),
                new Platform(1150, 260, 80, 20, 'grass'),
                new Platform(1300, 340, 80, 20, 'grass'),
                new Platform(1450, 420, 80, 20, 'grass'),
                new Platform(1600, 340, 80, 20, 'grass')
            ],
            enemies: [
                { x: 150, y: 470, type: 'goblin' },
                { x: 300, y: 390, type: 'goblin' },
                { x: 500, y: 200, type: 'bat' },
                { x: 750, y: 470, type: 'goblin' },
                { x: 900, y: 390, type: 'dragon' },
                { x: 1200, y: 230, type: 'bat' },
                { x: 1500, y: 390, type: 'goblin' }
            ],
            powerupPositions: [
                { x: 450, y: 300 },
                { x: 1050, y: 300 },
                { x: 1650, y: 300 }
            ],
            boss: null
        };
    }
    
    // Livello 4 - Boss: Minotauro
    createLevel4() {
        return {
            name: "Il Labirinto del Minotauro",
            playerStart: { x: 50, y: 500 },
            platforms: [
                new Platform(0, 580, 2000, 20, 'stone'),
                new Platform(200, 500, 200, 20, 'stone'),
                new Platform(500, 420, 200, 20, 'stone'),
                new Platform(800, 340, 200, 20, 'stone'),
                new Platform(1100, 420, 200, 20, 'stone'),
                new Platform(1400, 500, 200, 20, 'stone')
            ],
            enemies: [
                { x: 250, y: 470, type: 'goblin' },
                { x: 300, y: 470, type: 'goblin' },
                { x: 600, y: 390, type: 'dragon' },
                { x: 900, y: 310, type: 'bat' },
                { x: 1200, y: 390, type: 'dragon' },
                { x: 1500, y: 470, type: 'goblin' }
            ],
            powerupPositions: [
                { x: 300, y: 460 },
                { x: 900, y: 300 },
                { x: 1500, y: 460 }
            ],
            boss: { x: 1700, y: 480, type: 'minotaur' }
        };
    }
    
    // Livello 5 - Montagne Volanti
    createLevel5() {
        return {
            name: "Montagne Volanti",
            playerStart: { x: 50, y: 500 },
            platforms: [
                new Platform(0, 580, 150, 20, 'stone'),
                new Platform(200, 480, 120, 20, 'cloud'),
                new Platform(400, 380, 120, 20, 'cloud'),
                new Platform(600, 280, 120, 20, 'cloud'),
                new Platform(800, 180, 120, 20, 'cloud'),
                new Platform(1000, 280, 120, 20, 'cloud'),
                new Platform(1200, 380, 120, 20, 'cloud'),
                new Platform(1400, 480, 120, 20, 'cloud'),
                new Platform(1600, 380, 120, 20, 'cloud'),
                new Platform(1800, 580, 200, 20, 'stone')
            ],
            enemies: [
                { x: 250, y: 450, type: 'bat' },
                { x: 450, y: 350, type: 'bat' },
                { x: 650, y: 250, type: 'dragon' },
                { x: 850, y: 150, type: 'bat' },
                { x: 1050, y: 250, type: 'bat' },
                { x: 1250, y: 350, type: 'dragon' },
                { x: 1450, y: 450, type: 'bat' },
                { x: 1650, y: 350, type: 'bat' }
            ],
            powerupPositions: [
                { x: 460, y: 340 },
                { x: 860, y: 140 },
                { x: 1260, y: 340 },
                { x: 1660, y: 340 }
            ],
            boss: null
        };
    }
    
    // Livello 6 - Boss: Medusa
    createLevel6() {
        return {
            name: "Il Tempio di Medusa",
            playerStart: { x: 50, y: 500 },
            platforms: [
                new Platform(0, 580, 2000, 20, 'stone'),
                new Platform(300, 480, 150, 20, 'stone'),
                new Platform(600, 380, 150, 20, 'stone'),
                new Platform(900, 280, 150, 20, 'stone'),
                new Platform(1200, 380, 150, 20, 'stone'),
                new Platform(1500, 480, 150, 20, 'stone')
            ],
            enemies: [
                { x: 200, y: 550, type: 'goblin' },
                { x: 240, y: 550, type: 'goblin' },
                { x: 400, y: 450, type: 'dragon' },
                { x: 700, y: 350, type: 'bat' },
                { x: 1000, y: 250, type: 'dragon' },
                { x: 1300, y: 350, type: 'bat' },
                { x: 1600, y: 450, type: 'dragon' }
            ],
            powerupPositions: [
                { x: 375, y: 440 },
                { x: 675, y: 340 },
                { x: 975, y: 240 },
                { x: 1575, y: 440 }
            ],
            boss: { x: 1750, y: 480, type: 'medusa' }
        };
    }
    
    // Livello 7 - Caverne Profonde
    createLevel7() {
        return {
            name: "Caverne Profonde",
            playerStart: { x: 50, y: 500 },
            platforms: [
                new Platform(0, 580, 2000, 20, 'stone'),
                new Platform(150, 520, 100, 20, 'stone'),
                new Platform(300, 460, 100, 20, 'stone'),
                new Platform(450, 400, 100, 20, 'stone'),
                new Platform(600, 340, 100, 20, 'stone'),
                new Platform(750, 280, 100, 20, 'stone'),
                new Platform(900, 340, 100, 20, 'stone'),
                new Platform(1050, 400, 100, 20, 'stone'),
                new Platform(1200, 460, 100, 20, 'stone'),
                new Platform(1350, 520, 100, 20, 'stone'),
                new Platform(1500, 460, 100, 20, 'stone'),
                new Platform(1650, 400, 100, 20, 'stone'),
                new Platform(1800, 340, 100, 20, 'stone')
            ],
            enemies: [
                { x: 200, y: 490, type: 'goblin' },
                { x: 350, y: 430, type: 'dragon' },
                { x: 500, y: 370, type: 'bat' },
                { x: 650, y: 310, type: 'dragon' },
                { x: 800, y: 250, type: 'bat' },
                { x: 950, y: 310, type: 'dragon' },
                { x: 1100, y: 370, type: 'bat' },
                { x: 1250, y: 430, type: 'dragon' },
                { x: 1400, y: 490, type: 'goblin' },
                { x: 1440, y: 490, type: 'goblin' },
                { x: 1550, y: 430, type: 'dragon' },
                { x: 1700, y: 370, type: 'bat' },
                { x: 1850, y: 310, type: 'dragon' }
            ],
            powerupPositions: [
                { x: 400, y: 360 },
                { x: 800, y: 240 },
                { x: 1200, y: 360 },
                { x: 1600, y: 360 }
            ],
            boss: null
        };
    }
    
    // Livello 8 - Boss: Idra
    createLevel8() {
        return {
            name: "La Palude dell'Idra",
            playerStart: { x: 50, y: 500 },
            platforms: [
                new Platform(0, 580, 2000, 20, 'grass'),
                new Platform(200, 520, 120, 20, 'grass'),
                new Platform(400, 460, 120, 20, 'grass'),
                new Platform(600, 400, 120, 20, 'grass'),
                new Platform(800, 340, 120, 20, 'grass'),
                new Platform(1000, 400, 120, 20, 'grass'),
                new Platform(1200, 460, 120, 20, 'grass'),
                new Platform(1400, 520, 120, 20, 'grass'),
                new Platform(1600, 460, 120, 20, 'grass')
            ],
            enemies: [
                { x: 150, y: 550, type: 'dragon' },
                { x: 300, y: 490, type: 'bat' },
                { x: 450, y: 430, type: 'dragon' },
                { x: 600, y: 200, type: 'bat' },
                { x: 750, y: 310, type: 'dragon' },
                { x: 900, y: 200, type: 'bat' },
                { x: 1050, y: 370, type: 'dragon' },
                { x: 1200, y: 200, type: 'bat' },
                { x: 1350, y: 490, type: 'dragon' },
                { x: 1500, y: 430, type: 'bat' }
            ],
            powerupPositions: [
                { x: 350, y: 450 },
                { x: 700, y: 270 },
                { x: 1100, y: 330 },
                { x: 1550, y: 390 }
            ],
            boss: { x: 1750, y: 400, type: 'hydra' }
        };
    }
    
    // Livello 9 - Olimpo Inferiore
    createLevel9() {
        return {
            name: "Olimpo Inferiore",
            playerStart: { x: 50, y: 500 },
            platforms: [
                new Platform(0, 580, 2000, 20, 'cloud'),
                new Platform(100, 500, 100, 20, 'cloud'),
                new Platform(250, 420, 100, 20, 'cloud'),
                new Platform(400, 340, 100, 20, 'cloud'),
                new Platform(550, 260, 100, 20, 'cloud'),
                new Platform(700, 180, 100, 20, 'cloud'),
                new Platform(850, 260, 100, 20, 'cloud'),
                new Platform(1000, 340, 100, 20, 'cloud'),
                new Platform(1150, 420, 100, 20, 'cloud'),
                new Platform(1300, 500, 100, 20, 'cloud'),
                new Platform(1450, 420, 100, 20, 'cloud'),
                new Platform(1600, 340, 100, 20, 'cloud'),
                new Platform(1750, 260, 100, 20, 'cloud'),
                new Platform(1900, 180, 100, 20, 'cloud')
            ],
            enemies: [
                { x: 150, y: 470, type: 'dragon' },
                { x: 300, y: 390, type: 'bat' },
                { x: 450, y: 310, type: 'dragon' },
                { x: 600, y: 230, type: 'bat' },
                { x: 750, y: 150, type: 'dragon' },
                { x: 900, y: 230, type: 'bat' },
                { x: 1050, y: 310, type: 'dragon' },
                { x: 1200, y: 390, type: 'bat' },
                { x: 1350, y: 470, type: 'dragon' },
                { x: 1500, y: 390, type: 'bat' },
                { x: 1650, y: 310, type: 'dragon' },
                { x: 1800, y: 230, type: 'bat' },
                { x: 1950, y: 150, type: 'dragon' }
            ],
            powerupPositions: [
                { x: 350, y: 300 },
                { x: 650, y: 140 },
                { x: 1000, y: 300 },
                { x: 1400, y: 380 },
                { x: 1800, y: 220 }
            ],
            boss: null
        };
    }
    
    // Livello 10 - Boss Finale: Zeus
    createLevel10() {
        return {
            name: "Il Trono di Zeus",
            playerStart: { x: 50, y: 500 },
            platforms: [
                new Platform(0, 580, 2000, 20, 'cloud'),
                new Platform(300, 480, 200, 20, 'cloud'),
                new Platform(600, 380, 200, 20, 'cloud'),
                new Platform(900, 280, 200, 20, 'cloud'),
                new Platform(1200, 380, 200, 20, 'cloud'),
                new Platform(1500, 480, 200, 20, 'cloud'),
                new Platform(1800, 380, 200, 20, 'cloud')
            ],
            enemies: [
                { x: 200, y: 550, type: 'dragon' },
                { x: 250, y: 550, type: 'dragon' },
                { x: 400, y: 450, type: 'bat' },
                { x: 500, y: 450, type: 'bat' },
                { x: 700, y: 350, type: 'dragon' },
                { x: 800, y: 350, type: 'dragon' },
                { x: 1000, y: 250, type: 'bat' },
                { x: 1100, y: 250, type: 'bat' },
                { x: 1300, y: 350, type: 'dragon' },
                { x: 1400, y: 350, type: 'dragon' },
                { x: 1600, y: 450, type: 'bat' },
                { x: 1700, y: 450, type: 'bat' }
            ],
            powerupPositions: [
                { x: 375, y: 440 },
                { x: 675, y: 340 },
                { x: 975, y: 240 },
                { x: 1275, y: 340 },
                { x: 1575, y: 440 },
                { x: 1875, y: 340 }
            ],
            boss: { x: 1900, y: 300, type: 'zeus' }
        };
    }
}
