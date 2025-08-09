import { Test, TestingModule } from "@nestjs/testing";
import { TerritoryService } from "./territory.service";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { HttpException } from "@nestjs/common";
import { ManageTerritoryDTO } from "./DTOs/manage-territory.dto";
import { RabbitMQService } from "../shared/rabbitmq/rabbitmq.service";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("TerritoryService", () => {
  let service: TerritoryService;
  let rmqService: RabbitMQService;

  const mockEmit = jest.fn();
  const mockDto: ManageTerritoryDTO = {
    transactionId: "a3s5C0000008vfZQAQ",
    terDataList: [
      {
        parentMstrId: "T1234",
        name: "Demoxyz",
        masterId: "T000",
      },
    ],
    transactionName: ""
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerritoryService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("https://mocked.salesforce.com"),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            emit: mockEmit,
          },
        },
      ],
    }).compile();

    service = module.get<TerritoryService>(TerritoryService);
    rmqService = module.get<RabbitMQService>(RabbitMQService);
    mockEmit.mockClear();
  });

  it("should emit and throw HttpException on non-2xx response", async () => {
    const mockResponse = { status: 401, data: "Unauthorized" };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);
  });

  it("should throw internal error on unexpected failure", async () => {
    const error = { response: undefined };
    mockedAxios.post.mockRejectedValueOnce(error);

    await expect(service.manageTerritory("any", mockDto)).rejects.toThrow(
      new HttpException("Salesforce API call failed", 500)
    );
  });
});
