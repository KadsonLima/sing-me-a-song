import { faker } from "@faker-js/faker";

const API_BASE_URL = "http://localhost:5000";

beforeEach(() => {
  cy.resetDatabase();
});

describe("Create recommendation ", () => {
  it("create a new recommendation", () => {
    const recommendation = {
      name: faker.music.songName(),
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
    };
    cy.visit("http://localhost:3000/");
    cy.get("input[placeholder='Name']").type(recommendation.name);
    cy.get("input[placeholder='https://youtu.be/...']").type(
      recommendation.youtubeLink
    );
    cy.intercept("POST", `${API_BASE_URL}/recommendations`).as(
      "createRecommendation"
    );
    cy.get("button").click();
    cy.wait("@createRecommendation").then(({ response }) => {
      expect(response.statusCode).equal(201);
    });
  });

  it("not create a new recommendation if name is empty", () => {
    const recommendation = {
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
    };
    cy.visit("http://localhost:3000/");
    cy.get("input[placeholder='https://youtu.be/...']").type(
      recommendation.youtubeLink
    );
    cy.intercept("POST", `${API_BASE_URL}/recommendations`).as(
      "createRecommendation"
    );
    cy.get("button").click();
    cy.wait("@createRecommendation").then(({ response }) => {
      expect(response.statusCode).equal(422);
    });
  });
  it("not create a new recommendation if youtube link is empty", () => {
    const recommendation = {
      name: faker.music.songName(),
    };
    cy.visit("http://localhost:3000/");
    cy.get("input[placeholder='Name']").type(recommendation.name);
    cy.intercept("POST", `${API_BASE_URL}/recommendations`).as(
      "createRecommendation"
    );
    cy.get("button").click();
    cy.wait("@createRecommendation").then(({ response }) => {
      expect(response.statusCode).equal(422);
    });
  });
});

describe("Vote a recommendation suit test", () => {
  describe("Upvote a recommendation suit test", () => {
    it("upvote a recommendation", () => {
      cy.createRecommendation();
      const id = 1;

      cy.intercept("GET", `${API_BASE_URL}/recommendations`).as(
        "getRecommendations"
      );
      cy.visit("http://localhost:3000/");
      cy.wait("@getRecommendations");
      cy.get("article>div:nth-child(3)").then((div) => {
        const currentScore = parseInt(div.text());
        cy.intercept("POST", `${API_BASE_URL}/recommendations/${id}/upvote`).as(
          "upvote"
        );
        cy.get("#upvoteRecommendation").click();
        cy.wait("@upvote").then(({ response }) => {
          expect(response.statusCode).equal(200);
          cy.wait(500).then(() =>
            expect(currentScore + 1).equal(parseInt(div.text()))
          );
        });
      });
    });
  });
  describe("Downvote a recommendation suit test", () => {
    it("downvote a recommendation", () => {
      cy.createRecommendation();
      const id = 1;
      cy.intercept("GET", `${API_BASE_URL}/recommendations`).as(
        "getRecommendations"
      );
      cy.visit("http://localhost:3000/");
      cy.wait("@getRecommendations");
      cy.get("article>div:nth-child(3)").then((div) => {
        const currentScore = parseInt(div.text());
        cy.intercept(
          "POST",
          `${API_BASE_URL}/recommendations/${id}/downvote`
        ).as("downvote");
        cy.get("#downvoteRecommendation").click();
        cy.wait("@downvote").then(({ response }) => {
          expect(response.statusCode).equal(200);
          cy.wait(500).then(() =>
            expect(currentScore - 1).equal(parseInt(div.text()))
          );
        });
      });
    });
    it("remove recommendation if score is less than -5", () => {
      cy.createRecommendation(1, -5);
      const id = 1;
      cy.intercept("GET", `${API_BASE_URL}/recommendations`).as(
        "getRecommendations"
      );
      cy.visit("http://localhost:3000/");
      cy.wait("@getRecommendations");

      cy.intercept("POST", `${API_BASE_URL}/recommendations/${id}/downvote`).as(
        "downvote"
      );
      cy.get("#downvoteRecommendation").click();
      cy.wait("@downvote").then(({ response }) => {
        expect(response.statusCode).equal(200);
        cy.wait(500).then(() =>
          cy.get("article>div:nth-child(3)").should("not.exist")
        );
      });
    });
  });
});

describe("Get's recommendations suit test", () => {
  describe("Get recommendations suit test", () => {
    it("only get 10 recommendations", () => {
      cy.createRecommendation(15);
      cy.intercept("GET", `${API_BASE_URL}/recommendations`).as(
        "getRecommendations"
      );
      cy.visit("http://localhost:3000/");
      cy.wait("@getRecommendations").then(({ response }) => {
        expect(response.statusCode).equal(200);
        expect(response.body.length).equal(10);
        cy.get("#no-recommendations").should("not.exist");
      });
    });
    it("not get any recommendations if there are no recommendations", () => {
      cy.intercept("GET", `${API_BASE_URL}/recommendations`).as(
        "getRecommendations"
      );
      cy.visit("http://localhost:3000/");
      cy.wait("@getRecommendations").then(({ response }) => {
        expect(response.statusCode).equal(200);
        expect(response.body.length).equal(0);
        cy.get("#no-recommendations").should("exist");
      });
    });
  });
  describe("Get a random recommendation suit test", () => {
    it("get a random recommendation", () => {
      cy.createRecommendation(5);
      cy.intercept("GET", `${API_BASE_URL}/recommendations/random`).as(
        "getRecommendations"
      );
      cy.visit("http://localhost:3000/random");
      cy.wait("@getRecommendations").then(({ response }) => {
        expect(response.statusCode).equal(200);
        expect(response.body).not.equal(null);
        cy.get("#no-recommendations").should("not.exist");
      });
    });
  });
  describe("Get the top recommendations suit test", () => {
    it("get the top 10 recommendations", () => {
      cy.createRecommendation(5, 100);
      cy.createRecommendation(5, 200);
      cy.createRecommendation(5);
      cy.intercept("GET", `${API_BASE_URL}/recommendations/top/10`).as(
        "getRecommendations"
      );
      cy.visit("http://localhost:3000/top");
      cy.wait("@getRecommendations").then(({ response }) => {
        expect(response.statusCode).equal(200);
        expect(response.body.length).equal(10);
        cy.get("#no-recommendations").should("not.exist");
        cy.get("article:nth-of-type(1)>div:nth-child(3)").then((div) =>
          cy.wait(500).then(() => expect(parseInt(div.text())).equal(200))
        );
        cy.get("article:nth-of-type(6)>div:nth-child(3)").then((div) =>
          cy.wait(500).then(() => expect(parseInt(div.text())).equal(100))
        );
      });
    });
  });
});
