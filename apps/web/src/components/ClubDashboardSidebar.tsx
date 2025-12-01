"use client"

import Image from "next/image"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { LifeBuoy, Tent, Users, Gift, Plus, Building2, Settings, LogOut, X, Menu } from "lucide-react"

interface ClubDashboardSidebarProps {
  clubName?: string
  onLogout: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
  onCreateCampClick?: () => void
}

export default function ClubDashboardSidebar({
  clubName = "Club",
  onLogout,
  activeTab = "help-requests",
  onTabChange,
  onCreateCampClick,
}: ClubDashboardSidebarProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const handleRouteChange = () => {
      setIsSidebarOpen(false)
    }
    router.events?.on("routeChangeStart", handleRouteChange)
    return () => {
      router.events?.off("routeChangeStart", handleRouteChange)
    }
  }, [router])

  const menuItems = [
    {
      category: "CLUB",
      items: [
        { icon: LifeBuoy, label: "Help Requests", tabValue: "help-requests" },
        { icon: Tent, label: "Camps", tabValue: "camps" },
        { icon: Users, label: "Memberships", tabValue: "memberships" },
        { icon: Gift, label: "Camp Donations", tabValue: "camp-donations" },
      ],
    },
    {
      category: "MANAGE",
      items: [
        { icon: Plus, label: "Create Camp", action: "create-camp" },
        { icon: Building2, label: "View Club Info", href: "/clubs/my-club", id: "view-club-info" },
      ],
    },
    // {
    //   category: "SYSTEM",
    //   items: [{ icon: Settings, label: "Settings", href: "/clubs/settings" }],
    // },
  ]

  const handleTabClick = (tabValue: string) => {
    if (
      tabValue === "help-requests" ||
      tabValue === "camps" ||
      tabValue === "memberships" ||
      tabValue === "camp-donations"
    ) {
      if (onTabChange) {
        onTabChange(tabValue)
      } else {
        router.push(`/clubs/dashboard?tab=${tabValue}`)
      }
    }
  }

  const handleCreateCampClick = () => {
    if (onCreateCampClick) {
      onCreateCampClick()
    }
  }

  const handleOverlayClick = () => {
    setIsSidebarOpen(false)
  }

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 p-4 flex items-center justify-between h-16">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2 flex-1 ml-3 mr-3 overflow-hidden">
          <div className="flex-shrink-0">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded" />
          </div>
          <span className="font-bold text-gray-900 truncate text-sm">{clubName}</span>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={handleOverlayClick} />
      )}

      <div
        className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 w-72 flex flex-col
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-0
        pt-16 lg:pt-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* logo section */}
        <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-200 min-h-20">
          <div className="flex items-center gap-3 overflow-hidden w-full">
            <div className="flex-shrink-0">
              <Image src="/logo.png" alt="Logo" width={48} height={48} className="rounded" />
            </div>
            <span className="font-bold text-gray-900 whitespace-nowrap truncate">{clubName}</span>
          </div>
        </div>

        {/* menu items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuItems.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 whitespace-nowrap">
                {group.category}
              </p>
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon

                  if ("tabValue" in item) {
                    return (
                      <button
                        key={itemIdx}
                        onClick={() => {
                          handleTabClick(item.tabValue)
                          setIsSidebarOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm font-medium ${activeTab === item.tabValue
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-gray-700 hover:bg-gray-100"
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {item.label}
                      </button>
                    )
                  }

                  if ("action" in item) {
                    return (
                      <button
                        key={itemIdx}
                        onClick={() => {
                          item.action === "create-camp" && handleCreateCampClick()
                          setIsSidebarOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {item.label}
                      </button>
                    )
                  }

                  return (
                    <a
                      key={itemIdx}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm font-medium ${activeTab === (item as any).id
                        ? "bg-emerald-50"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 ${activeTab === (item as any).id ? "text-emerald-700" : "text-gray-700 group-hover:text-emerald-700"
                          }`}
                      />
                      <span
                        className={`truncate ${activeTab === (item as any).id ? "text-emerald-700" : "text-gray-700 group-hover:text-emerald-700"
                          }`}
                      >
                        {item.label}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => {
              onLogout()
              setIsSidebarOpen(false)
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
