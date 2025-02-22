import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoriqueAmendesComponent } from './historique-amendes.component';

describe('HistoriqueAmendesComponent', () => {
  let component: HistoriqueAmendesComponent;
  let fixture: ComponentFixture<HistoriqueAmendesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueAmendesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueAmendesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
