import { faker } from "@faker-js/faker"

export function  createRecomendation(){
    return {
        name:faker.name.firstName(),
        youtubeLink:'https://www.youtube.com/watch?v=chwyjJbcs1Y'
    }
}