import { getRecommendationId } from "../../tests/integration/factories/getIdRecommendation.js"
import {prisma} from "../database.js"

const insert = async (length = 1, score = 0) => {
	const recomendations = Array.from({ length }, () =>
		getRecommendationId(score)
	)
	const result = Promise.all(
		recomendations.map(
			async (rec) => await prisma.recommendation.create({ data: rec })
		)
	)
	return result
}

const deleteAll = async () =>
	await prisma.$transaction([
		prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`,
	])

export default { insert, deleteAll }