import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientDoctors } from './patient-doctors';

describe('PatientDoctors', () => {
  let component: PatientDoctors;
  let fixture: ComponentFixture<PatientDoctors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDoctors],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDoctors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
