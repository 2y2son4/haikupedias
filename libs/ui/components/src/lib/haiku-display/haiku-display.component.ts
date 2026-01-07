import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Haiku } from '@haikupedias/core/types';

@Component({
  selector: 'lib-haiku-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './haiku-display.component.html',
  styleUrl: './haiku-display.component.scss',
})
export class HaikuDisplayComponent {
  // Input haiku to display
  haiku = input.required<Haiku>();
}
