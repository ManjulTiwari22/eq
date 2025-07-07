"use client"

import { Button } from "@/components/ui/button"
import { FileText, BarChart3 } from "lucide-react"

interface NavigationProps {
  currentView: "form" | "dashboard"
  onViewChange: (view: "form" | "dashboard") => void
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        variant={currentView === "form" ? "default" : "outline"}
        onClick={() => onViewChange("form")}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        EQ Entry Form
      </Button>
      <Button
        variant={currentView === "dashboard" ? "default" : "outline"}
        onClick={() => onViewChange("dashboard")}
        className="flex items-center gap-2"
      >
        <BarChart3 className="h-4 w-4" />
        Dashboard & Reports
      </Button>
    </div>
  )
}
