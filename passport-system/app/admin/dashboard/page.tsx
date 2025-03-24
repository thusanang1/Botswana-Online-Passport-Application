import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Clock, CheckCircle, AlertTriangle, Users } from "lucide-react"
import { getAllApplications } from "@/app/actions/application-actions"
import { getAllUsers } from "@/app/actions/user-actions"
import { ApplicationStatus, UserStatus } from "@/app/lib/types"
import { ApplicationStatusBadge } from "@/app/components/application-status-badge"

export default async function AdminDashboard() {
  const applications = await getAllApplications()
  const users = await getAllUsers()

  const pendingApplications = applications.filter((app) => app.status === ApplicationStatus.PENDING)
  const approvedApplications = applications.filter((app) => app.status === ApplicationStatus.APPROVED)
  const rejectedApplications = applications.filter((app) => app.status === ApplicationStatus.REJECTED)

  const activeUsers = users.filter((user) => user.status === UserStatus.ACTIVE)
  const blockedUsers = users.filter((user) => user.status === UserStatus.BLOCKED)

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline">Settings</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
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
              <div className="text-2xl font-bold">{pendingApplications.length}</div>
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
              <div className="text-2xl font-bold">{approvedApplications.length}</div>
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
              <div className="text-2xl font-bold">{rejectedApplications.length}</div>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{users.length}</div>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="text-green-600">{activeUsers.length} active</span> •
              <span className="ml-1 text-amber-600">{blockedUsers.length} blocked</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedApplications.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-center text-muted-foreground">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Application #{application.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.firstName} {application.lastName} • Submitted on{" "}
                        {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApplicationStatusBadge status={application.status} />
                      <Link href={`/admin/application/${application.id}`}>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {approvedApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-center text-muted-foreground">No approved applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Application #{application.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.firstName} {application.lastName} • Approved on{" "}
                        {new Date(application.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApplicationStatusBadge status={application.status} />
                      <Link href={`/admin/application/${application.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {rejectedApplications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-center text-muted-foreground">No rejected applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">Application #{application.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.firstName} {application.lastName} • Rejected on{" "}
                        {new Date(application.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ApplicationStatusBadge status={application.status} />
                      <Link href={`/admin/application/${application.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

