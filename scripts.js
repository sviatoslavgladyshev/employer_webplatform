const apiKey = CONFIG.OPENAI_API_KEY;


document.getElementById("challengeForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("challengeTitle").value;
    const type = document.getElementById("challengeType").value;
    const goal = document.getElementById("challengeGoal").value;

    const challengeList = document.getElementById("userChallenges");
    const challengeItem = document.createElement("div");
    challengeItem.className = "challenge-item";

    if (type === "employer") {
        try {
            const milestones = await getMilestonesFromGPT(goal);
            challengeItem.innerHTML = `
                <h3>${title}</h3>
                <p>Type: ${type}</p>
                <p>${goal}</p>
                <h4>Milestone Plan:</h4>
                <ul id="milestonesList">
                    ${milestones.map(m => `<li>${m}</li>`).join('')}
                </ul>
                <button onclick="completeChallenge(this)">Mark as Completed</button>
            `;
        } catch (error) {
            console.error("Error generating milestones:", error);
            challengeItem.innerHTML = `
                <h3>${title}</h3>
                <p>Type: ${type}</p>
                <p>${goal}</p>
                <h4>Milestone Plan:</h4>
                <p>Could not generate milestones. Please try again later.</p>
                <button onclick="completeChallenge(this)">Mark as Completed</button>
            `;
        }
    } else {
        challengeItem.innerHTML = `
            <h3>${title}</h3>
            <p>Type: ${type}</p>
            <p>${goal}</p>
            <button onclick="completeChallenge(this)">Mark as Completed</button>
        `;
    }

    challengeList.appendChild(challengeItem);
    alert("Challenge created!");
    this.reset();
});

async function getMilestonesFromGPT(goal) {
    const prompt = `Break down the following big goal into 5 clear milestones: "${goal}".`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Use a supported model
                messages: [
                    { role: "system", content: "You are an assistant that creates milestone plans." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 200,
                temperature: 0.7,
            }),
        });

        const result = await response.json();
        console.log("GPT API Response:", result);

        // Ensure response contains messages
        if (!result.choices || result.choices.length === 0) {
            throw new Error("Invalid GPT response: No choices available.");
        }

        const milestonesText = result.choices[0].message.content.trim();
        return milestonesText.split("\n").filter(line => line.length > 0);
    } catch (error) {
        console.error("Error in getMilestonesFromGPT:", error);
        throw new Error("Unable to fetch milestones. Check your API key or network connection.");
    }
}

function completeChallenge(button) {
    const challengeItem = button.parentElement;
    challengeItem.remove();
    addToLeaderboard("Top Performer", "Challenge Completed!");
}

function addToLeaderboard(name, reason) {
    const leaderboard = document.getElementById("leaderboardList");
    const entry = document.createElement("li");
    entry.innerHTML = `<strong>${name}</strong>: ${reason}`;
    leaderboard.appendChild(entry);
}