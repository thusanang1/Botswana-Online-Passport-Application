"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ApplicationStatusBadge } from "@/app/components/application-status-badge"
import { ArrowLeft, Clock, Edit, FileText, Printer, CheckCircle, XCircle } from "lucide-react"
import { getApplicationById } from "@/app/actions/application-actions"
import { ApplicationStatus } from "@/app/lib/types"

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getApplicationById(params.id)
        setApplication(data)
      } catch (err) {
        setError("Failed to load application data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Clock className="h-8 w-8 animate-pulse text-muted-foreground" />
          <p className="text-muted-foreground">Loading application data...</p>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Application not found"}</CardDescription>
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

  const isPending = application.status === ApplicationStatus.PENDING
  const isRejected = application.status === ApplicationStatus.REJECTED

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Application #{params.id}</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Status:</p>
              <ApplicationStatusBadge status={application.status} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          {isPending && (
            <Link href={`/application/${params.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Application
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {isRejected && application.feedback && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Application Rejected</CardTitle>
            <CardDescription>
              Your application has been rejected. Please review the feedback below and make the necessary corrections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-white p-4">
              <p className="font-medium">Feedback from reviewer:</p>
              <p className="mt-2">{application.feedback}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/application/${params.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit and Resubmit
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="personal" className="print:hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">First Name</p>
                      <p>{application.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                      <p>{application.lastName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p>{new Date(application.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <p className="capitalize">{application.gender}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">National ID</p>
                    <p>{application.nationalId}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Address</p>
                    <p>{application.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">City/Town</p>
                      <p>{application.city}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Postal Code</p>
                      <p>{application.postalCode}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                      <p>{application.emergencyContact}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Emergency Phone</p>
                      <p>{application.emergencyPhone}</p>
                    </div>
                  </div>

                  {application.travelReason && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Purpose of Travel</p>
                      <p>{application.travelReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Biometric Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Selfie Photo</p>
                      <div className="overflow-hidden rounded-md border">
                        <img
                          src={application.selfieImage || "/placeholder.svg?height=300&width=300"}
                          alt="Applicant selfie"
                          className="aspect-square h-auto w-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">ID Card (Front)</p>
                      <div className="overflow-hidden rounded-md border">
                        <img
                          src={application.idFrontImage || "/placeholder.svg?height=200&width=320"}
                          alt="ID card front"
                          className="aspect-video h-auto w-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">ID Card (Back)</p>
                      <div className="overflow-hidden rounded-md border">
                        <img
                          src={application.idBackImage || "/placeholder.svg?height=200&width=320"}
                          alt="ID card back"
                          className="aspect-video h-auto w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Print view - only visible when printing */}
          <div className="hidden print:block">
            <div className="mb-8 border-b pb-4">
              <h2 className="text-xl font-bold">Personal Information</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">First Name</p>
                  <p>{application.firstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                  <p>{application.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p>{new Date(application.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="capitalize">{application.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">National ID</p>
                  <p>{application.nationalId}</p>
                </div>
              </div>
            </div>

            <div className="mb-8 border-b pb-4">
              <h2 className="text-xl font-bold">Contact Details</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{application.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">City/Town</p>
                  <p>{application.city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Postal Code</p>
                  <p>{application.postalCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                  <p>{application.emergencyContact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emergency Phone</p>
                  <p>{application.emergencyPhone}</p>
                </div>
                {application.travelReason && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Purpose of Travel</p>
                    <p>{application.travelReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold">Documents & Biometric Data</h2>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Selfie Photo</p>
                  <img
                    src={application.selfieImage || "/placeholder.svg?height=300&width=300"}
                    alt="Applicant selfie"
                    className="mt-2 h-32 w-auto"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Card (Front)</p>
                  <img
                    src={application.idFrontImage || "/placeholder.svg?height=200&width=320"}
                    alt="ID card front"
                    className="mt-2 h-24 w-auto"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Card (Back)</p>
                  <img
                    src={application.idBackImage || "/placeholder.svg?height=200&width=320"}
                    alt="ID card back"
                    className="mt-2 h-24 w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="print:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Track the progress of your passport application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Application ID</p>
                <p className="font-mono">{application.id}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                <p>{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p>{new Date(application.updatedAt).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                <div className="mt-1">
                  <ApplicationStatusBadge status={application.status} />
                </div>
              </div>

              {application.feedback && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                  <p className="mt-1 rounded-md bg-muted p-2 text-sm">{application.feedback}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-2 border-t bg-muted/50 p-4">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium">Estimated Processing Time:</p>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  7-10 days
                </Badge>
              </div>

              <div className="w-full rounded-md bg-white p-3 text-center text-sm">
                <p className="font-medium">Need assistance?</p>
                <p className="mt-1 text-muted-foreground">Contact our support team at:</p>
                <p className="mt-1">support@passports.gov.bw</p>
                <p>+267 3600 700</p>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="h-full w-px bg-border"></div>
                    </div>
                    <div>
                      <p className="font-medium">Application Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(application.createdAt).toLocaleDateString()} at{" "}
                        {new Date(application.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${application.status !== ApplicationStatus.PENDING ? "bg-primary text-white" : "border border-muted-foreground bg-background text-muted-foreground"}`}
                      >
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="h-full w-px bg-border"></div>
                    </div>
                    <div>
                      <p className="font-medium">Under Review</p>
                      <p className="text-sm text-muted-foreground">
                        {application.status !== ApplicationStatus.PENDING
                          ? `${new Date(application.updatedAt).toLocaleDateString()} at ${new Date(application.updatedAt).toLocaleTimeString()}`
                          : "Pending review by immigration officer"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${application.status === ApplicationStatus.APPROVED ? "bg-green-600 text-white" : application.status === ApplicationStatus.REJECTED ? "bg-destructive text-white" : "border border-muted-foreground bg-background text-muted-foreground"}`}
                      >
                        {application.status === ApplicationStatus.APPROVED ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : application.status === ApplicationStatus.REJECTED ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">
                        {application.status === ApplicationStatus.APPROVED
                          ? "Application Approved"
                          : application.status === ApplicationStatus.REJECTED
                            ? "Application Rejected"
                            : "Final Decision"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.status === ApplicationStatus.APPROVED
                          ? "Your passport application has been approved"
                          : application.status === ApplicationStatus.REJECTED
                            ? "Your application has been rejected. See feedback for details."
                            : "Awaiting final decision"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

