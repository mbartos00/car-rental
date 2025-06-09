import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockExecutionContext = (userRole: Role): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: userRole },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should allow access if no roles are required', () => {
    const context = mockExecutionContext(Role.USER);
    const getAllAndOverrideSpy = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBe(true);
    expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('should allow access if user role matches required role', () => {
    const context = mockExecutionContext(Role.ADMIN);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user role does not match required roles', () => {
    const context = mockExecutionContext(Role.USER);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    expect(guard.canActivate(context)).toBe(false);
  });
});
