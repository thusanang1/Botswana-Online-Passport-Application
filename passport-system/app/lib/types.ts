export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  status: UserStatus
  blockedUntil?: string // ISO date string when block expires
  blockReason?: string
  createdAt: string
  lastLoginAt?: string
}

export interface Application {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationalId: string
  address: string
  city: string
  postalCode: string
  emergencyContact: string
  emergencyPhone: string
  travelReason?: string
  selfieImage: string
  idFrontImage: string
  idBackImage: string
  status: ApplicationStatus
  feedback?: string
  createdAt: string
  updatedAt: string
}

