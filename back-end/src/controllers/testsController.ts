import { Response, Request } from "express"
import testsRepository from "../repositories/testsRepository.js"

const resetDatabase = async (req: Request, res: Response) => {
	await testsRepository.deleteAll()
	res.sendStatus(200)
}

const runRecomendationSeed = async (req: Request, res: Response) => {
	const amount = parseInt(req.params.amount) || 1
	const score = Number(req.query.score) || 0
	const recommendationData = await testsRepository.insert(amount, score)
	res.status(200).send(recommendationData)
}

export { resetDatabase, runRecomendationSeed }