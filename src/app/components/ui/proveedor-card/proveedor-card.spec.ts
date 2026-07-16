import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedorCard } from './proveedor-card';

describe('ProveedorCard', () => {
  let component: ProveedorCard;
  let fixture: ComponentFixture<ProveedorCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProveedorCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProveedorCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
