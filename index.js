const express = require("express")
const cors = require("cors")
const { connectToDb, getDb } = require("./db.js")
const { ObjectId } = require("mongodb")
require("dotenv").config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "500mb" }))

const port = process.env.PORT

let db
connectToDb((err) => {
	if (!err) {
		app.listen(port, () => {
			console.log(`Server listening on port ${port}....`)
		})
		db = getDb()
	}
})

app.get("/", (req, res) => {
	res.json({ msg: "Hello World!" })
})

app.get("/projects", (req, res) => {
	db.collection("projects")
		.find({})
		.toArray()
		.then((projects) => {
			res.json(projects)
		})
		.catch((err) => {
			res.status(500).json({ msg: "Internal  Error" })
		})
})

app.post("/projects", (req, res) => {
	const { name, info, image, url } = req.body
	db.collection("projects")
		.insertOne({ name, info, image, url })
		.then((result) => {
			console.log(result)
			return result
		})
		.then((result) => {
			res.status(201).json(result)
		})
		.catch((err) => {
			console.log(err)
			res.status(500).json({ err: "Error inserting project" })
		})
})

app.patch("/projects/:id", (req, res) => {
	if (ObjectId.isValid(req.params.id)) {
		db.collection("projects")
			.updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body })
			.then((result) => {
				res.status(200).json(result)
			})
			.catch((err) => {
				console.log(err)
				res.status(500).json({ error: "Error updating project" })
			})
	} else {
		res.status(400).json({ error: "Invalid ID" })
	}
})
