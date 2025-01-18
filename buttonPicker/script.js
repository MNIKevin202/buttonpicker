// Global sound toggle variable
let soundToggle = false;

// Load both click sounds
const clickSound1 = new Audio("click1.mp3");
const clickSound2 = new Audio("click2.mp3");

// Function to alternate sounds
let toggleSound = true;
function playAlternateClickSound() {
    if (toggleSound) {
        clickSound1.pause();
        clickSound1.currentTime = 0;
        clickSound1.play().catch(error => console.error("Audio play error:", error));
    } else {
        clickSound2.pause();
        clickSound2.currentTime = 0;
        clickSound2.play().catch(error => console.error("Audio play error:", error));
    }
    toggleSound = !toggleSound;
}

// Function to update participant count and resize buttons
function updateParticipantCount() {
    const buttons = document.querySelectorAll(".participant-button");
    const participantCount = buttons.length;
    document.getElementById("participantCount").textContent = `Participants: ${participantCount}`;

    // Adjust button size if participants exceed 100
    if (participantCount > 99) {
        buttons.forEach(button => {
            button.style.padding = "4px 8px";
            button.style.fontSize = "12px";
        });
    } else {
        buttons.forEach(button => {
            button.style.padding = "8px 16px";
            button.style.fontSize = "14px";
        });
    }
}

// Generate participant buttons
document.getElementById("generateButtons").addEventListener("click", () => {
    const nameInput = document.getElementById("nameInput").value.trim();
    const buttonContainer = document.getElementById("buttonContainer");
    const names = nameInput.split("\n").filter(name => name.trim() !== "");

    buttonContainer.innerHTML = "";

    names.forEach(name => {
        const button = document.createElement("button");
        button.classList.add("participant-button");
        button.textContent = name;
        buttonContainer.appendChild(button);
    });

    updateParticipantCount();
});

// Shuffle participant buttons
document.getElementById("shuffleButton").addEventListener("click", () => {
    shuffleButtons();
    updateParticipantCount();
});

// Shuffle Buttons Function
function shuffleButtons() {
    const buttonContainer = document.getElementById("buttonContainer");
    const buttons = Array.from(document.querySelectorAll(".participant-button"));
    const shuffledButtons = buttons.sort(() => Math.random() - 0.5);

    buttonContainer.innerHTML = "";
    shuffledButtons.forEach(button => buttonContainer.appendChild(button));
    updateParticipantCount();
}

// Show or hide the "Keep Winner" button based on Termination Mode
function updateWinnerModal() {
    const terminationMode = document.getElementById("terminationMode").checked;
    const keepWinnerButton = document.getElementById("keepWinnerButton");

    if (terminationMode) {
        keepWinnerButton.style.display = "none";
    } else {
        keepWinnerButton.style.display = "inline-block";
    }
}

// Listen for changes to Termination Mode
document.getElementById("terminationMode").addEventListener("change", updateWinnerModal);

function updateEliminatedList(name) {
    const eliminatedList = document.getElementById("eliminatedList");
    const listItem = document.createElement("li");
    listItem.textContent = name;
    eliminatedList.appendChild(listItem);
}

