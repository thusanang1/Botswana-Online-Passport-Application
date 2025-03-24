"use server"

import { revalidatePath } from "next/cache"
import { type Application, ApplicationStatus } from "@/app/lib/types"

// Mock database for demo purposes
let applications: Application[] = []

// Check if user already has an application
export async function userHasApplication(userId: string) {
  // In a real app, you would query the database to check if the user has an active application
  const userApplications = applications.filter((app) => app.userId === userId)

  // Return true if the user has any application that is not in REJECTED status
  return userApplications.some((app) => app.status !== ApplicationStatus.REJECTED)
}

export async function submitApplication(formData: any) {
  const userId = "user123" // In a real app, this would be the authenticated user's ID

  // Check if user already has an application
  const hasApplication = await userHasApplication(userId)

  if (hasApplication) {
    throw new Error("You already have an active application. Only one application per user is allowed.")
  }

  // In a real app, you would validate the data and store in a database
  const newApplication: Application = {
    id: Math.random().toString(36).substring(2, 9),
    userId: userId,
    firstName: formData.firstName,
    lastName: formData.lastName,
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender,
    nationalId: formData.nationalId,
    address: formData.address,
    city: formData.city,
    postalCode: formData.postalCode,
    emergencyContact: formData.emergencyContact,
    emergencyPhone: formData.emergencyPhone,
    travelReason: formData.travelReason || "",
    selfieImage: formData.selfieImage || "",
    idFrontImage: formData.idFrontImage || "",
    idBackImage: formData.idBackImage || "",
    status: ApplicationStatus.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Add application to mock database
  applications.push(newApplication)

  revalidatePath("/dashboard")

  return { success: true, applicationId: newApplication.id }
}

export async function updateApplication(formData: any) {
  // In a real app, you would validate the data and update in a database
  const applicationIndex = applications.findIndex((app) => app.id === formData.id)

  if (applicationIndex === -1) {
    throw new Error("Application not found")
  }

  // Update the application
  applications[applicationIndex] = {
    ...applications[applicationIndex],
    firstName: formData.firstName,
    lastName: formData.lastName,
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender,
    nationalId: formData.nationalId,
    address: formData.address,
    city: formData.city,
    postalCode: formData.postalCode,
    emergencyContact: formData.emergencyContact,
    emergencyPhone: formData.emergencyPhone,
    travelReason: formData.travelReason || "",
    selfieImage: formData.selfieImage || applications[applicationIndex].selfieImage,
    idFrontImage: formData.idFrontImage || applications[applicationIndex].idFrontImage,
    idBackImage: formData.idBackImage || applications[applicationIndex].idBackImage,
    status: formData.status,
    updatedAt: new Date().toISOString(),
  }

  revalidatePath("/dashboard")
  revalidatePath(`/application/${formData.id}`)

  return { success: true }
}

export async function getUserApplications() {
  // In a real app, you would fetch applications for the authenticated user
  // For demo purposes, we'll return mock data

  if (applications.length === 0) {
    // Add some sample applications if none exist
    applications = [
      {
        id: "app123",
        userId: "user123",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        gender: "male",
        nationalId: "12345678",
        address: "123 Main St",
        city: "Gaborone",
        postalCode: "00000",
        emergencyContact: "Jane Doe",
        emergencyPhone: "+267 71234567",
        travelReason: "Tourism",
        selfieImage: "/placeholder.svg?height=300&width=300",
        idFrontImage: "/placeholder.svg?height=200&width=320",
        idBackImage: "/placeholder.svg?height=200&width=320",
        status: ApplicationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }

  return applications.filter((app) => app.userId === "user123")
}

export async function getAllApplications() {
  // In a real app, you would fetch all applications from the database
  // For demo purposes, we'll return mock data

  if (applications.length === 0) {
    // Add some sample applications if none exist
    applications = [
      {
        id: "app123",
        userId: "user123",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        gender: "male",
        nationalId: "12345678",
        address: "123 Main St",
        city: "Gaborone",
        postalCode: "00000",
        emergencyContact: "Jane Doe",
        emergencyPhone: "+267 71234567",
        travelReason: "Tourism",
        selfieImage: "/placeholder.svg?height=300&width=300",
        idFrontImage: "/placeholder.svg?height=200&width=320",
        idBackImage: "/placeholder.svg?height=200&width=320",
        status: ApplicationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "app456",
        userId: "user456",
        firstName: "Alice",
        lastName: "Smith",
        dateOfBirth: "1985-05-15",
        gender: "female",
        nationalId: "87654321",
        address: "456 Oak St",
        city: "Francistown",
        postalCode: "00000",
        emergencyContact: "Bob Smith",
        emergencyPhone: "+267 72345678",
        travelReason: "Business",
        selfieImage: "/placeholder.svg?height=300&width=300",
        idFrontImage: "/placeholder.svg?height=200&width=320",
        idBackImage: "/placeholder.svg?height=200&width=320",
        status: ApplicationStatus.APPROVED,
        feedback: "All documents verified successfully.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      },
      {
        id: "app789",
        userId: "user789",
        firstName: "Michael",
        lastName: "Johnson",
        dateOfBirth: "1978-11-30",
        gender: "male",
        nationalId: "23456789",
        address: "789 Pine St",
        city: "Maun",
        postalCode: "00000",
        emergencyContact: "Sarah Johnson",
        emergencyPhone: "+267 73456789",
        travelReason: "Family visit",
        selfieImage: "/placeholder.svg?height=300&width=300",
        idFrontImage: "/placeholder.svg?height=200&width=320",
        idBackImage: "/placeholder.svg?height=200&width=320",
        status: ApplicationStatus.REJECTED,
        feedback: "National ID verification failed. Please submit a clearer copy of your ID.",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      },
    ]
  }

  return applications
}

export async function getApplicationById(id: string) {
  // In a real app, you would fetch the application from the database
  // For demo purposes, we'll return a mock application

  const application = applications.find((app) => app.id === id)

  if (!application) {
    throw new Error("Application not found")
  }

  return application
}

export async function updateApplicationStatus({
  id,
  status,
  feedback,
}: {
  id: string
  status: ApplicationStatus
  feedback?: string
}) {
  // In a real app, you would update the application in the database

  const applicationIndex = applications.findIndex((app) => app.id === id)

  if (applicationIndex === -1) {
    throw new Error("Application not found")
  }

  applications[applicationIndex] = {
    ...applications[applicationIndex],
    status,
    feedback: feedback || applications[applicationIndex].feedback,
    updatedAt: new Date().toISOString(),
  }

  revalidatePath("/admin/dashboard")
  revalidatePath(`/admin/application/${id}`)
  revalidatePath(`/application/${id}`)

  return { success: true }
}

