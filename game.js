// ===== DOM Elements =====
const cursorLight = document.getElementById('cursorLight');
const characterCards = document.querySelectorAll('.character-card');
const descPanel = document.getElementById('characterDescription');
const descImage = document.getElementById('descCharacterImage');
const descTitle = document.getElementById('descTitle');
const descText = document.getElementById('descText');
const statsContainer = document.getElementById('statsContainer');
const descCloseBtn = document.getElementById('descCloseBtn');
const startGameBtn = document.querySelector('.StartGame');
const jumpSound = document.getElementById('jumpSound');
const clickPop = document.getElementById('clickpop');
const exitSound = document.getElementById('exit');
const partyDiv = document.getElementById('party');
const overlay = document.getElementById('overlay');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicStatus = document.querySelector('.music-status');
// ===== Floating Pixel Animation =====
function createPixels() {
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];
  const container = document.body;

  for (let i = 0; i < 30; i++) {
    const pixel = document.createElement('div');
    pixel.classList.add('pixel');

    // Random properties
    const size = Math.random() * 10 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 5;

    pixel.style.width = `${size}px`;
    pixel.style.height = `${size}px`;
    pixel.style.backgroundColor = color;
    pixel.style.left = `${posX}%`;
    pixel.style.top = `${posY}%`;
    pixel.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;

    container.appendChild(pixel);
  }

  // Add the keyframes to the document head
  const style = document.createElement('style');
  style.textContent = `
    @keyframes float {
      0% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg); }
      100% { transform: translate(0, 0) rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
// ===== Game Variables =====
let mouseX = 0, mouseY = 0;
let cursorRAF;
let selectedCharacter = null;
const maxPartySize = 1;

// Game states
const gameStates = {
  MENU: 0,
  PLAYING: 1,
  GAMEOVER: 2
};
let currentState = gameStates.MENU;

// Player
const player = {
  x: 50,
  y: 50,
  width: 50,
  height: 50,
  speed: 5,
  jumping: false,
  velocityY: 0,
  character: null
};

// Obstacles
const obstacles = [];
let score = 0;
let gameRunning = false;
const keys = {};

// Character data
const characterData = {
  penguin: {
    name: "Arctic Avenger",
    description: "A fearless penguin warrior from the icy lands of Antarctica. Armed with razor-sharp icicles and unmatched agility on ice.",
    stats: [
      { label: "Strength", value: "7/10" },
      { label: "Speed", value: "9/10" },
      { label: "Ice Power", value: "10/10" },
      { label: "Defense", value: "6/10" }
    ],
    abilities: {
      slide: function() { /* ice slide ability */ },
      iceAttack: function() { /* attack code */ }
    },
    gameStats: {
      jumpHeight: 12,
      speed: 5
    }
  },
  duck: {
    name: "Quack Commander",
    description: "Leader of the feathered forces, combines aerial prowess with tactical brilliance.",
    stats: [
      { label: "Strength", value: "8/10" },
      { label: "Speed", value: "10/10" },
      { label: "Flight", value: "10/10" },
      { label: "Strategy", value: "9/10" }
    ],
    gameStats: {
      jumpHeight: 15,
      speed: 6
    }
  },
  cat: {
    name: "Shadow Prowler",
    description: "Master of stealth and night operations, moves unseen through the darkness.",
    stats: [
      { label: "Strength", value: "8/10" },
      { label: "Stealth", value: "10/10" },
      { label: "Agility", value: "10/10" },
      { label: "Night Vision", value: "10/10" }
    ],
    gameStats: {
      jumpHeight: 14,
      speed: 7
    }
  },
  dog: {
    name: "Bolt",
    description: "Playful and energetic pup with a heart full of courage.",
    stats: [
      { label: "Strength", value: "8/10" },
      { label: "Stealth", value: "10/10" },
      { label: "Agility", value: "10/10" },
      { label: "Speed", value: "10/10" }
    ],
    gameStats: {
      jumpHeight: 13,
      speed: 8
    }
  }
};

// ===== Game Functions =====
function startGame() {
  currentState = gameStates.PLAYING;
  gameRunning = true;
  score = 0;
  player.x = 50;
  player.y = canvas.height - 100;
  obstacles.length = 0;
  
  // Apply character stats
  if (selectedCharacter && characterData[selectedCharacter]) {
    const stats = characterData[selectedCharacter].gameStats;
    player.speed = stats.speed;
    player.character = selectedCharacter;
  }
  
  gameLoop();
}

function resetGame() {
  startGame();
}

function gameOver() {
  currentState = gameStates.GAMEOVER;
  gameRunning = false;
}

function gameLoop() {
  if (!gameRunning) return;
  
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  // Player movement
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;
  if (keys['ArrowUp'] && !player.jumping) {
    player.jumping = true;
    player.velocityY = -characterData[player.character]?.gameStats.jumpHeight || -15;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
  
  // Gravity
  player.velocityY += 0.8;
  player.y += player.velocityY;
  
  // Ground collision
  if (player.y > canvas.height - player.height) {
    player.y = canvas.height - player.height;
    player.jumping = false;
    player.velocityY = 0;
  }
  
  // Wall collision
  if (player.x < 0) player.x = 0;
  if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
  
  // Obstacle logic
  obstacles.forEach((obstacle, index) => {
    obstacle.x -= obstacle.speed;
    
    // Collision check
    if (
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y
    ) {
      gameOver();
    }
    
    // Remove if off-screen
    if (obstacle.x < -obstacle.width) {
      obstacles.splice(index, 1);
      score++;
    }
  });
  
  // Spawn new obstacles
  if (Math.random() < 0.02) {
    obstacles.push({
      x: canvas.width,
      y: canvas.height - 50,
      width: 30,
      height: 50,
      speed: 5
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  if (currentState === gameStates.PLAYING) {
    // Draw player
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw obstacles
    ctx.fillStyle = '#ef4444';
    obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw score
    ctx.textAlign = 'left'; // Default alignment
  ctx.font = '24px Silkscreen';
  ctx.fillStyle = 'white';
  } 
  else if (currentState === gameStates.GAMEOVER) {
    drawGameOver();
  }
  ctx.fillText(`Score: ${score}`, 100, 30); 
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = 'white';
  ctx.font = '48px Silkscreen';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
  
  ctx.font = '24px Silkscreen';
  ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 50);
  ctx.fillText('Click to play again', canvas.width/2, canvas.height/2 + 100);
}

// ===== UI Functions =====
function showCharacterDescription(character) {
  if (!characterData[character]) return;

  const data = characterData[character];
  const clickedCard = document.querySelector(`.character-card[data-character="${character}"]`);
  const clickedImage = clickedCard.querySelector('img');

  // Update description elements
  descTitle.textContent = data.name;
  descText.textContent = data.description;
  descImage.src = clickedImage.src;
  descImage.alt = clickedImage.alt;

  // Update stats
  statsContainer.innerHTML = '';
  data.stats.forEach(stat => {
    const statElement = document.createElement('div');
    statElement.className = 'stat';
    statElement.innerHTML = `
      <div class="label">${stat.label}</div>
      <div class="value">${stat.value}</div>
    `;
    statsContainer.appendChild(statElement);
  });

  // Show the description panel
  descPanel.classList.add('show');
  overlay.classList.add('show');
}

function closeCharacterDescription() {
  exitSound.currentTime = 0;
  exitSound.play();
  descPanel.classList.remove('show');
  overlay.classList.remove('show');
}

function updatePartyDisplay() {
  partyDiv.innerHTML = '';

  if (selectedCharacter) {
    const characterInfo = characterData[selectedCharacter];
    const div = document.createElement('div');
    div.className = 'party-member';
    div.innerHTML = `
      <img src="${document.querySelector(`.character-card[data-character="${selectedCharacter}"] img`).src}" 
           alt="${characterInfo.name}" width="80" height="80">
      <h3>${characterInfo.name}</h3>
      <p>Ready for battle!</p>
    `;
    partyDiv.appendChild(div);
    startGameBtn.disabled = false;
    startGameBtn.classList.add('enabled');
  } else {
    startGameBtn.disabled = true;
    startGameBtn.classList.remove('enabled');
  }
}

// ===== Event Listeners =====
// Character selection
characterCards.forEach(card => {
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    clickPop.currentTime = 0;
    clickPop.play();

    const character = card.getAttribute('data-character');

    if (selectedCharacter === character) {
      card.classList.remove('selected');
      selectedCharacter = null;
      updatePartyDisplay();
      return;
    }

    characterCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedCharacter = character;
    showCharacterDescription(character);
    updatePartyDisplay();
  });
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === 'Escape') closeCharacterDescription();
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Close description panel
descCloseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  closeCharacterDescription();
});

overlay.addEventListener('click', closeCharacterDescription);

// Start game button
startGameBtn.addEventListener('click', () => {
  if (!selectedCharacter) {
    alert('Please select a character first!');
    return;
  }

  jumpSound.currentTime = 0;
  jumpSound.play();

  // Hide menu, show canvas
  document.querySelector('.images-wrapper').style.display = 'none';
  document.querySelector('.start-game-wrapper').style.display = 'none';
  document.querySelector('h1').style.display = 'none';
  document.querySelector('.subtitle').style.display = 'none';
  
  canvas.style.display = 'block';
  startGame();
});

// Click to restart
canvas.addEventListener('click', () => {
  if (currentState === gameStates.GAMEOVER) {
    resetGame();
  }
});

// Cursor light effect
document.addEventListener('mousemove', (e) => {
  mouseX = e.pageX;
  mouseY = e.pageY;

  if (!cursorRAF) {
    cursorRAF = requestAnimationFrame(updateCursor);
  }
});

function updateCursor() {
  const diffX = mouseX - parseFloat(cursorLight.style.left || 0);
  const diffY = mouseY - parseFloat(cursorLight.style.top || 0);

  cursorLight.style.left = (parseFloat(cursorLight.style.left || 0) + diffX * 0.1) + 'px';
  cursorLight.style.top = (parseFloat(cursorLight.style.top || 0) + diffY * 0.1) + 'px';

  cursorRAF = requestAnimationFrame(updateCursor);
}

// Music controls
bgMusic.volume = 0.3;

document.addEventListener('DOMContentLoaded', () => {
  const playPromise = bgMusic.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      musicStatus.textContent = "Music: OFF (click to enable)";
      bgMusic.muted = true;
    });
  }
});

musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicStatus.textContent = "Music: ON";
    bgMusic.muted = false;
  } else {
    bgMusic.pause();
    musicStatus.textContent = "Music: OFF";
  }
});

// Initialize
// Initialize
updateCursor();
updatePartyDisplay();
createPixels(); // Add this line to create the floating pixels