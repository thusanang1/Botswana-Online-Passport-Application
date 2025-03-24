"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { getAllUsers, blockUser, unblockUser, deleteUser, searchUsers } from "@/app/actions/user-actions"
import { type User, UserStatus } from "@/app/lib/types"

export default function ManageUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get("status") || "all"

  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [blockReason, setBlockReason] = useState("")
  const [blockDuration, setBlockDuration] = useState("1")
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers()
        setUsers(allUsers)
        setFilteredUsers(allUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    // Apply filters
    let result = [...users]

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((user) => {
        if (statusFilter === "active") return user.status === UserStatus.ACTIVE
        if (statusFilter === "blocked") return user.status === UserStatus.BLOCKED
        if (statusFilter === "deleted") return user.status === UserStatus.DELETED
        return true
      })
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phoneNumber.includes(searchQuery),
      )
    }

    setFilteredUsers(result)
  }, [users, statusFilter, searchQuery])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (searchQuery.trim()) {
        const results = await searchUsers(searchQuery)
        setFilteredUsers(results)
      } else {
        setFilteredUsers(users)
      }
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const handleBlockUser = async () => {
    if (!selectedUser) return

    try {
      setActionError(null)
      await blockUser({
        userId: selectedUser.id,
        reason: blockReason,
        durationDays: Number.parseInt(blockDuration),
      })

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === selectedUser.id) {
            const blockedUntil = new Date()
            blockedUntil.setDate(blockedUntil.getDate() + Number.parseInt(blockDuration))

            return {
              ...user,
              status: UserStatus.BLOCKED,
              blockedUntil: blockedUntil.toISOString(),
              blockReason: blockReason,
            }
          }
          return user
        }),
      )

      setActionSuccess(
        `User ${selectedUser.firstName} ${selectedUser.lastName} has been blocked for ${blockDuration} day(s).`,
      )
      setIsBlockDialogOpen(false)
      setBlockReason("")
      setBlockDuration("1")
    } catch (error: any) {
      setActionError(error.message || "Failed to block user")
    }
  }

  const handleUnblockUser = async () => {
    if (!selectedUser) return

    try {
      setActionError(null)
      await unblockUser(selectedUser.id)

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              status: UserStatus.ACTIVE,
              blockedUntil: undefined,
              blockReason: undefined,
            }
          }
          return user
        }),
      )

      setActionSuccess(`User ${selectedUser.firstName} ${selectedUser.lastName} has been unblocked.`)
      setIsUnblockDialogOpen(false)
    } catch (error: any) {
      setActionError(error.message || "Failed to unblock user")
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setActionError(null)
      await deleteUser(selectedUser.id)

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              status: UserStatus.DELETED,
            }
          }
          return user
        }),
      )

      setActionSuccess(`User ${selectedUser.firstName} ${selectedUser.lastName} has been deleted.`)
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      setActionError(error.message || "Failed to delete user")
    }
  }

  const getUserStatusBadge = (user: User) => {
    switch (user.status) {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const getBlockTimeRemaining = (user: User) => {
    if (user.status !== UserStatus.BLOCKED || !user.blockedUntil) return null

    const now = new Date()
    const blockEnd = new Date(user.blockedUntil)

    if (blockEnd <= now) return "Block expired"

    const diffMs = blockEnd.getTime() - now.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHrs > 24) {
      const days = Math.floor(diffHrs / 24)
      return `${days} day${days > 1 ? "s" : ""} remaining`
    }

    return `${diffHrs}h ${diffMins}m remaining`
  }

  if (loading) {
    return (
      <div className="container flex h-[50vh] items-center justify-center">
        <p>Loading users...</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Manage Users</h1>
        </div>
      </div>

      {actionSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {actionError && (
        <Alert className="mb-6 bg-red-50 text-red-800">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts, block users who violate policies, or delete accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter:</span>
              <Select
                defaultValue={statusFilter || "all"}
                onValueChange={(value) => router.push(`/admin/users?status=${value}`)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getUserStatusBadge(user)}
                        {user.status === UserStatus.BLOCKED && user.blockedUntil && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {getBlockTimeRemaining(user)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.status === UserStatus.ACTIVE && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 border-amber-600"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsBlockDialogOpen(true)
                            }}
                          >
                            <ShieldAlert className="mr-1 h-4 w-4" />
                            Block
                          </Button>
                        )}

                        {user.status === UserStatus.BLOCKED && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsUnblockDialogOpen(true)
                            }}
                          >
                            <ShieldCheck className="mr-1 h-4 w-4" />
                            Unblock
                          </Button>
                        )}

                        {user.status !== UserStatus.DELETED && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Block User Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
            <DialogDescription>
              This will temporarily block the user from accessing the system. Blocked users cannot log in until the
              block period expires or is manually removed.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">User:</p>
                <p>
                  {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blockReason">Reason for blocking</Label>
                <Textarea
                  id="blockReason"
                  placeholder="Enter the reason for blocking this user"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="blockDuration">Block duration (max 3 days)</Label>
                <Select value={blockDuration} onValueChange={setBlockDuration}>
                  <SelectTrigger id="blockDuration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleBlockUser}
              disabled={!blockReason}
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock User Dialog */}
      <Dialog open={isUnblockDialogOpen} onOpenChange={setIsUnblockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock User</DialogTitle>
            <DialogDescription>
              This will remove the block and allow the user to access the system again.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">User:</p>
                <p>
                  {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                </p>
              </div>

              {selectedUser.blockReason && (
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Block reason:</p>
                  <p className="text-sm">{selectedUser.blockReason}</p>
                </div>
              )}

              {selectedUser.blockedUntil && (
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Blocked until:</p>
                  <p className="text-sm">{formatDate(selectedUser.blockedUntil)}</p>
                </div>
              )}

              <Alert className="bg-amber-50 text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription>
                  Are you sure you want to unblock this user before the block period expires?
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnblockDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={handleUnblockUser}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Unblock User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The user account will be permanently deleted from the system.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">User:</p>
                <p>
                  {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                </p>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Are you sure you want to delete this user? This action cannot be undone and will remove all user data
                  from the system.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

