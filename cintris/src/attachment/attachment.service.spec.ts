import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { RabbitMQService } from "../shared/rabbitmq/rabbitmq.service";
import { HttpException } from "@nestjs/common";
import { AttachmentService } from "./attachment.service";

describe("AttachmentService", () => {
  let service: AttachmentService;
  let rabbitMQService: RabbitMQService;

  const mockRabbitMQService = {
    send: jest.fn(),
    emit: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("http://mock-salesforce-url.com"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RabbitMQService, useValue: mockRabbitMQService },
      ],
    }).compile();

    service = module.get<AttachmentService>(AttachmentService);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);

    jest.clearAllMocks();
  });

  describe("processAttachment", () => {
    it("should return success result when AttachmentId exists", async () => {
      const attachmentData = { name: "sample" } as any;
      const mockResponse = { data: { AttachmentId: "123" }, Name: "test" };
      mockRabbitMQService.send.mockResolvedValue(mockResponse);

      const result = await service.processAttachment(attachmentData);

      expect(result).toEqual({
        success: true,
        message: "Attachment Sync Successfully in Centris",
      });
      expect(mockRabbitMQService.emit).toHaveBeenCalledWith(
        "transaction-log",
        expect.objectContaining({ Success: "true" })
      );
    });

    it("should return failure result when errors exist in response", async () => {
      const attachmentData = { name: "sample" } as any;
      const mockResponse = {
        data: { errors: [{ message: "Some error", type: "ValidationError" }] },
        Name: "test",
      };
      mockRabbitMQService.send.mockResolvedValue(mockResponse);

      const result = await service.processAttachment(attachmentData);

      expect(result).toEqual({
        success: false,
        message: "Attachment Sync Failed in Centris",
      });
      expect(mockRabbitMQService.emit).toHaveBeenCalledWith(
        "transaction-log",
        expect.objectContaining({ Success: "false" })
      );
    });

    it("should throw HttpException on unexpected error", async () => {
      const attachmentData = { name: "sample" } as any;
      const error = {
        message: "Internal error",
        response: { status: 500, data: "Server crash" },
      };
      mockRabbitMQService.send.mockRejectedValue(error);

      await expect(service.processAttachment(attachmentData)).rejects.toThrow(
        HttpException
      );
    });
  });

   describe("getAttachmentsIdsOnEventSubmission", () => {
    it("should return attachment IDs when present", async () => {
      const token = "valid-token";
      const eventId = "event123";
      const mockResponse = { attachmentIDs: ["id1", "id2"] };

      mockRabbitMQService.send.mockResolvedValue(mockResponse);

      const result = await service.getAttachmentsIdsOnEventSubmission(
        token,
        eventId
      );

      expect(result).toEqual(["id1", "id2"]);
      expect(mockRabbitMQService.emit).toHaveBeenCalledWith(
        "transaction-log",
        expect.objectContaining({ Success: "true" })
      );
    });

    it("should return empty array when no attachment IDs found", async () => {
      const token = "valid-token";
      const eventId = "event123";
      const mockResponse = {};

      mockRabbitMQService.send.mockResolvedValue(mockResponse);

      const result = await service.getAttachmentsIdsOnEventSubmission(
        token,
        eventId
      );

      expect(result).toEqual([]);
      expect(mockRabbitMQService.emit).toHaveBeenCalledWith(
        "transaction-log",
        expect.objectContaining({ Success: "false" })
      );
    });

    it("should throw 401 if token is missing", async () => {
      await expect(
        service.getAttachmentsIdsOnEventSubmission("", "eventId")
      ).rejects.toThrow(HttpException);
    });

    it("should throw HttpException on RabbitMQ error", async () => {
      const error = {
        message: "Server error",
        response: { status: 500, data: "error" },
      };
      mockRabbitMQService.send.mockRejectedValue(error);

      await expect(
        service.getAttachmentsIdsOnEventSubmission("token", "eventId")
      ).rejects.toThrow(HttpException);
    });
  });
});