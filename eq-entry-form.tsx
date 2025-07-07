"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Copy, Calendar, FileText, Users, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchCSVData, getUniqueValues } from "./utils/csv-parser"

interface EQFormData {
  eq: string
  receiptDate: string
  type: string
  source: string
  dueDate: string
  quotedNotQuoted: string
  customers: string
  extendedDueDate: string
  quotedDate: string
  id: string
  eqRef: string
  items: string
  salesExecEmail: string
  proposalExecEmail: string
  salesExecutive: string
  itemDescription: string
  itemCategory: string
  gemRef: string
  domInt: string
  endUser: string
  pmcConsultant: string
  stream: string
  siteCity: string
  siteType: string
  project: string
  proposalEngg: string
  sales: string
  createdBy: string
  attachments: string
  remarks: string
}

interface CSVData {
  headers: string[]
  data: any[]
}

export default function Component() {
  const { toast } = useToast()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [csvData, setCsvData] = useState<CSVData>({ headers: [], data: [] })
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<EQFormData>({
    eq: "",
    receiptDate: new Date().toISOString().split("T")[0],
    type: "",
    source: "",
    dueDate: "",
    quotedNotQuoted: "NotQuoted",
    customers: "",
    extendedDueDate: "",
    quotedDate: "",
    id: "",
    eqRef: "",
    items: "",
    salesExecEmail: "",
    proposalExecEmail: "",
    salesExecutive: "",
    itemDescription: "",
    itemCategory: "",
    gemRef: "",
    domInt: "Domestic",
    endUser: "",
    pmcConsultant: "",
    stream: "",
    siteCity: "",
    siteType: "",
    project: "",
    proposalEngg: "",
    sales: "",
    createdBy: "",
    attachments: "",
    remarks: "",
  })

  const generateNextEQNumber = () => {
    if (csvData.data.length === 0) return "18001"

    const maxEQ = Math.max(
      ...csvData.data.map((row) => Number.parseInt(row.EQ) || 18000),
      Number.parseInt(formData.eq) || 18000,
    )
    return (maxEQ + 1).toString()
  }

  // Load CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const data = await fetchCSVData(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EQ2025Grid-IF6rD7hIrM7S4PNXmPxS7VX2qMbQlX.csv",
      )
      setCsvData(data)

      // Generate new EQ number and ID
      const newId = (Math.max(...data.data.map((row) => Number.parseInt(row.ID) || 0), 0) + 1).toString()

      // Get the maximum EQ number from existing data and increment
      const maxEQ = Math.max(...data.data.map((row) => Number.parseInt(row.EQ) || 18000), 18000)
      const newEQ = (maxEQ + 1).toString()

      const newEQRef = `ATEQ/${newId}/${newEQ}`

      setFormData((prev) => ({
        ...prev,
        eq: newEQ,
        id: newId,
        eqRef: newEQRef,
        createdBy: "System User",
      }))

      setLoading(false)
    }

    loadData()
  }, [])

  const handleInputChange = (field: keyof EQFormData, value: string) => {
    // Prevent manual changes to EQ number
    if (field === "eq") return

    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-generate EQRef when ID changes (EQ is now auto-generated)
      if (field === "id") {
        updated.eqRef = `ATEQ/${updated.id}/${updated.eq}`
      }

      return updated
    })
  }

  const copyEQRef = () => {
    navigator.clipboard.writeText(formData.eqRef)
    toast({
      title: "Copied!",
      description: "EQ Reference copied to clipboard",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.customers || !formData.type || !formData.source || !formData.dueDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate form submission
    console.log("EQ Entry Submitted:", formData)
    setIsSubmitted(true)

    toast({
      title: "Success!",
      description: `Enquiry ${formData.eqRef} has been created successfully`,
    })
  }

  const resetForm = () => {
    setIsSubmitted(false)
    const newId = (Number.parseInt(formData.id) + 1).toString()

    // Generate next EQ number automatically
    const maxEQ = Math.max(
      ...csvData.data.map((row) => Number.parseInt(row.EQ) || 18000),
      Number.parseInt(formData.eq) || 18000,
    )
    const newEQ = (maxEQ + 1).toString()

    const newEQRef = `ATEQ/${newId}/${newEQ}`

    setFormData({
      eq: newEQ,
      receiptDate: new Date().toISOString().split("T")[0],
      type: "",
      source: "",
      dueDate: "",
      quotedNotQuoted: "NotQuoted",
      customers: "",
      extendedDueDate: "",
      quotedDate: "",
      id: newId,
      eqRef: newEQRef,
      items: "",
      salesExecEmail: "",
      proposalExecEmail: "",
      salesExecutive: "",
      itemDescription: "",
      itemCategory: "",
      gemRef: "",
      domInt: "Domestic",
      endUser: "",
      pmcConsultant: "",
      stream: "",
      siteCity: "",
      siteType: "",
      project: "",
      proposalEngg: "",
      sales: "",
      createdBy: "System User",
      attachments: "",
      remarks: "",
    })
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading EQ data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Enquiry Created Successfully!</CardTitle>
          <CardDescription>
            Your enquiry has been registered with reference:
            <Badge variant="secondary" className="ml-2 font-mono">
              {formData.eqRef}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-semibold mb-2">Enquiry Summary:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Customer:</span> {formData.customers}
              </div>
              <div>
                <span className="font-medium">Type:</span> {formData.type}
              </div>
              <div>
                <span className="font-medium">Source:</span> {formData.source}
              </div>
              <div>
                <span className="font-medium">Due Date:</span> {formData.dueDate}
              </div>
              <div>
                <span className="font-medium">Status:</span> {formData.quotedNotQuoted}
              </div>
              <div>
                <span className="font-medium">Items:</span> {formData.items}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={resetForm} className="w-full">
            Create New Enquiry
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Get unique values for dropdowns
  const uniqueTypes = getUniqueValues(csvData.data, "Type")
  const uniqueSources = getUniqueValues(csvData.data, "Source")
  const uniqueCustomers = getUniqueValues(csvData.data, "Customers")
  const uniqueItems = getUniqueValues(csvData.data, "Items")
  const uniqueItemCategories = getUniqueValues(csvData.data, "Item Category (from Items)")
  const uniqueSiteTypes = getUniqueValues(csvData.data, "SiteType")
  const uniqueSalesExecs = getUniqueValues(csvData.data, "Sales Executive (from Division) (from Items)")
  const uniqueProposalEnggs = getUniqueValues(csvData.data, "ProposalEngg")

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6" />
          EQ Entry Form
        </CardTitle>
        <CardDescription>Create a new enquiry entry. EQ reference has been automatically generated.</CardDescription>
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Label className="font-medium">EQ Reference:</Label>
          <Badge variant="outline" className="font-mono text-sm">
            {formData.eqRef}
          </Badge>
          <Button variant="ghost" size="sm" onClick={copyEQRef} className="h-6 w-6 p-0">
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="customer" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Customer
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Tracking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eq">EQ Number (Auto-generated)</Label>
                  <Input
                    id="eq"
                    value={formData.eq}
                    readOnly
                    disabled
                    className="font-mono bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id">ID</Label>
                  <Input id="id" value={formData.id} onChange={(e) => handleInputChange("id", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptDate">Receipt Date *</Label>
                  <Input
                    id="receiptDate"
                    type="date"
                    value={formData.receiptDate}
                    onChange={(e) => handleInputChange("receiptDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source *</Label>
                  <Select value={formData.source} onValueChange={(value) => handleInputChange("source", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extendedDueDate">Extended Due Date</Label>
                  <Input
                    id="extendedDueDate"
                    type="date"
                    value={formData.extendedDueDate}
                    onChange={(e) => handleInputChange("extendedDueDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quotedDate">Quoted Date</Label>
                  <Input
                    id="quotedDate"
                    type="date"
                    value={formData.quotedDate}
                    onChange={(e) => handleInputChange("quotedDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotedNotQuoted">Quote Status</Label>
                <Select
                  value={formData.quotedNotQuoted}
                  onValueChange={(value) => handleInputChange("quotedNotQuoted", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quoted">Quoted</SelectItem>
                    <SelectItem value="NotQuoted">Not Quoted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="customer" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="customers">Customer *</Label>
                <Select value={formData.customers} onValueChange={(value) => handleInputChange("customers", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCustomers.map((customer) => (
                      <SelectItem key={customer} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endUser">End User</Label>
                  <Input
                    id="endUser"
                    value={formData.endUser}
                    onChange={(e) => handleInputChange("endUser", e.target.value)}
                    placeholder="End user name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pmcConsultant">PMC/Consultant</Label>
                  <Input
                    id="pmcConsultant"
                    value={formData.pmcConsultant}
                    onChange={(e) => handleInputChange("pmcConsultant", e.target.value)}
                    placeholder="PMC or consultant name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domInt">Domestic/International</Label>
                  <Select value={formData.domInt} onValueChange={(value) => handleInputChange("domInt", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Domestic">Domestic</SelectItem>
                      <SelectItem value="International">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gemRef">GeM Reference</Label>
                  <Input
                    id="gemRef"
                    value={formData.gemRef}
                    onChange={(e) => handleInputChange("gemRef", e.target.value)}
                    placeholder="GeM reference number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  value={formData.project}
                  onChange={(e) => handleInputChange("project", e.target.value)}
                  placeholder="Project name"
                />
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="items">Items</Label>
                  <Select value={formData.items} onValueChange={(value) => handleInputChange("items", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select items" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueItems.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemCategory">Item Category</Label>
                  <Select
                    value={formData.itemCategory}
                    onValueChange={(value) => handleInputChange("itemCategory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueItemCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemDescription">Item Description</Label>
                <Textarea
                  id="itemDescription"
                  value={formData.itemDescription}
                  onChange={(e) => handleInputChange("itemDescription", e.target.value)}
                  placeholder="Detailed item description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stream">Stream</Label>
                  <Input
                    id="stream"
                    value={formData.stream}
                    onChange={(e) => handleInputChange("stream", e.target.value)}
                    placeholder="Stream"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteCity">Site City</Label>
                  <Input
                    id="siteCity"
                    value={formData.siteCity}
                    onChange={(e) => handleInputChange("siteCity", e.target.value)}
                    placeholder="Site city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteType">Site Type</Label>
                  <Select value={formData.siteType} onValueChange={(value) => handleInputChange("siteType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site type" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSiteTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salesExecutive">Sales Executive</Label>
                  <Select
                    value={formData.salesExecutive}
                    onValueChange={(value) => handleInputChange("salesExecutive", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales executive" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSalesExecs.map((exec) => (
                        <SelectItem key={exec} value={exec}>
                          {exec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposalEngg">Proposal Engineer</Label>
                  <Select
                    value={formData.proposalEngg}
                    onValueChange={(value) => handleInputChange("proposalEngg", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select proposal engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueProposalEnggs.map((engg) => (
                        <SelectItem key={engg} value={engg}>
                          {engg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salesExecEmail">Sales Executive Email</Label>
                  <Input
                    id="salesExecEmail"
                    type="email"
                    value={formData.salesExecEmail}
                    onChange={(e) => handleInputChange("salesExecEmail", e.target.value)}
                    placeholder="sales@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proposalExecEmail">Proposal Executive Email</Label>
                  <Input
                    id="proposalExecEmail"
                    type="email"
                    value={formData.proposalExecEmail}
                    onChange={(e) => handleInputChange("proposalExecEmail", e.target.value)}
                    placeholder="proposal@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="createdBy">Created By</Label>
                <Input
                  id="createdBy"
                  value={formData.createdBy}
                  onChange={(e) => handleInputChange("createdBy", e.target.value)}
                  placeholder="Creator name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Attachments</Label>
                <Input
                  id="attachments"
                  value={formData.attachments}
                  onChange={(e) => handleInputChange("attachments", e.target.value)}
                  placeholder="Attachment URLs or file names"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  placeholder="Additional remarks or notes"
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={resetForm} className="flex-1 bg-transparent">
            Reset Form
          </Button>
          <Button type="submit" className="flex-1">
            Create Enquiry
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
