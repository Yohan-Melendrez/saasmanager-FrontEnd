import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenciaCard } from './licencia-card';

describe('LicenciaCard', () => {
  let component: LicenciaCard;
  let fixture: ComponentFixture<LicenciaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenciaCard],
    }).compileComponents();

    fixture = TestBed.createComponent(LicenciaCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
