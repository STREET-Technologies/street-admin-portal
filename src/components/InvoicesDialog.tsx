import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, DollarSign } from "lucide-react";

interface Invoice {
  id: string;
  amount: number;
  paidAmount: number;
  dateTime: string;
  status: "paid" | "pending" | "overdue" | "partial";
  description: string;
}

interface InvoicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: Invoice[];
  userType: string;
  userName: string;
}

export function InvoicesDialog({ open, onOpenChange, invoices, userType, userName }: InvoicesDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "partial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {userType === "retail" ? `${userName} - All Invoices` : `${userName} - Invoices`}
          </DialogTitle>
          <DialogDescription>
            Complete list of invoices and payment history
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg text-black hover:text-primary transition-colors cursor-pointer">Invoice #{invoice.id}</h3>
                      <p className="text-sm text-muted-foreground">{invoice.description}</p>
                    </div>
                    <Badge 
                      className={`${getStatusColor(invoice.status)} font-medium`}
                      variant="outline"
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-semibold text-black hover:text-primary transition-colors">£{invoice.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Paid Amount</p>
                        <p className="font-semibold text-green-600">£{invoice.paidAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold text-black hover:text-primary transition-colors">{formatDate(invoice.dateTime)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {invoice.paidAmount < invoice.amount && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        Outstanding: <span className="font-semibold">£{(invoice.amount - invoice.paidAmount).toFixed(2)}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}