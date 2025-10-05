"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Filter } from "lucide-react"

// Mock data
const transactions = [
  { id: 1, merchant: "Amazon", amount: -45.99, category: "Shopping", account: "Chase Checking", date: "2024-01-15" },
  { id: 2, merchant: "Starbucks", amount: -5.50, category: "Dining", account: "Chase Checking", date: "2024-01-15" },
  { id: 3, merchant: "Salary", amount: 4200.00, category: "Income", account: "Chase Checking", date: "2024-01-14" },
  { id: 4, merchant: "Shell", amount: -35.20, category: "Transportation", account: "Chase Checking", date: "2024-01-14" },
  { id: 5, merchant: "Whole Foods", amount: -89.45, category: "Groceries", account: "Chase Checking", date: "2024-01-13" },
  { id: 6, merchant: "Netflix", amount: -15.99, category: "Entertainment", account: "Chase Checking", date: "2024-01-13" },
  { id: 7, merchant: "Uber", amount: -12.75, category: "Transportation", account: "Chase Checking", date: "2024-01-12" },
  { id: 8, merchant: "McDonald's", amount: -8.99, category: "Dining", account: "Chase Checking", date: "2024-01-12" },
  { id: 9, merchant: "Target", amount: -67.32, category: "Shopping", account: "Chase Checking", date: "2024-01-11" },
  { id: 10, merchant: "Gas Station", amount: -42.10, category: "Transportation", account: "Chase Checking", date: "2024-01-11" },
  { id: 11, merchant: "Apple Store", amount: -299.99, category: "Shopping", account: "Chase Checking", date: "2024-01-10" },
  { id: 12, merchant: "Pizza Hut", amount: -24.50, category: "Dining", account: "Chase Checking", date: "2024-01-10" },
  { id: 13, merchant: "Freelance Payment", amount: 850.00, category: "Income", account: "Chase Checking", date: "2024-01-09" },
  { id: 14, merchant: "CVS Pharmacy", amount: -18.75, category: "Health", account: "Chase Checking", date: "2024-01-09" },
  { id: 15, merchant: "Spotify", amount: -9.99, category: "Entertainment", account: "Chase Checking", date: "2024-01-08" },
]

const categories = ["All", "Income", "Groceries", "Dining", "Transportation", "Shopping", "Entertainment", "Health", "Bills", "Other"]

type SortField = "date" | "merchant" | "amount" | "category" | "account"
type SortDirection = "asc" | "desc"

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="h-4 w-4 text-primary" /> : 
      <ArrowDown className="h-4 w-4 text-primary" />
  }

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "All" || transaction.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortField) {
        case "date":
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case "merchant":
          aValue = a.merchant.toLowerCase()
          bValue = b.merchant.toLowerCase()
          break
        case "amount":
          aValue = Math.abs(a.amount)
          bValue = Math.abs(b.amount)
          break
        case "category":
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        case "account":
          aValue = a.account.toLowerCase()
          bValue = b.account.toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Income: "bg-green-100 text-green-800",
      Groceries: "bg-blue-100 text-blue-800",
      Dining: "bg-orange-100 text-orange-800",
      Transportation: "bg-purple-100 text-purple-800",
      Shopping: "bg-pink-100 text-pink-800",
      Entertainment: "bg-yellow-100 text-yellow-800",
      Health: "bg-red-100 text-red-800",
      Bills: "bg-gray-100 text-gray-800",
      Other: "bg-slate-100 text-slate-800"
    }
    return colors[category] || colors.Other
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage your transaction history.
          </p>
        </div>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="z-20">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="z-30">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Date</span>
                      {getSortIcon("date")}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("merchant")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Merchant</span>
                      {getSortIcon("merchant")}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("account")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Account</span>
                      {getSortIcon("account")}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Category</span>
                      {getSortIcon("category")}
                    </div>
                  </th>
                  <th 
                    className="text-right py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end space-x-2">
                      <span>Amount</span>
                      {getSortIcon("amount")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {transaction.merchant.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{transaction.merchant}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{transaction.account}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getCategoryColor(transaction.category)}>
                        {transaction.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
