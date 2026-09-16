import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormsModule,
  NgForm
} from '@angular/forms';

import {
  Doctor
} from '../../../../services/doctor.service';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './doctor-form.html'
})
export class DoctorForm implements OnChanges {

  @Input()
  doctor: Doctor = {
    name: '',
    specialization: '',
    phone: '',
    email: '',
    experience: 0
  };

  @Input()
  editingId: number | null = null;

  @Input()
  saving = false;

  @Output()
  submitted = new EventEmitter<Doctor>();

  @Output()
  cancelled = new EventEmitter<void>();

  formDoctor: Doctor = {
    name: '',
    specialization: '',
    phone: '',
    email: '',
    experience: 0
  };

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (changes['doctor']) {

      this.formDoctor = {
        id: this.doctor.id,
        name: this.doctor.name ?? '',
        specialization:
          this.doctor.specialization ?? '',
        phone:
          this.doctor.phone ?? '',
        email:
          this.doctor.email ?? '',
        experience:
          this.doctor.experience ?? 0
      };

    }

  }

  submitForm(
    form: NgForm
  ): void {

    if (this.saving) {
      return;
    }

    if (!form.valid) {
      return;
    }

    const doctorData: Doctor = {

      name:
        this.formDoctor.name,

      specialization:
        this.formDoctor.specialization,

      phone:
        this.formDoctor.phone,

      email:
        this.formDoctor.email,

      experience:
        Number(
          this.formDoctor.experience
        )

    };

    this.submitted.emit(
      doctorData
    );

  }

  cancel(): void {

    if (this.saving) {
      return;
    }

    this.cancelled.emit();

  }

}