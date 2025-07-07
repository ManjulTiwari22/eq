"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { FileText, Users, Clock, CheckCircle, Search, Filter, Download, TrendingUp } from "lucide-react"
import { fetchCSVData, getUniqueValues } from "../utils/csv-parser"

interface DashboardData {
  headers: string[]
  data: any[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({ headers: [], data: [] })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const data = await fetchCSVData(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EQ2025Grid-IF6rD7hIrM7S4PNXmPxS7VX2qMbQlX.csv",
      )
      setDashboardData(data)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading dashboard data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Data processing for charts
  const processDataForCharts = () => {
    const data = dashboardData.data

    // Type distribution
    const typeData = data.reduce((acc: any, row: any) => {
      const type = row.Type || "Unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    const typeChartData = Object.entries(typeData).map(([name, value]) => ({
      name,
      value: value as number,
    }))

    // Source distribution
    const sourceData = data.reduce((acc: any, row: any) => {
      const source = row.Source || "Unknown"
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {})

    const sourceChartData = Object.entries(sourceData).map(([name, value]) => ({
      name,
      value: value as number,
    }))

    // Customer distribution (top 10)
    const customerData = data.reduce((acc: any, row: any) => {
      const customer = row.Customers || "Unknown"
      acc[customer] = (acc[customer] || 0) + 1
      return acc
    }, {})

    const customerChartData = Object.entries(customerData)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        value: value as number,
      }))

    // Status distribution
    const statusData = data.reduce((acc: any, row: any) => {
      const status = row["Quoted/NotQuoted"] || "Unknown"
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    const statusChartData = Object.entries(statusData).map(([name, value]) => ({
      name,
      value: value as number,
    }))

    // Monthly trend (based on Receipt Date)
    const monthlyData = data.reduce((acc: any, row: any) => {
      const receiptDate = row["Receipt Date"]
      if (receiptDate) {
        const month = receiptDate.split("/")[1] + "/" + receiptDate.split("/")[2]
        acc[month] = (acc[month] || 0) + 1
      }
      return acc
    }, {})

    const monthlyChartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({
        name,
        value: value as number,
      }))

    return {
      typeChartData,
      sourceChartData,
      customerChartData,
      statusChartData,
      monthlyChartData,
    }
  }

  const { typeChartData, sourceChartData, customerChartData, statusChartData, monthlyChartData } =
    processDataForCharts()

  // Filter data for table
  const filteredData = dashboardData.data.filter((row) => {
    const matchesSearch =
      searchTerm === "" ||
      Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === "all" || row.Type === filterType
    const matchesStatus = filterStatus === "all" || row["Quoted/NotQuoted"] === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Summary statistics
  const totalEntries = dashboardData.data.length
  const quotedEntries = dashboardData.data.filter((row) => row["Quoted/NotQuoted"] === "Quoted").length
  const pendingEntries = dashboardData.data.filter((row) => row["Quoted/NotQuoted"] === "NotQuoted").length
  const uniqueCustomers = new Set(dashboardData.data.map((row) => row.Customers)).size

  const exportData = () => {
    const csvContent = [
      dashboardData.headers.join(","),
      ...filteredData.map((row) => dashboardData.headers.map((header) => row[header] || "").join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "eq_data_export.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground">All EQ entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quoted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{quotedEntries}</div>
            <p className="text-xs text-muted-foreground">
              {totalEntries > 0 ? Math.round((quotedEntries / totalEntries) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingEntries}</div>
            <p className="text-xs text-muted-foreground">
              {totalEntries > 0 ? Math.round((pendingEntries / totalEntries) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Charts & Analytics
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Enquiry Types</CardTitle>
                <CardDescription>Distribution of enquiry types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={typeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Source Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Enquiry Sources</CardTitle>
                <CardDescription>Where enquiries are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Customers with most enquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerChartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quote Status */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Status</CardTitle>
                <CardDescription>Quoted vs Not Quoted enquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
              <CardDescription>Enquiry volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search all fields..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {getUniqueValues(dashboardData.data, "Type").map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Quoted">Quoted</SelectItem>
                    <SelectItem value="NotQuoted">Not Quoted</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportData} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>EQ Entries ({filteredData.length} records)</CardTitle>
              <CardDescription>Detailed view of all enquiry entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>EQ Ref</TableHead>
                      <TableHead>Receipt Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Sales Executive</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 50).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{row.EQRef}</TableCell>
                        <TableCell>{row["Receipt Date"]}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{row.Customers}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.Type}</Badge>
                        </TableCell>
                        <TableCell>{row.Source}</TableCell>
                        <TableCell>
                          <Badge variant={row["Quoted/NotQuoted"] === "Quoted" ? "default" : "secondary"}>
                            {row["Quoted/NotQuoted"]}
                          </Badge>
                        </TableCell>
                        <TableCell>{row.DueDate}</TableCell>
                        <TableCell>{row.Items}</TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          {row["Sales Executive (from Division) (from Items)"]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredData.length > 50 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Showing first 50 of {filteredData.length} records. Use filters to narrow down results.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
