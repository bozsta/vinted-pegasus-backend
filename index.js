const express = require('express')
const formidable = require('express-formidable')
const mongoose = require('mongoose')
const cors = require('cors')
const cloudinary = require("cloudinary").v2;
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_API_SECRET)




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
app.post('/payment', async (req,res) => {
  try {
    const { stripeToken, amount, description } = req.fields
    console.log('stripeToken', stripeToken)
    console.log('amount', amount)
    console.log('description', description)
     // Créer la transaction
   const response = await stripe.charges.create({
      amount: amount * 100,
      currency: "eur",
      description: description,
      // On envoie ici le token
      source: stripeToken,
    });
    console.log('Stripe response', response);

    res.status(200).json({
      status: 200,
      message: 'success',
      data: response
    })
  } catch (error) {
    console.log('error message', error.message)
    res.status(400).json({error: 
      {
        message: error.message
      }
    })
  }
})

app.all("*", (req, res) => {
  res.status(404).json({ message: 'URL not found'})
})

app.listen(process.env.PORT, () => {
    console.log(`Server start on port ${process.env.PORT}`)
})