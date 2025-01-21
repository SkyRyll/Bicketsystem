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
            allTickets = data;
            displayTickets(allTickets);
        })
        .catch((error) => {
            console.error("Error fetching tickets:", error);
            const ticketList = document.getElementById("ticketList");
            ticketList.innerHTML = "<p>Error loading tickets.</p>";
        });
}
// Function to display tickets in a table format
function displayTickets(tickets) {
    const ticketList = document.getElementById("ticketList");
    ticketList.innerHTML = "";

    if (tickets.length === 0) {
        ticketList.innerHTML = "<p>No tickets found.</p>";
        return;
    }

    // Create table and headers
    const table = document.createElement("table");
    table.classList.add("custom-table"); // Use a custom class for styling

    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Title & Date</th>
            <th>Description</th>
            <th>Status</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Populate table rows with ticket data
    tickets.forEach((ticket) => {
        const row = document.createElement("tr");

        const titleDateCell = document.createElement("td");
        titleDateCell.innerHTML = `
            <strong>${ticket.ticket_title}</strong><br>
            <small>Created on: ${new Date(ticket.creation_date).toLocaleString()}</small>
        `;
        row.appendChild(titleDateCell);

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = ticket.ticket_description;
        row.appendChild(descriptionCell);

        const statusCell = document.createElement("td");
        statusCell.classList.add("status-cell");

        // Set the text content based on the status_id
        if (ticket.status_id === 1) {
            statusCell.textContent = "Open";
            statusCell.classList.add("status-open"); // Add the "status-open" class
        } else if (ticket.status_id === 2) {
            statusCell.textContent = "Closed";
            statusCell.classList.add("status-closed"); // Add the "status-closed" class
        } else {
            statusCell.textContent = "In Progress";
            statusCell.classList.add("status-in-progress"); // Add the "status-in-progress" class
        }

        // Append the status cell to the row
        row.appendChild(statusCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    ticketList.appendChild(table);
}

// Function to filter tickets based on user input
function filterTickets() {
    const searchbarInput = document.getElementById("searchbarInput").value.trim().toLowerCase();
    const status = document.getElementById("status").value;
    const creationDate = document.getElementById("creationDate").value;
    const sortOrder = document.getElementById("sortOrder").value;

    let filteredTickets = allTickets.filter((ticket) => {
        let isMatch = true;

        // Filter by title
        const ticketTitle = (ticket.ticket_title || "").trim().toLowerCase(); // Handle undefined/null ticket_title
        console.log("ticketTitleInput:", searchbarInput);
        console.log("ticketTitle:", ticketTitle);
        if (searchbarInput && !ticketTitle.includes(searchbarInput)) {
            isMatch = false;
        }

        // Filter by status
        if (status && ticket.status_id != status) {
            isMatch = false;
        }

        // Filter by creation date
        if (creationDate) {
            const ticketDate = new Date(ticket.creation_date).toISOString().split("T")[0];
            if (ticketDate !== creationDate) {
                isMatch = false;
            }
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
    console.log();
});

// Load and fetch all tickets initially
document.addEventListener("DOMContentLoaded", () => {
    fetchTickets(); // Fetch all tickets without filters
});
