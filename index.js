const express = require('express')
const formidable = require('express-formidable')
const mongoose = require('mongoose')
const cors = require('cors')
const cloudinary = require("cloudinary").v2;


require('dotenv').config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express()
app.use(formidable())
app.use(cors())

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

// Routes
const userRoutes = require('./routes/user')
app.use("/user", userRoutes)
const offerRoutes = require('./routes/offers')
app.use("/offer", offerRoutes)

app.all("*", (req, res) => {
  res.status(404).json({ message: 'URL not found'})
})

app.listen(process.env.PORT, () => {
    console.log(`Server start on port ${process.env.PORT}`)
})