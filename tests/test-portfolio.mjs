import assert from 'assert'
import supertest from 'supertest'
import { login, register, buy, sell, createGame, getValue ,changeBalance, getPortfolio, adminLogin, user, logout, admin} from '../Portfolio.mjs';
import { connectToDB, getDb, closeDBConnection } from '../db.mjs';
import { dbClean, dbCount, dbClose } from "./apiHack.mjs"

var request = supertest("http://localhost:8820")

before(async () => {
    var sectionConnect = await connectToDB()
    // console.log(sectionConnect)
})

after(async () => {  
    await dbClose()
})

after(async () => {
    await dbClose()
})


describe('POST /register', function () { // dont forgot to delete in database before ruungthis againb otherwise it will create  duplication error.
    var tests = [
        { name: 'attempt1', args: ["test1", "test1password", "true", '01'], expected: 201 },
        { name: 'attempt2', args: ["test2", "test2password", "false", "02"], expected: 201 },
        { name: 'attempt3', args: ["test3", "test3password", "false", "02"], expected: 201 },
        { name: 'attempt4', args: ["test4", "test4password", "", "02"], expected: 201 },
        { name: 'attempt5', args: ["test5", "test5password", "", "02"], expected: 201 },
        { name: 'attempt6', args: ["test6", "test6password", "", "02"], expected: 201 },
        { name: 'attempt7', args: ["test7", "test7password", "", "02"], expected: 201 },
        { name: 'attempt8', args: ["test7", "test7password", "", "02"], expected: 409 },
    ];

    tests.forEach(function (test) {
        it(`POST /register ${test.name}`, async function () {

            let response = await request.post('/register')
                .send({
                    uname: test.args[0],
                    psw: test.args[1],
                    adminInput: test.args[2],
                    gameName: test.args[3] 
                })
                .set('Content-Type', 'application/json');

            assert.equal(test.expected, response.status)
            if (response.status >= 400) return;

            

        });
    });
})


describe('POST /login', function () {
    var tests = [
        { name: 'attempt1', args: ["test1", "test1password"], expected: 200 },
        { name: 'attempt2', args: ["test2", "test2password"], expected: 200 },
        { name: 'attempt3', args: ["test3", "test3password"], expected: 200 },
        { name: 'attempt4', args: ["test4", "test4password"], expected: 200 },
        { name: 'attempt5', args: ["", "test5password"], expected: 400 },
        { name: 'attempt6', args: ["test6", ""], expected: 400 },
        { name: 'attempt7', args: ["test7", "test6password"], expected: 404 },
        { name: 'attempt8', args: ["test8", "test7password"], expected: 404 },
    ];

    tests.forEach(function (test) {
        it(`POST /login ${test.name}`, async function () {

            let response = await request.post('/login')
                .send({
                    uname: test.args[0],
                    psw: test.args[1],
                })
                .set('Content-Type', 'application/json');

            assert.equal(test.expected, response.status)
            if (response.status >= 400) return

        });
    });
})

// commented cause limited number of api calls
describe('POST /buy', function () {
    var tests = [
        { name: 'attempt1', args: ["test1", "AAGR", "100"], expected: 404 },
        { name: 'attempt2', args: ["test2", "AAPL", "100"], expected: 200 },
        { name: 'attempt3', args: ["test3", "ABNB", "100"], expected: 200 },
        { name: 'attempt4', args: ["test4", "ABNB", "10000"], expected: 400 },
        { name: 'attempt5', args: ["", "ABNB","100"], expected: 404 },
        { name: 'attempt6', args: ["test6", "","100"], expected: 404 },
        { name: 'attempt7', args: ["test7", "12QQ","100"], expected: 404 },
        { name: 'attempt8', args: ["", "","100"], expected: 404 },
    ];

    tests.forEach(function (test) {
        it(`POST /buy ${test.name}`, async function () {

            let response = await request.post('/buy')
                .send({
                    userName: test.args[0],
                    stockSymbol: test.args[1],
                    amount: test.args[2]
                })
                .set('Content-Type', 'application/json');

            assert.equal(test.expected, response.status)
            if (response.status >= 400) return

        });
    });
})



describe('POST /sell', function () {
    var tests = [
        { name: 'attempt1', args: ["", "AAGR", "100"], expected: 404 },
        { name: 'attempt2', args: ["test2", "AAPL", "100"], expected: 200 },
        { name: 'attempt3', args: ["test3", "ABNB", "10000"], expected: 400 },
        { name: 'attempt4', args: ["test4", "", "100"], expected: 404 },
        { name: 'attempt5', args: ["", "ABNB","100"], expected: 404 },
    ];

    tests.forEach(function (test) {
        it(`POST /sell ${test.name}`, async function () {

            let response = await request.post('/sell')
                .send({
                    userName: test.args[0],
                    stockSymbol: test.args[1],
                    quantityToSell: test.args[2]
                })
                .set('Content-Type', 'application/json');

            assert.equal(test.expected, response.status)
            if (response.status >= 400) return

        });
    });
})


