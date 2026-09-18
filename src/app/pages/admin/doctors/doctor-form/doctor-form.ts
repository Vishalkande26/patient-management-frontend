import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Doctor
} from '../../../../services/doctor.service';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
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

  doctorForm = new FormGroup({
    name: new FormControl<string>(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    specialization: new FormControl<string>(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    phone: new FormControl<string>(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ]
      }
    ),

    email: new FormControl<string>(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email
        ]
      }
    ),

    experience: new FormControl<number>(
      0,
      {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(0)
        ]
      }
    )
  });

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (changes['doctor']) {

      this.doctorForm.patchValue({

        name:
          this.doctor.name ?? '',

        specialization:
          this.doctor.specialization ?? '',

        phone:
          this.doctor.phone ?? '',

        email:
          this.doctor.email ?? '',

        experience:
          this.doctor.experience ?? 0

      });

      this.doctorForm.markAsPristine();
      this.doctorForm.markAsUntouched();

    }
  }

  submitForm(): void {

    if (this.saving) {
      return;
    }

    if (this.doctorForm.invalid) {

      this.doctorForm.markAllAsTouched();

      return;
    }

    const doctorData: Doctor = {

      name:
        this.doctorForm.controls.name.value.trim(),

      specialization:
        this.doctorForm.controls.specialization.value.trim(),

      phone:
        this.doctorForm.controls.phone.value.trim(),

      email:
        this.doctorForm.controls.email.value.trim(),

      experience:
        Number(
          this.doctorForm.controls.experience.value
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

  isFieldInvalid(
    fieldName:
      | 'name'
      | 'specialization'
      | 'phone'
      | 'email'
      | 'experience'
  ): boolean {

    const control =
      this.doctorForm.controls[fieldName];

    return (
      control.invalid &&
      (control.touched ||
        control.dirty)
    );
  }

}