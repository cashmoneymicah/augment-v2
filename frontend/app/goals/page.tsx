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
import { Plus, Target, Calendar, DollarSign } from "lucide-react"

// Mock data
const goals = [
  {
    id: 1,
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 7500,
    targetDate: "2024-12-31",
    category: "Savings",
    monthlyContribution: 500,
    progress: 75
  },
  {
    id: 2,
    name: "Vacation to Europe",
    targetAmount: 5000,
    currentAmount: 2100,
    targetDate: "2024-08-15",
    category: "Travel",
    monthlyContribution: 300,
    progress: 42
  },
  {
    id: 3,
    name: "New Car Down Payment",
    targetAmount: 15000,
    currentAmount: 8500,
    targetDate: "2025-06-01",
    category: "Housing",
    monthlyContribution: 800,
    progress: 57
  },
  {
    id: 4,
    name: "Home Renovation",
    targetAmount: 25000,
    currentAmount: 12000,
    targetDate: "2025-12-31",
    category: "Housing",
    monthlyContribution: 1000,
    progress: 48
  }
]

const categories = [
  "Savings",
  "Travel", 
  "Housing",
  "Education",
  "Health",
  "Entertainment",
  "Investment",
  "Other"
]

export default function Goals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    category: "",
    initialAmount: "",
    monthlyContribution: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the goal to your backend
    console.log("New goal:", formData)
    setIsDialogOpen(false)
    setFormData({
      name: "",
      targetAmount: "",
      targetDate: "",
      category: "",
      initialAmount: "",
      monthlyContribution: ""
    })
  }

  const getStatusColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusText = (progress: number) => {
    if (progress >= 100) return "Completed"
    if (progress >= 75) return "Almost There"
    if (progress >= 50) return "On Track"
    return "Getting Started"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Track your savings goals and financial targets.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set up a new savings goal to track your progress.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Emergency Fund"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="10000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    required
                  />
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
                  <Label htmlFor="initialAmount">Initial Amount (Optional)</Label>
                  <Input
                    id="initialAmount"
                    type="number"
                    placeholder="0"
                    value={formData.initialAmount}
                    onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                  <Input
                    id="monthlyContribution"
                    type="number"
                    placeholder="500"
                    value={formData.monthlyContribution}
                    onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Goal</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <CardDescription>{goal.category}</CardDescription>
                  </div>
                </div>
                <Badge variant={goal.progress >= 75 ? "default" : "secondary"}>
                  {getStatusText(goal.progress)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current</p>
                  <p className="font-semibold">${goal.currentAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target</p>
                  <p className="font-semibold">${goal.targetAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Monthly</p>
                  <p className="font-semibold">${goal.monthlyContribution}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target Date</p>
                  <p className="font-semibold">{new Date(goal.targetDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-semibold text-primary">
                    ${(goal.targetAmount - goal.currentAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first savings goal to start tracking your progress.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
