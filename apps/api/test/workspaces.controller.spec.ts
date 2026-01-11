import { WorkspacesController } from '../src/modules/workspaces/workspaces.controller';
import { WorkspacesService } from '../src/modules/workspaces/workspaces.service';

const mockWorkspacesService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let service: ReturnType<typeof mockWorkspacesService>;

  beforeEach(() => {
    service = mockWorkspacesService() as any;
    controller = new WorkspacesController(service as unknown as WorkspacesService);
  });

  it('should create workspace with userId', async () => {
    const req: any = { user: { userId: 'user-1' } };
    const dto: any = { name: 'Casa' };
    await controller.create(req, dto);
    expect(service.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('should find all workspaces for user', async () => {
    const req: any = { user: { userId: 'user-1' } };
    await controller.findAll(req);
    expect(service.findAll).toHaveBeenCalledWith('user-1');
  });

  it('should find one workspace', async () => {
    const req: any = { user: { userId: 'user-1' } };
    await controller.findOne('ws-1', req);
    expect(service.findOne).toHaveBeenCalledWith('ws-1', 'user-1');
  });

  it('should update workspace', async () => {
    const dto: any = { name: 'New' };
    await controller.update('ws-1', dto);
    expect(service.update).toHaveBeenCalledWith('ws-1', dto);
  });

  it('should remove workspace', async () => {
    await controller.remove('ws-1');
    expect(service.remove).toHaveBeenCalledWith('ws-1');
  });
});
