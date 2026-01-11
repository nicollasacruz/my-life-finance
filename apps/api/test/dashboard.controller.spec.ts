import { DashboardController } from '../src/modules/dashboard/dashboard.controller';
import { DashboardService } from '../src/modules/dashboard/dashboard.service';

const mockDashboardService = () => ({
  getMonthlyOverview: jest.fn(),
  getYearlyOverview: jest.fn(),
});

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: ReturnType<typeof mockDashboardService>;

  beforeEach(() => {
    service = mockDashboardService() as any;
    controller = new DashboardController(service as unknown as DashboardService);
  });

  it('should call monthly overview with parsed numbers', async () => {
    await controller.getMonthlyOverview('ws-1', '2025', '6');
    expect(service.getMonthlyOverview).toHaveBeenCalledWith('ws-1', 2025, 6);
  });

  it('should call yearly overview with parsed number', async () => {
    await controller.getYearlyOverview('ws-1', '2024');
    expect(service.getYearlyOverview).toHaveBeenCalledWith('ws-1', 2024);
  });
});
