"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Target
} from "lucide-react"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"

// Mock data
const incomeExpenseData = [
  { month: "Jan", income: 4200, expenses: 2850 },
  { month: "Feb", income: 4200, expenses: 3200 },
  { month: "Mar", income: 4500, expenses: 3100 },
  { month: "Apr", income: 4200, expenses: 2900 },
  { month: "May", income: 4800, expenses: 3500 },
  { month: "Jun", income: 4200, expenses: 2800 }
]

const weeklySpendingData = [
  { week: "Week 1", amount: 400 },
  { week: "Week 2", amount: 300 },
  { week: "Week 3", amount: 200 },
  { week: "Week 4", amount: 500 }
]

const savingsProgressData = [
  { month: "Jan", amount: 1350 },
  { month: "Feb", amount: 1000 },
  { month: "Mar", amount: 1400 },
  { month: "Apr", amount: 1300 },
  { month: "May", amount: 1300 },
  { month: "Jun", amount: 1400 }
]

const budgetPerformanceData = [
  { category: "Groceries", budget: 500, spent: 320, performance: 64 },
  { category: "Dining", budget: 200, spent: 180, performance: 90 },
  { category: "Transportation", budget: 200, spent: 150, performance: 75 },
  { category: "Entertainment", budget: 100, spent: 90, performance: 90 },
  { category: "Shopping", budget: 300, spent: 250, performance: 83 }
]

const goalsData = [
  { name: "Emergency Fund", progress: 75, target: 10000, current: 7500 },
  { name: "Vacation", progress: 42, target: 5000, current: 2100 },
  { name: "Car Down Payment", progress: 57, target: 15000, current: 8500 }
]

const dateRanges = [
  { value: "7d", label: "Last Week" },
  { value: "4w", label: "4 Weeks" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" },
  { value: "5y", label: "5 Years" },
  { value: "custom", label: "Custom Range" }
]

export default function Analytics() {
  const [dateRange, setDateRange] = useState("3m")

  const customTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights into your financial patterns and trends.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Income vs Expenses</span>
          </CardTitle>
          <CardDescription>
            Track your monthly income and spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={customTooltipStyle} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Spending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5" />
              <span>Weekly Spending</span>
            </CardTitle>
            <CardDescription>
              Your spending patterns by week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Savings Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Savings Progress</span>
            </CardTitle>
            <CardDescription>
              Monthly savings accumulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Performance</CardTitle>
          <CardDescription>
            How well you're staying within your budget limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetPerformanceData.map((budget) => (
              <div key={budget.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{budget.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      ${budget.spent} / ${budget.budget}
                    </span>
                    <Badge variant={budget.performance >= 90 ? "destructive" : budget.performance >= 75 ? "secondary" : "default"}>
                      {budget.performance}%
                    </Badge>
                  </div>
                </div>
                <Progress value={budget.performance} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals Overview - Compact Version */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Goals Overview</span>
          </CardTitle>
          <CardDescription>
            Progress on your savings goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goalsData.map((goal) => (
              <div key={goal.name} className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.progress}%
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>${goal.current.toLocaleString()}</span>
                    <span>${goal.target.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
