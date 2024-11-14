import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js'
import mongoose from "mongoose"
import Product from "./models/product.model.js"

dotenv.config();

const app = express();

app.use(express.json());// allows us to accept JSON format in req.body

app.get("/api/products", async (req, res) =>{
    try{
        const products = await Product.find({});
        res.status(200).json({ success: true, data: products});

    }catch(error){
        console.log("error in finding products", error.message);
        res.status(500).json({ success: false, message: "Server Error"});

    }
});

app.post("/api/products", async (req, res) => {
    const products = req.body; // Expecting an array of products

    // Check if req.body is an array and has at least one product
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ success: false, message: "Please provide at least one product" });
    }

    // Validate each product and collect errors if any
    const invalidProducts = products.filter(product => !product.name || !product.price || !product.image);
    if (invalidProducts.length > 0) {
        return res.status(400).json({ success: false, message: "Each product must have a name, price, and image" });
    }

    try {
        // Create and save all products in one go
        const savedProducts = await Product.insertMany(products);
        res.status(201).json({ success: true, data: savedProducts });
    } catch (error) {
        console.error("Error in Create products:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.put("/api/products/:id",async (req, res) => {
    const { id } = req.params;

    const product = req.body;

    try{
        const updatedProduct = await Product.findByIdAndUpdate(id, product,{new:true});
        res.status(200).json({ success: true, data: updatedProduct});

    }catch(error){
        res.status(500).json({ success: false, message: "Server Error"});

    }

});

app.delete("/api/products/:id",async (req, res) => {
    const { id } = req.params;

    try{
        await Product.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Product Deleted"})

    }catch(error){
        console.log("error in fetching product:", error.message);
        res.status(404).json({ success: false, message:"product not found"})

    }
});



app.listen(5000, () => {
    connectDB();
    console.log("Server started at http://localhost:5000");
});

