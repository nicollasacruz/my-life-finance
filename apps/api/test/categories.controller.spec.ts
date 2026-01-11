import { CategoriesController } from '../src/modules/categories/categories.controller';
import { CategoriesService } from '../src/modules/categories/categories.service';

const mockCategoriesService = () => ({
  create: jest.fn(),
  seedDefaultCategories: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: ReturnType<typeof mockCategoriesService>;

  beforeEach(() => {
    service = mockCategoriesService() as any;
    controller = new CategoriesController(service as unknown as CategoriesService);
  });

  it('should create category', async () => {
    const dto: any = { name: 'Food' };
    await controller.create('ws-1', dto);
    expect(service.create).toHaveBeenCalledWith('ws-1', dto);
  });

  it('should seed defaults', async () => {
    await controller.seedDefaults('ws-1');
    expect(service.seedDefaultCategories).toHaveBeenCalledWith('ws-1');
  });

  it('should list categories', async () => {
    await controller.findAll('ws-1');
    expect(service.findAll).toHaveBeenCalledWith('ws-1');
  });

  it('should get one category', async () => {
    await controller.findOne('cat-1', 'ws-1');
    expect(service.findOne).toHaveBeenCalledWith('cat-1', 'ws-1');
  });

  it('should update category', async () => {
    const dto: any = { name: 'New' };
    await controller.update('cat-1', 'ws-1', dto);
    expect(service.update).toHaveBeenCalledWith('cat-1', 'ws-1', dto);
  });

  it('should remove category', async () => {
    await controller.remove('cat-1', 'ws-1');
    expect(service.remove).toHaveBeenCalledWith('cat-1', 'ws-1');
  });
});
