import { TestBed } from '@angular/core/testing';

import { Licencias } from './licencias';

describe('Licencias', () => {
  let service: Licencias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Licencias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
