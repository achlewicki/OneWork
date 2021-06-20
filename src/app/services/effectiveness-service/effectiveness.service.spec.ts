import { TestBed } from '@angular/core/testing';

import { EffectivenessService } from './effectiveness.service';

describe('EffectivenessService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EffectivenessService = TestBed.get(EffectivenessService);
    expect(service).toBeTruthy();
  });
});
