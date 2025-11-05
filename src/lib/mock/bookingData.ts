/**
 * Mock data for booking flow - provides complete sample data for development
 * @see https://doccure.dreamstechnologies.com/html/template/booking.html
 */

import { DoctorProfileResponse } from "@/types/doctorProfile";

/**
 * Mock doctor profile for Dr. Michael Brown (Psychologist)
 */
export const mockDoctorProfile: DoctorProfileResponse = {
  id: "mock-doctor-1",
  userId: "user-1",
  firstName: "Michael",
  lastName: "Brown",
  avatar: "https://i.pravatar.cc/300?img=12",
  city: "Austin",
  dob: "1980-05-15",
  role: "DOCTOR",
  residency: "5th Street - 1011 W 5th St, Suite 120, Austin, TX 78703",
  yearsOfExperience: 12,
  bio: "Board-certified psychologist specializing in cognitive behavioral therapy and stress management. Committed to helping patients achieve mental wellness through evidence-based practices.",
  isAvailable: true,
  languages: ["English", "Spanish"],

  specialties: [
    {
      relationshipId: 1,
      specialty: {
        id: "1",
        name: "Cardiology",
        code: "CARD",
        description: "Heart and cardiovascular system",
      },
      isPrimary: true,
      certificationDate: "2015-06-01",
      certificationBody: "American Board of Medical Specialties",
      yearsOfExperienceInSpecialty: 8,
    },
    {
      relationshipId: 2,
      specialty: {
        id: "2",
        name: "Neurology",
        code: "NEUR",
        description: "Brain and nervous system disorders",
      },
      isPrimary: false,
      certificationDate: "2018-03-15",
      yearsOfExperienceInSpecialty: 5,
    },
    {
      relationshipId: 3,
      specialty: {
        id: "3",
        name: "Urology",
        code: "UROL",
        description: "Urinary tract and male reproductive system",
      },
      isPrimary: false,
      certificationDate: "2019-09-01",
      yearsOfExperienceInSpecialty: 4,
    },
  ],

  services: [
    {
      relationshipId: 1,
      service: {
        id: "1",
        name: "Echocardiograms",
      },
      price: 310,
      currency: "$",
      displayOrder: 1,
    },
    {
      relationshipId: 2,
      service: {
        id: "2",
        name: "Stress tests",
      },
      price: 754,
      currency: "$",
      displayOrder: 2,
    },
    {
      relationshipId: 3,
      service: {
        id: "3",
        name: "Stress tests",
      },
      price: 754,
      currency: "$",
      displayOrder: 3,
    },
    {
      relationshipId: 4,
      service: {
        id: "4",
        name: "Heart Catheterization",
      },
      price: 150,
      currency: "$",
      displayOrder: 4,
    },
    {
      relationshipId: 5,
      service: {
        id: "5",
        name: "Echocardiograms",
      },
      price: 200,
      currency: "$",
      displayOrder: 5,
    },
    {
      relationshipId: 6,
      service: {
        id: "6",
        name: "Echocardiograms",
      },
      price: 200,
      currency: "$",
      displayOrder: 6,
    },
  ],

  experiences: [
    {
      relationshipId: 1,
      experience: {
        id: "exp-1",
        hospitalName: "Austin Medical Center",
        hospitalLogo: "https://via.placeholder.com/100x100?text=AMC",
        department: "Cardiology",
        location: "Austin",
        country: "United States",
        position: "Senior Psychologist",
        startDate: "2015-01-01",
        isCurrent: true,
        description: "Leading mental health initiatives and providing individual therapy sessions",
        displayOrder: 1,
      },
      displayOrder: 1,
      isHighlighted: true,
    },
  ],
};

/**
 * Mock clinic locations for appointment selection
 */
export const mockClinicLocations = [
  {
    clinicId: "clinic-1",
    name: "The Cardiovascular Clinic",
    address: "2301 Erringer Road, Simi Valley, CA, 93065",
    distance: "500 Meters",
    isAvailable: true,
    icon: "building",
  },
  {
    clinicId: "clinic-2",
    name: "MediBridge Inc.",
    address: "915 Willow Street, San Jose, CA, 95125",
    distance: "12 KM",
    isAvailable: true,
    icon: "building",
  },
  {
    clinicId: "clinic-3",
    name: "The Cardiac Clinic",
    address: "714 Burwell Heights Road, Bridge City, TX, 77611",
    distance: "16 KM",
    isAvailable: true,
    icon: "building",
  },
];

