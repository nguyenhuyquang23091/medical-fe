import { House, Home, Inbox, Search, Settings } from "lucide-react";
import { Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, } from "@/components/ui/sidebar"
//Menu Item
const items = 
[
    {
        title: 'Home',
        url : "#",
        icon: Home,
    },
    {
        title: 'Department',
        url: "#",
        icon : House,
    },
    {
        title: 'Blog',
        url: "#",
        icon : Inbox,
    },
    {
        title: 'Doctor',
        url: "#",
        icon : Search,
    },
    {
        title: 'Contacts',
        url: "#",
        icon : Settings,
    },

]
export function AppSidebar() {
    return (
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-2xl font-bold text-blue-500" >MedConnect</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  }
