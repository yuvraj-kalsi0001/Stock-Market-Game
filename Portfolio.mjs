import https from 'https';
import { connectToDB, getDb, closeDBConnection } from './db.mjs';
import { json } from 'express';




// make connection with database
connectToDB()

async function _get_collection() {
    //This function return all the documents in the portfolio collection which are basically all the players in the database

    let db = await getDb();
    let db_collection = await db.collection('portfolio');
    // console.log(db_collection.find({}).toArray())
    return db_collection

};

async function getStockPrice(stockSymbol) {
    // This code connects with the API and gets the stock information which contains the stock symbol, stock price and the quantity of stock the company is owning. It returns the object containing all this information according to live NYSE rates

    return new Promise((resolve, reject) => {
        // da266844dd82bfa0739a12e85aa9e6c9
        // ZOfNifSbAOGmSHuCwLLA2tQm5Ts2ZdRf
        // eMFpUUJ8afgHS2biLMXkQ8bRZb7NPh7n
        // switch between these API keys
        const options = {
            hostname: 'financialmodelingprep.com',
            port: 443,
            path: `/api/v3/quote-short/${stockSymbol}/?apikey=eMFpUUJ8afgHS2biLMXkQ8bRZb7NPh7n`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'eMFpUUJ8afgHS2biLMXkQ8bRZb7NPh7n'
            }
        };

        const request = https.request(options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(data));
            });
        });

        request.on('error', (error) => {
            reject(error);
        });

        request.end();
    });
}

async function declareWinner() {
    // This declared winner function is first checking all the players in the database who are having the balance more than 10,000. It 
    //is triggered every time when somebody buys a stock or sells a stock. If there is anyone with more than 10,000 balance, this 
    //function returns true and the information of the player else it will return false


    try {

        const collection = await _get_collection();


        const players = await collection.find({}).toArray();

        // console.log(players)

        // console.log(winner.userName)
        // console.log(winner)S
        // console.log('----------------------------', res)

        const winners = [];
        for (const player of players) {
            // console.log(player.userName)
            const playerValue = await getValue(player.userName);
            // console.log(player.balance)
            var total = (parseFloat(playerValue) + parseFloat(player.balance))
            if (total >= 10000) {
                // console.log(total)
                winners.push(player);
            }
        }

        // console.log(winners)

        if (winners.length > 0) {
            // Declare the first winner found
            const winner = winners[0];
            await collection.updateMany(
                { gameName: winner.gameName },
                { $set: { currentlyPlaying: false, gameName: undefined, balance: 1000, stocks: {}, history: [] } }
            );
            return [true, winner];
        } else {
            return [false, null];
        }
    } catch (error) {
        console.error('Error in declareWinner:', error);
        throw error;
    }
}

export async function register(req, res) {
    // This register function register new players and it takes username, password, admin input and game name. If the admin input is true, 
    //it will give certain permissions to make changes later in the game. It also check if a user with that user name already exist, it will 
    //send the message saying username already exist. This function adds into the database a user with username, password, balance which is 
    //1000 at the beginning for every player and empty stock dictionary and admin, gamename, empty array history storing all the transactions and currently playing bolean

    try {
        const userName = req.body.uname;
        const password = req.body.psw;
        const adminInput = req.body.adminInput;
        const gameName = req.body.gameName;

        // console.log(userName+password)




        const collection = await _get_collection();
        const existingUser = await collection.findOne({ userName: userName });

        // console.log(existingUser)

        if (existingUser) {
            res.status(409).json({ status: 409, message: "Username already exists" });
            return;
        }


        const result = await collection.insertOne(
            {
                userName,
                password,
                balance: 1000.00,
                stocks: {},
                adminInput,
                gameName,
                history: [],
                currentlyPlaying: false,

            });
        res.status(201).json({ status: 201, message: "Registration successful." });

    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });

    }
}

