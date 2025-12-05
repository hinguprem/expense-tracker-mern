const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to the database using the secret URI
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (err) {
    // If connection fails, print error and stop the server
    console.log(`Error: ${err.message}`.red);
    process.exit(1);
  }
};

module.exports = connectDB;