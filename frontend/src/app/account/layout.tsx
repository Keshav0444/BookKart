"use client";
import {
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  CreditCard,
  User,
  Heart,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { logout, toggleLoginDialog } from "@/store/slices/userSlice";
import toast from "react-hot-toast";
import { useLogoutMutation } from "@/store/api";
import NoData from "@/lib/NoData";

const navigation = [
  {
    title: "My Profile",
    href: "/account/profile",
    icon: User,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "My Orders",
    href: "/account/orders",
    icon: ShoppingCart,
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "Selling Products",
    href: "/account/selling-products",
    icon: BookOpen,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
    color: "from-red-500 to-pink-500",
  },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [logoutMutation] = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logoutMutation({}).unwrap()
      dispatch(logout())
      toast.success('logged out successfully')
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  const userPlaceholder = user?.name
    ?.split(" ")
    .map((name: string) => name[0])
    .join("");

  console.log(user?.profilePicture);

  const handleOpenLogin = () => {
    dispatch(toggleLoginDialog());
  };


  if (!user) {
    return (
      <NoData
        message="Please log in to access your cart."
        description="You need to be logged in to view your cart and checkout."
        buttonText="Login"
        imageUrl="/images/login.jpg"
        onClick={handleOpenLogin}
      />
    );
  }

  return (
    <div className="grid  p-4 w-[90%] mx-auto lg:grid-cols-[370px_1fr]">
      <div className="hidden border-r m-5 rounded-lg p-2  bg-gradient-to-b from-violet-500 to-purple-700 lg:block">
        <div className="flex flex-col gap-2">
          <div className="flex h-[60px] items-center px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-white"
            >
              <span className="text-2xl">Your Account</span>
            </Link>
          </div>
          <div className="flex-1 space-y-4 py-4">
            <div className="px-6 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 rounded-full ">
                  {user?.profilePicture ? (
                    <AvatarImage
                      src={user?.profilePicture}
                      alt="User"
                    />
                  ) : (
                    <AvatarFallback>{userPlaceholder}</AvatarFallback>
                  )}
                </Avatar>

                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-purple-200">{user?.email}</p>
                </div>
              </div>
            </div>
            <Separator className="bg-purple-400" />
            <div className="space-y-1 px-2">
              <nav className="grid items-start px-2 py-2 text-sm font-medium">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 mb-2 transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white`
                          : "text-purple-100 hover:bg-purple-600"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="mt-auto flex p-4">
            <Button variant="secondary" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
