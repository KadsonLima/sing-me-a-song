import { Router } from "express"
import {
	resetDatabase,
	runRecomendationSeed,
} from "../controllers/testsController.js"

const testRouter = Router()

testRouter.post("/reset-database", resetDatabase)
testRouter.post("/seed-recommendations/:amount", runRecomendationSeed)

export default testRouter