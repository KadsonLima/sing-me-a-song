

describe('Adicionar Recomendação', () => {
  it('adicionar recomendação', () => {
    cy.visit('http://localhost:3000/');

    cy.get("input").eq(0).type("nome");
    cy.get("input").eq(1).type("https://www.youtube.com/watch?v=UToclsnPOsA");

		cy.get("button").click();
  })
})