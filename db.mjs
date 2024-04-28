import { MongoClient } from 'mongodb';
const uri ="mongodb+srv://ykalsi:E6raeTUdH4rx6iQB@cluster0.ptxhzch.mongodb.net/";
const client = new MongoClient(uri);
var db;

/**
 * A function to stablish a connection with a MongoDB instance.
 */
export async function connectToDB() {
    try {
        // Connect the client to the server
        await client.connect();
        db = await client.db('portfolio-project');
        // Our db name is going to be portfolio-project
        console.log("Connected successfully to mongoDB");
    } catch (err) {
        throw err;
    }
}
/**
 * This method just returns the database instance
 * @returns A Database instance
 */
export async function getDb() {
    // console.log(db)
    return db;
}

export async function _get_collection() {

  let db = await getDb();
  let db_collection = await db.collection('portfolio');
  // console.log(db_collection.find({}).toArray())
  return db_collection

};

export async function closeDBConnection(){
    await client.close();
    return 'Connection closed';
};


export default {connectToDB, getDb, closeDBConnection};
