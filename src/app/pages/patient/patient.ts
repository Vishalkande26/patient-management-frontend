import {
  Component
} from '@angular/core';

import {
  RouterOutlet
} from '@angular/router';

@Component({
  selector: 'app-patient',

  imports: [
    RouterOutlet
  ],

  templateUrl: './patient.html',

  styleUrl: './patient.css'
})
export class Patient {
}