"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, Edit, Trash2 } from "lucide-react"

// Mock data
const budgets = [
  {
    id: 1,
    month: "January 2024",
    category: "Groceries",
    limit: 500,
    spent: 320,
    status: "good"
  },
  {
    id: 2,
    month: "January 2024",
    category: "Dining",
    limit: 200,
    spent: 180,
    status: "warning"
  },
  {
    id: 3,
    month: "January 2024",
    category: "Transportation",
    limit: 200,
    spent: 150,
    status: "good"
  },
  {
    id: 4,
    month: "January 2024",
    category: "Entertainment",
    limit: 100,
    spent: 90,
    status: "warning"
  },
  {
    id: 5,
    month: "January 2024",
    category: "Shopping",
    limit: 300,
    spent: 250,
    status: "good"
  }
]

const categories = [
  "Groceries",
  "Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Health",
  "Bills",
  "Utilities",
  "Other"
]

const months = [
  "January 2024",
  "February 2024",
  "March 2024",
  "April 2024",
  "May 2024",
  "June 2024",
  "July 2024",
  "August 2024",
  "September 2024",
  "October 2024",
  "November 2024",
  "December 2024"
]

export default function Budgets() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    month: "",
    category: "",
    limit: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the budget to your backend
    console.log("New budget:", formData)
    setIsDialogOpen(false)
    setFormData({
      month: "",
      category: "",
      limit: ""
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "bg-green-500"
      case "warning": return "bg-yellow-500"
      case "danger": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "good": return "On Track"
      case "warning": return "Warning"
      case "danger": return "Over Budget"
      default: return "Unknown"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "good": return "default" as const
      case "warning": return "secondary" as const
      case "danger": return "destructive" as const
      default: return "default" as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Create and manage your monthly budgets.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Set up a new monthly budget for a specific category.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="month">Month</Label>
                  <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="limit">Limit Amount</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="500"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Budget</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budgets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100
          return (
            <Card key={budget.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      <CardDescription>{budget.month}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(budget.status)}>
                    {getStatusText(budget.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Spent</p>
                    <p className="font-semibold">${budget.spent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Limit</p>
                    <p className="font-semibold">${budget.limit.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={`font-semibold ${budget.limit - budget.spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${(budget.limit - budget.spent).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {budgets.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your spending.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
