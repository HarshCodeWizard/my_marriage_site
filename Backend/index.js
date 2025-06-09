import connectDB from "./db/index.js";
import { app, server, io } from "./app.js"; // Use named imports

// Make io available to routes
app.set("io", io);

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    const port = process.env.PORT || 8000;
    server.listen(port, () => {
      console.log(`⚙️ Server is running at port: ${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed!!! ", err);
    process.exit(1); // Exit if MongoDB connection fails
  });