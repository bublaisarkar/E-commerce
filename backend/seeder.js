const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const Cart = require("./models/Cart");
const products = require("./data/products");


dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Function to seed the database

const seedData = async () => {
  try {
    // Clear existing products
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();

    // Create an admin user
    const createdliser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password:"123456",
      role: "admin",
    });

    // Assign admin user ID to each product
    const userID = createdliser._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: userID };
    });

    // Insert sample products
    await Product.insertMany(sampleProducts);

    console.log("Database data Seeded Successfully");
    process.exit();

  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData()