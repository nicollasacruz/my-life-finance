import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { UsersService } from '../src/modules/users/users.service';

const mockUser = {
  id: 'user-id',
  email: 'user@example.com',
  name: 'Tester',
  preferences: {},
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
};

const mockAuthService = () => ({
  refreshCookieName: 'mlf_refresh_token',
  getRefreshCookieOptions: jest.fn(() => ({ httpOnly: true, maxAge: 1000 })),
  sanitizeUser: jest.fn((u) => u),
  extractRefreshTokenFromRequest: jest.fn((req: any) => req.cookies?.mlf_refresh_token ?? null),
  register: jest.fn().mockResolvedValue({
    user: mockUser,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }),
  login: jest.fn().mockResolvedValue({
    user: mockUser,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }),
  refresh: jest.fn().mockResolvedValue({
    user: mockUser,
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  }),
  logout: jest.fn().mockResolvedValue(undefined),
});

const mockUsersService = () => ({
  findById: jest.fn().mockResolvedValue(mockUser),
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: ReturnType<typeof mockAuthService>;
  let usersService: ReturnType<typeof mockUsersService>;

  beforeEach(() => {
    authService = mockAuthService() as any;
    usersService = mockUsersService() as any;
    controller = new AuthController(authService as unknown as AuthService, usersService as unknown as UsersService);
  });

  it('should register and set refresh cookie', async () => {
    const res: any = { cookie: jest.fn() };
    const dto = { email: 'user@example.com', password: 'password123', name: 'Tester' };

    const result = await controller.register(dto as any, res);

    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(res.cookie).toHaveBeenCalledWith(
      authService.refreshCookieName,
      'refresh-token',
      authService.getRefreshCookieOptions()
    );
    expect(result).toEqual({ user: mockUser, accessToken: 'access-token' });
  });

  it('should login and set refresh cookie', async () => {
    const res: any = { cookie: jest.fn() };
    const dto = { email: 'user@example.com', password: 'password123' };

    const result = await controller.login(dto as any, res);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(res.cookie).toHaveBeenCalledWith(
      authService.refreshCookieName,
      'refresh-token',
      authService.getRefreshCookieOptions()
    );
    expect(result).toEqual({ user: mockUser, accessToken: 'access-token' });
  });

  it('should refresh tokens and set new refresh cookie', async () => {
    const res: any = { cookie: jest.fn() };
    const req: any = { cookies: { [authService.refreshCookieName]: 'old-refresh' } };

    const result = await controller.refresh(req, res);

    expect(authService.refresh).toHaveBeenCalledWith('old-refresh');
    expect(res.cookie).toHaveBeenCalledWith(
      authService.refreshCookieName,
      'new-refresh-token',
      authService.getRefreshCookieOptions()
    );
    expect(result).toEqual({ user: mockUser, accessToken: 'new-access-token' });
  });

  it('should logout and clear cookie', async () => {
    const res: any = { clearCookie: jest.fn() };
    const req: any = { cookies: { [authService.refreshCookieName]: 'old-refresh' } };

    const result = await controller.logout(req, res);

    expect(authService.logout).toHaveBeenCalledWith('old-refresh');
    expect(res.clearCookie).toHaveBeenCalledWith(
      authService.refreshCookieName,
      authService.getRefreshCookieOptions()
    );
    expect(result).toEqual({ success: true });
  });

  it('should return sanitized user from /me', async () => {
    const req: any = { user: { userId: mockUser.id } };
    authService.sanitizeUser.mockReturnValue({ id: mockUser.id, email: mockUser.email });

    const result = await controller.me(req);

    expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
    expect(authService.sanitizeUser).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual({ id: mockUser.id, email: mockUser.email });
  });
});
