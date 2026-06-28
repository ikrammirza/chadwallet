import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "ChadWallet — The Best Memecoin Trading App",
  description: "Launch your meme. Go viral. Realize dreams.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-chad-black text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}