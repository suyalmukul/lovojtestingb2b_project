const mongoose = require("mongoose");

    exports.mongodb = () => {
    mongoose.set("strictQuery", false);
    // Connect to the MongoDB database
    mongoose
      .connect(process.env.MONGODB_URL, { useNewUrlParser: true })
      .then(() => console.log(`Connected to ${process.env.NODE_ENV} DB ✅`))
      .catch((error) => console.error("Error connecting to MongoDB:", error));
  };



  ///////