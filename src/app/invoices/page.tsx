'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Invoice {
  id: string
  issue_date: string
  due_date: string
  total: number
  status: 'pending' | 'paid' | 'overdue' | 'all' | 'unpaid'
  client: {
    name: string
    company: string
    id: string
  }
}

const StatCard = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow">
    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
  </div>
)

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data } = await supabase
        .from('invoices')
        .select(`
          *,
          client:client_id (
            name,
            company
          )
        `)
      if (data) setInvoices(data)
    }
    fetchInvoices()
  }, [])

  const totalInvoices = invoices.length
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  const unpaidInvoices = invoices.filter(invoice => invoice.status !== 'paid').length

  // Generate monthly invoice data for the last 6 months
  const getMonthlyInvoiceData = () => {
    const today = new Date()
    const months = []
    
    // Create an array of the last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = month.toLocaleString('default', { month: 'short' })
      const year = month.getFullYear()
      
      // Count invoices for this month
      const count = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.issue_date)
        return invoiceDate.getMonth() === month.getMonth() && 
               invoiceDate.getFullYear() === year
      }).length
      
      months.push({ name: `${monthName} ${year}`, count })
    }
    
    return months
  }

  const monthlyData = getMonthlyInvoiceData()

  const stats = [
    { label: 'Total Invoices', value: totalInvoices },
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
    { label: 'Unpaid Invoices', value: unpaidInvoices }
  ]

  const StatsSection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  )

  const groupedInvoices = invoices.reduce((groups, invoice) => {
    const status = invoice.status || 'pending'
    return {
      ...groups,
      [status]: [...(groups[status] || []), invoice]
    }
  }, {} as Record<string, Invoice[]>)

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    all: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    unpaid: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
        <Link
          href="/invoices/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Invoice
        </Link>
      </div>

      <StatsSection />
      
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Invoices by Month</h2>
        <div className="w-full min-h-[250px] max-h-[300px]">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={monthlyData} 
              margin={{ top: 5, right: 20, left: 20, bottom: 65 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                width={40}
              />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" name="Invoices" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {Object.entries(groupedInvoices).map(([status, invoices]) => (
        <div key={status} className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white capitalize">{status} Invoices</h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Issue Date</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Due Date</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.map(invoice => (
                    <tr 
                      key={invoice.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                      onClick={() => router.push(`/invoices/${invoice.id}`)}
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{invoice.client.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{invoice.client.company}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                        ${invoice.total.toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[invoice.status]}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        <button 
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/invoices/${invoice.id}`);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
