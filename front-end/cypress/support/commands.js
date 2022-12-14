// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


const API_BASE_URL = "http://localhost:5000"

Cypress.Commands.add("resetDatabase", () => {
	cy.request("POST", `${API_BASE_URL}/tests/reset-database`).as(
		"resetDatabase"
	)
})

Cypress.Commands.add("createRecommendation", (amount = 1, score = 0) => {
	cy.request(
		"POST",
		`${API_BASE_URL}/tests/seed-recommendations/${amount}?score=${score}`
	).as("createRecommendation")
})