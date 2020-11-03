const Accounts = require('../models/account')

const isAuthenticated = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const bearer = req.headers.authorization.replace('Bearer ', '')
            const user = await Accounts.findOne({token: bearer })
            if (user) {
                req.user = user
                return next()
            } 
        }
        res.status(401).json({ error: { message : 'Not authorized' } })
    } catch (error) {
        res.status(401).json({ error: { message : 'Not uthorized' } })
    }
};
module.exports = isAuthenticated