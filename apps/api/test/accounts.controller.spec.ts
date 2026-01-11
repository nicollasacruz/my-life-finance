import { AccountsController } from '../src/modules/accounts/accounts.controller';
import { AccountsService } from '../src/modules/accounts/accounts.service';
import { AccountType } from '@prisma/client';

const mockAccountsService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('AccountsController', () => {
  let controller: AccountsController;
  let service: ReturnType<typeof mockAccountsService>;

  beforeEach(() => {
    service = mockAccountsService() as any;
    controller = new AccountsController(service as unknown as AccountsService);
  });

  it('should create account', async () => {
    const dto: any = { name: 'Rent' };
    await controller.create('ws-1', dto);
    expect(service.create).toHaveBeenCalledWith('ws-1', dto);
  });

  it('should list accounts with optional type', async () => {
    await controller.findAll('ws-1', AccountType.FIXED);
    expect(service.findAll).toHaveBeenCalledWith('ws-1', AccountType.FIXED);
  });

  it('should get one account', async () => {
    await controller.findOne('acc-1', 'ws-1');
    expect(service.findOne).toHaveBeenCalledWith('acc-1', 'ws-1');
  });

  it('should update account', async () => {
    const dto: any = { name: 'Updated' };
    await controller.update('acc-1', 'ws-1', dto);
    expect(service.update).toHaveBeenCalledWith('acc-1', 'ws-1', dto);
  });

  it('should remove account', async () => {
    await controller.remove('acc-1', 'ws-1');
    expect(service.remove).toHaveBeenCalledWith('acc-1', 'ws-1');
  });
});
