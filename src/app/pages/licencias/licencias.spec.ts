import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LicenciasComponent } from './licencias';
import { LicenciasService } from '../../services/api/licencias';
import { of, throwError } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('LicenciasComponent', () => {
  let fixture: ComponentFixture<LicenciasComponent>;
  let component: LicenciasComponent;
  let licenciasServiceSpy: jasmine.SpyObj<LicenciasService>;

  beforeEach(async () => {
    licenciasServiceSpy = jasmine.createSpyObj('LicenciasService', ['obtenerLicencias']);
    licenciasServiceSpy.obtenerLicencias.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [LicenciasComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LicenciasService, useValue: licenciasServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LicenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar licencias al iniciar', () => {
    expect(licenciasServiceSpy.obtenerLicencias).toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
    expect(component.licencias()).toEqual([]);
  });

  it('debe manejar error al cargar licencias', () => {
    licenciasServiceSpy.obtenerLicencias.and.returnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(component.error()).toBe('Error al cargar las licencias.');
  });
});
