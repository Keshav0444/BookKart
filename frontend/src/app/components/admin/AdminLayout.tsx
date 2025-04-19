import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLogoutMutation } from "@/store/api";
import { logout } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";
import {
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

interface AdminLayoutProps {
  children: React.ReactNode;
}
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation({}).unwrap();
      dispatch(logout());
      toast.success("logged out successfully");
      router.push("/admin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  const userPlaceholder = user?.name
    ?.split(" ")
    .map((name: string) => name[0])
    .join("");

  const handleProtectedNavigation = (href: string) => {
    if (user) {
      router.push(href);
    } else {
      router.push("/admin/login");
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      onClick: () => router.push("/admin"),
      href: "/admin",
      icon: LayoutDashboard,
      bgColor: "from-purple-500 to-indigo-600",
      textColor: "text-purple-600",
    },
    {
      name: "Orders",
      onClick: () => handleProtectedNavigation("/admin/orders"),
      icon: ShoppingBag,
      href: "/admin/orders",
      bgColor: "from-blue-500 to-cyan-600",
      textColor: "text-blue-600",
    },
    {
      name: "Payments",
      onClick: () => handleProtectedNavigation("/admin/payments"),
      icon: CreditCard,
      href: "/admin/payments",
      bgColor: "from-pink-500 to-rose-600",
      textColor: "text-pink-600",
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* mobile sidebar */}

      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ",
            sidebarOpen ? "translate-x-0 " : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
            <h1 className="text-xl ml-10 font-bold">BookKart Admin</h1>
          </div>

          <nav className="h-full overflow-y-auto bg-white shadow-lg">
            <div className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={cn(
                    "group w-full flex items-center px-4 py-2 text-base font-medium rounded-md transition-all duration-200",
                    pathname === item.href
                      ? `bg-gradient-to-r ${item.bgColor} text-white`
                      : `text-gray-600 hover:bg-gray-50 hover:${item.textColor}`
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-6 w-6 ",
                      pathname === item.href
                        ? "text-white"
                        : `text-gray-400 group-hover:${item.textColor}`
                    )}
                  />
                  {item.name}
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 w-full p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </nav>
        </aside>
      </div>

      {/* Desktop sidebar */}

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow overflow-y-auto">
          <div className="flex h-16 items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
            <h1 className="text-xl  font-bold">BookKart Admin</h1>
          </div>

          <nav className="flex-1  bg-white shadow-lg">
            <div className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={cn(
                    "group w-full flex items-center px-4 py-2 text-base font-medium rounded-md transition-all duration-200",
                    pathname === item.href
                      ? `bg-gradient-to-r ${item.bgColor} text-white`
                      : `text-gray-600 hover:bg-gray-50 hover:${item.textColor}`
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-6 w-6 ",
                      pathname === item.href
                        ? "text-white"
                        : `text-gray-400 group-hover:${item.textColor}`
                    )}
                  />
                  {item.name}
                </button>
              ))}
            </div>
            <div className="p-4 b border-t mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl ml-10 font-semibold text-gray-800">
              {navigation.find((item) => item.href === pathname)?.name ||
                "Admin Panel"}
            </h1>

            <div className="flex-end items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <Avatar className="w-8 h-8 rounded-full">
                      {user?.profilePicture ? (
                        <AvatarImage src={user.profilePicture} alt="User" />
                      ) : userPlaceholder ? (
                        <AvatarFallback>{userPlaceholder}</AvatarFallback>
                      ) : (
                        <User className="ml-2 mt-2" />
                      )}
                    </Avatar>
                    {user ? (
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    ) : (
                      <p className="text-md font-medium">My Account</p>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Setting</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user ? (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleLogout}
                    >
                      Logout
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => router.push("/admin/login")}
                    >
                      Login{" "}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 pb-8 ">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
