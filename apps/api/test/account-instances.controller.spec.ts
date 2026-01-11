import { AccountInstancesController } from '../src/modules/account-instances/account-instances.controller';
import { AccountInstancesService } from '../src/modules/account-instances/account-instances.service';

const mockAccountInstancesService = () => ({
  findAll: jest.fn(),
  getDashboardStats: jest.fn(),
  generateYearlyInstances: jest.fn(),
  findOne: jest.fn(),
  markPaid: jest.fn(),
  markExempt: jest.fn(),
  reopen: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('AccountInstancesController', () => {
  let controller: AccountInstancesController;
  let service: ReturnType<typeof mockAccountInstancesService>;

  beforeEach(() => {
    service = mockAccountInstancesService() as any;
    controller = new AccountInstancesController(
      service as unknown as AccountInstancesService,
    );
  });

  it('should list instances', async () => {
    await controller.findAll('ws-1', 2024, 5);
    expect(service.findAll).toHaveBeenCalledWith('ws-1', 2024, 5);
  });

  it('should get dashboard stats with provided year/month', async () => {
    await controller.getDashboardStats('ws-1', 2024, 6);
    expect(service.getDashboardStats).toHaveBeenCalledWith('ws-1', 2024, 6);
  });

  it('should generate yearly instances', async () => {
    await controller.generateYearly('ws-1', 2025);
    expect(service.generateYearlyInstances).toHaveBeenCalledWith('ws-1', 2025);
  });

  it('should get one instance', async () => {
    await controller.findOne('inst-1', 'ws-1');
    expect(service.findOne).toHaveBeenCalledWith('inst-1', 'ws-1');
  });

  it('should mark paid', async () => {
    const dto: any = { amountPaid: 1000 };
    await controller.markPaid('inst-1', 'ws-1', dto);
    expect(service.markPaid).toHaveBeenCalledWith('inst-1', 'ws-1', dto);
  });

  it('should mark exempt', async () => {
    await controller.markExempt('inst-1', 'ws-1');
    expect(service.markExempt).toHaveBeenCalledWith('inst-1', 'ws-1');
  });

  it('should reopen instance', async () => {
    await controller.reopen('inst-1', 'ws-1');
    expect(service.reopen).toHaveBeenCalledWith('inst-1', 'ws-1');
  });

  it('should update instance', async () => {
    const dto: any = { notes: 'updated' };
    await controller.update('inst-1', 'ws-1', dto);
    expect(service.update).toHaveBeenCalledWith('inst-1', 'ws-1', dto);
  });

  it('should remove instance', async () => {
    await controller.remove('inst-1', 'ws-1');
    expect(service.remove).toHaveBeenCalledWith('inst-1', 'ws-1');
  });
});
