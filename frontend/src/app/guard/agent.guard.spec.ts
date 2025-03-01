import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { agentGuard } from './guard/agent.guard';

describe('agentGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => agentGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
