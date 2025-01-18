const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
let names = [];
let startAngle = 0;
let arc = 0;
let spinTimeout = null;
let spinAngleStart = 10;
let spinTime = 0;
let spinTimeTotal = 0;
let middleImage = new Image();
let imageSize = 40; // Default image size percentage
let twitchClient = null;
let twitchChannel = '';
let twitchCommand = '';
let twitchParticipants = new Set();  // To store unique participants
let isConnected = false;

//console.log('tmi:', tmi);  // Debug if tmi is loaded
console.log('Is tmi loaded?', typeof tmi !== 'undefined' ? 'Yes' : 'No');

const socket = io();

socket.on('newParticipant', (username) => {
    console.log(`🎉 New participant received from server: ${username}`);

    if (!names.includes(username)) {
        names.push(username);
        arc = Math.PI / (names.length / 2);
        drawWheel();

        const nameInputField = document.getElementById('nameInput');
        if (nameInputField) {
            nameInputField.value = names.join('\n');
        }

        console.log(`✅ ${username} has been added to the wheel.`);
    } else {
        console.warn(`⚠️ ${username} is already on the wheel.`);
    }
});





// Set default center image
middleImage.src = 'centerimage.png';
middleImage.onload = drawWheel;

// Prefill the names field with 5 random names only when the page loads
window.addEventListener('load', () => {
    const defaultNames = ["Alice", "Bob", "Charlie", "David", "Eve"];
    const nameInputField = document.getElementById('nameInput');
    if (nameInputField && nameInputField.value.trim() === '') {
        nameInputField.value = defaultNames.join('\n');
        names = defaultNames;
        arc = Math.PI / (names.length / 2);
        drawWheel();
    }
    checkTwitchAuth();
});

document.getElementById('generateWheel').addEventListener('click', () => {
    const nameInput = document.getElementById('nameInput').value.trim();
    names = nameInput.split('\n').filter(name => name.trim() !== '');
    arc = Math.PI / (names.length / 2);
    drawWheel();
});

document.getElementById('spinButton').addEventListener('click', () => {
    spinWheel();
});

canvas.addEventListener('click', () => {
    spinWheel();
});

document.getElementById('shuffleButton').addEventListener('click', () => {
    shuffleArray(names);
    drawWheel();
});

// Spin Button
document.getElementById('spinButton').addEventListener('click', () => {
    spinWheel();
});

// Shuffle Button
document.getElementById('shuffleButton').addEventListener('click', () => {
    shuffleArray(names);
    drawWheel();
});

// 🎥 Twitch "Go" Button - Start Monitoring Twitch Chat
document.getElementById('twitchGoButton').addEventListener('click', () => {
    twitchChannel = document.getElementById('twitchChannel').value.trim().toLowerCase();
    twitchCommand = document.getElementById('twitchCommand').value.trim();
    const goButton = document.getElementById('twitchGoButton');

    if (!twitchChannel || !twitchCommand) {
        alert('Please enter both the Twitch channel and command.');
        return;
    }

    if (!isConnected) {
        console.log(`🔄 Attempting to connect to Twitch channel: ${twitchChannel}...`);

        if (!twitchClient) {
            twitchClient = new tmi.Client({
                options: { debug: true },
                connection: { reconnect: true, secure: true },
                identity: {
                    username: 'buttonpicker',
                    password: 'oauth:gq3nura2ws24xfn0e4evoem7vj9ge3'  // Replace with a valid OAuth token
                },
                channels: [twitchChannel]
            });

            // Always listen for messages
            twitchClient.on('message', (channel, tags, message, self) => {
                if (self) return;
            
                console.log(`📩 [${channel}] ${tags['display-name']}: ${message}`);
            
                if (message.trim().toLowerCase() === twitchCommand.toLowerCase()) {
                    console.log(`✅ Command matched: ${message}`);
            
                    const username = tags['display-name'];
                    console.log(`👤 Detected user: ${username}`);
            
                    if (!participants.has(username)) {
                        console.log(`➕ Adding ${username} to the participants list...`);
                        participants.add(username);
            
                        // ✅ Correct: Emit participant to the frontend
                        io.emit('newParticipant', username);
                        console.log(`🚀 Emitted new participant to frontend: ${username}`);
                    } else {
                        console.warn(`⚠️ ${username} is already in the participant list.`);
                    }
                }
            });
            
            
            
            
            

            // Connect the bot
            twitchClient.connect().then(() => {
                console.log(`✅ Successfully connected to ${twitchChannel}`);
                goButton.textContent = 'Leave Channel';
                isConnected = true;
            }).catch(err => {
                console.error(`❌ Failed to connect: ${err}`);
            });
        }
    } else {
        // Disconnect if already connected
        twitchClient.disconnect()
            .then(() => {
                console.log(`❎ Disconnected from Twitch channel: ${twitchChannel}`);
                goButton.textContent = 'Authorize and Go';
                isConnected = false;
                twitchParticipants.clear();
            })
            .catch(err => console.error('❌ Failed to disconnect from Twitch:', err));
    }
});


