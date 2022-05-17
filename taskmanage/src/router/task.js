const express = require('express')
const { tasks , tasksProperties } = require('../models/tasks')
const auth = require('../middleware/auth')
const router = new express.Router()

// *************** task create api *************** //
router.post('/tasks',auth, async (req, res) => {
	//const Task = new tasks(req.body)
	const Task = new tasks({
		...req.body,
		owner: req.User._id
	})

	try {
		await Task.save()
		res.status(201).send(Task)
	} catch (error) {
		res.status(400).send(err);
	}

	// Task.save().then( () => {
    //    	res.status(201).send(Task)
	// }).catch( (err) => {
	// 	res.status(400).send(err);
	// })
});

// *************** get all tasks *************** //
// get the tasks which user has created

router.get('/tasks', auth, async (req, res) => {

	try {

		//const Tasks = await tasks.find({ owner: req.User._id })
		
		// if(!Tasks){
		// 	return res.status(404).send({error: "No tasks found"})
		// }
		await req.User.populate('task')
		//console.log(req.User.task)

		res.status(200).send(req.User.task)
	} catch (error) {
		res.status(400).send(error)
	}
})


// *************** find task by id *************** //
// only owner of the task can find this
router.get('/task/:id',auth, async (req, res) => {
	try {
		//const Task = await tasks.findById(req.params.id)
		const Task = await tasks.findOne({ _id : req.params.id, owner: req.User.id })

		if(!Task){
			return res.status(404).send({ error: "no task found" })
		}

		res.status(200).send(Task)
	} catch (error) {
		res.status(400).send(error)
	}
})
// *************** find a task by id and update *************** //
router.patch('/task/:id',auth, async (req, res) => {

	const taskToUpdate = Object.keys(req.body)

	const isValidUpdate = taskToUpdate.every( (update) => {
		return tasksProperties.includes(update)
	})

	if(!isValidUpdate){
		return res.status(400).send({ error: "invalid update" })
	}

	try {
		//const Task = await tasks.findById(req.params.id)
		
		const Task = await tasks.findOne({ _id : req.params.id , owner: req.User._id })

		//const Task = await tasks.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
		if(!Task){
			return res.status(404).send( { error : "no data found" } )
		}

		taskToUpdate.forEach( (u) => {
			Task[u] = req.body[u]
		})
		await Task.save()
		res.status(200).send(Task)
	} catch (error) {
		res.status(400).send(error)
	}
})

// *************** Delete task by id *************** //

router.delete('/task/:id', auth, async (req, res) => {

	try {
		//const Task = await tasks.findByIdAndDelete(req.params.id)

		const Task = await tasks.findOneAndDelete({ _id: req.params.id, owner: req.User._id })

		if(!Task){
			return res.status(404).send({error: "No task found"})
		}

		res.status(200).send({ success : "task has been deleted" })
	} catch (error) {
		res.status(404).send(error)
	}
})

module.exports = router