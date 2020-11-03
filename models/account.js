const mongoose = require('mongoose')
const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/

const Account = mongoose.model('Account', {
    email: {
        unique: true,
        required: true,
        type: String,
        validate: {
            validator: function(v) {
              return emailRegex.test(v);
            },
            message: props => `${props.value} is not a valid email format!`,
            code: 'Format'
          },
    },
    account: {
        username: {
            required: true,
            type: String
        },
        phone: String,
        avatar: Object,
    },
    token: String,
    hash: String,
    salt: String,
})

module.exports = Account