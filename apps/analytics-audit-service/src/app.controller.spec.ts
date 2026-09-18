import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsAuditController } from './app.controller';
import { AnalyticsAuditService } from './app.service';

describe('AnalyticsAuditController', () => {
  let appController: AnalyticsAuditController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsAuditController],
      providers: [AnalyticsAuditService],
    }).compile();

    appController = app.get<AnalyticsAuditController>(AnalyticsAuditController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