/**
 * Mock time slots for scheduling
 */
export const mockTimeSlots = {
  morning: [
    { id: "m1", time: "08:00 AM - 09:00 AM", startTime: "08:00", endTime: "09:00", isAvailable: true },
    { id: "m2", time: "09:00 AM - 10:00 AM", startTime: "09:00", endTime: "10:00", isAvailable: true },
    { id: "m3", time: "10:00 AM - 11:00 AM", startTime: "10:00", endTime: "11:00", isAvailable: true },
    { id: "m4", time: "11:00 AM - 12:00 PM", startTime: "11:00", endTime: "12:00", isAvailable: false },
  ],
  afternoon: [
    { id: "a1", time: "12:00 PM - 01:00 PM", startTime: "12:00", endTime: "13:00", isAvailable: true },
    { id: "a2", time: "01:00 PM - 02:00 PM", startTime: "13:00", endTime: "14:00", isAvailable: true },
    { id: "a3", time: "02:00 PM - 03:00 PM", startTime: "14:00", endTime: "15:00", isAvailable: false },
    { id: "a4", time: "03:00 PM - 04:00 PM", startTime: "15:00", endTime: "16:00", isAvailable: true },
  ],
  evening: [
    { id: "e1", time: "04:00 PM - 05:00 PM", startTime: "16:00", endTime: "17:00", isAvailable: true },
    { id: "e2", time: "05:00 PM - 06:00 PM", startTime: "17:00", endTime: "18:00", isAvailable: true },
    { id: "e3", time: "06:00 PM - 07:00 PM", startTime: "18:00", endTime: "19:00", isAvailable: true },
    { id: "e4", time: "07:00 PM - 08:00 PM", startTime: "19:00", endTime: "20:00", isAvailable: false },
  ],
};

/**
 * Mock patient profiles
 */
export const mockPatients = [
  {
    patientId: "patient-1",
    name: "Andrew Fletcher",
    email: "andrew.fletcher@example.com",
    phoneNumber: "+1-512-555-7890",
    dateOfBirth: "1985-03-22",
    gender: "Male",
  },
  {
    patientId: "patient-2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phoneNumber: "+1-512-555-4567",
    dateOfBirth: "1992-07-14",
    gender: "Female",
  },
];

/**
 * Payment methods configuration
 */
export const mockPaymentMethods = [
  {
    id: "credit_card",
    name: "Credit Card",
    icon: "credit-card",
    description: "Pay securely with your credit or debit card",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "paypal",
    description: "Fast and secure payment with PayPal",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: "stripe",
    description: "Secure payment processing via Stripe",
  },
];

/**
 * Price breakdown constants
 */
export const BOOKING_FEE = 20;
export const TAX_RATE = 0.09; // 9%
export const DISCOUNT_AMOUNT = 15;

/**
 * Calculate total price with fees
 */
export const calculateBookingTotal = (servicePrice: number) => {
  const tax = Math.round(servicePrice * TAX_RATE);
  const subtotal = servicePrice + BOOKING_FEE;
  const total = subtotal + tax - DISCOUNT_AMOUNT;

  return {
    serviceCharge: servicePrice,
    bookingFee: BOOKING_FEE,
    tax,
    discount: DISCOUNT_AMOUNT,
    subtotal,
    total,
  };
};

/**
 * Mock booking confirmation data
 */
export const mockBookingConfirmation = {
  bookingReferenceNumber: "DCRA12565",
  confirmationMessage: "Booking Confirmed",
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DCRA12565",
  instructions: [
    "Please be on time, arrive 15 minutes before the appointment time",
    "Bring any relevant medical records or test results",
    "Call us in case you face any issue on Booking / Cancellation",
  ],
  supportPhone: "+1-512-555-0100",
  supportEmail: "support@doccure.com",
};
