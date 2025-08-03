import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "../styles/mobile-optimizations.css";
import "../styles/fluid-responsive.css";
import SessionProvider from "@/components/auth/SessionProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import KeyboardShortcutsProvider from "@/components/providers/KeyboardShortcutsProvider";
import DevModeIndicator from "@/components/ui/dev-mode-indicator";
import ModeIndicator from "@/components/ui/mode-indicator";
import { ModeProvider } from "@/lib/context/ModeContext";
import { SettingsProvider } from "@/components/settings/SettingsContext";
import { ToastProvider } from "@/components/ui/toast";
import { NotificationCenterProvider } from "@/components/ui/notification-center";
import { NetworkStatusIndicator } from "@/components/ui/NetworkAwareLoading";
// Initialize server-side components
import "@/lib/server-init";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "DevPulse - AI-Native Development Analytics",
  description: "Transform GitHub data into actionable insights with AI-powered analytics for developers and teams.",
  keywords: ["developer analytics", "GitHub analytics", "burnout prevention", "team productivity", "AI analytics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen bg-background text-foreground disable-pull-refresh safe-area-bottom`}
      >
        <SessionProvider>
          <ReactQueryProvider>
            <ModeProvider>
              <SettingsProvider>
                <ToastProvider defaultPosition="bottom-right">
                  <NotificationCenterProvider>
                    <KeyboardShortcutsProvider>
                      {children}
                      <DevModeIndicator />
                      <ModeIndicator position="top-center" />
                      <NetworkStatusIndicator />
                    </KeyboardShortcutsProvider>
                  </NotificationCenterProvider>
                </ToastProvider>
              </SettingsProvider>
            </ModeProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
