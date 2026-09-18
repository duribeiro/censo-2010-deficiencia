import * as React from "react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { REGION_OPTIONS, useFilters } from "@/lib/filters"
import {
  ChartColumnIncreasingIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  MapIcon,
  ShapesIcon,
  TableIcon,
} from "lucide-react"

const navMain = [
  { title: "Visão geral", url: "#overview", icon: <LayoutDashboardIcon /> },
  { title: "Estados", url: "#states", icon: <MapIcon /> },
  { title: "Tipos de deficiência", url: "#types", icon: <ShapesIcon /> },
  { title: "Tabela", url: "#table", icon: <TableIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { region, setRegion } = useFilters()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#overview" />}
            >
              <ChartColumnIncreasingIcon className="size-5!" />
              <span className="text-base font-semibold">Censo 2010</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <SidebarGroup>
          <SidebarGroupLabel>Região</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {REGION_OPTIONS.map((option) => (
                <SidebarMenuItem key={option.label}>
                  <SidebarMenuButton
                    tooltip={option.label}
                    isActive={region === option.id}
                    onClick={() => setRegion(option.id)}
                  >
                    <span>{option.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="IBGE, Censo Demográfico 2010">
              <DatabaseIcon className="size-5!" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">IBGE</span>
                <span className="truncate text-xs text-muted-foreground">
                  Censo Demográfico 2010
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
