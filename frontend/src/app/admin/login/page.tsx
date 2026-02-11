"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
} from "@/store/api";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authStatus, toggleLoginDialog } from "@/store/slices/userSlice";
import { useDispatch } from "react-redux";
import Image from "next/image";

interface LoginProps {
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  agreeTerms: boolean;
}

interface ForgotPasswordFormData {
  email: string;
}

const Login: React.FC<LoginProps> = ({ isLoginOpen, setIsLoginOpen }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [currentTab, setCurrentTab] = useState<"login" | "signup" | "forgot">(
    "login"
  );
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const dispatch = useDispatch();

  const BASE_URL = "http://localhost:8000/api";

  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const router = useRouter();
  const [forgotPassword] = useForgotPasswordMutation();

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<SignupFormData>();
  const {
    register: registerForgotPassword,
    handleSubmit: handleForgotPasswordSubmit,
    formState: { errors: forgotPasswordErrors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmitLogin = async (data: LoginFormData) => {
    setLoginLoading(true);
    try {
      const result = await login(data).unwrap();
      console.log(result)
      if (result.success) {
        toast.success("Login successful");
    dispatch(authStatus());
        router.push("/admin")
        setTimeout(() =>{
           window.location.reload();
        },100)
      } else {
        toast.error("Login failed.Please try again.");
      }
    } catch (error) {
      toast.error("Email or password incorrect");
    } finally {
      setLoginLoading(false);
    }
  };

  const onSubmitSignup = async (data: SignupFormData) => {
    setSignupLoading(true);
    try {
      const { email, password, name } = data;
      const result = await register({ email, password, name, role:"admin" }).unwrap();
      console.log(result);
      if (result.success) {
        toast.success("verification link send to email successfully");
        setCurrentTab('login');
      }
    } catch (error) {
      toast.error("Email already exists");
    } finally {
      setSignupLoading(false);
    }
  };



  const onSubmitForgotPassword = async (data: ForgotPasswordFormData) => {
    setForgotPasswordLoading(true);
    try {
      await forgotPassword(data.email).unwrap();
      toast.success("reset password link send to email successful");
      setForgotPasswordSuccess(true);
    } catch (error) {
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-indigo-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
               <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6 text-white text-center">
                 <h1 className="text-2xl font-bold">
                       BookKart Admin Portal
                 </h1>
                 <p className="text-purple-100 mt-1">
                  Access the admin dashboard
                 </p>
               </div>

               <div className="p-6">
               <Tabs
          value={currentTab}
          onValueChange={(value) =>
            setCurrentTab(value as "login" | "signup" | "forgot")
          }
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="forgot">Forgot</TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="login" className="space-y-4">
                <form
                  onSubmit={handleLoginSubmit(onSubmitLogin)}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Input
                      {...registerLogin("email", {
                        required: "Email is required",
                      })}
                      placeholder="Email"
                      type="email"
                      className="pl-10"
                    />
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-red-500 text-sm">
                      {loginErrors.email.message}
                    </p>
                  )}
                  <div className="relative">
                    <Input
                      {...registerLogin("password", {
                        required: "Password is required",
                      })}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                    />
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                    {showPassword ? (
                      <EyeOff
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        size={20}
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        size={20}
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>
                  {loginErrors.password && (
                    <p className="text-red-500 text-sm">
                      {loginErrors.password.message}
                    </p>
                  )}
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 font-bold">
                    {loginLoading ? (
                      <Loader className="animate-spin mr-2" size={20} />
                    ) : (
                      "Login as Admin"
                    )}
                  </Button>
                </form>

                <div className="text-center mt-4 ">
                   <Link href='/' className="text-sm text-purple-600 hover:underline">
                   Return to main site</Link>
                </div>
         
      
              </TabsContent>
              <TabsContent value="signup" className="space-y-4">
                <form
                  onSubmit={handleSignupSubmit(onSubmitSignup)}
                  className="space-y-4"
                >
                  <Input
                    {...registerSignup("name", {
                      required: "Name is required",
                    })}
                    placeholder="Name"
                    type="text"
                  />
                  {signupErrors.name && (
                    <p className="text-red-500 text-sm">
                      {signupErrors.name.message}
                    </p>
                  )}
                  <div className="relative">
                    <Input
                      {...registerSignup("email", {
                        required: "Email is required",
                      })}
                      placeholder="Email"
                      type="email"
                      className="pl-10"
                    />
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="text-red-500 text-sm">
                      {signupErrors.email.message}
                    </p>
                  )}
                  <div className="relative">
                    <Input
                      {...registerSignup("password", {
                        required: "Password is required",
                      })}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                    />
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={20}
                    />
                    {showPassword ? (
                      <EyeOff
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        size={20}
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <Eye
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        size={20}
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>
                  {signupErrors.password && (
                    <p className="text-red-500 text-sm">
                      {signupErrors.password.message}
                    </p>
                  )}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...registerSignup("agreeTerms", {
                        required: "You must agree to the terms",
                      })}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                      I agree to the Terms and Conditions
                    </label>
                  </div>
                  {signupErrors.agreeTerms && (
                    <p className="text-red-500 text-sm">
                      {signupErrors.agreeTerms.message}
                    </p>
                  )}
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
                    {signupLoading ? (
                      <Loader className="animate-spin mr-2" size={20} />
                    ) : (
                      "Create Admin Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="forgot" className="space-y-4">
                {!forgotPasswordSuccess ? (
                  <form
                    onSubmit={handleForgotPasswordSubmit(
                      onSubmitForgotPassword
                    )}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Input
                        {...registerForgotPassword("email", {
                          required: "Email is required",
                        })}
                        placeholder="Email"
                        type="email"
                        className="pl-10"
                      />
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                    </div>
                    {forgotPasswordErrors.email && (
                      <p className="text-red-500 text-sm">
                        {forgotPasswordErrors.email.message}
                      </p>
                    )}
                    <Button type="submit" className="w-full">
                      {forgotPasswordLoading ? (
                        <Loader className="animate-spin mr-2" size={20} />
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-700">
                      Reset Link Sent
                    </h3>
                    <p className="text-gray-500">
                      We've sent a password reset link to your email. Please
                      check your inbox and follow the instructions to reset your
                      password.
                    </p>
                    <Button
                      onClick={() => setForgotPasswordSuccess(false)}
                      className="w-full"
                    >
                      Send Another Email
                    </Button>
                  </motion.div>
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
        <p className="text-sm text-center text-gray-600 mt-6">
          By clicking "agree", you agree to our{" "}
          <Link href="/terms-of-use" className="text-blue-500 hover:underline">
            Terms of Use
          </Link>
          ,{" "}
          <Link
            href="/privacy-policy"
            className="text-blue-500 hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
               </div>
        </div>
        
    </div>
  );
};

export default Login;
