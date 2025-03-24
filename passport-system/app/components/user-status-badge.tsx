import { Badge } from "@/components/ui/badge"
import { UserStatus } from "@/app/lib/types"
import { CheckCircle, ShieldAlert, XCircle } from "lucide-react"

interface UserStatusBadgeProps {
  status: UserStatus
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  switch (status) {
    case UserStatus.ACTIVE:
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      )
    case UserStatus.BLOCKED:
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          <ShieldAlert className="mr-1 h-3 w-3" />
          Blocked
        </Badge>
      )
    case UserStatus.DELETED:
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700">
          <XCircle className="mr-1 h-3 w-3" />
          Deleted
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

