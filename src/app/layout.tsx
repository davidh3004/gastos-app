import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DataRefreshProvider } from "@/components/providers/DataRefreshProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QuickChatFab } from "@/components/chat/QuickChatFab";
import { BottomNav } from "@/components/ui/BottomNav";
import { AlertsBell } from "@/components/ui/AlertsBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Topbar } from "@/components/ui/Topbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finanzas · David",
  description: "Dashboard financiero personal",
};

const themeInitScript = `(function(){try{var s=localStorage.getItem("finanzas-theme");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=s==="light"||s==="dark"?s:(d?"dark":"light");var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;if(t==="dark"){r.classList.add("dark");}else{r.classList.remove("dark");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-white text-gray-900 dark:bg-background dark:text-foreground">
        <ThemeProvider>
          <DataRefreshProvider>
            <div className="fixed right-4 top-3 z-40 flex items-center gap-1.5 md:hidden">
              <AlertsBell />
              <ThemeToggle />
            </div>
            <Topbar />
            <main className="mx-auto w-full max-w-[1200px] flex-1 px-0 pb-20 md:px-6 md:pb-0 lg:px-8">
              {children}
            </main>
            <BottomNav />
            <QuickChatFab />
          </DataRefreshProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
