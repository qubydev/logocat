import { JetBrains_Mono, Handlee } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weights: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const handlee = Handlee({
  subsets: ["latin"],
  variable: "--font-handlee",
  weight: "400",
});

export const metadata = {
  title: "Logocat",
  description: "Get logo of any site with logocat",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jetBrainsMono.className} ${handlee.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