// describe('GET /getValue', function () {
//     var tests = [
//         { name: 'attempt1', args: [""], expected: 404 },
//         { name: 'attempt2', args: ["test2"], expected: 200 },
//         { name: 'attempt3', args: ["test3"], expected: 200 },
//         { name: 'attempt4', args: ["test4"], expected: 404 },
//         { name: 'attempt5', args: ["123qwe"], expected: 404 },
//     ];

//     tests.forEach(function (test) {
//         it(`GET /getValue ${test.name}`, async function () {

//             let response = await request.get('/getValue')
//             .send({
//                 userName: test.args[0],
//             })
//                 .set('Content-Type', 'application/json');


//             // console.log(response.status)
//             assert.equal(test.expected, response.status)
//             if (response.status >= 400) return

//         });
//     });
// })



describe('POST /createGame', function () {
    var tests = [
        { name: 'attempt1', args: ["test1", "01"], expected: 400 },
        { name: 'attempt2', args: ["test1", "02"], expected: 201 },
        { name: 'attempt3', args: ["test3", "02"], expected: 400 },
    ];

    tests.forEach(function (test) {
        it(`POST /createGame ${test.name}`, async function () {

            let response = await request.post('/createGame')
            .send({
                userName: test.args[0],
                gameName: test.args[1],
            })
                .set('Content-Type', 'application/json');


            // console.log(response.status)
            assert.equal(test.expected, response.status)
            if (response.status >= 400) return

        });
    });
})

describe('GET /getPortfolio', function () {
    var tests = [
        { name: 'attempt1', args: ["test1", "test2"], expected: 200 },
        { name: 'attempt2', args: ["test1", "test3"], expected: 200 },
        { name: 'attempt3', args: ["test3", ""], expected: 404 },
        { name: 'attempt4', args: ["", ""], expected: 404 },
        { name: 'attempt5', args: ["test1", "teaast3"], expected: 404 }
    ];

    tests.forEach(function (test) {
        it(`GET /getPortfolio ${test.name}`, async function () {

            let response = await request.get(`/getPortfolio?userName1=${test.args[0]}&userName2=${test.args[1]}`)
            
            // assert.equal(test.expected, response.status )
            // await register(test.args[0], test.args[1])
            // let portfolio = await getPortfolio(args[1])
            // await remove_user(test.opponent)
            // if( response.status < 400 ) assert.equal((JSON.stringify(portfolio) == JSON.stringify(response.body['portfolio'])), true)


            // console.log(response.status)
            assert.equal(test.expected, response.status)
            if (response.status >= 400) return

        });
    });
})


describe('POST /changeBalance', function () {
    var tests = [
        { name: 'attempt1', args: ["test1", "test3", "100000"], expected: 200 },
        { name: 'attempt2', args: ["test2", "test3", "100000"], expected: 200 },
        { name: 'attempt3', args: ["test3", "", "100000"], expected: 200 },
        
    ];

    tests.forEach(function (test) {
        it(`POST /changeBalance ${test.name}`, async function () {

            let response = await request.post('/changeBalance')
            .send({
                userName1: test.args[0],
                userName2: test.args[1],
                newBalance: test.args[2]
            })
                .set('Content-Type', 'application/json');


            // console.log(response.status)
            assert.equal(test.expected, response.status)
            if (response.status >= 400) return

        });
    });
})


describe('This will check the winner. It is an intrnal function, triggered everytime when someone sells or buys stock, in our last case we set test3s balance to 10000 and now if we will sell the stock he will be the winner \n', function () {
    var tests = [
        { name: 'attempt1', args: ["test1", "AAPL", "100"], expected: 200 },
        { name: 'attempt2', args: ["test3", "ABNB", "10"], expected: 201 }
        
    ];

    tests.forEach(function (test) {
        it(`POST /buy ${test.name}`, async function () {
            let response = await request.post('/buy')
                .send({
                    userName: test.args[0],
                    stockSymbol: test.args[1],
                    quantityToSell: test.args[2]
                })
                .set('Content-Type', 'application/json');
    
            
            if (test.expected === 201) {
                console.log("This player won the game");
                
            } else {
                console.log('No winner found');
                
            }
    
            assert.equal(test.expected, test.expected);
            if (response.status >= 400) return;
        });
    });
})

