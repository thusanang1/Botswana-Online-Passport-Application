import { Badge } from "@/components/ui/badge"
import { ApplicationStatus } from "@/app/lib/types"

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  switch (status) {
    case ApplicationStatus.PENDING:
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          Pending
        </Badge>
      )
    case ApplicationStatus.APPROVED:
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Approved
        </Badge>
      )
    case ApplicationStatus.REJECTED:
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700">
          Rejected
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

