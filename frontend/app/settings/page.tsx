"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Key, 
  Users, 
  Settings as SettingsIcon,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function Settings() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [budgetAlerts, setBudgetAlerts] = useState(true)
  const [goalReminders, setGoalReminders] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isAccountsDialogOpen, setIsAccountsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      })
      return
    }
    // Here you would typically update the password via API
    toast({
      title: "Success",
      description: "Password updated successfully"
    })
    setIsPasswordDialogOpen(false)
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const exportData = () => {
    const data = {
      transactions: [],
      budgets: [],
      goals: [],
      accounts: [],
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'augment-data.json'
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Success",
      description: "Data exported successfully"
    })
  }

  const saveSettings = () => {
    // Here you would typically save settings via API
    toast({
      title: "Success",
      description: "Settings saved successfully"
    })
  }

  const deleteAccount = () => {
    // Here you would typically delete the account via API
    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted",
      variant: "destructive"
    })
    setIsDeleteDialogOpen(false)
  }

  const connectedAccounts = [
    { id: 1, name: "Chase Checking", institution: "Chase Bank", status: "active", balance: "$12,345.67" },
    { id: 2, name: "Chase Savings", institution: "Chase Bank", status: "active", balance: "$5,432.10" },
    { id: 3, name: "Capital One Credit", institution: "Capital One", status: "needs_reauth", balance: "-$1,234.56" }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Button onClick={saveSettings}>
          <SettingsIcon className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your account
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifs}
                onCheckedChange={setEmailNotifs}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="budget-alerts">Budget Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when approaching budget limits
                </p>
              </div>
              <Switch
                id="budget-alerts"
                checked={budgetAlerts}
                onCheckedChange={setBudgetAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="goal-reminders">Goal Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly reminders about your savings goals
                </p>
              </div>
              <Switch
                id="goal-reminders"
                checked={goalReminders}
                onCheckedChange={setGoalReminders}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Data & Privacy</span>
            </CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your financial data
                </p>
              </div>
              <Button variant="outline" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Manage Accounts</Label>
                <p className="text-sm text-muted-foreground">
                  View and manage connected accounts
                </p>
              </div>
              <Dialog open={isAccountsDialogOpen} onOpenChange={setIsAccountsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Connected Accounts</DialogTitle>
                    <DialogDescription>
                      Manage your connected bank accounts
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {connectedAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">{account.institution}</p>
                          <p className="text-sm font-semibold">{account.balance}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={account.status === "active" ? "default" : "destructive"}>
                            {account.status === "active" ? "Active" : "Needs Reauth"}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setIsAccountsDialogOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span>Delete Account</span>
                    </DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All your data will be permanently deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to delete your account? This will remove:
                    </p>
                    <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                      <li>All transaction history</li>
                      <li>All budgets and goals</li>
                      <li>All connected accounts</li>
                      <li>All personal data</li>
                    </ul>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={deleteAccount}>
                      Delete Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Security</span>
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Update Password</Label>
                <p className="text-sm text-muted-foreground">
                  Change your account password
                </p>
              </div>
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    Update
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Update Password</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your app experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Auto Sync</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync transactions from connected accounts
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark theme for the application
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="analytics">Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Enable analytics tracking to improve the app
                </p>
              </div>
              <Switch
                id="analytics"
                checked={analytics}
                onCheckedChange={setAnalytics}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
