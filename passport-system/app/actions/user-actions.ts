"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { type User, UserStatus } from "@/app/lib/types"
import { revalidatePath } from "next/cache"

// Mock database for demo purposes
const users: User[] = [
  {
    id: "user123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "+267 71234567",
    status: UserStatus.ACTIVE,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "user456",
    firstName: "Alice",
    lastName: "Smith",
    email: "alice.smith@example.com",
    phoneNumber: "+267 72345678",
    status: UserStatus.ACTIVE,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "user789",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    phoneNumber: "+267 73456789",
    status: UserStatus.ACTIVE,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "user101",
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@example.com",
    phoneNumber: "+267 74567890",
    status: UserStatus.BLOCKED,
    blockedUntil: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    blockReason: "Multiple invalid document submissions",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
]

export async function createUser(userData: {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
}) {
  // In a real app, you would hash the password and store in a database
  const newUser: User = {
    id: Math.random().toString(36).substring(2, 9),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phoneNumber: userData.phoneNumber,
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString(),
  }

  // Check if user already exists
  const existingUser = users.find((user) => user.email === userData.email)
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Add user to mock database
  users.push(newUser)

  return { success: true }
}

export async function loginUser({ email, password }: { email: string; password: string }) {
  // In a real app, you would verify credentials against a database
  const user = users.find((u) => u.email === email)

  if (user && user.status === UserStatus.BLOCKED) {
    const blockedUntil = user.blockedUntil ? new Date(user.blockedUntil) : null
    if (blockedUntil && blockedUntil > new Date()) {
      return {
        success: false,
        error: `Your account is temporarily blocked until ${blockedUntil.toLocaleString()}. Reason: ${user.blockReason || "Policy violation"}`,
      }
    } else {
      // If block period has expired, automatically unblock
      user.status = UserStatus.ACTIVE
      user.blockedUntil = undefined
      user.blockReason = undefined
    }
  }

  // For demo purposes, we'll simulate a successful login
  // In a real app, you would verify the password hash

  // Set a cookie to simulate authentication
  cookies().set("user_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  // Update last login time
  if (user) {
    user.lastLoginAt = new Date().toISOString()
  }

  return { success: true }
}

export async function logoutUser() {
  cookies().delete("user_session")
  redirect("/login")
}

export async function getUser() {
  // In a real app, you would verify the session and fetch user data
  // For demo purposes, we'll return a mock user
  return {
    id: "user123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
  }
}

export async function getAllUsers() {
  // In a real app, you would fetch users from the database with pagination
  return users
}

export async function getUserById(id: string) {
  const user = users.find((user) => user.id === id)
  if (!user) {
    throw new Error("User not found")
  }
  return user
}

export async function blockUser({
  userId,
  reason,
  durationDays,
}: {
  userId: string
  reason: string
  durationDays: number
}) {
  // Validate duration (max 3 days)
  if (durationDays < 1 || durationDays > 3) {
    throw new Error("Block duration must be between 1 and 3 days")
  }

  const userIndex = users.findIndex((user) => user.id === userId)
  if (userIndex === -1) {
    throw new Error("User not found")
  }

  // Calculate block end date
  const blockedUntil = new Date()
  blockedUntil.setDate(blockedUntil.getDate() + durationDays)

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    status: UserStatus.BLOCKED,
    blockedUntil: blockedUntil.toISOString(),
    blockReason: reason,
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function unblockUser(userId: string) {
  const userIndex = users.findIndex((user) => user.id === userId)
  if (userIndex === -1) {
    throw new Error("User not found")
  }

  // Update user
  users[userIndex] = {
    ...users[userIndex],
    status: UserStatus.ACTIVE,
    blockedUntil: undefined,
    blockReason: undefined,
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const userIndex = users.findIndex((user) => user.id === userId)
  if (userIndex === -1) {
    throw new Error("User not found")
  }

  // In a real app, you might want to soft delete instead of removing from the array
  users[userIndex] = {
    ...users[userIndex],
    status: UserStatus.DELETED,
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function searchUsers(query: string) {
  if (!query) return users

  const lowercaseQuery = query.toLowerCase()
  return users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(lowercaseQuery) ||
      user.lastName.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.phoneNumber.includes(query),
  )
}

