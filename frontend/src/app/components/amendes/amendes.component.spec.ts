import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmendesComponent } from './amendes.component';

describe('AmendesComponent', () => {
  let component: AmendesComponent;
  let fixture: ComponentFixture<AmendesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmendesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmendesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
