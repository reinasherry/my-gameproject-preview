
  // Create floating pixel effect
function createPixels() {
  const colors = ['blue', 'orange', 'yellow', '#10b981'];
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

    // Create CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(180deg); }
        100% { transform: translate(0, 0) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    container.appendChild(pixel);
  }
}

// Character descriptions data
const characterData = {
  penguin: {
    name: "Arctic Avenger",
    description: "A fearless penguin warrior from the icy lands of Antarctica. Armed with razor-sharp icicles and unmatched agility on ice, the Arctic Avenger defends the frozen realms against any threat. With a sleek black and white plumage that camouflages perfectly against ice and snow, this character can launch surprise attacks on enemies before they even notice.",
    stats: [
      { label: "Strength", value: "7/10" },
      { label: "Speed", value: "9/10" },
      { label: "Ice Power", value: "10/10" },
      { label: "Defense", value: "6/10" }
    ],
    background: "images/backgrounds/icepinguin.png"
  },
  duck: {
    name: "Quack Commander",
    description: "Leader of the feathered forces, Quack Commander combines aerial prowess with tactical brilliance. With wings that create hurricane-force winds and a beak that can cut through steel, no enemy is safe from his fury. This character specializes in air-based combat and can coordinate team attacks with precision.",
    stats: [
      { label: "Strength", value: "8/10" },
      { label: "Speed", value: "10/10" },
      { label: "Flight", value: "10/10" },
      { label: "Strategy", value: "9/10" }
    ]
  },
  cat: {
    name: "Shadow Prowler",
    description: "Master of stealth and night operations, Shadow Prowler moves unseen through the darkness. With enhanced senses and retractable claws, this feline fighter strikes with precision when least expected. Nine lives allow for daring maneuvers that would be fatal for other characters.",
    stats: [
      { label: "Strength", value: "8/10" },
      { label: "Stealth", value: "10/10" },
      { label: "Agility", value: "10/10" },
      { label: "Night Vision", value: "10/10" }
    ]
  },
  dog: {
    name: "Bolt",
    description: "Bolt is a playful and energetic pup with a heart full of courage. Known for his speed and loyalty, he's always ready to dash into action and stand by your side—whether it's during a game or guarding your snacks.",
    stats: [
      { label: "Strength", value: "8/10" },
      { label: "Stealth", value: "10/10" },
      { label: "Agility", value: "10/10" },
      { label: "speed", value: "10/10" }
    ]
  }
};

// DOM elements
const cursorLight = document.getElementById('cursorLight');
const images = document.querySelectorAll('.image-container img');
const container = document.querySelector('.image-container');
const overlay = document.getElementById('overlay');
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
const gameBackground = document.getElementById('gameBackground');

// Variables
let mouseX = 0, mouseY = 0;
let cursorRAF;
let selectedCharacter = null;
const maxPartySize = 1;

// Mouse tracking for cursor light
document.addEventListener('mousemove', (e) => {
  mouseX = e.pageX;
  mouseY = e.pageY;

  // Smooth follow effect
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

// Initialize cursor
updateCursor();

// Show character description
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

// Close character description
function closeCharacterDescription() {
  // Play exit sound
  exitSound.currentTime = 0;
  exitSound.play();

  descPanel.classList.remove('show');
  overlay.classList.remove('show');
}

// Update the party display
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
    
    // Enable start button
    startGameBtn.disabled = false;
    startGameBtn.classList.add('enabled');
  } else {
    // Disable start button
    startGameBtn.disabled = true;
    startGameBtn.classList.remove('enabled');
  }
}

// Character selection
characterCards.forEach(card => {
  card.addEventListener('click', (e) => {
    // Prevent triggering the image click event
    e.stopPropagation();

    // Play selection sound
    clickPop.currentTime = 0;
    clickPop.play();

    // Get character type from data attribute
    const character = card.getAttribute('data-character');

    // If clicking the same character, deselect it
    if (selectedCharacter === character) {
      card.classList.remove('selected');
      selectedCharacter = null;
      updatePartyDisplay();
      return;
    }

    // Remove selection from all cards
    characterCards.forEach(c => c.classList.remove('selected'));

    // Add selection to clicked card
    card.classList.add('selected');
    selectedCharacter = character;

    // Show description with image
    showCharacterDescription(character);
    
    // Update party display
    updatePartyDisplay();
  });
});

// Close with ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCharacterDescription();
  }
});

// Close description panel when clicking the X button
descCloseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  closeCharacterDescription();
});

// Close overlay when clicking outside
overlay.addEventListener('click', closeCharacterDescription);

// Start game button functionality
startGameBtn.addEventListener('click', () => {
  if (!selectedCharacter) {
    alert('Please select a character first!');
    return;
  }
  
  jumpSound.currentTime = 0;
  jumpSound.play();

  // Show background if penguin is selected
  if (selectedCharacter === 'penguin') {
    const character = characterData[selectedCharacter];
    
    // Hide everything except the background
    document.body.style.overflow = 'hidden';
    document.querySelectorAll('body > *:not(#gameBackground)').forEach(el => {
      el.style.display = 'none';
    });
    
    // Set and show the background
    gameBackground.style.backgroundImage = `url('${character.background}')`;
    gameBackground.style.display = 'block';
    
    // Add click to return
    gameBackground.addEventListener('click', () => {
      gameBackground.style.display = 'none';
      document.querySelectorAll('body > *:not(#gameBackground)').forEach(el => {
        el.style.display = '';
      });
      document.body.style.overflow = '';
    });
  } else {
    // Original behavior for other characters
    console.log('Starting game with character:', selectedCharacter);
    alert(`Game starting with ${characterData[selectedCharacter].name}!`);
  }
});

// Background music variables
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const musicStatus = document.querySelector('.music-status');

// Set music volume (0 to 1)
bgMusic.volume = 0.3; // 30% volume

// Try to autoplay music when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Many browsers block autoplay, so we need to handle this carefully
  const playPromise = bgMusic.play();
  
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      // Autoplay was prevented, show muted status
      musicStatus.textContent = "Music: OFF (click to enable)";
      bgMusic.muted = true;
    });
  }
});

// Toggle music on/off
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
createPixels();
updatePartyDisplay(); // Initialize party display

