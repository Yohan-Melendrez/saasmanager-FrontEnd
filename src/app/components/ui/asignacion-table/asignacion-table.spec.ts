import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionTable } from './asignacion-table';

describe('AsignacionTable', () => {
  let component: AsignacionTable;
  let fixture: ComponentFixture<AsignacionTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionTable],
    }).compileComponents();

    fixture = TestBed.createComponent(AsignacionTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
