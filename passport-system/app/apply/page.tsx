"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/app/components/date-picker"
import { MultiCameraCapture } from "@/app/components/multi-camera-capture"
import { submitApplication, userHasApplication } from "@/app/actions/application-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function ApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [hasApplication, setHasApplication] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationalId: "",
    address: "",
    city: "",
    postalCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    travelReason: "",
    selfieImage: null as string | null,
    idFrontImage: null as string | null,
    idBackImage: null as string | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const checkExistingApplication = async () => {
      try {
        // In a real app, you would use the authenticated user's ID
        const hasExistingApplication = await userHasApplication("user123")
        setHasApplication(hasExistingApplication)
      } catch (error) {
        console.error("Error checking application status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkExistingApplication()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Check if user is at least 18 years old
      const today = new Date()
      const birthDate = new Date(date)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 18) {
        setErrors((prev) => ({ ...prev, dateOfBirth: "You must be at least 18 years old to apply" }))
        return
      }

      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.dateOfBirth
        return newErrors
      })

      setFormData((prev) => ({ ...prev, dateOfBirth: date.toISOString().split("T")[0] }))
    }
  }

  const handleImageCapture = (type: "selfie" | "idFront" | "idBack", imageData: string) => {
    setFormData((prev) => ({
      ...prev,
      [type === "selfie" ? "selfieImage" : type === "idFront" ? "idFrontImage" : "idBackImage"]: imageData,
    }))
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = "First name is required"
      if (!formData.lastName) newErrors.lastName = "Last name is required"
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
      if (!formData.gender) newErrors.gender = "Gender is required"
      if (!formData.nationalId) newErrors.nationalId = "National ID is required"
    } else if (currentStep === 2) {
      if (!formData.address) newErrors.address = "Address is required"
      if (!formData.city) newErrors.city = "City is required"
      if (!formData.postalCode) newErrors.postalCode = "Postal code is required"
      if (!formData.emergencyContact) newErrors.emergencyContact = "Emergency contact is required"
      if (!formData.emergencyPhone) newErrors.emergencyPhone = "Emergency phone is required"
    } else if (currentStep === 3) {
      if (!formData.selfieImage) newErrors.selfieImage = "Selfie image is required"
      if (!formData.idFrontImage) newErrors.idFrontImage = "ID card front image is required"
      if (!formData.idBackImage) newErrors.idBackImage = "ID card back image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(step)) return

    try {
      await submitApplication(formData)
      router.push("/dashboard?application=submitted")
    } catch (error: any) {
      console.error("Application submission error:", error)
      setErrors({ form: error.message || "Application submission failed. Please try again." })
    }
  }

  if (loading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (hasApplication) {
    return (
      <div className="container py-8">
        <h1 className="mb-8 text-3xl font-bold">Passport Application</h1>

        <Card>
          <CardHeader>
            <CardTitle>Application Limit Reached</CardTitle>
            <CardDescription>
              For security reasons, you can only have one active passport application at a time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You already have an active passport application in progress. You can submit a new application once your
                current application is completed or rejected.
              </AlertDescription>
            </Alert>
            <p className="text-muted-foreground">
              Please check your existing application status on your dashboard. If you believe this is an error, please
              contact support.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Passport Application</h1>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row">
        <div className={`flex-1 border-b-2 pb-2 ${step >= 1 ? "border-primary" : "border-muted"}`}>
          <p className={`text-sm font-medium ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>Step 1</p>
          <p className="text-lg font-semibold">Personal Information</p>
        </div>
        <div className={`flex-1 border-b-2 pb-2 ${step >= 2 ? "border-primary" : "border-muted"}`}>
          <p className={`text-sm font-medium ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>Step 2</p>
          <p className="text-lg font-semibold">Contact Details</p>
        </div>
        <div className={`flex-1 border-b-2 pb-2 ${step >= 3 ? "border-primary" : "border-muted"}`}>
          <p className={`text-sm font-medium ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>Step 3</p>
          <p className="text-lg font-semibold">Documents & Verification</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Personal Information"}
            {step === 2 && "Contact Details"}
            {step === 3 && "Documents & Verification"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Please provide your personal details"}
            {step === 2 && "Please provide your contact information"}
            {step === 3 && "Please upload your photos and identification documents"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <DatePicker onChange={handleDateChange} />
                  {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => handleSelectChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID Number</Label>
                  <Input id="nationalId" name="nationalId" value={formData.nationalId} onChange={handleChange} />
                  {errors.nationalId && <p className="text-sm text-destructive">{errors.nationalId}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Residential Address</Label>
                  <Textarea id="address" name="address" value={formData.address} onChange={handleChange} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City/Town</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} />
                    {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                  />
                  {errors.emergencyContact && <p className="text-sm text-destructive">{errors.emergencyContact}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                  />
                  {errors.emergencyPhone && <p className="text-sm text-destructive">{errors.emergencyPhone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travelReason">Purpose of Travel (Optional)</Label>
                  <Textarea
                    id="travelReason"
                    name="travelReason"
                    value={formData.travelReason}
                    onChange={handleChange}
                    placeholder="Please describe the purpose of your travel"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <MultiCameraCapture onCapture={handleImageCapture} />

                {(errors.selfieImage || errors.idFrontImage || errors.idBackImage) && (
                  <div className="rounded-md bg-destructive/10 p-3 text-destructive">
                    {errors.selfieImage && <p className="text-sm">{errors.selfieImage}</p>}
                    {errors.idFrontImage && <p className="text-sm">{errors.idFrontImage}</p>}
                    {errors.idBackImage && <p className="text-sm">{errors.idBackImage}</p>}
                  </div>
                )}

                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-medium">Declaration</h3>
                  <p className="text-sm text-muted-foreground">
                    I hereby declare that the information provided in this application is true and correct to the best
                    of my knowledge. I understand that providing false information may result in the rejection of my
                    application and possible legal consequences.
                  </p>
                </div>
              </div>
            )}

            {errors.form && <p className="mt-4 text-center text-sm text-destructive">{errors.form}</p>}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit">Submit Application</Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

