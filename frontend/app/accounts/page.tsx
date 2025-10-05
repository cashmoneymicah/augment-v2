"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUpDown,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react"

// Mock data
const accounts = [
  {
    id: 1,
    name: "Chase Checking",
    institution: "Chase Bank",
    type: "Checking",
    balance: 12345.67,
    status: "active",
    lastSync: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Chase Savings",
    institution: "Chase Bank", 
    type: "Savings",
    balance: 5432.10,
    status: "active",
    lastSync: "2024-01-15T10:30:00Z"
  },
  {
    id: 3,
    name: "Capital One Credit",
    institution: "Capital One",
    type: "Credit Card",
    balance: -1234.56,
    status: "needs_reauth",
    lastSync: "2024-01-10T14:20:00Z"
  },
  {
    id: 4,
    name: "Wells Fargo Investment",
    institution: "Wells Fargo",
    type: "Investment",
    balance: 25000.00,
    status: "active",
    lastSync: "2024-01-15T09:15:00Z"
  }
]

export default function Accounts() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "needs_reauth": return "bg-yellow-100 text-yellow-800"
      case "error": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active"
      case "needs_reauth": return "Needs Reauth"
      case "error": return "Error"
      default: return "Unknown"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "needs_reauth": return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance)
  }

  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected bank accounts and financial institutions.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync All
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>
                  Connect a new bank account to track your finances.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Bank account connection via Plaid will be available soon.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common account operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <ArrowUpDown className="h-6 w-6" />
                  <span>Transfer Money</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer Money</DialogTitle>
                  <DialogDescription>
                    Transfer funds between your accounts.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="text-center py-8">
                    <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Transfer Feature</h3>
                    <p className="text-muted-foreground">
                      Money transfer functionality will be available soon.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsTransferDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => window.location.href = '/transactions'}
            >
              <ExternalLink className="h-6 w-6" />
              <span>View Transactions</span>
            </Button>

            <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Set Savings Goal</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Savings Goal</DialogTitle>
                  <DialogDescription>
                    Create a new savings goal linked to this account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Savings Goal</h3>
                    <p className="text-muted-foreground">
                      This will redirect you to the Goals page to create a new goal.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {
                    setIsGoalDialogOpen(false)
                    window.location.href = '/goals'
                  }}>
                    Go to Goals
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <div className="grid gap-6 md:grid-cols-2">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <CardDescription>{account.institution}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(account.status)}
                  <Badge className={getStatusColor(account.status)}>
                    {getStatusText(account.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-semibold">{account.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Balance</p>
                  <p className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatBalance(account.balance)}
                  </p>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-muted-foreground">Last Sync</p>
                <p className="font-medium">{formatLastSync(account.lastSync)}</p>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No accounts connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your first bank account to start tracking your finances.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Connect Your First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
