// Function to fetch ticket data from the new endpoint
async function fetchTickets() {
    try {
        const response = await fetch("/api/getTicketsByRoomAndUserID"); // Replace with your endpoint
        if (!response.ok) {
            throw new Error("Failed to fetch tickets");
        }
        const tickets = await response.json();
        renderTicketsTable(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
    }
}

// Function to update the ticket status
async function updateTicketStatus(ticketId, newStatusId) {
    try {
        const response = await fetch(`/api/updateTicketStatus/${ticketId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status_id: newStatusId }),
        });

        if (!response.ok) {
            throw new Error("Failed to update ticket status");
        }

        console.log(`Ticket ${ticketId} status updated to ${newStatusId}`);
        // Optionally, re-fetch the tickets to refresh the table
        await fetchTickets();
    } catch (error) {
        console.error("Error updating ticket status:", error);
    }
}

// Function to render the tickets table
function renderTicketsTable(tickets) {
    const ticketList = document.getElementById("ticketList");
    ticketList.innerHTML = ""; // Clear any previous content

    const table = document.createElement("table");
    table.classList.add("custom-table");

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

        // Create dropdown for editing status
        const statusDropdown = document.createElement("select");
        statusDropdown.innerHTML = `
            <option value="1" ${ticket.status_id === 1 ? "selected" : ""}>Open</option>
            <option value="2" ${ticket.status_id === 2 ? "selected" : ""}>In Progress</option>
            <option value="3" ${ticket.status_id === 3 ? "selected" : ""}>Closed</option>
        `;
        statusDropdown.addEventListener("change", async (event) => {
            const newStatusId = parseInt(event.target.value, 10);
            await updateTicketStatus(ticket.ticket_id, newStatusId); // Call the update function
        });

        statusCell.appendChild(statusDropdown);
        row.appendChild(statusCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    ticketList.appendChild(table);
}

document.addEventListener("DOMContentLoaded", () => {
    fetchTickets();
});
