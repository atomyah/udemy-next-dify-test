import "../globals.css";

export default function AuthLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4">
            {children}
        </div>
      </body>
    </html>
  )
}