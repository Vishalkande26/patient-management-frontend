import { TestBed } from '@angular/core/testing';

import { DoctorPatientService } from './doctor-patient.service';

describe('DoctorPatientService', () => {

  let service: DoctorPatientService;

  beforeEach(() => {

    TestBed.configureTestingModule({});

    service = TestBed.inject(DoctorPatientService);

  });

  it('should be created', () => {

    expect(service).toBeTruthy();

  });

});