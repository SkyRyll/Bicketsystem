const modal = document.getElementById("ticketModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// Open modal
openModalBtn.onclick = function () {
    modal.style.display = "block";
    loadRooms(); // Fetch rooms and populate checkboxes
};

// Close modal
closeModalBtn.onclick = function () {
    modal.style.display = "none";
};

// Close modal when clicking outside the modal content
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Function to fetch rooms from the backend (via AJAX or Fetch)
function loadRooms() {
    fetch("/api/getAllRooms")
        .then((response) => response.json())
        .then((rooms) => {
            const roomSelectorDiv = document.getElementById("roomSelector");
            roomSelectorDiv.innerHTML = ""; // Clear previous radios

            rooms.forEach((room) => {
                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "rooms";
                radio.value = room.room_id;

                const label = document.createElement("label");
                label.innerText = room.room_name;
                label.appendChild(radio);

                // Append each label into a container
                const roomItemDiv = document.createElement("div");
                roomItemDiv.classList.add("room-item");
                roomItemDiv.appendChild(label);

                roomSelectorDiv.appendChild(roomItemDiv);
            });
        })
        .catch((error) => console.error("Error fetching rooms:", error));
}
// Handle form submission
const ticketForm = document.getElementById("ticketForm");
ticketForm.onsubmit = async function (event) {
    event.preventDefault();

    const ticketTitle = document.getElementById("ticketTitle").value;
    const ticketDescription = document.getElementById("ticketDescription").value;
    const selectedRoom = document.querySelector('input[name="rooms"]:checked').value;

    try {
        // Wait for userID to be fetched
        const userResponse = await fetch("/api/getSessionUser");
        const userData = await userResponse.json();
        const userID = userData.userID;

        // Prepare data to send to the backend
        const formData = {
            ticketTitle: ticketTitle,
            ticketDescription: ticketDescription,
            roomId: selectedRoom,
            userID: userID,
        };

        // Send data to the backend
        const ticketResponse = await fetch("/api/createTicket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const ticketData = await ticketResponse.json();
        console.log("Ticket created:", ticketData);

        // Close the modal and reset the form
        if (ticketResponse.ok) {
            modal.style.display = "none";
            ticketForm.reset();
            alert("Ticket created successfully!");
            fetchTickets();
        } else {
            alert("Failed to create ticket. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let allTickets = []; // Array to hold all tickets

// Function to fetch tickets from the API
function fetchTickets() {
    const apiUrl = "http://localhost:3000/api/getTicketsByUserID";

    // Fetch request to the API
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            allTickets = data; // Save all tickets in a global array
            displayTickets(allTickets); // Display all tickets initially
        })
        .catch((error) => {
            console.error("Error fetching tickets:", error);
            const ticketList = document.getElementById("ticketList");
            ticketList.innerHTML = "<p>Error loading tickets.</p>";
        });
}

// Function to display tickets based on the passed array
function displayTickets(tickets) {
    const ticketList = document.getElementById("ticketList");
    ticketList.innerHTML = ""; // Clear previous tickets

    if (tickets.length === 0) {
        ticketList.innerHTML = "<p>No tickets found.</p>";
        return;
    }

    // Display tickets
    tickets.forEach((ticket) => {
        const ticketDiv = document.createElement("div");
        ticketDiv.classList.add("ticket-card", "mb-3", "p-3", "border", "rounded");

        ticketDiv.innerHTML = `
                    <h5 class="ticket-title">${ticket.ticket_title}</h5>
                    <p class="ticket-description">${ticket.ticket_description}</p>
                    <p class="ticket-date">Created on: ${new Date(ticket.creation_date).toLocaleString()}</p>
                    <p class="ticket-status">Status: ${ticket.status_id === 1 ? "Open" : ticket.status_id === 2 ? "Closed" : "In Progress"}</p>
                `;

        ticketList.appendChild(ticketDiv);
    });
}

// Function to filter tickets based on user input
function filterTickets() {
    const ticketTitle = document.getElementById("ticketTitle").value.toLowerCase();
    const status = document.getElementById("status").value;
    const creationDate = document.getElementById("creationDate").value;
    const sortOrder = document.getElementById("sortOrder").value;

    let filteredTickets = allTickets.filter((ticket) => {
        let isMatch = true;

        // Filter by title
        if (ticketTitle && !ticket.ticket_title.toLowerCase().includes(ticketTitle)) {
            isMatch = false;
        }

        // Filter by status
        if (status && ticket.status_id != status) {
            isMatch = false;
        }

        // Filter by creation date
        if (creationDate && ticket.creation_date.substring(0, 10) !== creationDate) {
            isMatch = false;
        }

        return isMatch;
    });

    // Sort by creation date if a sort option is selected
    if (sortOrder) {
        filteredTickets = filteredTickets.sort((a, b) => {
            const dateA = new Date(a.creation_date);
            const dateB = new Date(b.creation_date);

            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
    }

    // Display filtered and sorted tickets
    displayTickets(filteredTickets);
}

// Event listener for the filter form
document.getElementById("filterForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submit behavior
    filterTickets(); // Apply the filters
});

// Load and fetch all tickets initially
document.addEventListener("DOMContentLoaded", () => {
    fetchTickets(); // Fetch all tickets without filters
});
