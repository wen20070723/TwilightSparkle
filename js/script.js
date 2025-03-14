// 切换冒险故事展开状态
const expandButtons = document.querySelectorAll('.expand-btn');
expandButtons.forEach((button) => {
    button.addEventListener('click', function () {
        const hiddenContent = this.nextElementSibling;
        const isExpanded = hiddenContent.classList.contains('expanded');
        if (isExpanded) {
            hiddenContent.classList.remove('expanded');
            this.textContent = '展开更多';
        } else {
            hiddenContent.classList.add('expanded');
            this.textContent = '收起内容';
        }
    });
});

// 切换趣味小知识
const toggleFactButton = document.getElementById('toggle-fact');
const factItems = document.querySelectorAll('.fact-item');
let currentFactIndex = 0;
toggleFactButton.addEventListener('click', function () {
    factItems[currentFactIndex].style.display = 'none';
    currentFactIndex = (currentFactIndex + 1) % factItems.length;
    factItems[currentFactIndex].style.display = 'block';
});

// 施展咒语功能
const castSpellButton = document.getElementById('cast-spell-button');
const body = document.body;
let spellTimer;

castSpellButton.addEventListener('click', function () {
    if (this.disabled) return;
    body.classList.add('spell-active');
    this.disabled = true;
    spellTimer = setTimeout(() => {
        body.classList.remove('spell-active');
        this.disabled = false;
    }, 5000);
});

// 游戏相关变量
const gameSection = document.getElementById('game');
const toggleGameLink = document.getElementById('toggle-game');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const magicEnergyElement = document.getElementById('magic-energy');
const restartButton = document.getElementById('restartButton');
const gameStartPrompt = document.getElementById('game-start-prompt');
const gameOverPopup = document.getElementById('game-over-popup');
const finalScoreElement = document.getElementById('final-score');
const closePopupButton = document.getElementById('close-popup');

let isGameRunning = false;
let score = 0;
let health = 3;
let magicEnergy = 0;
let playerX;
let traps = [];
let stars = [];
let gameInterval;
let touchStartX = 0;
let lastPlayerX = 0;
let trapSpeed = 5;
let trapGenerateRate = 0.02;

// 初始化游戏画布大小
function initCanvasSize() {
    gameCanvas.width = Math.min(window.innerWidth - 40, 800);
    gameCanvas.height = gameCanvas.width * 3 / 4;
}

// 初始化游戏
function initGame() {
    initCanvasSize();
    playerX = gameCanvas.width / 2;
    score = 0;
    health = 3;
    magicEnergy = 0;
    traps = [];
    stars = [];
    scoreElement.textContent = score;
    healthElement.textContent = health;
    magicEnergyElement.textContent = magicEnergy;
    gameStartPrompt.style.display = 'block';
    gameOverPopup.classList.add('hidden');
    isGameRunning = false;
    clearInterval(gameInterval);
    trapSpeed = 5;
    trapGenerateRate = 0.02;
}

// 生成陷阱
function generateTrap() {
    const trapX = Math.random() * (gameCanvas.width - 20);
    const trapType = Math.random();
    let color;
    if (trapType < 0.2) {
        color = 'blue'; // 蓝色方块，碰到不动不掉血
    } else if (trapType < 0.4) {
        color = 'orange'; // 橙色方块，必须移动才会掉血
    } else {
        color = 'red'; // 普通红色方块
    }
    traps.push({ x: trapX, y: 0, width: 20, height: 20, color: color });
}

// 生成星星
function generateStar() {
    const starX = Math.random() * (gameCanvas.width - 10);
    stars.push({ x: starX, y: 0, width: 10, height: 10 });
}

// 生成回血方块
function generateHealBlock() {
    if (Math.random() < 0.005) {
        const healX = Math.random() * (gameCanvas.width - 20);
        traps.push({ x: healX, y: 0, width: 20, height: 20, color: 'green' });
    }
}

// 绘制玩家
function drawPlayer() {
    ctx.fillStyle = 'purple';
    ctx.fillRect(playerX, gameCanvas.height - 30, 30, 30);
    lastPlayerX = playerX;
}

// 绘制陷阱
function drawTraps() {
    traps.forEach((trap) => {
        ctx.fillStyle = trap.color;
        ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
        trap.y += trapSpeed;
    });
    traps = traps.filter((trap) => trap.y < gameCanvas.height);
}

// 绘制星星
function drawStars() {
    ctx.fillStyle = 'yellow';
    stars.forEach((star) => {
        ctx.fillRect(star.x, star.y, star.width, star.height);
        star.y += 3;
    });
    stars = stars.filter((star) => star.y < gameCanvas.height);
}

