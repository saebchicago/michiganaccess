import { ReactNode } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import CrisisBar from "@/components/shared/CrisisBar";
import AIChatWidget from "@/components/shared/AIChatWidget";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="flex min-h-screen flex-col">
    <CrisisBar />
    <Header />
    <motion.main
      id="main-content"
      className="flex-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      role="main"
    >
      {children}
    </motion.main>
    <Footer />
    <AIChatWidget />
  </div>
);

export default Layout;
