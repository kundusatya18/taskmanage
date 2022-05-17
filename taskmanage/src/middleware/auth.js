const jwt = require('jsonwebtoken');
const { user, userProperties } = require('../models/users')

const auth = async (req, res, next) => {
   try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, process.env.JWT_TOEKN)
        const User = await user.findOne({ _id : decoded._id, 'tokens.token': token })

        if(!User){
            throw new error('Please authorize')
        }
        
        req.token = token
        req.User = User
        next()

    } catch (error) {
        res.status(401).send({ Error: "Please authorize" })
    }
}

module.exports = auth