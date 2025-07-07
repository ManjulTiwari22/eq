"use client"

import { useState } from "react"
import Component from "../eq-entry-form"
import { Dashboard } from "../components/dashboard"
import { Navigation } from "../components/navigation"

export default function Page() {
  const [currentView, setCurrentView] = useState<"form" | "dashboard">("form")

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 bg-gray-50">
      <div className="w-full max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EQ Management System</h1>
          <p className="text-gray-600">Manage enquiries and view comprehensive reports</p>
        </div>

        <Navigation currentView={currentView} onViewChange={setCurrentView} />

        {currentView === "form" ? <Component /> : <Dashboard />}
      </div>
    </main>
  )
}
