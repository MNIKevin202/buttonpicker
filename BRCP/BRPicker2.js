const { ipcRenderer } = require('electron');

let themes = [];
let rounds = [];
let modifiers = [];
let prizes = [];

function loadPickerData() {
    fetch('pickerData.json')
        .then(response => response.json())
        .then(data => {
            themes = data.themes;
            rounds = data.rounds;
            modifiers = data.modifiers;
            prizes = data.prizes;
            updateUI();
        })
        .catch(error => console.error('Error loading picker data:', error));
}

function updateUI() {
    if (lastOpenedPicker) {
        toggleMenu(lastOpenedPicker.title, lastOpenedPicker.pickerType);
    }
}

loadPickerData();

let lastOpenedPicker = null;
let selectedTheme = "None";
let selectedRound = "None";
let selectedModifier = "None";
let selectedPrize = "None";

// Open/Close Sliding Menu
function toggleMenu(title, pickerType) {
    const menu = document.getElementById("slidingMenu");

    let options = [];
    if (pickerType === "theme") {
        options = themes;
    } else if (pickerType === "round") {
        options = rounds;
    } else if (pickerType === "modifier") {
        options = modifiers;
    } else if (pickerType === "prize") {
        options = prizes;
    }

    if (lastOpenedPicker && lastOpenedPicker.pickerType === pickerType) {
        menu.classList.toggle("hidden");
        return;
    }

    document.getElementById("menuTitle").textContent = title;
    const menuOptions = document.getElementById("menuOptions");
    menuOptions.innerHTML = "";
    options.forEach(option => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = option;
        btn.onclick = () => addToMain(option, pickerType);
        menuOptions.appendChild(btn);
    });

    // Add "Add All" button
    const addAllBtn = document.createElement("button");
    addAllBtn.className = "option-btn";
    addAllBtn.textContent = "Add All";
    addAllBtn.onclick = () => {
        options.forEach(option => addToMain(option, pickerType, false));  // Pass 'false' to skip sidebar updates
        updateDetails("Multiple Items Added", pickerType);  // Update sidebar once
    };
    
    menuOptions.appendChild(addAllBtn);

    clearMainButtons();
    menu.classList.remove("hidden");
    lastOpenedPicker = { title, pickerType };
}

// Add Entry to Main Grid and Update Sidebar
function addToMain(text, pickerType, updateSidebar = true) {
    const btn = document.createElement("button");
    btn.className = "entry-btn";
    btn.textContent = text;
    document.getElementById("buttonContainer").appendChild(btn);

    // Only update the sidebar if 'updateSidebar' is true
    if (updateSidebar) {
        if (pickerType === "theme") {
            selectedTheme = text;
        } else if (pickerType === "round") {
            selectedRound = text;
        } else if (pickerType === "modifier") {
            selectedModifier = text;
        } else if (pickerType === "prize") {
            selectedPrize = text;
        }

        updateBrowserSource();
    }
}

// Clear Main Grid
function clearMainButtons() {
    document.getElementById("buttonContainer").innerHTML = "";
}

// Shuffle Buttons
function shuffleButtons() {
    const container = document.getElementById("buttonContainer");
    const buttons = Array.from(container.children);
    buttons.sort(() => Math.random() - 0.5).forEach(btn => container.appendChild(btn));
}

// Start Highlight Animation
function startHighlightAnimation() {
    const duration = parseInt(document.getElementById("durationDropdown").value) * 1000;
    const buttons = document.querySelectorAll(".entry-btn");

    if (buttons.length === 0) {
        alert("Add entries before starting!");
        return;
    }

    // Clear all highlights before starting
    buttons.forEach(btn => btn.classList.remove("highlight", "winner"));

    let interval = setInterval(() => {
        buttons.forEach(btn => btn.classList.remove("highlight"));  // Remove all highlights during the animation

        const randomBtn = buttons[Math.floor(Math.random() * buttons.length)];
        randomBtn.classList.add("highlight");
    }, 100);

    setTimeout(() => {
        clearInterval(interval);

        // Ensure all highlights are removed before selecting the winner
        buttons.forEach(btn => btn.classList.remove("highlight", "winner"));

        // Select and highlight the winner
        const winner = buttons[Math.floor(Math.random() * buttons.length)];
        winner.classList.add("winner");

        // Update sidebar with the correct picker type
        updateDetails(winner.textContent, lastOpenedPicker.pickerType);

        // Show celebratory message in browser source
        showCelebratoryMessage(winner.textContent);
    }, duration);
}

// Update Sidebar with Current Selections
function updateDetails(selected, pickerType) {
    if (pickerType === "theme") {
        selectedTheme = selected;
    } else if (pickerType === "round") {
        selectedRound = selected;
    } else if (pickerType === "modifier") {
        selectedModifier = selected;
    } else if (pickerType === "prize") {
        selectedPrize = selected;
    }

    // Update the sidebar display
    document.getElementById("selectedTheme").textContent = `Server: ${selectedTheme}`;
    document.getElementById("selectedRound").textContent = `Type: ${selectedRound}`;
    document.getElementById("selectedModifier").textContent = `Modifier: ${selectedModifier}`;
    document.getElementById("selectedPrize").textContent = `Prize: ${selectedPrize}`;

    // Update browser source
    updateBrowserSource();
}

