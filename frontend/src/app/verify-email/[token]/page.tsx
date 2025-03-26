"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useVerifyEmailMutation } from "@/store/api";
import { authStatus, setEmailVerified } from "@/store/slices/userSlice";
import { RootState } from "@/store/store";

const EmailVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useRouter();
  const dispatch = useDispatch();
  const [verifyEmail] = useVerifyEmailMutation();
  const isEmailVerified = useSelector((state: RootState) => state.user.isEmailVerified);
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "alreadyVerified" 
  >("loading");

  useEffect(() => {
    const verify = async () => {
      if (isEmailVerified) {
        setVerificationStatus("alreadyVerified");
        return;
      }

      try {
        const result = await verifyEmail(token).unwrap();
        console.log('Verification result:', result);
        
        if (result.success) {
          dispatch(setEmailVerified(true));
          setVerificationStatus('success');
          dispatch(authStatus());
          toast.success('Email verified successfully');
          setTimeout(() => {
            window.location.href = "/"; 
          }, 3000);
        } else {
          throw new Error(result.message || 'Verification failed');
        }
      } catch (error) {
        console.error('Verification error:', error);
      }
    };

    if (token) {
      verify();
    }
  }, [token, verifyEmail, dispatch, isEmailVerified]);

  const handleGoHome = () => {
    window.location.href = "/"; 
  };

  return (
    <div className="p-20 flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full"
      >
        {verificationStatus === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-500">
              Please wait while we confirm your email address...
            </p>
          </div>
        )}

        {verificationStatus === "success" && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-500 mb-6">
              Your email has been successfully verified. You'll be redirected to the homepage shortly.
            </p>
          </motion.div>
        )}

        {verificationStatus === "alreadyVerified" && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Info className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Email Already Verified
            </h2>
            <p className="text-gray-500 mb-6">
              Your email is already verified. You can use our services.
            </p>
            <Button
              onClick={handleGoHome}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
              Go to Homepage
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerification;