async function fetchOAuthToken() {
    const response = await fetch('/get-token');
    const data = await response.json();
    return data.token;
}

async function connectTwitchBot() {
    const oauthToken = await fetchOAuthToken();

    if (!oauthToken) {
        console.error('❌ No OAuth token available.');
        return;
    }

    twitchClient = new tmi.Client({
        options: { debug: true },
        connection: { reconnect: true, secure: true },
        identity: {
            username: 'buttonpicker',
            password: `oauth:${oauthToken}`
        },
        channels: [twitchChannel]
    });

    twitchClient.connect()
        .then(() => console.log(`✅ Connected to Twitch channel: ${twitchChannel}`))
        .catch(err => console.error(`❌ Failed to connect:`, err));
}



document.getElementById('middleImageUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            middleImage = new Image();
            middleImage.src = e.target.result;
            middleImage.onload = drawWheel;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('imageSizeSlider').addEventListener('input', (event) => {
    imageSize = event.target.value;
    document.getElementById('imageSizeValue').textContent = imageSize;
    drawWheel();
});

document.getElementById('durationSlider').addEventListener('input', (event) => {
    document.getElementById('durationValue').textContent = event.target.value;
});

document.getElementById('wheelSizeSlider').addEventListener('input', (event) => {
    document.getElementById('wheelSizeValue').textContent = event.target.value;
    drawWheel();
});

document.getElementById('innerCircleSizeSlider').addEventListener('input', (event) => {
    document.getElementById('innerCircleSizeValue').textContent = event.target.value;
    drawWheel();
});

document.getElementById('fontSelect').addEventListener('change', drawWheel);
document.getElementById('fontSize').addEventListener('input', drawWheel);
document.getElementById('fontBold').addEventListener('change', drawWheel);

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('winnerModal').style.display = 'none';
});

document.getElementById('removeWinnerButton').addEventListener('click', () => {
    const winnerText = document.getElementById('winnerText').textContent;
    const winnerName = winnerText.replace('Winner: ', '').replace('Eliminated: ', '');
    const index = names.indexOf(winnerName);
    if (index !== -1) {
        names.splice(index, 1);
        arc = Math.PI / (names.length / 2); // Recalculate arc
        drawWheel();
    }
    document.getElementById('winnerModal').style.display = 'none';
});

document.getElementById('keepWinnerButton').addEventListener('click', () => {
    document.getElementById('winnerModal').style.display = 'none';
});

document.getElementById('twitchLeaveButton').addEventListener('click', () => {
    if (twitchClient) {
        twitchClient.part(twitchChannel)
            .then(() => {
                console.log(`Left Twitch channel: ${twitchChannel}`);
                twitchClient = null;
                twitchParticipants.clear();  // Reset participants
            })
            .catch(console.error);
    }
});


// Twitch Integration Toggle
document.getElementById('twitchToggle').addEventListener('change', (event) => {
    const twitchFields = document.getElementById('twitchFields');
    if (event.target.checked) {
        twitchFields.style.display = 'block';
    } else {
        twitchFields.style.display = 'none';
    }
});

function spinWheel() {
    const duration = parseInt(document.getElementById('durationSlider').value, 10) * 1000;
    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = duration;
    rotateWheel();
}

