import supertest from 'supertest';
import app from '../../src/app'
import { prisma } from '../../src/database';
import { deleteAllData, recommendationScenary } from './factories/getIdRecommendation';
import { createRecomendation } from './factories/newRecommendation';


beforeEach(async () => {
	await deleteAllData()
})

describe("Create new Recomendation ...", () =>{

    it("Enviando a requisição com tipos diferente, deve dar erro", async ()=>{
        const recomendation = {name:1, youtubeLink:'https://www.youtube.com/watch?v=chwyjJbcs1Y'}

        const result = await supertest(app).post('/recommendations').send(recomendation);


        expect(result.status).toBe(422);

    })

    it("Create an existing recommendation", async ()=>{
        const recomendation = await createRecomendation()

        await supertest(app).post('/recommendations').send(recomendation);
        const result = await supertest(app).post('/recommendations').send(recomendation);


        expect(result.status).toBe(409);

    })

    it("Create a recomendation", async ()=>{
        const recomendation = await createRecomendation()

        const result = await supertest(app).post('/recommendations').send(recomendation);
        const recomendationDataBase = await prisma.recommendation.findUnique({
            where:{name:recomendation.name}
        });

        expect(result.status).toBe(201);
        expect(recomendationDataBase).not.toBeNull();
    })
})

describe("POST /upvote", () => {
	it("upvote a recommendation", async () => {
		const newRecommendation = await recommendationScenary();

		const { id } = newRecommendation[0]

		const response = await supertest(app).post(`/recommendations/${id}/upvote`)

		const recommendation = await prisma.recommendation.findUnique({
			where: { id },
		})
		expect(recommendation.score).toBe(1)
		expect(response.status).toBe(200)
	})

	it("not upvote a recommendation if not exist", async () => {
		const response = await supertest(app).post("/recommendations/999/upvote")
		expect(response.status).toBe(404)
	})
})

describe("POST /downvote", () => {
	it("downvote a recommendation", async () => {

		const recommendationData = await recommendationScenary()

		const { id } = recommendationData[0]

		const response = await supertest(app).post(`/recommendations/${id}/downvote`)

		const recommendation = await prisma.recommendation.findUnique({
			where: { id },
		})
		expect(recommendation.score).toBe(-1)
		expect(response.status).toBe(200)
	})
	it("not upvote a recommendation if not exist", async () => {
		const response = await supertest(app).post("/recommendations/123/downvote")
		expect(response.status).toBe(404)
	})
	it("remove a recommendation if the score is less than -5", async () => {
		const recommendationData = await recommendationScenary(1, -6)

		const { id } = recommendationData[0]
        
		const response = await supertest(app).post(`/recommendations/${id}/downvote`)
		const recommendation = await prisma.recommendation.findUnique({
			where: { id },
		})
		expect(recommendation).toBeNull()
		expect(response.status).toBe(200)
	})
})

describe("GET /recommendations", () => {

	it("return a list with 10 recommendations", async () => {
		await recommendationScenary(11)
		const response = await supertest(app).get("/recommendations")
		expect(response.status).toBe(200)
		expect(response.body).toHaveLength(10)
	})
	it("return an empty list if no recommendations", async () => {
		const response = await supertest(app).get("/recommendations")
		expect(response.status).toBe(200)
		
	})
	describe("GET /recommendations-by-id", () => {
		it("should return a recommendation by id", async () => {
			const recommendationData =
				await recommendationScenary(2)
			const { id } = recommendationData[0]
			const response = await supertest(app).get(`/recommendations/${id}`)
			expect(response.status).toBe(200)
			expect(response.body).toEqual(recommendationData[0])
		})
		it("should not return a recommendation if id does not exist", async () => {
			const response = await supertest(app).get("/recommendations/123")
			expect(response.status).toBe(404)
		})
	})
	describe("GET /random-recommendations", () => {
		it("should return a random recommendation", async () => {
			const recommendationData =
				await recommendationScenary(1)
			const response = await supertest(app).get("/recommendations/random")
			expect(response.status).toBe(200)
			expect(response.body).toEqual(recommendationData[0])
		})
		it("should not return a recommendation if none exists", async () => {
			const response = await supertest(app).get("/recommendations/random")
			expect(response.status).toBe(404)
		})
	})
	describe("GET /top-recommendations", () => {
		it(" return a list of top recommendations", async () => {
			await recommendationScenary(10, 200)
			await recommendationScenary(10, 100)

			const response = await supertest(app).get("/recommendations/top/10")
			expect(response.status).toBe(200)
			expect(response.body).toHaveLength(10)
			expect(response.body).not.toHaveProperty("score", 100)
		})
		it("return an empty list of top recommendations if none exist", async () => {
			const response = await supertest(app).get("/recommendations/top/10")
			expect(response.status).toBe(200)
			
		})
	})
})

afterAll(async () => {
	await prisma.$disconnect()
})