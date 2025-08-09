import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentService } from './attachment.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Attachment } from '../entities/attachment.entity';
import { AttachmentIds } from '../entities/attachmentIds.entity';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let attachmentRepo: Repository<Attachment>;
  let attachmentIdsRepo: Repository<AttachmentIds>;

  const mockAttachmentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
  };

  const mockAttachmentIdsRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        {
          provide: getRepositoryToken(Attachment),
          useValue: mockAttachmentRepo,
        },
        {
          provide: getRepositoryToken(AttachmentIds),
          useValue: mockAttachmentIdsRepo,
        },
      ],
    }).compile();

    service = module.get<AttachmentService>(AttachmentService);
    attachmentRepo = module.get(getRepositoryToken(Attachment));
    attachmentIdsRepo = module.get(getRepositoryToken(AttachmentIds));
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handelCreatedAttachment', () => {
    it('should create and save attachment', async () => {
      const data = { Id: '1' };
      mockAttachmentRepo.create.mockReturnValue(data);
      mockAttachmentRepo.save.mockResolvedValue(data);

      await service.handelCreatedAttachment(data);

      expect(mockAttachmentRepo.create).toHaveBeenCalledWith(data);
      expect(mockAttachmentRepo.save).toHaveBeenCalledWith(data);
    });
  });

  describe('sendAttachmentIDsToCentris', () => {
    it('should throw if eventId is missing', async () =>
      await expect(service.sendAttachmentIDsToCentris('')).rejects.toThrow(
        HttpException,
      ));

    it('should fetch attachments and save AttachmentIds', async () => {
      const eventId = '123';
      const mockAttachments = [{ Id: 'a1' }, { Id: 'a2' }];
      mockAttachmentRepo.find.mockResolvedValue(mockAttachments);
      mockAttachmentIdsRepo.create.mockReturnValue({
        Id: eventId,
        AttachmentIdList: ['a1', 'a2'],
      });

      await service.sendAttachmentIDsToCentris(eventId);

      expect(mockAttachmentRepo.find).toHaveBeenCalledWith({
        where: { ExternalRecordId: eventId },
        select: ['Id'],
      });

      expect(mockAttachmentIdsRepo.create).toHaveBeenCalledWith({
        Id: eventId,
        AttachmentIdList: ['a1', 'a2'],
      });

      expect(mockAttachmentIdsRepo.save).toHaveBeenCalled();
    });
  });
});