document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const startButton = document.getElementById('start-button');
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');
    const videoContainer = document.getElementById('video-container');
    const videoElement = document.getElementById('video');
    const muteButton = document.getElementById('mute-button');

    const winSound = new Audio('sounds/win.mp3');
    const backgroundMusic = new Audio('sounds/background.mp3');

    let isMuted = false;
    let gameOver = false;
    let score = 0;
    let timeRemaining = 60;

    // 🎨 Load 5 different cat sprites
    const catImages = ['images/cat1.png', 'images/cat2.png', 'images/cat3.png', 'images/cat4.png', 'images/cat5.png']
        .map(src => {
            const img = new Image();
            img.src = src;
            return img;
        });

    // 🎵 Load multiple meow sounds
    const meowSounds = [
        new Audio('sounds/meow1.mp3'),
        new Audio('sounds/meow2.mp3'),
        new Audio('sounds/meow3.mp3'),
        new Audio('sounds/meow4.mp3'),
        new Audio('sounds/meow5.mp3')
    ];

    // 🎨 Load Character Image
    const characterImage = new Image();
    characterImage.src = 'images/character.png';

    // 🏃 Character Properties
    const character = { x: 0, y: 0, width: 180, height: 180, speed: 10, radius: 80 };

    // 🐈 Cat Properties
    const cats = [];

    function createCat() {
        if (cats.length < 4) {  // ✅ Limit to 4 cats
            let newCat;
            let safeSpawn = false;
    
            while (!safeSpawn) {
                newCat = {
                    x: Math.random() * (canvas.width - 25), // Kept size same
                    y: Math.random() * (canvas.height - 25),
                    radius: 25,  // Kept size same
                    sprite: catImages[Math.floor(Math.random() * catImages.length)],
                    meowSound: meowSounds[Math.floor(Math.random() * meowSounds.length)] // 🎵 Assign random meow sound
                };
    
                // ✅ Ensure new cat spawns at least 150px away from the character
                const dx = newCat.x - character.x;
                const dy = newCat.y - character.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                if (distance > 150) {  
                    safeSpawn = true;
                }
            }
    
            cats.push(newCat);
        }
    }

    function drawCharacter() {
        ctx.drawImage(characterImage, character.x, character.y, character.width, character.height);
    }

    function drawCats() {
        cats.forEach(cat => {
            ctx.drawImage(cat.sprite, cat.x - cat.radius, cat.y - cat.radius, cat.radius * 2, cat.radius * 2);
        });
    }

    function checkCollision(cat) {
        const dx = cat.x - (character.x + character.width / 1.2); // ✅ Only right side
        const dy = cat.y - (character.y + character.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < cat.radius + (character.width / 5.5);
    }

    function updateScore() {
        for (let i = cats.length - 1; i >= 0; i--) {
            if (checkCollision(cats[i])) {
                score++;
                cats[i].meowSound.play(); // 🎵 Play the cat's assigned meow sound
                cats.splice(i, 1); // ✅ Instant disappearance
            }
        }
    }

    function drawScoreAndTimer() {
        scoreElement.textContent = `Score: ${score}`;
        timerElement.textContent = `Time: ${timeRemaining}`;
    }

    function endGame() {
        gameOver = true;
        winSound.play();
        finalScoreElement.textContent = score;
        gameOverElement.style.display = 'block';
        clearInterval(timerInterval);
        backgroundMusic.pause();

        setTimeout(() => {
            videoContainer.style.display = 'block';
            videoElement.play();
        }, 10000);
    }

    const timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
        } else if (!gameOver) {
            endGame();
        }
    }, 1000);

    function moveCharacter() {
        document.addEventListener('keydown', (e) => {
            if (gameOver) return;

            if (e.key === 'w' && character.y > -character.height / 2) {
                character.y -= character.speed;
            }
            if (e.key === 's' && character.y < canvas.height - character.height / 2) {
                character.y += character.speed;
            }
            if (e.key === 'a' && character.x > -character.width / 2) {
                character.x -= character.speed;
            }
            if (e.key === 'd' && character.x < canvas.width - character.width / 2) {
                character.x += character.speed;
            }
        });
    }

    function gameLoop() {
        if (gameOver) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCharacter();
        drawCats();
        updateScore();
        drawScoreAndTimer();

        if (cats.length < 4 && Math.random() < 0.1) { // ✅ Limit max 4 cats
            createCat();
        }

        requestAnimationFrame(gameLoop);
    }

    // 🎵 Start Button Logic
    startButton.addEventListener('click', () => {
        startButton.style.display = 'none'; 
        gameCanvas.style.display = 'block'; 
        scoreElement.style.display = 'block'; 
        timerElement.style.display = 'block'; 
        muteButton.style.display = 'block'; 

        backgroundMusic.play();
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.5;
    });

    // 🎵 Mute Button Logic
    muteButton.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            backgroundMusic.pause();
            muteButton.textContent = "Unmute Music";
        } else {
            backgroundMusic.play();
            muteButton.textContent = "Mute Music";
        }
    });

    moveCharacter();
    gameLoop();
});
