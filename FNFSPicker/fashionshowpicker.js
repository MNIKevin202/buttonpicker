let themes = [];
let rounds = [];
let modifiers = [];

// Load Picker Data via API
function loadPickerData() {
    fetch('/api/picker-data/FNFSPicker')
        .then(response => response.json())
        .then(data => {
            themes = data.themes || [];
            rounds = data.rounds || [];
            modifiers = data.modifiers || [];
            updateUI();
        })
        .catch(error => console.error('Error loading picker data:', error));
}

// Refresh UI when data is updated
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

// Open/Close Sliding Menu with Correct Data
function toggleMenu(title, pickerType) {
    const menu = document.getElementById("slidingMenu");

    let options = [];
    if (pickerType === "theme") {
        options = themes;
    } else if (pickerType === "round") {
        options = rounds;
    } else if (pickerType === "modifier") {
        options = modifiers;
    }

    if (lastOpenedPicker === pickerType) {
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

    clearMainButtons();
    menu.classList.remove("hidden");
    lastOpenedPicker = pickerType;
}

// Add Entry to Main Grid and Update Sidebar
function addToMain(text, pickerType) {
    const btn = document.createElement("button");
    btn.className = "entry-btn";
    btn.textContent = text;
    document.getElementById("buttonContainer").appendChild(btn);

    // Update selection based on picker type
    if (pickerType === "theme") {
        selectedTheme = text;
    } else if (pickerType === "round") {
        selectedRound = text;
    } else if (pickerType === "modifier") {
        selectedModifier = text;
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

    buttons.forEach(btn => btn.classList.remove("highlight", "winner"));

    let interval = setInterval(() => {
        buttons.forEach(btn => btn.classList.remove("highlight"));
        const randomBtn = buttons[Math.floor(Math.random() * buttons.length)];
        randomBtn.classList.add("highlight");
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        buttons.forEach(btn => btn.classList.remove("highlight", "winner"));

        const winner = buttons[Math.floor(Math.random() * buttons.length)];
        winner.classList.add("winner");

        updateDetails(winner.textContent, lastOpenedPicker);
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
    }

    document.getElementById("selectedTheme").textContent = `Theme: ${selectedTheme}`;
    document.getElementById("selectedRound").textContent = `Round: ${selectedRound}`;
    document.getElementById("selectedModifier").textContent = `Modifier: ${selectedModifier}`;
}

// Reset Sidebar Details
function resetDetails() {
    selectedTheme = "None";
    selectedRound = "None";
    selectedModifier = "None";
    updateDetails();
}

// Event Listeners
document.getElementById("themePickerBtn").onclick = () => toggleMenu("Theme Picker", "theme");
document.getElementById("roundPickerBtn").onclick = () => toggleMenu("Round Picker", "round");
document.getElementById("modifierPickerBtn").onclick = () => toggleMenu("Modifier Picker", "modifier");
document.getElementById("closeMenu").onclick = () => document.getElementById("slidingMenu").classList.add("hidden");
document.getElementById("shuffleButton").onclick = shuffleButtons;
document.getElementById("startButton").onclick = startHighlightAnimation;
document.getElementById("resetButton").onclick = resetDetails;

document.getElementById("addCustomEntries").onclick = () => {
    const input = document.getElementById("customInput").value.split("\n").filter(line => line.trim() !== "");
    input.forEach(entry => addToMain(entry, lastOpenedPicker));
    document.getElementById("customInput").value = "";
};

// Listen for preferences-updated to reload data
// Listen for preferences-updated message (web version - no action needed)
// Data will be reloaded when the page is refreshed
