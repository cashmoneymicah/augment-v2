"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data
const kpiData = [
  {
    title: "Total Balance",
    value: "$12,345.67",
    change: "+2.5%",
    changeType: "positive" as const,
    icon: DollarSign,
    iconBgColor: "bg-blue-500/10",
    iconColor: "text-blue-500"
  },
  {
    title: "Income",
    value: "$4,200.00",
    change: "+5.2%",
    changeType: "positive" as const,
    icon: TrendingUp,
    iconBgColor: "bg-green-500/10",
    iconColor: "text-green-500"
  },
  {
    title: "Expenses",
    value: "$2,850.00",
    change: "-1.8%",
    changeType: "negative" as const,
    icon: TrendingDown,
    iconBgColor: "bg-red-500/10",
    iconColor: "text-red-500"
  },
  {
    title: "Savings Rate",
    value: "32.1%",
    change: "+3.2%",
    changeType: "positive" as const,
    icon: PiggyBank,
    iconBgColor: "bg-purple-500/10",
    iconColor: "text-purple-500"
  }
]

const spendingData = [
  { name: "Groceries", value: 400, color: "#8884d8" },
  { name: "Dining", value: 300, color: "#82ca9d" },
  { name: "Transportation", value: 200, color: "#ffc658" },
  { name: "Entertainment", value: 150, color: "#ff7300" },
  { name: "Shopping", value: 100, color: "#00ff00" },
]

const trendsData = [
  { name: "Week 1", amount: 400 },
  { name: "Week 2", amount: 300 },
  { name: "Week 3", amount: 200 },
  { name: "Week 4", amount: 500 },
]

const budgetData = [
  { category: "Groceries", spent: 320, limit: 500, status: "good" },
  { category: "Dining", spent: 180, limit: 200, status: "warning" },
  { category: "Transportation", spent: 150, limit: 200, status: "good" },
  { category: "Entertainment", spent: 90, limit: 100, status: "warning" },
  { category: "Shopping", spent: 250, limit: 300, status: "good" },
]

const recentTransactions = [
  { id: 1, merchant: "Amazon", amount: -45.99, category: "Shopping", date: "2024-01-15" },
  { id: 2, merchant: "Starbucks", amount: -5.50, category: "Dining", date: "2024-01-15" },
  { id: 3, merchant: "Salary", amount: 4200.00, category: "Income", date: "2024-01-14" },
  { id: 4, merchant: "Shell", amount: -35.20, category: "Transportation", date: "2024-01-14" },
  { id: 5, merchant: "Whole Foods", amount: -89.45, category: "Groceries", date: "2024-01-13" },
  { id: 6, merchant: "Netflix", amount: -15.99, category: "Entertainment", date: "2024-01-13" },
  { id: 7, merchant: "Uber", amount: -12.75, category: "Transportation", date: "2024-01-12" },
  { id: 8, merchant: "McDonald's", amount: -8.99, category: "Dining", date: "2024-01-12" },
  { id: 9, merchant: "Target", amount: -67.32, category: "Shopping", date: "2024-01-11" },
  { id: 10, merchant: "Gas Station", amount: -42.10, category: "Transportation", date: "2024-01-11" },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your finances.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.iconBgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {kpi.changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={kpi.changeType === "positive" ? "text-green-500" : "text-red-500"}>
                    {kpi.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Analysis</CardTitle>
            <CardDescription>
              Breakdown of your spending by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="category" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="category">By Category</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>
              <TabsContent value="category" className="mt-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {spendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="trends" className="mt-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Budget Overview - Compact Version */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              Top 5 budgets for this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgetData.slice(0, 5).map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100
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
              
              return (
                <div key={budget.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{budget.category}</span>
                    <Badge variant={budget.status === "good" ? "default" : "destructive"}>
                      {getStatusText(budget.status)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${budget.spent.toFixed(2)} / ${budget.limit}</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your latest financial activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {transaction.merchant.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{transaction.merchant}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
