const passwordInput = document.getElementById("password");
const passwordRules = document.getElementById("password-rules");

passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    // Define your password rules here
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password);

    let errorMessage = [];

    if (password.length < minLength) {
        errorMessage.push("Password must be at least 8 characters long.");
    }
    if (!hasUpperCase) {
        errorMessage.push("Password must contain at least one uppercase letter.");
    }
    if (!hasLowerCase) {
        errorMessage.push("Password must contain at least one lowercase letter.");
    }
    if (!hasNumbers) {
        errorMessage.push("Password must contain at least one number.");
    }
    if (!hasSpecialChars) {
        errorMessage.push("Password must contain at least one special character.");
        errorMessage.push("! @ # $  % ^ & * ( ) _ + { } [ ] : ; < > , . ? ~ \\ -");
    }

    passwordRules.innerHTML = errorMessage.map((message) => `<p class="password-rules-text">${message}</p>`).join("");
});

// Get references to the dropdown and the checkbox container
const roleSelect = document.getElementById("role-select");
const roomSelector = document.getElementById("room-selector");

// Add an event listener to the dropdown
roleSelect.addEventListener("change", () => {
    // Show the checkbox container if "Room Attendant" is selected
    if (roleSelect.value === "room_attendant") {
        roomSelector.style.display = "block";
    } else {
        roomSelector.style.display = "none";
    }
});

// Function to fetch rooms from the API and add checkboxes
async function fetchRooms() {
    try {
        const response = await fetch("/api/getAllRooms");
        const rooms = await response.json();

        const checkboxContainer = document.getElementById("checkbox-container");

        // Clear any existing checkboxes
        checkboxContainer.innerHTML = "";

        // Add a checkbox for each room
        // Create containers for left and right columns
        const leftColumn = document.createElement("div");
        const rightColumn = document.createElement("div");

        leftColumn.style.display = "flex";
        leftColumn.style.flexDirection = "column";
        leftColumn.style.gap = "10px";

        rightColumn.style.display = "flex";
        rightColumn.style.flexDirection = "column";
        rightColumn.style.gap = "10px";

        rooms.forEach((room) => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `room-${room.room_id}`;
            checkbox.name = "rooms";
            checkbox.value = room.room_id;

            const label = document.createElement("label");
            label.htmlFor = `room-${room.room_id}`;
            label.textContent = room.room_name;

            const div = document.createElement("div");
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.justifyContent = "flex-start";
            div.style.gap = "5px"; // Small space between label and checkbox

            div.appendChild(label);
            div.appendChild(checkbox);

            // Append to the appropriate column based on room name
            if (room.room_name.startsWith("A")) {
                leftColumn.appendChild(div);
            } else if (room.room_name.startsWith("B")) {
                rightColumn.appendChild(div);
            }
        });

        // Append columns to the checkbox container
        checkboxContainer.appendChild(leftColumn);
        checkboxContainer.appendChild(rightColumn);
    } catch (error) {
        console.error("Error fetching rooms:", error);
    }
}

// Fetch rooms when the page loads
document.addEventListener("DOMContentLoaded", fetchRooms);
