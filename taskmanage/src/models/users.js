const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Router } = require('express');
const { tasks } = require('./tasks');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 5
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value <= 0){
                throw new Error('Age must be a positive number');
            }
        }
    },
    gender: {
        type: Boolean
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps : true
})

userSchema.virtual('task', {
    ref: 'tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const User = this

    const userObject = User.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// only instance can use this method
userSchema.methods.generateToken = async function() {
    const User = this
    const token = jwt.sign({ _id: User._id.toString() }, process.env.JWT_TOEKN)
    User.tokens = User.tokens.concat({ token })
    await User.save()
    return token
}

// this is model method we can access directly 
userSchema.statics.findByCredentials = async (email , password) => {
    
    const User = await user.findOne({ email })
    //console.log('check1 '+User)
    const validpass = await bcrypt.compare(password, User.password)
    //console.log('check2 '+validpass)
    if(User && validpass){
        //dconsole.log('check3 ')
        return User
    } else {
        throw new Error('Unable to login')
    }
}

// this will only work for create. So, for update api we have to modify as create to use this middleware
// Note: this will work before saving.
userSchema.pre('save', async function (next) {
    const User = this
    if(User.isModified('password')){
        User.password = await bcrypt.hash(User.password, 8)
    }
    next()
})

// cascade delete tasks associated with user
userSchema.pre('remove', async function(next){
    const User = this
    
    await tasks.deleteMany({ owner: User._id })
    
    next()
})

const user = mongoose.model('users', userSchema);

const userProperties = ['name', 'email', 'password' , 'age' , 'gender']

module.exports = { user, userProperties }