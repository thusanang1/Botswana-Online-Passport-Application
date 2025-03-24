"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApplicationStatusBadge } from "@/app/components/application-status-badge"
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import { getApplicationById, updateApplicationStatus } from "@/app/actions/application-actions"
import { ApplicationStatus } from "@/app/lib/types"

export default function AdminApplicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  // Fetch application data
  useState(() => {
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
  })

  const handleApprove = async () => {
    try {
      await updateApplicationStatus({
        id: params.id,
        status: ApplicationStatus.APPROVED,
        feedback,
      })

      setIsApproveDialogOpen(false)
      router.push("/admin/dashboard?status=approved")
    } catch (err) {
      console.error(err)
    }
  }

  const handleReject = async () => {
    try {
      await updateApplicationStatus({
        id: params.id,
        status: ApplicationStatus.REJECTED,
        feedback,
      })

      setIsRejectDialogOpen(false)
      router.push("/admin/dashboard?status=rejected")
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <p>Loading application data...</p>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Application not found"}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/admin/dashboard")}>
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
      <div className="mb-8 flex items-center">
        <Button variant="outline" onClick={() => router.push("/admin/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="ml-4">
          <h1 className="text-2xl font-bold">Application #{params.id}</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Status:</p>
            <ApplicationStatusBadge status={application.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="personal">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="contact">Contact Details</TabsTrigger>
              <TabsTrigger value="biometric">Biometric Data</TabsTrigger>
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

            <TabsContent value="biometric" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Biometric Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">Selfie Image</p>
                    <div className="overflow-hidden rounded-md">
                      <img
                        src={application.selfieImage || "/placeholder.svg"}
                        alt="Applicant selfie"
                        className="h-64 w-auto object-cover"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Application Review</CardTitle>
              <CardDescription>Review and make a decision on this application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submission Date</p>
                <p>{new Date(application.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Application Status</p>
                <ApplicationStatusBadge status={application.status} />
              </div>

              {application.feedback && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Feedback</p>
                  <p>{application.feedback}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-2">
              {application.status === ApplicationStatus.PENDING && (
                <>
                  <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Application
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Approve Application</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to approve this passport application?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Add feedback (optional)</p>
                          <Textarea
                            placeholder="Enter any feedback or notes"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                          Confirm Approval
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Application
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to reject this passport application?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Rejection reason (required)</p>
                          <Textarea
                            placeholder="Enter the reason for rejection"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                          Confirm Rejection
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

