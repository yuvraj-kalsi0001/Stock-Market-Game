import express, { json, urlencoded } from 'express';
import session from 'express-session';
import { login, register, buy, sell, createGame, getValue ,changeBalance, getPortfolio, adminLogin, user, logout, admin} from './Portfolio.mjs';
import { connectToDB, getDb, closeDBConnection } from './db.mjs';


const app = express();
const port = 8820;

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static('public'))
// app.use(session)

app.use(session({
  secret: 'abcd1234', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));


app.set('view engine', 'pug');


app.set('views', './public');

async function startApp() {
  try {

    app.get("/", async function (req, res) { 
      res.sendFile('index.html', {root: 'public'}) })

    app.post("/login", login);

    app.get("/logout", logout);

    app.get("/user", user);

    app.post("/adminLogin", adminLogin);

    app.get("/admin", admin);

    app.post("/register", register);

    app.post("/buy", buy);

    app.post("/sell", sell);

    // app.get("/getValue", getValue);

    app.post("/createGame", createGame);

    app.post("/changeBalance", changeBalance);

    app.get("/getPortfolio", getPortfolio);

  } catch (error) {
    console.error('Error starting app:', error);
  }
}

startApp();

app.listen(port, () => {
  console.log('App listening at http://localhost:%d', port);
});

//This code handles when the command line is interrupted by control C or we interrupt the connection between the database
process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  console.log('Closing Mongo Client.');
  server.close(async function(){
    let msg = await closeDBConnection();
    console.log(msg);
  });
});

// _get_collection()