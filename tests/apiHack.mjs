import { MongoClient } from 'mongodb';
const uri ="mongodb://localhost:8820";
const client = new MongoClient(uri, { useUnifiedTopology: true });
var db, collection=null;

/**
 * A function to stablish a connection with a MongoDB instance.
 */
async function dbCollection() {
    if( collection ) return collection;
    try {
        // Connect the client to the server
        await client.connect();
        // Our db name is going to be contacts-db
        db = await client.db('portfolio-project');
        console.log("Connected successfully to mongoDB");  
    } catch (err) {
        throw err; 
    } 
    collection = await db.collection('portfolio');
    return collection;
}


export async function dbClose(){
    await client.close();
    return 'Connection closed';
};

export async function dbRemove(query){
    await dbCollection();
    await collection.deleteMany(query)
    let found = await collection.countDocuments(query)
    return found
};

export async function dbCount(query){
    await dbCollection();
    return await collection.countDocuments(query)
};

export async function dbClean(query){
    await dbCollection();
    let found = await collection.countDocuments(query)
    if( found != 0 )
        await collection.deleteMany(query)
    return found
};


export default {dbCollection, dbCount, dbClean, dbRemove, dbClose}