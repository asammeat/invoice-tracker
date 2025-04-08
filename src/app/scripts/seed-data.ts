import { supabase } from '../lib/supabase';

// Sample client data
const clients = [
  {
    name: 'John Smith',
    company: 'Tech Solutions Inc.',
    email: 'john.smith@techsolutions.com',
    phone: '(555) 123-4567',
    address: '123 Business Ave, Tech City, TC 12345'
  },
  {
    name: 'Sarah Johnson',
    company: 'Digital Dynamics',
    email: 'sarah.j@digitaldynamics.com',
    phone: '(555) 234-5678',
    address: '456 Innovation Dr, Digital City, DC 23456'
  },
  {
    name: 'Michael Chen',
    company: 'Global Systems Ltd.',
    email: 'm.chen@globalsystems.com',
    phone: '(555) 345-6789',
    address: '789 Enterprise St, Global City, GC 34567'
  },
  {
    name: 'Emma Davis',
    company: 'Creative Solutions Co.',
    email: 'emma.d@creativesolutions.com',
    phone: '(555) 456-7890',
    address: '321 Design Blvd, Creative City, CC 45678'
  },
  {
    name: 'Robert Wilson',
    company: 'Data Innovators',
    email: 'r.wilson@datainnovators.com',
    phone: '(555) 567-8901',
    address: '654 Data Way, Innovation City, IC 56789'
  },
  {
    name: 'Lisa Anderson',
    company: 'Smart Services',
    email: 'l.anderson@smartservices.com',
    phone: '(555) 678-9012',
    address: '987 Smart St, Service City, SC 67890'
  },
  {
    name: 'David Kim',
    company: 'Future Tech Corp',
    email: 'd.kim@futuretech.com',
    phone: '(555) 789-0123',
    address: '147 Future Lane, Tech City, TC 78901'
  },
  {
    name: 'Rachel Brown',
    company: 'Cloud Solutions',
    email: 'rachel.b@cloudsolutions.com',
    phone: '(555) 890-1234',
    address: '258 Cloud Ave, Digital City, DC 89012'
  },
  {
    name: 'James Taylor',
    company: 'Network Systems',
    email: 'j.taylor@networksystems.com',
    phone: '(555) 901-2345',
    address: '369 Network Dr, System City, SC 90123'
  },
  {
    name: 'Maria Garcia',
    company: 'Web Experts LLC',
    email: 'm.garcia@webexperts.com',
    phone: '(555) 012-3456',
    address: '741 Web St, Expert City, EC 01234'
  }
];

// Function to generate random invoice items
function generateInvoiceItems(count: number) {
  const items = [];
  const descriptions = [
    'Web Development',
    'UI/UX Design',
    'Database Setup',
    'API Integration',
    'Cloud Infrastructure',
    'Security Audit',
    'Performance Optimization',
    'Technical Consultation',
    'Mobile App Development',
    'System Maintenance'
  ];

  for (let i = 0; i < count; i++) {
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = Math.floor(Math.random() * 200) + 50;

    items.push({
      description,
      quantity,
      unit_price: unitPrice,
      amount: quantity * unitPrice
    });
  }

  return items;
}

// Function to generate invoices
function generateInvoices(count: number) {
  const invoices = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  for (let i = 0; i < count; i++) {
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const items = generateInvoiceItems(Math.floor(Math.random() * 3) + 1);
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    
    // Generate a random date between now and 6 months ago
    const randomDate = new Date(
      sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    );

    invoices.push({
      client_name: randomClient.name,
      client_company: randomClient.company,
      client_email: randomClient.email,
      client_phone: randomClient.phone,
      client_address: randomClient.address,
      issue_date: randomDate.toISOString().split('T')[0],
      due_date: new Date(randomDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: Math.random() > 0.3 ? 'paid' : 'unpaid',
      items,
      total_amount: total
    });
  }

  return invoices;
}

// Function to seed the database
export async function seedDatabase() {
  try {
    // Insert clients
    for (const client of clients) {
      const { error: clientError } = await supabase
        .from('clients')
        .insert([client]);

      if (clientError) throw clientError;
    }
    console.log('✅ Clients seeded successfully');

    // Generate and insert invoices
    const invoices = generateInvoices(30);
    for (const invoice of invoices) {
      const { items, ...invoiceData } = invoice;
      
      // Insert invoice
      const { data: insertedInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select();

      if (invoiceError) throw invoiceError;

      // Insert invoice items
      if (insertedInvoice && insertedInvoice[0]) {
        const invoiceItems = items.map(item => ({
          ...item,
          invoice_id: insertedInvoice[0].id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);

        if (itemsError) throw itemsError;
      }
    }
    console.log('✅ Invoices and items seeded successfully');

    return { success: true, message: 'Database seeded successfully' };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { success: false, message: error.message };
  }
} 