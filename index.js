const express = require('express')
const formidable = require('express-formidable')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})

const app = express()
app.use(formidable())
app.use(cors)

// Routes
// const userRoutes = require('./routes/user')
// // app.use('/user', userRoutes)
// const offerRoutes = require('./routes/offers')
// app.use('/offer', offerRoutes)

app.all('*', (req, res) => {
  res.status(404).json({ message: 'URL not found'})
})

app.listen(process.env.PORT, () => {
    console.log(`Server start on prot ${process.env.PORT}`)
})