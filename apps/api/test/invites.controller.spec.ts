import { InvitesController } from '../src/modules/workspaces/invites.controller';
import { InvitesService } from '../src/modules/workspaces/invites.service';

const mockInvitesService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  accept: jest.fn(),
  decline: jest.fn(),
  cancel: jest.fn(),
});

describe('InvitesController', () => {
  let controller: InvitesController;
  let service: ReturnType<typeof mockInvitesService>;

  beforeEach(() => {
    service = mockInvitesService() as any;
    controller = new InvitesController(service as unknown as InvitesService);
  });

  it('should create invite with workspace and user', async () => {
    const req: any = { user: { userId: 'user-1' } };
    const dto: any = { email: 'invitee@example.com' };
    await controller.create('ws-1', dto, req);
    expect(service.create).toHaveBeenCalledWith('ws-1', 'user-1', dto);
  });

  it('should list invites', async () => {
    await controller.findAll('ws-1');
    expect(service.findAll).toHaveBeenCalledWith('ws-1');
  });

  it('should accept invite with token and user', async () => {
    const req: any = { user: { userId: 'user-1' } };
    await controller.accept('token-1', req);
    expect(service.accept).toHaveBeenCalledWith('token-1', 'user-1');
  });

  it('should decline invite with token and user', async () => {
    const req: any = { user: { userId: 'user-1' } };
    await controller.decline('token-1', req);
    expect(service.decline).toHaveBeenCalledWith('token-1', 'user-1');
  });

  it('should cancel invite', async () => {
    await controller.cancel('invite-1');
    expect(service.cancel).toHaveBeenCalledWith('invite-1');
  });
});
