"""Prescription tests."""

import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Prescription, PrescriptionStatusEnum, User, RoleEnum
from app.services import PrescriptionService
from app.schemas import PrescriptionCreateRequest, PrescriptionDispenseRequest, PrescriptionCancelRequest


class TestPrescriptionService:
    """Test suite for PrescriptionService."""
    
    @pytest.fixture
    def test_users(self, db: Session):
        """Create test users (doctor, patient, pharmacist)."""
        doctor = User(
            email="doctor@test.com",
            name="Dr. Test",
            password_hash="hashed_pass",
            role=RoleEnum.DOCTOR,
            status="active",
            email_verified=True
        )
        patient = User(
            email="patient@test.com",
            name="Patient Test",
            password_hash="hashed_pass",
            role=RoleEnum.PATIENT,
            status="active",
            email_verified=True
        )
        pharmacist = User(
            email="pharmacist@test.com",
            name="Pharmacist Test",
            password_hash="hashed_pass",
            role=RoleEnum.PHARMACIST,
            status="active",
            email_verified=True
        )
        
        db.add_all([doctor, patient, pharmacist])
        db.commit()
        db.refresh(doctor)
        db.refresh(patient)
        db.refresh(pharmacist)
        
        return {"doctor": doctor, "patient": patient, "pharmacist": pharmacist}
    
    def test_create_prescription(self, db: Session, test_users):
        """Test creating a new prescription."""
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Aspirin",
            dosage="500mg",
            frequency="2 times daily",
            duration="7 days",
            quantity=14,
            route="oral"
        )
        
        assert prescription.id is not None
        assert prescription.medication_name == "Aspirin"
        assert prescription.status == PrescriptionStatusEnum.ACTIVE
        assert prescription.doctor_id == test_users["doctor"].id
        assert prescription.patient_id == test_users["patient"].id
    
    def test_get_prescription_by_id(self, db: Session, test_users):
        """Test retrieving prescription by ID."""
        # Create prescription
        created = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Ibuprofen",
            dosage="400mg",
            frequency="3 times daily",
            duration="5 days",
            quantity=15
        )
        
        # Retrieve it
        retrieved = PrescriptionService.get_prescription_by_id(db, created.id)
        assert retrieved.id == created.id
        assert retrieved.medication_name == "Ibuprofen"
    
    def test_get_patient_prescriptions(self, db: Session, test_users):
        """Test retrieving prescriptions for a patient."""
        # Create multiple prescriptions
        for i in range(3):
            PrescriptionService.create_prescription(
                db,
                doctor_id=test_users["doctor"].id,
                patient_id=test_users["patient"].id,
                medication_name=f"Medicine {i}",
                dosage="100mg",
                frequency="daily",
                duration="7 days",
                quantity=10
            )
        
        total, prescriptions = PrescriptionService.get_patient_prescriptions(
            db, test_users["patient"].id
        )
        
        assert total == 3
        assert len(prescriptions) == 3
    
    def test_get_doctor_prescriptions(self, db: Session, test_users):
        """Test retrieving prescriptions issued by a doctor."""
        # Create multiple prescriptions
        for i in range(2):
            PrescriptionService.create_prescription(
                db,
                doctor_id=test_users["doctor"].id,
                patient_id=test_users["patient"].id,
                medication_name=f"Medicine {i}",
                dosage="100mg",
                frequency="daily",
                duration="7 days",
                quantity=10
            )
        
        total, prescriptions = PrescriptionService.get_doctor_prescriptions(
            db, test_users["doctor"].id
        )
        
        assert total == 2
        assert len(prescriptions) == 2
    
    def test_cancel_prescription(self, db: Session, test_users):
        """Test cancelling a prescription."""
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Paracetamol",
            dosage="500mg",
            frequency="2 times daily",
            duration="7 days",
            quantity=14
        )
        
        cancelled = PrescriptionService.cancel_prescription(
            db,
            prescription.id,
            test_users["doctor"].id,
            "Patient allergic to ingredient"
        )
        
        assert cancelled.status == PrescriptionStatusEnum.CANCELLED
        assert cancelled.cancellation_reason == "Patient allergic to ingredient"
        assert cancelled.cancelled_by_id == test_users["doctor"].id
        assert cancelled.cancelled_date is not None
    
    def test_dispense_prescription_full(self, db: Session, test_users):
        """Test dispensing full quantity of prescription."""
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Amoxicillin",
            dosage="500mg",
            frequency="3 times daily",
            duration="10 days",
            quantity=30
        )
        
        dispensed = PrescriptionService.dispense_prescription(
            db,
            prescription.id,
            test_users["pharmacist"].id,
            30
        )
        
        assert dispensed.quantity_dispensed == 30
        assert dispensed.status == PrescriptionStatusEnum.DISPENSED
        assert dispensed.dispensed_by_id == test_users["pharmacist"].id
        assert dispensed.dispensed_date is not None
    
    def test_dispense_prescription_partial(self, db: Session, test_users):
        """Test partial dispensing of prescription."""
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Vitamin C",
            dosage="1000mg",
            frequency="daily",
            duration="30 days",
            quantity=30
        )
        
        # Dispense partial
        dispensed = PrescriptionService.dispense_prescription(
            db,
            prescription.id,
            test_users["pharmacist"].id,
            15
        )
        
        assert dispensed.quantity_dispensed == 15
        assert dispensed.status == PrescriptionStatusEnum.ACTIVE  # Still active
        
        # Dispense rest
        dispensed = PrescriptionService.dispense_prescription(
            db,
            prescription.id,
            test_users["pharmacist"].id,
            15
        )
        
        assert dispensed.quantity_dispensed == 30
        assert dispensed.status == PrescriptionStatusEnum.DISPENSED
    
    def test_dispense_invalid_quantity(self, db: Session, test_users):
        """Test dispensing invalid quantity."""
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Medicine",
            dosage="100mg",
            frequency="daily",
            duration="7 days",
            quantity=10
        )
        
        with pytest.raises(Exception):
            PrescriptionService.dispense_prescription(
                db,
                prescription.id,
                test_users["pharmacist"].id,
                15  # More than prescribed
            )
    
    def test_update_prescription(self, db: Session, test_users):
        """Test updating a prescription."""
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Original",
            dosage="100mg",
            frequency="daily",
            duration="7 days",
            quantity=7
        )
        
        updated = PrescriptionService.update_prescription(
            db,
            prescription.id,
            test_users["doctor"].id,
            medication_name="Updated",
            quantity=14
        )
        
        assert updated.medication_name == "Updated"
        assert updated.quantity == 14
    
    def test_cannot_update_dispensed_prescription(self, db: Session, test_users):
        """Test that dispensed prescriptions cannot be updated."""
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Medicine",
            dosage="100mg",
            frequency="daily",
            duration="7 days",
            quantity=10
        )
        
        # Dispense it
        PrescriptionService.dispense_prescription(
            db,
            prescription.id,
            test_users["pharmacist"].id,
            10
        )
        
        # Try to update
        with pytest.raises(Exception):
            PrescriptionService.update_prescription(
                db,
                prescription.id,
                test_users["doctor"].id,
                medication_name="Updated"
            )
    
    def test_get_pending_dispensing(self, db: Session, test_users):
        """Test getting prescriptions pending dispensing."""
        # Create active prescriptions
        for i in range(3):
            PrescriptionService.create_prescription(
                db,
                doctor_id=test_users["doctor"].id,
                patient_id=test_users["patient"].id,
                medication_name=f"Medicine {i}",
                dosage="100mg",
                frequency="daily",
                duration="7 days",
                quantity=10
            )
        
        total, pending = PrescriptionService.get_pending_dispensing_prescriptions(db)
        
        assert total == 3
        assert all(p.status == PrescriptionStatusEnum.ACTIVE for p in pending)
    
    def test_search_prescriptions(self, db: Session, test_users):
        """Test searching prescriptions with filters."""
        # Create prescriptions with different statuses
        active = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Aspirin",
            dosage="500mg",
            frequency="daily",
            duration="7 days",
            quantity=10
        )
        
        # Search by medication name
        total, results = PrescriptionService.search_prescriptions(
            db,
            medication_name="Aspirin"
        )
        
        assert total >= 1
        assert any(p.medication_name == "Aspirin" for p in results)
    
    def test_prescription_expiry(self, db: Session, test_users):
        """Test prescription expiration."""
        past_date = datetime.utcnow() - timedelta(days=1)
        
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Expired",
            dosage="100mg",
            frequency="daily",
            duration="7 days",
            quantity=10,
            expiry_date=past_date
        )
        
        expired = PrescriptionService.get_expired_prescriptions(db)
        
        assert any(p.id == prescription.id for p in expired)
    
    def test_cannot_dispense_cancelled_prescription(self, db: Session, test_users):
        """Test that cancelled prescriptions cannot be dispensed."""
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Medicine",
            dosage="100mg",
            frequency="daily",
            duration="7 days",
            quantity=10
        )
        
        # Cancel it
        PrescriptionService.cancel_prescription(
            db,
            prescription.id,
            test_users["doctor"].id,
            "No longer needed"
        )
        
        # Try to dispense
        with pytest.raises(Exception):
            PrescriptionService.dispense_prescription(
                db,
                prescription.id,
                test_users["pharmacist"].id,
                10
            )
    
    def test_authorization_non_doctor_cannot_edit(self, db: Session, test_users):
        """Test that only the prescribing doctor can edit."""
        prescription = PrescriptionService.create_prescription(
            db,
            doctor_id=test_users["doctor"].id,
            patient_id=test_users["patient"].id,
            medication_name="Medicine",
            dosage="100mg",
            frequency="daily",
            duration="7 days",
            quantity=10
        )
        
        # Try to update with wrong doctor
        other_doctor = User(
            email="other_doctor@test.com",
            name="Other Doctor",
            password_hash="hashed_pass",
            role=RoleEnum.DOCTOR,
            status="active",
            email_verified=True
        )
        db.add(other_doctor)
        db.commit()
        db.refresh(other_doctor)
        
        with pytest.raises(Exception):
            PrescriptionService.update_prescription(
                db,
                prescription.id,
                other_doctor.id,
                medication_name="Updated"
            )
