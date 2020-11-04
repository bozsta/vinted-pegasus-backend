const router = require('express').Router()
const Accounts = require('../models/account')
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

router.post('/signup', async (req,res) => {
    try {
        let { email, username, phone, password} = req.fields

        email = email.trim()
        username = username.trim()
        phone = phone.trim()
        password = password.trim()

        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);
    
        const account = new Accounts({
            email,
            account: {
                username,
                phone
            },
            token,
            hash,
            salt
        })
        await account.save()
        res.status(200).json({
            message: 'account created'
        })
    } catch (error) { 
        let  message = error.message
        if (error.code === 11000) {
            message = 'Email already exist'
        }
        res.status(400).json({error: {
            status: error.code,
            message: message
        }})
    }
})

router.post('/login', async (req,res) => {
    try {
        const email = req.fields.email
        const password = req.fields.password
        const user = await Accounts.findOne({email: email})
        const hash = SHA256(password + user.salt).toString(encBase64);
        if (hash === user.hash) {
            res.status(200).json({
                _id: user._id,
                token: user.token,
                account: user.account
            })
        } else {
            res.status(403).json({ message: 'Acces denied'})
        }
    } catch (error) {
        res.status(400).json({
            error: {
                message: error.messsage
            }
        })
    }
})

module.exports = router
