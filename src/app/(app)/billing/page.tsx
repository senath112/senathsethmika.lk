import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const paymentHistory = [
  {
    invoice: "INV001",
    date: "2023-10-01",
    course: "Advanced Genetics",
    amount: "$500.00",
    status: "Paid",
  },
  {
    invoice: "INV002",
    date: "2023-10-01",
    course: "Organic Chemistry II",
    amount: "$550.00",
    status: "Paid",
  },
  {
    invoice: "INV003",
    date: "2024-02-15",
    course: "Quantum Physics",
    amount: "$600.00",
    status: "Paid",
  },
  {
    invoice: "INV004",
    date: "2024-02-15",
    course: "Cellular Biology",
    amount: "$520.00",
    status: "Paid",
  },
];

export default function BillingPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Billing & Payments</h1>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and payment methods.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">Current Plan: Pro (Annual)</p>
              <p className="text-muted-foreground">Your plan renews on October 1, 2024.</p>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button>Manage Subscription</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View your past payments and download invoices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.invoice}>
                    <TableCell className="font-medium">{payment.invoice}</TableCell>
                    <TableCell>{payment.course}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">{payment.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
