"use client"; 
import Loader from "@/lib/BookLoader";
import AuthChecker from "@/store/Provider/AuthProvider";
import { persistor, store } from "@/store/store";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  
  return (
    <Provider store={store}> 
     <PersistGate loading={<Loader />} persistor={persistor}>
     <Toaster />
      <AuthChecker> 
        {children} 
      </AuthChecker>
      </PersistGate>
    </Provider>
  );
}
