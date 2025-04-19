"use client"; 
import Loader from "@/lib/BookLoader";
import AuthChecker from "@/store/Provider/AuthProvider";
import { persistor, store } from "@/store/store";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
     const pathname = usePathname();
     const isAdminRoute = pathname.startsWith("/admin")
  return (
    <Provider store={store}> 
     <PersistGate loading={<Loader />} persistor={persistor}>
     <Toaster />
      <AuthChecker> 
        {!isAdminRoute && <Header/>}
        {children} 
        {!isAdminRoute && <Footer/>}
      </AuthChecker>
      </PersistGate>
    </Provider>
  );
}