// Reset Sidebar Details
function resetDetails() {
    selectedTheme = "None";
    selectedRound = "None";
    selectedModifier = "None";
    selectedPrize = "None";
    updateDetails();  // Reflect the reset in the sidebar
}

// Update Browser Source
function updateBrowserSource() {
    const iframe = document.getElementById("browserSourceIframe");
    if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const buttonContainer = iframeDoc.getElementById("buttonContainer");
        buttonContainer.innerHTML = document.getElementById("buttonContainer").innerHTML;

        const selectedThemeElem = iframeDoc.getElementById("selectedTheme");
        const selectedRoundElem = iframeDoc.getElementById("selectedRound");
        const selectedModifierElem = iframeDoc.getElementById("selectedModifier");
        const selectedPrizeElem = iframeDoc.getElementById("selectedPrize");

        selectedThemeElem.textContent = `Server: ${selectedTheme}`;
        selectedRoundElem.textContent = `Type: ${selectedRound}`;
        selectedModifierElem.textContent = `Modifier: ${selectedModifier}`;
        selectedPrizeElem.textContent = `Prize: ${selectedPrize}`;
    }
}

// Show Celebratory Message
function showCelebratoryMessage(winnerText) {
    const iframe = document.getElementById("browserSourceIframe");
    if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const messageElem = iframeDoc.createElement("div");
        messageElem.className = "celebratory-message";
        messageElem.textContent = `Congratulations! ${winnerText} won!`;
        iframeDoc.body.appendChild(messageElem);

        setTimeout(() => {
            messageElem.remove();
        }, 5000);
    }
}

// Event Listeners
document.getElementById("themePickerBtn").onclick = () => toggleMenu("Server Picker", "theme");
document.getElementById("roundPickerBtn").onclick = () => toggleMenu("Type Picker", "round");
document.getElementById("modifierPickerBtn").onclick = () => toggleMenu("Modifier Picker", "modifier");
document.getElementById("prizePickerBtn").onclick = () => toggleMenu("Prize Picker", "prize");
document.getElementById("closeMenu").onclick = () => document.getElementById("slidingMenu").classList.add("hidden");
document.getElementById("shuffleButton").onclick = shuffleButtons;
document.getElementById("startButton").onclick = startHighlightAnimation;
document.getElementById("resetButton").onclick = resetDetails;
document.getElementById("addCustomEntries").onclick = () => {
    const input = document.getElementById("customInput").value.split("\n").filter(line => line.trim() !== "");
    input.forEach(entry => addToMain(entry, lastOpenedPicker.pickerType));
    document.getElementById("customInput").value = "";
};

// Resizing functionality
document.addEventListener('DOMContentLoaded', () => {
    const leftSidebar = document.querySelector('.sidebar-left');
    const rightSidebar = document.querySelector('.sidebar-right');
    const sizerHandleLeft = document.querySelector('.sizer-handle-left');
    const sizerHandleRight = document.querySelector('.sizer-handle-right');

    let isResizingLeft = false;
    let isResizingRight = false;

    sizerHandleLeft.addEventListener('mousedown', (e) => {
        isResizingLeft = true;
        document.addEventListener('mousemove', resizeLeft);
        document.addEventListener('mouseup', stopResizeLeft);
    });

    sizerHandleRight.addEventListener('mousedown', (e) => {
        isResizingRight = true;
        document.addEventListener('mousemove', resizeRight);
        document.addEventListener('mouseup', stopResizeRight);
    });

    function resizeLeft(e) {
        if (isResizingLeft) {
            const newWidth = e.clientX - leftSidebar.getBoundingClientRect().left;
            if (newWidth >= 150 && newWidth <= 300) {
                leftSidebar.style.width = newWidth + 'px';
            }
        }
    }

    function stopResizeLeft() {
        isResizingLeft = false;
        document.removeEventListener('mousemove', resizeLeft);
        document.removeEventListener('mouseup', stopResizeLeft);
    }

    function resizeRight(e) {
        if (isResizingRight) {
            const newWidth = rightSidebar.getBoundingClientRect().right - e.clientX;
            if (newWidth >= 150 && newWidth <= 300) {
                rightSidebar.style.width = newWidth + 'px';
            }
        }
    }

    function stopResizeRight() {
        isResizingRight = false;
        document.removeEventListener('mousemove', resizeRight);
        document.removeEventListener('mouseup', stopResizeRight);
    }
});

// Listen for preferences-updated message
ipcRenderer.on('preferences-updated', () => {
    loadPickerData();
});