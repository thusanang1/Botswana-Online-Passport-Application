import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { getUserApplications, userHasApplication } from "@/app/actions/application-actions"
import { ApplicationStatus } from "@/app/lib/types"
import { ApplicationStatusBadge } from "@/app/components/application-status-badge"

export default async function Dashboard() {
  const applications = await getUserApplications()
  const hasActiveApplication = await userHasApplication("user123") // In a real app, use the authenticated user's ID

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {!hasActiveApplication ? (
          <Link href="/apply">
            <Button>New Application</Button>
          </Link>
        ) : (
          <Button disabled title="You already have an active application">
            New Application
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{applications.length}</div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {applications.filter((app) => app.status === ApplicationStatus.PENDING).length}
              </div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {applications.filter((app) => app.status === ApplicationStatus.APPROVED).length}
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {applications.filter((app) => app.status === ApplicationStatus.REJECTED).length}
              </div>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-4 mt-8 text-xl font-semibold">Your Applications</h2>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="mb-4 text-center text-muted-foreground">
              You haven't submitted any passport applications yet.
            </p>
            <Link href="/apply">
              <Button>Start New Application</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Application #{application.id}</p>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <ApplicationStatusBadge status={application.status} />
                  <Link href={`/application/${application.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasActiveApplication && applications.length > 0 && (
        <div className="mt-6">
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <AlertTriangle className="mt-1 h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="font-medium">One Application Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    For security reasons, you can only have one active passport application at a time. You can submit a
                    new application once your current application is completed or rejected.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