// 检测碰撞
function checkCollision() {
    traps.forEach((trap, index) => {
        if (
            playerX < trap.x + trap.width &&
            playerX + 30 > trap.x &&
            gameCanvas.height - 30 < trap.y + trap.height &&
            gameCanvas.height - 30 + 30 > trap.y
        ) {
            if (trap.color === 'blue') {
                if (playerX !== lastPlayerX) {
                    if (magicEnergy >= 100) {
                        magicEnergy = 0;
                        magicEnergyElement.textContent = magicEnergy;
                        traps.splice(index, 1);
                    } else {
                        health--;
                        healthElement.textContent = health;
                        traps.splice(index, 1);
                        if (health <= 0) {
                            endGame();
                        }
                    }
                }
            } else if (trap.color === 'orange') {
                if (playerX === lastPlayerX) {
                    if (magicEnergy >= 100) {
                        magicEnergy = 0;
                        magicEnergyElement.textContent = magicEnergy;
                        traps.splice(index, 1);
                    } else {
                        health--;
                        healthElement.textContent = health;
                        traps.splice(index, 1);
                        if (health <= 0) {
                            endGame();
                        }
                    }
                }
            } else if (trap.color === 'green') {
                if (health < 3) {
                    health++;
                    healthElement.textContent = health;
                }
                traps.splice(index, 1);
            } else {
                if (magicEnergy >= 100) {
                    magicEnergy = 0;
                    magicEnergyElement.textContent = magicEnergy;
                    traps.splice(index, 1);
                } else {
                    health--;
                    healthElement.textContent = health;
                    traps.splice(index, 1);
                    if (health <= 0) {
                        endGame();
                    }
                }
            }
        }
    });

    stars.forEach((star, index) => {
        if (
            playerX < star.x + star.width &&
            playerX + 30 > star.x &&
            gameCanvas.height - 30 < star.y + star.height &&
            gameCanvas.height - 30 + 30 > star.y
        ) {
            score++;
            scoreElement.textContent = score;
            magicEnergy += 20;
            if (magicEnergy > 100) {
                magicEnergy = 100;
            }
            magicEnergyElement.textContent = magicEnergy;
            stars.splice(index, 1);

            // 随着得分增加，加快陷阱速度和生成率
            if (score % 5 === 0 && trapSpeed < 10) {
                trapSpeed += 1;
            }
            if (score % 10 === 0 && trapGenerateRate < 0.1) {
                trapGenerateRate += 0.01;
            }
        }
    });
}

// 游戏循环
function gameLoop() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    drawPlayer();
    drawTraps();
    drawStars();
    checkCollision();
    generateHealBlock();

    if (Math.random() < trapGenerateRate) {
        generateTrap();
    }
    if (Math.random() < 0.01) {
        generateStar();
    }
}

// 开始游戏
function startGame() {
    isGameRunning = true;
    gameStartPrompt.style.display = 'none';
    gameInterval = setInterval(gameLoop, 20);
}

// 结束游戏
function endGame() {
    isGameRunning = false;
    clearInterval(gameInterval);
    finalScoreElement.textContent = score;
    gameOverPopup.classList.remove('hidden');
}

// 键盘控制
document.addEventListener('keydown', function (event) {
    if (!isGameRunning) return;
    if (event.key === 'ArrowLeft' && playerX > 0) {
        playerX -= 10;
    } else if (event.key === 'ArrowRight' && playerX < gameCanvas.width - 30) {
        playerX += 10;
    }
});

// 触摸控制
gameCanvas.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
});

gameCanvas.addEventListener('touchend', function (event) {
    if (!isGameRunning) return;
    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (deltaX > 20 && playerX < gameCanvas.width - 30) {
        playerX += 10;
    } else if (deltaX < -20 && playerX > 0) {
        playerX -= 10;
    }
});

// 触摸控制按钮
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');

leftButton.addEventListener('click', function () {
    if (isGameRunning && playerX > 0) {
        playerX -= 10;
    }
});

rightButton.addEventListener('click', function () {
    if (isGameRunning && playerX < gameCanvas.width - 30) {
        playerX += 10;
    }
});

// 开始游戏提示点击事件
gameStartPrompt.addEventListener('click', startGame);

// 重新开始游戏
restartButton.addEventListener('click', initGame);

// 关闭游戏结束弹窗
closePopupButton.addEventListener('click', function () {
    gameOverPopup.classList.add('hidden');
});

// 切换游戏显示状态
toggleGameLink.addEventListener('click', function (event) {
    event.preventDefault();
    gameSection.classList.toggle('hidden');
    if (!gameSection.classList.contains('hidden')) {
        initGame();
    }
});

// 窗口大小改变时重新设置画布大小
window.addEventListener('resize', initCanvasSize);

// 初始化游戏
initGame();