export async function login(req, res) {
    // This login function first checks if the username and password are provided. If they are provided then it will look for a user 
    //matching the given username and password and if the user is found it will return the user object.


    try {
        const userName = req.body.uname;
        const password = req.body.psw;

        if (!userName || !password) {
            res.status(400).send("Username and password are required");
            return;
        }

        const collection = await _get_collection();
        const documents = await collection.find({
            userName: userName,
            password: password
        }).toArray();

        // console.log("documents")

        // req.session.username = userName;

        // console.log('Session data after login:', req.session.username);

        if (documents.length === 0) {
            res.status(404).json({ status: 404, message: "Invalid username or password" })
            // res.status(404).send("Invalid username or password");
        } else {
            // console.log(documents[0].admin)
            req.session.username = userName;  // Storing username in session
            // console.log('foo')
            // res.status(200).send('sucess login')
            res.status(200).json({ status: 200, message: "Login successful." });

        }
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).send("Internal Server Error");
    }
}

export async function user(req, res) {
    try {
        // console.log('fee');

        if (req.session.username) {
            // User is logged in, fetch user data and render the user dashboard
            const userName = req.session.username; // Retrieve the username from the session

            const collection = await _get_collection();
            const userData = await collection.findOne({ userName: userName });

            if (userData) {
                res.render("user.ejs", { user: userData, session: req.session });
            } else {
                res.status(404).send("User not found");
            }
        } else {
            // User is not logged in, redirect to login page
            res.redirect("login.html");
        }
    } catch (error) {
        console.error("Error in user route:", error);
        res.status(500).send("Internal Server Error");
    }
}

export async function adminLogin(req, res) {
    // This login function first checks if the username and password are provided. If they are provided then it will look for a user 
    //matching the given username and password and if the user is found it will return the user object.


    try {
        const userName = req.body.uname;
        const password = req.body.psw;

        if (!userName || !password) {
            res.status(400).send("Username and password are required");
            return;
        }

        const collection = await _get_collection();
        const documents = await collection.find({
            userName: userName,
            password: password
        }).toArray();

        req.session.username = userName

        if (documents.length === 0) {
            res.status(404).send("Invalid username or password");
        } else {
            // console.log(documents[0].admin)
            if (documents[0].adminInput == true) { res.status(200).json({ status: 200, message: "ok admin" }); } else {
                res.status(404).json({ message: 'you do not have admin access' });
            }
        }
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).send("Internal Server Error");
    }
}

export async function admin(req, res) {
    try {
        // console.log('fee');

        if (req.session.username) {
            // User is logged in, fetch user data and render the user dashboard
            const userName = req.session.username; // Retrieve the username from the session

            const collection = await _get_collection();
            const userData = await collection.findOne({ userName: userName });

            // Fetch all players' data
            const playersData = await collection.find({}).toArray();

            // console.log(playersData)

            // Fetch all games' data (assuming you have a separate 'games' collection)
            let db = await getDb();
            let gamesCollection = await db.collection('games');
            // const gamesCollection = await _get_collection('games'); // Assuming 'games' is the name of the collection
            const gamesData = await gamesCollection.find({}).toArray();

            if (userData) {
                res.render("adminHome.ejs", {
                    adminName: userName,
                    players: playersData,
                    games: gamesData,
                    session: req.session
                });
            } else {
                res.status(404).send("Admin not found");
            }
        } else {
            // User is not logged in, redirect to login page
            res.redirect("/admin");
        }
    } catch (error) {
        console.error("Error in admin route:", error);
        res.status(500).send("Internal Server Error");
    }
}

