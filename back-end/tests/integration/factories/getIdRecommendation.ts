import { prisma } from "../../../src/database";
import { createRecomendation } from "./newRecommendation";


export  function  getRecommendationId(score=0){
    const newRecommendation = createRecomendation();
    newRecommendation['score'] = score;

    return newRecommendation
}

export async function  recommendationScenary(
	length = 1,
	score = 0
){
	const recomendations = Array.from({ length }, () =>
        getRecommendationId(score)
	)

	const result = Promise.all(
		recomendations.map(
			async rec => await prisma.recommendation.create({ data: rec })
		)
	)
	return result
}

export const deleteAllData = async () =>
	await prisma.$transaction([
		prisma.$executeRaw`TRUNCATE TABLE recommendations RESTART IDENTITY`,
	])