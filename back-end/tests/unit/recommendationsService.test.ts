import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { recommendationService } from "../../src/services/recommendationsService";
import {
  createId,
  createRecommendationBody,
  createRecommendationData,
} from "./factories/unitfactory";

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock("../../src/repositories/recommendationRepository");

describe("recommendation service test suite", () => {
  describe("Create a new recommendation", () => {
    it("create a new recommendation", async () => {
      jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValueOnce(null);
      jest
        .spyOn(recommendationRepository, "create")
        .mockResolvedValueOnce(null);

      const recommendationBody = createRecommendationBody();
      await recommendationService.insert(recommendationBody);
      expect(recommendationRepository.findByName).toBeCalled();
      expect(recommendationRepository.create).toBeCalled();
    });
    it("not create a new recommendation if it already exists", async () => {
      jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValueOnce(true as any);

      const recommendationBody = createRecommendationBody();
      const promise = recommendationService.insert(recommendationBody);
      expect(promise).rejects.toHaveProperty("type", "conflict");
    });
  });
  describe("Upvote a recommendation", () => {
    it("upvote the existing recommendation", async () => {
      jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValueOnce(true as any);
      jest
        .spyOn(recommendationRepository, "updateScore")
        .mockResolvedValueOnce(null);

      await recommendationService.upvote(createId());
      expect(recommendationRepository.find).toBeCalled();
      expect(recommendationRepository.updateScore).toBeCalled();
    });
    it("not upvote a recommendation if the recommendation id does not exist", () => {
      jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValueOnce(false as any);
      const promise = recommendationService.upvote(createId());
      expect(promise).rejects.toHaveProperty("type", "not_found");
    });
  });
  describe("Downvote a recommendation", () => {
    it("downvote the existing recommendation", async () => {
      jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValueOnce(true as any);
      jest
        .spyOn(recommendationRepository, "updateScore")
        .mockResolvedValueOnce(1 as any);
      jest
        .spyOn(recommendationRepository, "remove")
        .mockResolvedValueOnce(null);

      await recommendationService.downvote(createId());
      expect(recommendationRepository.find).toBeCalled();
      expect(recommendationRepository.updateScore).toBeCalled();
      expect(recommendationRepository.remove).not.toBeCalled();
    });
    it("not downvote a recommendation if the recommendation id does not exist", () => {
      jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValueOnce(false as any);
      const promise = recommendationService.downvote(createId());
      expect(promise).rejects.toHaveProperty("type", "not_found");
    });
    it(" downvote and remove the existing recommendation", async () => {
      jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValueOnce(true as any);
      jest
        .spyOn(recommendationRepository, "updateScore")
        .mockResolvedValueOnce({ score: -6 } as any);
      jest
        .spyOn(recommendationRepository, "remove")
        .mockResolvedValueOnce(null);

      await recommendationService.downvote(createId());
      expect(recommendationRepository.find).toBeCalled();
      expect(recommendationRepository.updateScore).toBeCalled();
      expect(recommendationRepository.remove).toBeCalled();
    });
  });
  describe("Get recommendation by id", () => {
    it("return a recommendation if id is valid", async () => {
      const recommendation = createRecommendationData();
      jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValueOnce(recommendation);
      const result = await recommendationService.getById(createId());
      expect(recommendationRepository.find).toBeCalled();
      expect(result).toEqual(recommendation);
    });
    it("not return a recommendation if id is invalid", async () => {
      jest.spyOn(recommendationRepository, "find").mockResolvedValueOnce(null);
      const promise = recommendationService.getById(createId());
      expect(promise).rejects.toHaveProperty("type", "not_found");
    });
  });
  describe("Get all recommendations", () => {
    it("return a list of recommendations", async () => {
      const recommendations = [
        createRecommendationData(),
        createRecommendationData(),
      ];
      jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValueOnce(recommendations);
      const result = await recommendationService.get();
      expect(recommendationRepository.findAll).toBeCalled();
      expect(result).toEqual(recommendations);
    });
  });
  describe("Get top recommendations", () => {
    it("return a list of top recommendations", async () => {
      const recommendations = [
        createRecommendationData(),
        createRecommendationData(),
      ];
      jest
        .spyOn(recommendationRepository, "getAmountByScore")
        .mockResolvedValueOnce(recommendations);
      const result = await recommendationService.getTop(2);
      expect(recommendationRepository.getAmountByScore).toBeCalled();
      expect(result).toEqual(recommendations);
    });
  });
  describe("Get random recommendation", () => {
    it("return a random recommendation with 10 or more of score", async () => {
      const recommendations = [
        createRecommendationData(),
        createRecommendationData(),
      ];
      jest.spyOn(Math, "random").mockImplementation(() => {
        return 0.5;
      });
      jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValueOnce(recommendations);
      const result = await recommendationService.getRandom();
      expect(recommendationRepository.findAll).toBeCalled();
      expect(result).toEqual(recommendations[1]);
    });
    it("return a random recommendation between -5 and 10 score", async () => {
      const recommendations = [
        createRecommendationData(),
        createRecommendationData(),
      ];
      jest.spyOn(Math, "random").mockImplementation(() => {
        return 0.8;
      });
      jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValueOnce(recommendations);
      const result = await recommendationService.getRandom();
      expect(recommendationRepository.findAll).toBeCalled();
      expect(result).toEqual(recommendations[1]);
    });
    it("not return a random recommendation if there are no recommendations", async () => {
      jest.spyOn(Math, "random").mockImplementation(() => {
        return 0.5;
      });
      jest.spyOn(recommendationRepository, "findAll").mockResolvedValue([]);
      const promise = recommendationService.getRandom();
      expect(promise).rejects.toHaveProperty("type", "not_found");
    });
  });
});
