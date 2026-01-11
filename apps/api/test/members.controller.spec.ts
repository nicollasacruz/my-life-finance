import { MembersController } from '../src/modules/workspaces/members.controller';
import { MembersService } from '../src/modules/workspaces/members.service';

const mockMembersService = () => ({
  findAll: jest.fn(),
  updateRole: jest.fn(),
  remove: jest.fn(),
});

describe('MembersController', () => {
  let controller: MembersController;
  let service: ReturnType<typeof mockMembersService>;

  beforeEach(() => {
    service = mockMembersService() as any;
    controller = new MembersController(service as unknown as MembersService);
  });

  it('should list members', async () => {
    await controller.findAll('ws-1');
    expect(service.findAll).toHaveBeenCalledWith('ws-1');
  });

  it('should update member role with current role from request', async () => {
    const dto: any = { role: 'ADMIN' };
    const req: any = { workspaceMember: { role: 'OWNER' } };
    await controller.updateRole('ws-1', 'user-2', dto, req);
    expect(service.updateRole).toHaveBeenCalledWith('ws-1', 'user-2', dto, 'OWNER');
  });

  it('should remove member using requester id', async () => {
    const req: any = { user: { userId: 'owner-1' } };
    await controller.remove('ws-1', 'user-2', req);
    expect(service.remove).toHaveBeenCalledWith('ws-1', 'user-2', 'owner-1');
  });
});
