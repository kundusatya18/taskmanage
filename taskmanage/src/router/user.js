const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { ExplainVerbosity } = require('mongoose/node_modules/mongodb')
const { user, userProperties } = require('../models/users')
const auth = require('../middleware/auth')
const { sendWelcomeEmail } = require('../emails/account')
const router = new express.Router()

router.get('/test', (req, res) => {
    res.send('working fine')
})

// we don't have to set header for node api as express set it by default behind the seen

// *************** user create api *************** //
router.post('/user', async (req, res) => {
	
    //const User = new user(req.body)
	// this is using async and wait function
	try {
		const User = new user(req.body)
		await User.save()
		//sendWelcomeEmail(User.email, User.name)
		const token = await User.generateToken();
		res.status(201).send({User , token})
	} catch (error) {
		res.status(400).send()
	}
   
	// User.save().then( () => {
 //       	res.status(201).send(User)
	// }).then(()=>{
	// 	//sendWelcomeEmail(User.email, User.name)
	// }).then(()=>{
	// 	const token = User.generateToken();
	// }).catch( (err) => {
	// 	if(err.code== 11000){
	// 		err= "Email already exist"
	// 	}
	// 	res.status(400).send({error: err})
	// })
});

// Login User
router.post('/user/login', async (req, res) => {

    try {
		const User = await user.findByCredentials( req.body.email , req.body.password )

		if(!User){
			return res.status(404).send({ error: "Unable to login"})
		}
        const token = await User.generateToken()
		res.send({User,token})
	} catch (error) {
		res.status(400).send(error)
	}
})

// user log out // single user
router.post('/user/logout', auth, async (req, res) => {

	try {
		req.User.tokens = req.User.tokens.filter((token) => {
			return token.token !== req.token
		})

		await req.User.save()
		res.send({success : "logout successfully"})
	} catch (error) {
		res.status(500).send({error : "something went wrong"})
	}
})

// user log out // all currently login user apart from current
router.post('/user/logoutothers', auth, async (req, res) => {

	try {
		req.User.tokens = req.User.tokens.filter((token) => {
			return token.token == req.token
		})
        
		await req.User.save()
		res.send({success : "logout other user with this credentials successfully"})
	} catch (error) {
		res.status(500).send({error : "something went wrong"})
	}
})

// user log out // all currently login user apart from current
router.post('/user/logoutallusers', auth, async (req, res) => {

	try {
		req.User.tokens = []
		await req.User.save()
		res.send({success : "logout all users with this credentials successfully"})
	} catch (error) {
		res.status(500).send({error : "something went wrong"})
	}
})

//*************** single user api *************** //
router.get('/user/me',auth, async (req, res)=>{
		res.send(req.User)
})

//*************** all users api *************** //
// note if u are finding all users then not need to create model instance
router.get('/users', async (req, res)=>{

	try {
		const users = await user.find({})

		res.status(200).send(users)
	} catch (error) {
		res.status(404).send(error);
	}
	// user.find({}).then((user)=>{
	// 	res.status(200).send(user)
	// }).catch((err) => {
	// 	res.status(404).send(err);
	// })
})

// *************** find user by id *************** //
router.get('/user/:id',async (req, res) => {
    const _id = req.params.id

	try {
		const User = await user.findById(_id)

		if(!User){
			return res.status(404).send({ error: "user not found" })
		}

		res.status(200).send(User)
	} catch (error) {
		res.status(404).send();
	}
	// user.findById(_id).then((user)=>{
	// 	res.status(200).send(user)
	// }).catch((e)=>{
	// 	res.status(404).send('no data found');
	// })
})

// *************** find user by id and update *************** //
router.patch('/user/update', auth, async (req, res) => {

	const userToUpdate = Object.keys(req.body)

	const isValidUpdate = userToUpdate.every( (update) => {
		return userProperties.includes(update)
	})

	if(!isValidUpdate){
		return res.status(404).send({ error : "wrong properties! error updating" })
	}

	try {
		userToUpdate.forEach((d) => {
			req.User[d] = req.body[d]
		})

		await req.User.save()
		//const User = await user.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
		res.status(201).send(req.User)
	} catch (error) {
		res.status(400).send(error)
	}
})

// multer setup
const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, cb){
		if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
			return cb(new error('Please upload an image'))
		}
		cb(undefined, true)
	}
})

// updating user profile
router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {

	const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer()
    //req.User.avatar = req.file.buffer
	req.User.avatar = buffer
	
	await req.User.save()
	res.send({ success: "uploaded successfully" })
}, ( error, req, res, next) => {
	res.status(400).send({ error: error.message })
})

//deleting user avatar
router.delete('/user/me/avator',auth, async (req, res) => {

	try {
		 req.User.avatar = undefined // if you set undefined the avator field will be deleted
		 await req.User.save()
		 res.send({ success: "profile picture deleted successfully"})
	} catch (error) {
		res.status(400).send(error)
	}
})

// get user image
router.get('/user/:id/avatar', async (req, res) => {

	try {
		const User = await user.findById(req.params.id)

		if(!User || !User.avatar){
			throw new error()
		}

		res.set('content-Type','image/png')
		res.send(User.avatar)

	} catch (error) {
		res.status(404).send(User.avatar)
	}
})

// *************** user delete api *************** //
router.delete('/user/delete', auth, async (req, res) => {
	    
	try {
		await req.User.remove()
		res.status(200).send({ success: "user deleted"})
	} catch (error) {
		res.status(404).send(error)
	}
})

module.exports = router