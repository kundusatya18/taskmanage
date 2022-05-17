const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    completed: {
        type: Boolean,
        default: true
    },
    owner: {
        type : mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
},{
    timestamps : true
})

taskSchema.pre('save', async function (next) {

    console.log('Before saving')
    next()
})

const tasks = mongoose.model('tasks',taskSchema)
const tasksProperties = ['name', 'description', 'completed']            

module.exports = { tasks , tasksProperties }