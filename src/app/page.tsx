import { supabase } from '@/app/lib/supabase';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/app/lib/utils';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  total_amount: number;
  status: 'paid' | 'unpaid';
  clients?: {
    name: string;
    company: string;
  };
}

export default async function Home() {
  // Fetch total invoices and amount
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*');

  const totalInvoices = invoices?.length || 0;
  const totalAmount = invoices?.reduce((sum: number, invoice: Invoice) => sum + invoice.total_amount, 0) || 0;

  // Fetch recent invoices
  const { data: recentInvoices } = await supabase
    .from('invoices')
    .select(`
      *,
      clients (
        name,
        company
      )
    `)
    .order('issue_date', { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Total Invoices</h2>
          <p className="text-2xl sm:text-3xl font-bold">{totalInvoices}</p>
        </Card>
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Total Amount</h2>
          <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalAmount)}</p>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
          <h2 className="text-lg sm:text-xl font-semibold">Recent Invoices</h2>
          <Link 
            href="/invoices" 
            className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-gray-500">Invoice #</th>
                    <th scope="col" className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-gray-500">Client</th>
                    <th scope="col" className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-gray-500">Date</th>
                    <th scope="col" className="px-3 sm:px-6 py-2 text-right text-xs sm:text-sm font-medium text-gray-500">Amount</th>
                    <th scope="col" className="px-3 sm:px-6 py-2 text-center text-xs sm:text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInvoices?.map((invoice: Invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-xs sm:text-sm">
                        <Link 
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </td>
                      <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-xs sm:text-sm">
                        {invoice.clients?.company || invoice.clients?.name}
                      </td>
                      <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-xs sm:text-sm">
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-xs sm:text-sm text-right">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 rounded-full text-xs sm:text-sm ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}