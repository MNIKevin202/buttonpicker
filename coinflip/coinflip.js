let headsCount = 0;
let tailsCount = 0;
let flipCount = 0;

document.getElementById("flipButton").addEventListener("click", () => {
    const coin = document.getElementById("coin");
    const historyList = document.getElementById("historyList");
    const duration = parseInt(document.getElementById("durationDropdown").value, 10);
    const bestOfThree = document.getElementById("bestOfThreeToggle").checked;
    const winnerDisplay = document.getElementById("winnerDisplay");

    // Add the flipping class to start the animation
    coin.classList.add("flipping");

    // Alternate between heads and tails during the flip
    let flipIntervalCount = 0;
    const flipInterval = setInterval(() => {
        coin.src = flipIntervalCount % 2 === 0 ? "heads.png" : "tails.png";
        flipIntervalCount++;
    }, 100); // Adjust the interval to match the animation speed

    // Randomly choose heads or tails after a delay
    setTimeout(() => {
        clearInterval(flipInterval);

        const isHeads = Math.random() < 0.5;
        const result = isHeads ? "heads" : "tails";

        // Remove the flipping class to stop the animation
        coin.classList.remove("flipping");

        // Update the coin image with the final result
        setTimeout(() => {
            coin.src = `${result}.png`;
            coin.alt = result.charAt(0).toUpperCase() + result.slice(1);

            // Add the result to the history list
            const listItem = document.createElement("li");
            listItem.textContent = result.charAt(0).toUpperCase() + result.slice(1);
            historyList.appendChild(listItem);

            // Update counts
            if (isHeads) {
                headsCount++;
            } else {
                tailsCount++;
            }

            flipCount++;

            // Check for best 2 out of 3
            if (bestOfThree) {
                if (headsCount === 2 || tailsCount === 2) {
                    let winner = headsCount === 2 ? "Heads" : "Tails";
                    winnerDisplay.textContent = `Winner: ${winner}`;
                    // Reset counts for the next round
                    headsCount = 0;
                    tailsCount = 0;
                    flipCount = 0;
                }
            } else {
                winnerDisplay.textContent = "";
            }

        }, 100); // Small delay to ensure the final image is set after the animation stops
    }, duration); // Use the selected duration
});