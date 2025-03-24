import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary py-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-foreground">Botswana Passport Application Portal</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="bg-white text-primary hover:bg-white/90">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-primary hover:bg-white/90">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container flex-1 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Apply for your Botswana Passport</h2>
            <p className="text-xl text-muted-foreground">
              Our secure online portal makes applying for a passport simple and convenient.
            </p>
            <div className="flex gap-4">
              <Link href="/register">
                <Button size="lg">Start Application</Button>
              </Link>
              <Link href="/status">
                <Button variant="outline" size="lg">
                  Check Status
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Secure Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Real-time biometric verification ensures your identity is protected throughout the application
                  process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Monitor your application status in real-time as it moves through our verification queue.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Digital Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Complete your entire application online, including biometric capture and document submission.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fast Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our streamlined approval process helps you get your passport as quickly as possible.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-muted py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Republic of Botswana. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

