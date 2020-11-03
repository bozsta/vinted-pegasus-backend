const router = require('express').Router()
const cloudinary = require("cloudinary").v2;
const isAuthenticated = require('../middleware/isAuthenticated')
const Accounts = require('../models/account')
const Offers = require('../models/offers')

cloudinary.config({
    cloud_name: "vinted-pegasus",
    api_key: "942957996145417",
    api_secret: "g3PO0LmPzLFTFkLv6_neYcGpPko"
  });


router.get('/', async (req, res) => {
    try {
        const { title, priceMin, priceMax, sort, page, itemPerPage } = req.query

        const option = { 
            product_price: {
                $gte: 0
            }
         } 
         if (title) {
             option.product_name = new RegExp(title, 'i')
         }
        if (priceMin) {
            option.product_price.$gte = Number(priceMin)
        }
        if(priceMax) {
            option.product_price.$lte = Number(priceMax)
        }
        let limit = 0
       let toSkip = 0
        let order = undefined
        if (page) {
            limit = itemPerPage && isNaN(itemPerPage) ? 0 : Number(itemPerPage)
            if (!isNaN(page) || Number(page) > 0) {
                    toSkip =  (Number(page - 1) * limit) 
            }
        }
        
        if (sort) {
            let dir = sort.toLowerCase()
            if (dir !== 'price-desc' && dir !== 'price-asc') {
                throw Error('sort keyword not reconized')
            }
           dir = dir === "price-desc" ? "desc" : "asc"
           order = { product_price : dir }
        }
        
        const offers = await Offers.find(option).populate({
            path: 'owner',
            select: 'account'
        })
            .sort(order)
            .limit(limit)
            .skip(toSkip)
                                
        const count = await Offers.countDocuments({option})

        res.status(200).json({
            count: count,
            offers: offers
        })
    } catch (error) {
        res.status(400).json({ error: { message: error.message } })
    }
})  
// http://localhost:3000/offer/publish
router.post('/publish', isAuthenticated, async (req, res) => {
    try {
        const { title, description, price, condition, city, brand, size, color} = req.fields
        const picture = req.files.picture
        const { user } = req

        const newOffer = new Offers({
            product_name: title,
            product_description: description,
            product_price: price,
            product_details: [
                { condition },
                { city },
                { brand }, 
                { size },
                { color }
            ],
            product_image: picture,
            owner: user
        })

        const result = await cloudinary.uploader.upload(picture.path, { folder: `/offers/${newOffer._id}` })

        if (result.secure_url) {
            newOffer.product_image = {
                url: result.secure_url,
                public_id: result.public_id
            } 
            await newOffer.save()
            res.status(200).json({
                _id: newOffer._id,
                product_name: newOffer.product_name,
                product_description: newOffer.product_description,
                product_price: newOffer.product_price,
                product_details: newOffer.product_details,
                owner: {
                    account: user.account,
                    _id: user._id
                },
                product_image: newOffer.product_image
            })
        } else {
            res.status(400).json({ error: { message: erros.message } }) 
        }
    } catch (error) { res.status(400).json({ error: { message: erros.message } }) }
})

router.put('/delete', isAuthenticated, async (req, res) => {
    try {
        const { offerId } = req.fields
        const offer = await Offers.findById(offerId)
        if (offer) {
            await offer.deleteOne({id: offerId})
            await cloudinary.api.delete_resources([offer.product_image.public_id])
            await cloudinary.api.delete_folder(`/offers/${offerId}`)

            res.status(200).json({ message: 'Offer deleted'})
        } else {
            res.status(400).json({ error: { message: 'Failled' } }) 
        }

    } catch (error) { res.status(400).json({ error: { message: error.message } }) }
})

router.put('/update', isAuthenticated, async (req, res) => {
    try {
        const { offerId, title, description, price, condition, city, brand, size, color} = req.fields
        const picture = req.files.picture

        const offer = await Offers.findById(offerId)

        await cloudinary.api.delete_resources(offer.product_image.public_id)
        const result = await cloudinary.uploader.upload(picture.path, { folder: `/offers/${offer._id}` })
        if (result) {
            if (title) {
                offer.product_name = title
            }
            if (description) {
                offer.product_description = description
            }
            if (price) {
                offer.product_price = price
            }
            if (condition) {
                offer.product_details[0].condition = condition
            }
            if (city) {
                offer.product_details[1].city = city
            }
            if (brand) {
                offer.product_details[2].brand = brand
            }
            if (size) {
                offer.product_details[3].size = size
            }
            if (color) {
                offer.product_details[4].color = color
            }
            offer.product_image = { 
                public_id : result.public_id,
                url : result.secure_url
            }

            await offer.save()
            res.status(200).json({
                _id: offer._id,
                product_name: offer.product_name,
                product_description: offer.product_description,
                product_price: offer.product_price,
                product_details: offer.product_details,
                product_image: offer.product_image
            })
        } else {
            res.status(200).json({ error: { message: 'Updated failled'}})
        }

    } catch (error) { res.status(400).json({ error: {message: error.message } }) }
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const offer = await Offers.findById(id).populate({
            path: 'owner',
            select: 'account'
        })

        res.status(200).json(offer)
    } catch (error) {
        res.status(400).json({ error: { message: error.message } })
    }
})
module.exports = router