const mongoose = require("mongoose");
require("dotenv").config();


const connectionToDB = () => {
    mongoose.connect(process.env.CONNECTION_TO_CLOUD_DB)
        .then(() => console.log('connected to MONGODB'))
        .catch((error) => console.log('connection failed to MONGODB', error));
}


module.exports = connectionToDB;