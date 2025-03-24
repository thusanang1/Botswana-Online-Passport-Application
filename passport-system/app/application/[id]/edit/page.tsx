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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { getApplicationById, updateApplication } from "@/app/actions/application-actions"
import { ApplicationStatus } from "@/app/lib/types"

export default function EditApplicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
  const [originalStatus, setOriginalStatus] = useState<ApplicationStatus>(ApplicationStatus.PENDING)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getApplicationById(params.id)

        // Only allow editing pending or rejected applications
        if (data.status !== ApplicationStatus.PENDING && data.status !== ApplicationStatus.REJECTED) {
          router.push(`/application/${params.id}`)
          return
        }

        setOriginalStatus(data.status)
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "",
          nationalId: data.nationalId || "",
          address: data.address || "",
          city: data.city || "",
          postalCode: data.postalCode || "",
          emergencyContact: data.emergencyContact || "",
          emergencyPhone: data.emergencyPhone || "",
          travelReason: data.travelReason || "",
          selfieImage: data.selfieImage || null,
          idFrontImage: data.idFrontImage || null,
          idBackImage: data.idBackImage || null,
        })
      } catch (err) {
        setError("Failed to load application data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
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

    // Clear error for this field if it exists
    const fieldName = type === "selfie" ? "selfieImage" : type === "idFront" ? "idFrontImage" : "idBackImage"
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const validateTab = (tabName: string) => {
    const newErrors: Record<string, string> = {}

    if (tabName === "personal") {
      if (!formData.firstName) newErrors.firstName = "First name is required"
      if (!formData.lastName) newErrors.lastName = "Last name is required"
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
      if (!formData.gender) newErrors.gender = "Gender is required"
      if (!formData.nationalId) newErrors.nationalId = "National ID is required"
    } else if (tabName === "contact") {
      if (!formData.address) newErrors.address = "Address is required"
      if (!formData.city) newErrors.city = "City is required"
      if (!formData.postalCode) newErrors.postalCode = "Postal code is required"
      if (!formData.emergencyContact) newErrors.emergencyContact = "Emergency contact is required"
      if (!formData.emergencyPhone) newErrors.emergencyPhone = "Emergency phone is required"
    } else if (tabName === "documents") {
      if (!formData.selfieImage) newErrors.selfieImage = "Selfie image is required"
      if (!formData.idFrontImage) newErrors.idFrontImage = "ID card front image is required"
      if (!formData.idBackImage) newErrors.idBackImage = "ID card back image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTabChange = (tab: string) => {
    // Validate current tab before switching
    if (validateTab(activeTab)) {
      setActiveTab(tab)
    }
  }

  const validateForm = () => {
    // Validate all tabs
    const personalValid = validateTab("personal")
    const contactValid = validateTab("contact")
    const documentsValid = validateTab("documents")

    if (!personalValid) {
      setActiveTab("personal")
      return false
    }

    if (!contactValid) {
      setActiveTab("contact")
      return false
    }

    if (!documentsValid) {
      setActiveTab("documents")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSaving(true)

      await updateApplication({
        id: params.id,
        ...formData,
        status:
          originalStatus === ApplicationStatus.REJECTED
            ? ApplicationStatus.PENDING // If it was rejected, set back to pending for review
            : originalStatus, // Otherwise keep the same status
      })

      router.push(`/application/${params.id}?updated=true`)
    } catch (error) {
      console.error("Application update error:", error)
      setErrors({ form: "Application update failed. Please try again." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <p>Loading application data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/application/${params.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Application</h1>
        </div>
      </div>

      {originalStatus === ApplicationStatus.REJECTED && (
        <Alert className="mb-6 border-destructive/50 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            Your application was previously rejected. After making the necessary changes, it will be resubmitted for
            review.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="contact">Contact Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <DatePicker
                    onChange={handleDateChange}
                    initialDate={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
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
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="button" onClick={() => handleTabChange("contact")}>
                  Next: Contact Details
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>Update your contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => handleTabChange("personal")}>
                  Previous: Personal Info
                </Button>
                <Button type="button" onClick={() => handleTabChange("documents")}>
                  Next: Documents
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Documents & Biometric Data</CardTitle>
                <CardDescription>Update your photos and identification documents</CardDescription>
              </CardHeader>
              <CardContent>
                <MultiCameraCapture
                  onCapture={handleImageCapture}
                  initialImages={{
                    selfie: formData.selfieImage,
                    idFront: formData.idFrontImage,
                    idBack: formData.idBackImage,
                  }}
                />

                {(errors.selfieImage || errors.idFrontImage || errors.idBackImage) && (
                  <div className="mt-4 rounded-md bg-destructive/10 p-3 text-destructive">
                    {errors.selfieImage && <p className="text-sm">{errors.selfieImage}</p>}
                    {errors.idFrontImage && <p className="text-sm">{errors.idFrontImage}</p>}
                    {errors.idBackImage && <p className="text-sm">{errors.idBackImage}</p>}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => handleTabChange("contact")}>
                  Previous: Contact Details
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {errors.form && (
          <div className="mt-4 rounded-md bg-destructive/10 p-3 text-center text-destructive">
            <p>{errors.form}</p>
          </div>
        )}
      </form>
    </div>
  )
}

