import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Licencia } from '../../../models/licencia.interface';

@Component({
  selector: 'app-licencia-card',
  imports: [CommonModule],
  templateUrl: './licencia-card.html',
  styleUrl: './licencia-card.css',
})
export class LicenciaCard {
  @Input({ required: true }) licencia!: Licencia;
}
