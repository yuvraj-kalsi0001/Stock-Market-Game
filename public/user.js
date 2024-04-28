// Access data-username attribute
const username = document.querySelector('.container').getAttribute('data-userName');

function buyStock() {
    let symbol = prompt("Enter the stock symbol:");
    let amount = prompt("Enter the amount in dollars:");

    if (!isValidSymbol(symbol)) {
        alert("Invalid stock symbol. Please enter a valid symbol.");
        return;
    }

    if (!isValidAmount(amount)) {
        alert("Invalid amount. Please enter a valid number.");
        return;
    }

    fetch('/buy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: username,
            stockSymbol: symbol.toUpperCase(),
            amount: amount
        })
    })
        .then(response => response.json())
        .then(data => {
            // console.log("data.status")
            // console.log(data)
            if (data.status === 201) { window.location.href = `winner.html?message=${data.message}`; }
            else {
                alert(data.message);

                window.location.href = '/user'
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function sellStock() {
    let symbol = prompt("Enter the stock symbol:");
    let amount = prompt("Enter the amount in dollars:");

    if (!isValidSymbol(symbol)) {
        alert("Invalid stock symbol. Please enter a valid symbol.");
        return;
    }

    if (!isValidAmount(amount)) {
        alert("Invalid amount. Please enter a valid number.");
        return;
    }

    fetch('/sell', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userName: username,
            stockSymbol: symbol.toUpperCase(),
            quantityToSell: amount
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 201) { window.location.href = `winner.html?message=${data.message}`; }
            else {
                alert(data.message);

                window.location.href = '/user'
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function showHistory() {
    let historyDiv = document.getElementById('history');
    if (historyDiv) {
        // Check if historyDiv is currently hidden
        if (historyDiv.classList.contains('hidden')) {
            // If hidden, remove 'hidden' class to show the div
            historyDiv.classList.remove('hidden');
        } else {
            // If visible, add 'hidden' class to hide the div
            historyDiv.classList.add('hidden');
        }
    }
}

function isValidSymbol(symbol) {
    // only alphalebetsn
    const regex = /^[a-zA-Z]+$/; // Only alphabetic character
    return regex.test(symbol);
}

function isValidAmount(amount) {
    // Regular expression to validate price (e.g., 100, 100.50, 0.50)
    const amountRegex = /^\d+(\.\d{1,2})?$/;
    return amountRegex.test(amount);
}

document.addEventListener("DOMContentLoaded", function () {
    const logoutButton = document.getElementById("logout-button");

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            fetch("/logout", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then(response => {
                    if (response.redirected) {
                        window.location.href = response.url;  // Redirect to the login or home page
                    }
                })
                .catch(error => {
                    console.error("Error logging out:", error);
                });
        });
    }
});

function viewOpponentPortfolio() {
    let targetUsername = prompt("Enter the username of the player whose portfolio you want to view:");

    if (!targetUsername) {
        alert("Username cannot be empty.");
        return;
    }

    fetch(`/getPortfolio?userName1=${username}&userName2=${targetUsername}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 200) {
            alert(`Username: ${data.username}\nBalance: ${data.balance}\nStocks: ${JSON.stringify(data.stocks)}`);
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