// Start the winner selection process
document.getElementById("startButton").addEventListener("click", () => {
    const buttons = document.querySelectorAll(".participant-button");
    const timerDuration = parseInt(document.getElementById("timerDropdown").value, 10);
    const animationMode = document.getElementById("animationMode").value;
    const shuffleAfterSpin = document.getElementById("shuffleAfterSpin").checked;
    const terminationMode = document.getElementById("terminationMode").checked;
    const soundEnabled = soundToggle && document.getElementById("soundToggle").checked;
    const countdownDisplay = document.getElementById("countdownDisplay");

    if (terminationMode) {
        document.getElementById("eliminatedSidebar").classList.remove("hidden");
    } else {
        document.getElementById("eliminatedSidebar").classList.add("hidden");
    }
    
    if (buttons.length === 0) {
        alert("Please generate buttons before starting.");
        return;
    }

    let timeLeft = timerDuration;
    countdownDisplay.textContent = `Time Remaining: ${timeLeft}s`;

    let currentIndex = 0;

    // Countdown timer
    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = `Time Remaining: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);

    // Dynamic highlighting speed adjustment
    let interval;
    function adjustSpeed() {
        let speed;

        if (timeLeft > timerDuration * 0.5) {
            speed = 100;
        } else if (timeLeft > timerDuration * 0.2) {
            speed = 200;
        } else {
            speed = 400;
        }

        clearInterval(interval);
        interval = setInterval(() => {
            buttons.forEach(button => button.classList.remove("active"));

            let targetButton;
            if (animationMode === "random") {
                const randomIndex = Math.floor(Math.random() * buttons.length);
                targetButton = buttons[randomIndex];
            } else {
                targetButton = buttons[currentIndex];
                currentIndex = (currentIndex + 1) % buttons.length;
            }

            targetButton.classList.add("active");

            if (soundEnabled) {
                playAlternateClickSound();
            }
        }, speed);
    }

    adjustSpeed();

    const speedAdjustmentInterval = setInterval(() => {
        adjustSpeed();
        if (timeLeft <= 0) {
            clearInterval(speedAdjustmentInterval);
        }
    }, 1000);

    // Stop the animation and announce the winner
    setTimeout(() => {
        clearInterval(interval);
        clearInterval(countdownInterval);
        countdownDisplay.textContent = "";

        const highlightedButton = document.querySelector(".participant-button.active");
        const winnerName = highlightedButton.textContent;

        if (terminationMode && buttons.length > 1) {
            document.getElementById("winnerText").textContent = `❌ Better luck next time, ${winnerName}! ❌`;
            updateEliminatedList(winnerName);
        } else {
            document.getElementById("winnerText").textContent = `🎉 Congratulations, ${winnerName}! 🎉`;
        }
        document.getElementById("winnerModal").style.display = "block";

        updateWinnerModal();

        // Corrected remove functionality
        document.getElementById("removeWinnerButton").onclick = () => {
            if (terminationMode || highlightedButton) {
                highlightedButton.remove();
                updateParticipantCount();
        
                // Remove the eliminated participant from the textarea
                const nameInput = document.getElementById("nameInput");
                nameInput.value = nameInput.value
                    .split("\n")
                    .filter(name => name !== highlightedButton.textContent)
                    .join("\n");
            }
            document.getElementById("winnerModal").style.display = "none";
        
            if (shuffleAfterSpin) {
                shuffleButtons();
            }
        
            // 🔥 Continue Auto Draw After Removing a Winner
            continueAutoDraw();
        };

        document.getElementById("keepWinnerButton").onclick = () => {
            document.getElementById("winnerModal").style.display = "none";
        
            if (shuffleAfterSpin) {
                shuffleButtons();
            }
        
            // 🔥 Continue Auto Draw After Keeping a Winner
            continueAutoDraw();
        };

    }, timerDuration * 1000);
});

// Toggle the visibility of the settings panel
document.getElementById("toggleSettingsButton").addEventListener("click", () => {
    const settingsPanel = document.getElementById("settingsPanel");
    const toggleButton = document.getElementById("toggleSettingsButton");

    if (settingsPanel.classList.contains("hidden")) {
        settingsPanel.classList.remove("hidden");
        toggleButton.textContent = "Hide Settings ▲";
    } else {
        settingsPanel.classList.add("hidden");
        toggleButton.textContent = "Show Settings ▼";
    }
});

// Collapse/Expand Settings Panel
document.getElementById("collapseSettingsButton").addEventListener("click", () => {
    const settingsPanel = document.getElementById("settingsPanel");
    const collapseButton = document.getElementById("collapseSettingsButton");

    if (settingsPanel.classList.contains("hidden")) {
        settingsPanel.classList.remove("hidden");
        collapseButton.textContent = "▲";
    } else {
        settingsPanel.classList.add("hidden");
        collapseButton.textContent = "▼";
    }
});

let autoDrawsRemaining = 0;

function startDraw() {
    const buttons = document.querySelectorAll(".participant-button");
    const timerDuration = parseInt(document.getElementById("timerDropdown").value, 10);
    const animationMode = document.getElementById("animationMode").value;
    const shuffleAfterSpin = document.getElementById("shuffleAfterSpin").checked;
    const terminationMode = document.getElementById("terminationMode").checked;
    const soundEnabled = soundToggle && document.getElementById("soundToggle").checked;

    if (buttons.length === 0) {
        alert("Please generate buttons before starting.");
        return;
    }

    let currentIndex = 0;

    // Dynamic highlighting
    const highlightInterval = setInterval(() => {
        buttons.forEach(button => button.classList.remove("active"));

        let targetButton;
        if (animationMode === "random") {
            const randomIndex = Math.floor(Math.random() * buttons.length);
            targetButton = buttons[randomIndex];
        } else {
            targetButton = buttons[currentIndex];
            currentIndex = (currentIndex + 1) % buttons.length;
        }

        targetButton.classList.add("active");
    }, 100);

    // Stop after timer ends
    setTimeout(() => {
        clearInterval(highlightInterval);
        const winnerButton = document.querySelector(".participant-button.active");
        const winnerName = winnerButton.textContent;

        document.getElementById("winnerText").textContent = `🎉 Winner: ${winnerName} 🎉`;
        document.getElementById("winnerModal").style.display = "block";

        // Handle winner removal or keeping
        document.getElementById("removeWinnerButton").onclick = () => {
            winnerButton.remove();
            continueAutoDraw();
            document.getElementById("winnerModal").style.display = "none";
        };

        document.getElementById("keepWinnerButton").onclick = () => {
            continueAutoDraw();
            document.getElementById("winnerModal").style.display = "none";
        };

    }, timerDuration * 1000);
}

// Continue Auto Draw if enabled
function continueAutoDraw() {
    if (autoDrawsRemaining > 0) {
        autoDrawsRemaining--;
        setTimeout(() => {
            startDraw();
        }, 1000);
    }
}

// Start Button Logic
document.getElementById("startButton").addEventListener("click", () => {
    autoDrawsRemaining = parseInt(document.getElementById("autoDrawCount").value, 10);
    startDraw();
});

// Close the modal when clicking the close button
document.getElementById("closeModal").onclick = function () {
    document.getElementById("winnerModal").style.display = "none";
};

// Close the modal when clicking outside of it
window.onclick = function (event) {
    const modal = document.getElementById("winnerModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Disable sound toggle if soundToggle is false
if (!soundToggle) {
    const soundToggleCheckbox = document.getElementById("soundToggle");
    soundToggleCheckbox.disabled = true;
    soundToggleCheckbox.title = "This will be available in a future update.";
}