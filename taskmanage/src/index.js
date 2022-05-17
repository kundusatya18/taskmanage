const app = require('./app')

const port = process.env.PORT


// const { tasks } = require('./models/tasks')

// const main = async () => {
// 	const Task = await tasks.findById('614a415d788d6b3f71b14ba3')

// 	//await Task.populate('owner').execPopulate()
     
//     await Task.populate('owner')

// 	console.log(Task.owner)
	//  tasks.find().populate('owner').exec((err,posts)=>{
	// 	if(err){
	// 		console.log(err)
	// 	}
	// 	else{
	// 		if (!posts) {
	// 			console.log('No owner found')
	// 		}
	// 		else{
	// 			console.log(posts)
	// 		}
	// 	}
	// })
// }

// main()

// app running
app.listen(port, ()=> {
	console.log('server is running on port '+ port)
})	
