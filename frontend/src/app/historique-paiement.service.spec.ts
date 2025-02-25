import { TestBed } from '@angular/core/testing';

import { HistoriquePaiementService } from './historique-paiement.service';

describe('HistoriquePaiementService', () => {
  let service: HistoriquePaiementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoriquePaiementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
