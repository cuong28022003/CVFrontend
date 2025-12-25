import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // Ensure clean storage before each test
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle invalid JSON in storage gracefully', () => {
    // Simulate bad value previously stored in some browsers
    localStorage.setItem('currentUser', 'undefined');
    const svc = TestBed.inject(AuthService);
    expect(svc.getCurrentUser()).toBeNull();
  });
});
