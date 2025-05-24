import "../globals.css";
import PrivateHeader from "@/components/layouts/PrivateHeader";

export default function PrivateLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html>
      <body>
            <PrivateHeader />
            {children}
      </body>
    </html>
  )
}
