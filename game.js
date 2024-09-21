// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game Variables
let gameState = 'menu'; // 'menu', 'playing', 'gameover', 'instructions'
let playerScore = 0;
let computerScore = 0;
const winningScore = 5;

// Paddle Class
class Paddle {
  constructor(x, y, width, height, isPlayer) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 10;
    this.isPlayer = isPlayer;
  }

  draw() {
    ctx.fillStyle = '#FFF';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update(ball) {
    if (this.isPlayer) {
      // Player paddle movement is handled by event listeners
    } else {
      // Simple AI for computer paddle
      if (ball.y < this.y + this.height / 2) {
        this.y -= this.speed * 0.6;
      } else if (ball.y > this.y + this.height / 2) {
        this.y += this.speed * 0.6;
      }
    }

    // Prevent paddles from going out of bounds
    if (this.y < 0) this.y = 0;
    if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
  }
}

// Ball Class
class Ball {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = 7;
    this.speedX = Math.random() > 0.5 ? 7 : -7;
    this.speedY = (Math.random() * 6) - 3;
  }

  draw() {
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update(paddlePlayer, paddleComputer) {
    this.x += this.speedX;
    this.y += this.speedY;

    // Top and bottom wall collision
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.speedY = -this.speedY;
    }

    // Paddle collisions
    if (this.x - this.radius < paddlePlayer.x + paddlePlayer.width &&
        this.y > paddlePlayer.y && this.y < paddlePlayer.y + paddlePlayer.height) {
      this.speedX = -this.speedX;
      this.x = paddlePlayer.x + paddlePlayer.width + this.radius;
    }

    if (this.x + this.radius > paddleComputer.x &&
        this.y > paddleComputer.y && this.y < paddleComputer.y + paddleComputer.height) {
      this.speedX = -this.speedX;
      this.x = paddleComputer.x - this.radius;
    }

    // Scoring
    if (this.x + this.radius < 0) {
      computerScore++;
      this.reset();
    }

    if (this.x - this.radius > canvas.width) {
      playerScore++;
      this.reset();
    }
  }
}

// Initialize game objects
let paddlePlayer = new Paddle(10, canvas.height / 2 - 50, 10, 100, true);
let paddleComputer = new Paddle(canvas.width - 20, canvas.height / 2 - 50, 10, 100, false);
let ball = new Ball();

// Input Handling
let keys = {};

window.addEventListener('keydown', function (e) {
  keys[e.key] = true;

  if (gameState === 'menu' || gameState === 'gameover' || gameState === 'instructions') {
    if (e.key === 'Enter') {
      if (gameState === 'menu') {
        gameState = 'playing';
      } else if (gameState === 'gameover') {
        playerScore = 0;
        computerScore = 0;
        gameState = 'menu';
      } else if (gameState === 'instructions') {
        gameState = 'menu';
      }
    }
    if (e.key === 'i' && gameState === 'menu') {
      gameState = 'instructions';
    }
  }
});

window.addEventListener('keyup', function (e) {
  delete keys[e.key];
});

// Main Game Loop
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

function update() {
  if (gameState === 'playing') {
    // Update game objects
    if (keys['ArrowUp']) paddlePlayer.y -= paddlePlayer.speed;
    if (keys['ArrowDown']) paddlePlayer.y += paddlePlayer.speed;

    paddlePlayer.update();
    paddleComputer.update(ball);
    ball.update(paddlePlayer, paddleComputer);

    // Check for game over
    if (playerScore >= winningScore || computerScore >= winningScore) {
      gameState = 'gameover';
    }
  }
}

function render() {
  // Clear screen
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gameState === 'menu') {
    drawMenu();
  } else if (gameState === 'playing') {
    // Draw game objects
    paddlePlayer.draw();
    paddleComputer.draw();
    ball.draw();
    drawScore();
  } else if (gameState === 'gameover') {
    drawGameOver();
  } else if (gameState === 'instructions') {
    drawInstructions();
  }
}

function drawMenu() {
  ctx.fillStyle = '#FFF';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Pong Game', canvas.width / 2, canvas.height / 2 - 100);
  ctx.font = '36px Arial';
  ctx.fillText('Press ENTER to Play', canvas.width / 2, canvas.height / 2);
  ctx.fillText('Press I for Instructions', canvas.width / 2, canvas.height / 2 + 50);
}

function drawInstructions() {
  ctx.fillStyle = '#FFF';
  ctx.font = '36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Instructions', canvas.width / 2, canvas.height / 2 - 100);
  ctx.font = '24px Arial';
  ctx.fillText('Use the UP and DOWN arrow keys to move your paddle.', canvas.width / 2, canvas.height / 2 - 50);
  ctx.fillText('First to 5 points wins the game.', canvas.width / 2, canvas.height / 2);
  ctx.fillText('Press ENTER to return to the menu.', canvas.width / 2, canvas.height / 2 + 50);
}

function drawGameOver() {
  ctx.fillStyle = '#FFF';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  let winner = playerScore > computerScore ? 'Player' : 'Computer';
  ctx.fillText(`${winner} Wins!`, canvas.width / 2, canvas.height / 2 - 50);
  ctx.font = '36px Arial';
  ctx.fillText('Press ENTER to return to the menu.', canvas.width / 2, canvas.height / 2 + 20);
}

function drawScore() {
  ctx.fillStyle = '#FFF';
  ctx.font = '36px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Player: ${playerScore}`, 20, 40);
  ctx.textAlign = 'right';
  ctx.fillText(`Computer: ${computerScore}`, canvas.width - 20, 40);
}

// Handle window resize
window.addEventListener('resize', function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  paddleComputer.x = canvas.width - 20;
});

gameLoop();