export async function buy(req, res) {
    //This function takes username, stock symbol and amount in dollars of the stock you want to buy then it will fetch the 
    //information of the stock by inputting the stock symbol in getStockPrice function and then if the information is found then we will 
    //calculate how much amount of the stock are we going to purchase with that amount of money. We will also check if the inputs are 
    //valid or not and also check if there is sufficient balance to buy that amount of stock. After buying the stock, we will update the 
    //balance in the users profile and update the transaction in history as an object which contains the date, time, the type of 
    //purchase, purchase and symbol At the end of this function check winner is triggered. which will return if there is any winner after the purchase


    try {
        const userName = req.body.userName;
        const stockSymbol = req.body.stockSymbol;
        const amount = parseFloat(req.body.amount);


        const stockInfo = await getStockPrice(stockSymbol);

        // console.log(stockInfo)

        if (stockInfo.length < 1 || stockSymbol.length < 1) {
            res.status(404).send('invalid input')
            return
        }


        const quantity = amount / stockInfo[0].price;

        const collection = await _get_collection();
        const user = await collection.findOne({ userName: userName });


        if (!user) {
            res.status(404).send("User not found");
            return;
        }


        let currentBalance = parseFloat(user.balance);


        if (isNaN(currentBalance) || currentBalance < amount) {
            res.status(400).send("Insufficient balance");
            return;
        }


        const newBalance = currentBalance - amount;


        await collection.updateOne(
            { userName: userName },
            { $set: { balance: newBalance } }
        );


        let updatedStocks = { ...user.stocks };
        if (updatedStocks[stockSymbol]) {

            updatedStocks[stockSymbol] += quantity;
        } else {

            updatedStocks[stockSymbol] = quantity;
        }


        await collection.updateOne(
            { userName: userName },
            { $set: { stocks: updatedStocks } },
            { upsert: true }
        );


        const historyUpdate = {
            symbol: stockSymbol,
            action: 'buy',
            quantity: quantity,
            price: stockInfo[0].price,
            timestamp: new Date()
        };

        // console.log(historyUpdate)

        await collection.updateOne(
            { userName: userName },
            { $push: { "history": historyUpdate } }
        );



        const winner = await declareWinner();

        // console.log(winner)

        // console.log(winner)
        if (winner[0] === true) {
            // res.send(`Player ${winner[1].userName} is the winner with a balance of $${winner[1].balance}`);
            // res.status(200).json({ message: `Player ${winner[1].userName} is the winner with a total score of $${winner[1].balance}` });
            return res.status(201).json({ status: 201, message: `Player ${winner[1].userName} is the winner with a total score of $${winner[1].balance}` });

            // Redirect to logout
            // return res.redirect('winner.html'); 
        } else {
            return res.status(200).json({ message: `Purchase successful. You bought $${amount} worth of shares of ${stockSymbol}.` });
        }

        res.status(200).json({ message: `Purchase successful. You bought $${amount} worth of shares of ${stockSymbol}.` });


    } catch (error) {
        console.error('Error in buy:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

export async function sell(req, res) {

    //This function takes username, stock symbol and amount in dollars of the stock you want to sell then it will fetch the 
    //information of the stock by inputting the stock symbol in getStockPrice function and then if the information is found then we will 
    //calculate how much amount of the stock are we going to sell with that amount of money. We will also check if the inputs are 
    //valid or not and also check if there is sufficient amonut of stock to sell. After selling the stock, we will update the 
    //balance in the users profile and update the transaction in history as an object which contains the date, time, the type of 
    //purchase, purchase and symbol At the end of this function check winner is triggered which will return if there is any winner after the purchase

    try {
        const userName = req.body.userName;
        const stockSymbol = req.body.stockSymbol;
        const quantityToSell = parseFloat(req.body.quantityToSell);

        const collection = await _get_collection();
        const user = await collection.findOne({ userName: userName });




        if (!user) {
            res.status(404).send("User not found");
            return;
        }


        const stockInfo = await getStockPrice(stockSymbol);

        if (stockInfo.length < 1 || stockSymbol.length < 1) {
            res.status(404).send('invalid input')
            return
        }

        let amountOfStockToSell = (quantityToSell / stockInfo[0].price);
        // console.log(amountOfStockToSell)

        const userStocks = user.stocks;
        if (!userStocks || !userStocks[stockSymbol] || userStocks[stockSymbol] < amountOfStockToSell) {
            res.status(400).send("Insufficient stocks to sell");
            return;
        }
        // console.log(userStocks)

        let currentBalance = parseFloat(user.balance);
        const newBalance = currentBalance + quantityToSell;
        const updatedStocks = { ...userStocks };
        updatedStocks[stockSymbol] -= amountOfStockToSell;

        await collection.updateOne(
            { userName: userName },
            { $set: { balance: newBalance, stocks: updatedStocks } }
        );

        const historyUpdate = {
            symbol: stockSymbol,
            action: 'sell',
            quantity: amountOfStockToSell,
            companyName: stockInfo[0].companyName,
            price: stockInfo[0].price,
            timestamp: new Date()
        };

        await collection.updateOne(
            { userName: userName },
            { $push: { "history": historyUpdate } }
        );

        // console.log(amountOfStockToSell);
        // console.log(quantityOfPriceToSell);
        // console.log(amountOfStockToSell);

        const winner = await declareWinner();
        if (winner[0] === true) {
            // res.send(`Player ${winner[1].userName} is the winner with a balance of $${winner[1].balance}`);
            // res.status(200).json({ message: `Player ${winner[1].userName} is the winner with a total score of $${winner[1].balance}` });
            return res.status(201).json({ status: 201, message: `Player ${winner[1].userName} is the winner with a total score of $${winner[1].balance}` });

            // Redirect to logout
            // return res.redirect('winner.html'); 
        } else {
            return res.status(200).json({ message: `Sell successful. You sold ${amountOfStockToSell} shares of ${stockSymbol} for $${quantityToSell}.` });
        }

        res.status(200).json({ message: `Sell successful. You sold ${amountOfStockToSell} shares of ${stockSymbol} for $${quantityToSell}.` });


    } catch (error) {
        console.error('Error in sell:', error);
        res.status(500).send("Internal Server Error");
    }
}

export async function getValue(userName) {
    // This get value function will return the The cost prise of the stock a player is owning. In this function, we are going into the database and checking the player's stock object and then calculating the price of each stock a player is is owning, then returning the sum of those.



    // console.log('-----------------------------------')
    try {
        // const userName = req.body.userName;

        const collection = await _get_collection();
        const user = await collection.findOne({ userName: userName });

        if (!user || user.length < 1) {
            // console.log('foo')
            return null;
        }

        if (user.stocks.length < 1 || user.history.length < 1) {
            // console.log('bar')
            return null;
        }

        const stocks = user.stocks;
        const stockSymbols = Object.keys(stocks);
        let totalValue = 0;

        for (const symbol of stockSymbols) {
            const stockInfo = await getStockPrice(symbol);
            if (stockInfo.length > 0) {
                const stockValue = stocks[symbol] * stockInfo[0].price;
                totalValue += stockValue;
            }
        }

        return totalValue.toFixed(2);

    } catch (error) {
        console.error('Error in getValue:', error);
        throw error;
    }
}

export async function changeBalance(req, res) {
    //This is the additional Feature of admin in which the user 1 would be the admin and user to be the other player in this function we check if the user 1 is admin. He can change the balance of the user 2, if not we return only users can change the balance.

    try {
        const userName1 = req.body.userName1;
        const userName2 = req.body.userName2;
        const newBalance = parseFloat(req.body.newBalance);



        const collection = await _get_collection();

        const user1 = await collection.findOne({
            userName: userName1
        })

        // console.log(user1)

        if (!user1 || user1.admin === false) {
            res.status(403).send("Only admin can change balance.");
            return;
        }

        // console.log(newBalance)

        const result = await collection.updateOne(
            { userName: userName2 },
            { $set: { balance: newBalance } }
        );

        // console.log(result)

        if (result !== null || result !== undefined) {
            // console.log('baa')
            res.status(200).json({ message: `Balance updated successfully for ${userName2}` });
            // res.status(200).send(`Balance updated successfully for ${userName2}`);
        } else {
            res.status(404).json({ message: `User not found` });
            // res.status(404).send("User not found");
        }
    } catch (error) {
        console.error('Error in changeBalance:', error);
        res.status(500).send("Internal Server Error");
    }

}

export async function createGame(req, res) {
    // In this function, a player can start the game. At first we check if the user who requested to create the game is an admin or not and then we will check the game name parameter. Then we will go into the collection, and all the players with that game name can enter a match if they are not currently playing. We will check if they are currently playing by using the parameter currentlyPlaying. And the minimum amount of players we require to start a match is 2. After starting a match, we will create a new document in the game collection. We will also change the currently playing parameter of every player who entered this game to be true.



    try {
        const userName = req.body.userName;
        const gameName = req.body.gameName;

        const collection = await _get_collection();


        const adminUser = await collection.findOne({ userName: userName });
        if (!adminUser || adminUser.adminInput === false) {
            res.status(403).send("Only admin can create a game.");
            return;
        }

        // console.log(adminUser)


        const players = await collection.find({
            gameName: gameName,
            currentlyPlaying: false
        }).toArray();

        if (players.length < 2) {
            res.status(400).send("Not enough players to start the game.");
            return;
        }

        const gameDocument = {
            admin: adminUser.userName,
            gameName: gameName,
            players: players.map(player => player.userName)
        };

        const db_games = await getDb();
        const gamesCollection = await db_games.collection('games');

        const result = await gamesCollection.insertOne(gameDocument);


        if (result !== null || result !== undefined) {
            await collection.updateMany(
                { userName: { $in: gameDocument.players } },
                { $set: { currentlyPlaying: true } }
            );

            res.status(201).send("Game created successfully.");
        } else {
            res.status(500).send("Failed to create game.");
        }
    } catch (error) {
        console.error('Error in createGame:', error);
        res.status(500).send("Internal Server Error");
    }
}

export async function getPortfolio(req, res) {
    // Additional feature in which user one can request to look at the portfolio of other users and whenever user1 asks to check portfolio of another user they have to pay $50. 50 dollars amount is deducted from their account We are also checking for the inputs if they are valid or not.

    try {
        const requestingUserName = req.query.userName1;
        const targetUserName = req.query.userName2;

        const collection = await _get_collection();

        const targetUser = await collection.findOne({ userName: targetUserName });

        // console.log(requestingUserName)

        if (!targetUser || targetUser === null || targetUser === undefined) {
            res.status(404).json({ status: 404, message: "Target user not found." });
            return;
        }

        const requestingUser = await collection.findOne({ userName: requestingUserName });

        if (!requestingUser || requestingUser === null || requestingUser === undefined) {
            res.status(404).json({ status: 404, message: "Requesting user not found." });
            return;
        }

        let currentBalance = parseFloat(requestingUser.balance);
        if (isNaN(currentBalance) || currentBalance < 50) {
            res.status(400).json({ status: 400, message: "Insufficient balance to view portfolio." });
            return;
        }

        const newBalance = currentBalance - 50;

        await collection.updateOne(
            { userName: requestingUserName },
            { $set: { balance: newBalance } }
        );

        res.status(200).json({
            status: 200,
            message: "Portfolio data retrieved successfully.",
            username: targetUser.userName,
            balance: targetUser.balance,
            stocks: targetUser.stocks
        });

    } catch (error) {
        console.error('Error in getPortfolio:', error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }

}


export function logout(req, res) {
    try {

        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send("Internal Server Error");
            }

            res.redirect("/");
        });
    } catch (error) {
        console.error('Error in logout:', error);
        res.status(500).send("Internal Server Error");
    }
}

