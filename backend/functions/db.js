require('dotenv').config();
const {MongoClient} = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
// Export the DB connection, so don't have to keep reconnecting to DB
module.exports = client