const apiKey = "dW9ujJZFvu5gKCJWVXH1IBAE2q_pU5Nk";
const tickers = "AAPL";

fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${tickers}&apiKey=${apiKey}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        // Process the fetched data here
    })
    .catch(error => {
        console.error("Fetch error:", error);
    });
