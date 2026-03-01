import "./globals.css";
import { ToastProviderWrapper } from "@/components/ToastProviderWrapper";

export const metadata = {
  title: "ThreadPilot — Reddit Growth on Autopilot",
  description:
    "Generate native-feeling, value-first Reddit posts that grow your product organically.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProviderWrapper>{children}</ToastProviderWrapper>
      </body>
    </html>
  );
}
