'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  invoice_id: string
}

interface Invoice {
  id: string
  issue_date: string
  due_date: string
  total: number
  status: 'pending' | 'paid' | 'overdue' | 'unpaid'
  client: {
    id: string
    name: string
    company: string
    email: string
    phone: string
    address: string
  }
  items: InvoiceItem[]
}

export default function InvoiceDetailsPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true)
      const { data: invoiceData } = await supabase
        .from('invoices')
        .select(`
          *,
          client:client_id (*),
          items:invoice_items (*)
        `)
        .eq('id', params.id)
        .single()

      if (invoiceData) {
        setInvoice(invoiceData)
      }
      setLoading(false)
    }

    fetchInvoice()
  }, [params.id])

  const toggleInvoiceStatus = async () => {
    if (!invoice) return

    setUpdating(true)
    const newStatus = invoice.status === 'paid' ? 'unpaid' : 'paid'

    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoice.id)

    if (!error) {
      setInvoice(prev => prev ? { ...prev, status: newStatus } : null)
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">Invoice Not Found</h1>
        <p className="mb-3 sm:mb-4 text-gray-600 dark:text-gray-400">The invoice you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link href="/invoices" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          ← Back to Invoices
        </Link>
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    unpaid: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Invoice Details</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button
            onClick={toggleInvoiceStatus}
            disabled={updating}
            className={`px-3 sm:px-4 py-2 rounded-md font-medium text-sm sm:text-base ${
              invoice.status === 'paid'
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {updating ? 'Updating...' : invoice.status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
          </button>
          <Link href="/invoices" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-center sm:text-left">
            ← Back to Invoices
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-4 sm:mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-4 sm:mb-6 gap-4 sm:gap-0">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white">Invoice #{invoice.id.slice(0, 8)}</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Issue Date: {new Date(invoice.issue_date).toLocaleDateString()}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
              <span className={`mt-1 sm:mt-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[invoice.status]}`}>
                {invoice.status}
              </span>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">${invoice.total.toFixed(2)}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Client Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{invoice.client.name}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{invoice.client.company}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{invoice.client.email}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{invoice.client.phone}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{invoice.client.address}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Invoice Items</h3>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Price</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">{item.description}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">${item.unit_price.toFixed(2)}</td>
                        <td className="px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white">${(item.quantity * item.unit_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 