function drawWheel() {
    console.log(`🖌️ Drawing wheel with participants: ${names.join(', ')}`);

    const outsideRadius = parseInt(document.getElementById('wheelSizeSlider').value, 10);
    const textRadius = outsideRadius - 40;
    const insideRadius = parseInt(document.getElementById('innerCircleSizeSlider').value, 10);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw middle image if available
    if (middleImage) {
        ctx.save();
        ctx.translate(250, 250);
        const size = (canvas.width * imageSize) / 100;
        ctx.drawImage(middleImage, -size / 2, -size / 2, size, size);
        ctx.restore();
        console.log('🖼️ Middle image drawn on the wheel.');
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    for (let i = 0; i < names.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = getColor(i, names.length);

        ctx.beginPath();
        ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
        ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
        ctx.stroke();
        ctx.fill();
        
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 250 + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = names[i];
        const fontSize = document.getElementById('fontSize').value;
        const fontBold = document.getElementById('fontBold').checked ? 'bold' : 'normal';
        const font = document.getElementById('fontSelect').value;
        ctx.font = `${fontBold} ${fontSize}px ${font}`;
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
        
        console.log(`🔠 Added "${text}" to the wheel segment.`);
        }

    // Draw arrow pointing down
    const arrowX = canvas.width / 2 - 50; // Move the arrow 50 pixels to the left
    const arrowY = 30; // Increase this value to move the arrow down
    const arrowSize = 20;
    
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY + arrowSize); // Starting point (bottom of the arrow)
    ctx.lineTo(arrowX - arrowSize, arrowY); // Top-left point of the arrow
    ctx.lineTo(arrowX + arrowSize, arrowY); // Top-right point of the arrow
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();
    
    console.log('➡️ Arrow drawn on the wheel.');
}



function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawWheel();
    spinTimeout = setTimeout(rotateWheel, 30);
}

function stopRotateWheel() {
    clearTimeout(spinTimeout);
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    ctx.save();
    ctx.font = 'bold 30px Arial';
    const text = names[index];
    const termination = document.getElementById('terminationToggle').checked;
    if (termination) {
        names.splice(index, 1);
        arc = Math.PI / (names.length / 2); // Recalculate arc
        if (names.length === 1) {
            document.getElementById('winnerText').textContent = `Winner: ${names[0]}`;
        } else {
            document.getElementById('winnerText').textContent = `Eliminated: ${text}`;
        }
        drawWheel();
    } else {
        document.getElementById('winnerText').textContent = `Winner: ${text}`;
    }
    document.getElementById('winnerModal').style.display = 'block';
    ctx.restore();
}

function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
}

function getColor(item, maxitem) {
    const phase = 0;
    const center = 128;
    const width = 127;
    const frequency = Math.PI * 2 / maxitem;

    const red = Math.sin(frequency * item + 2 + phase) * width + center;
    const green = Math.sin(frequency * item + 0 + phase) * width + center;
    const blue = Math.sin(frequency * item + 4 + phase) * width + center;

    return `rgb(${Math.round(red)},${Math.round(green)},${Math.round(blue)})`;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function checkTwitchAuth() {
    try {
        const response = await fetch('/api/twitch/user', { cache: 'no-store' });
        const data = await response.json();

        if (data.username && data.token) {
            document.getElementById('loggedInUser').textContent = `Logged in as: ${data.username}`;
            twitchChannel = data.username;
            document.getElementById('twitchLoginContainer').style.display = 'none';
            document.getElementById('twitchCommandContainer').style.display = 'block';
            connectTwitchBot(data.token);
        } else {
            console.log('User not authenticated');
        }
    } catch (error) {
        console.error('Error fetching Twitch user data:', error);
    }
}


async function connectTwitchBot(oauthToken) {
    if (!oauthToken) {
        console.error('❌ No OAuth token available.');
        return;
    }

    twitchClient = new tmi.Client({
        options: { debug: true },
        connection: { reconnect: true, secure: true },
        identity: {
            username: 'buttonpicker',  // Bot's username
            password: `oauth:${oauthToken}`
        },
        channels: [twitchChannel]
    });

    twitchClient.connect()
        .then(() => console.log(`✅ Connected to Twitch channel: ${twitchChannel}`))
        .catch(err => console.error(`❌ Failed to connect:`, err));
}

// 🟢 Trigger the auth check when the page loads
window.onload = checkTwitchAuth;

// Existing event listeners and functions below...
document.getElementById('spinButton').addEventListener('click', () => {
    spinWheel();
});