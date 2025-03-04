import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { AgentGuard } from './agent.guard';

describe('agentGuard', () => {
  const executeGuard: CanActivateFn = (route, state) => 
      TestBed.runInInjectionContext(() => {
        const guard = TestBed.inject(AgentGuard);
        return guard.canActivate();
      });

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
