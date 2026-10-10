import { db } from '../src/lib/db'

// Deterministic pseudo-random for reproducible seed
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(42)
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
const randFloat = (min: number, max: number) => rand() * (max - min) + min

const categories = ['Electronics', 'Apparel', 'Home & Living', 'Office', 'Grocery', 'Sports']
const suppliers = ['PT Sumber Makmur', 'CV Mitra Usaha', 'Global Trade Co.', 'Nusantara Supply', 'Prima Distribusi']

const productSeed = [
  { name: 'Wireless Mouse Logitech M350', cat: 'Electronics', price: 285000, cost: 210000, stock: 124, reorder: 20 },
  { name: 'Mechanical Keyboard Keychron K2', cat: 'Electronics', price: 1250000, cost: 980000, stock: 8, reorder: 12 },
  { name: 'USB-C Hub 7-in-1 Anker', cat: 'Electronics', price: 349000, cost: 265000, stock: 67, reorder: 15 },
  { name: 'Portable SSD Samsung T7 1TB', cat: 'Electronics', price: 1850000, cost: 1550000, stock: 32, reorder: 8 },
  { name: 'Cotton T-Shirt Premium', cat: 'Apparel', price: 89000, cost: 52000, stock: 230, reorder: 40 },
  { name: 'Denim Jacket Selvedge', cat: 'Apparel', price: 549000, cost: 410000, stock: 45, reorder: 15 },
  { name: 'Running Shoes Ultraboost', cat: 'Apparel', price: 1799000, cost: 1350000, stock: 6, reorder: 10 },
  { name: 'Ceramic Mug 350ml', cat: 'Home & Living', price: 45000, cost: 28000, stock: 412, reorder: 50 },
  { name: 'Aroma Diffuser Wood', cat: 'Home & Living', price: 189000, cost: 132000, stock: 78, reorder: 20 },
  { name: 'Standing Lamp Nordic', cat: 'Home & Living', price: 689000, cost: 540000, stock: 4, reorder: 6 },
  { name: 'A4 Paper 80gsm (500 sheets)', cat: 'Office', price: 55000, cost: 42000, stock: 156, reorder: 30 },
  { name: 'Gel Pen 0.5mm (Pack of 12)', cat: 'Office', price: 38000, cost: 26000, stock: 89, reorder: 25 },
  { name: 'Stapler Heavy Duty', cat: 'Office', price: 125000, cost: 89000, stock: 9, reorder: 10 },
  { name: 'Arabica Coffee Beans 1kg', cat: 'Grocery', price: 165000, cost: 120000, stock: 95, reorder: 20 },
  { name: 'Organic Honey 500g', cat: 'Grocery', price: 98000, cost: 72000, stock: 14, reorder: 12 },
  { name: 'Yoga Mat Pro Grip', cat: 'Sports', price: 295000, cost: 215000, stock: 56, reorder: 15 },
  { name: 'Resistance Band Set', cat: 'Sports', price: 135000, cost: 88000, stock: 102, reorder: 20 },
  { name: 'Insulated Water Bottle 1L', cat: 'Sports', price: 159000, cost: 110000, stock: 7, reorder: 12 },
]

const customerNames = [
  { name: 'Andi Wijaya', company: null, type: 'individual' },
  { name: 'Siti Rahma', company: null, type: 'individual' },
  { name: 'Budi Santoso', company: 'PT Karya Nusantara', type: 'business' },
  { name: 'Dewi Lestari', company: 'CV Berkah Jaya', type: 'business' },
  { name: 'Rudi Hartono', company: null, type: 'individual' },
  { name: 'Maya Anggraini', company: 'PT Digital Solusi', type: 'business' },
  { name: 'Hendra Gunawan', company: 'PT Maju Bersama', type: 'business' },
  { name: 'Lina Marlina', company: null, type: 'individual' },
  { name: 'Fajar Pratama', company: 'CV Sumber Rejeki', type: 'business' },
  { name: 'Rina Oktaviani', company: null, type: 'individual' },
  { name: 'Agus Setiawan', company: 'PT Global Teknologi', type: 'business' },
  { name: 'Putri Maharani', company: null, type: 'individual' },
]

const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Yogyakarta', 'Bali', 'Makassar']
const orderStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
const paymentMethods = ['card', 'cash', 'transfer', 'ewallet']

const settingsSeed: Record<string, string> = {
  companyName: 'Nexus ERP Suite',
  companyEmail: 'finance@nexus-erp.com',
  companyPhone: '+62 21 5550 1234',
  companyAddress: 'Jl. Sudirman Kav. 52-53, Jakarta Selatan 12190',
  currency: 'IDR',
  currencySymbol: 'Rp',
  language: 'id',
  timezone: 'Asia/Jakarta',
  taxRate: '11',
  lowStockAlerts: 'true',
  orderNotifications: 'true',
  weeklyReport: 'true',
}

async function main() {
  console.log('🌱 Seeding Nexus ERP Suite database...')

  // Clean
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.product.deleteMany()
  await db.customer.deleteMany()
  await db.activity.deleteMany()
  await db.setting.deleteMany()

  // Products
  const products = [] as any[]
  for (const p of productSeed) {
    const sku = `SKU-${p.name.split(' ').slice(0, 2).join('').toUpperCase()}-${randInt(100, 999)}`
    const created = await db.product.create({
      data: {
        sku,
        name: p.name,
        category: p.cat,
        description: `${p.name} — supplied by ${pick(suppliers)}`,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        reorderLevel: p.reorder,
        supplier: pick(suppliers),
        status: 'active',
      },
    })
    products.push(created)
  }
  console.log(`  ✓ ${products.length} products seeded`)

  // Customers
  const customers = [] as any[]
  for (const c of customerNames) {
    const created = await db.customer.create({
      data: {
        name: c.name,
        email: `${c.name.toLowerCase().replace(/ /g, '.')}@example.com`,
        phone: `+62 8${randInt(11, 89)} ${randInt(1000, 9999)} ${randInt(1000, 9999)}`,
        company: c.company,
        type: c.type,
        status: rand() > 0.85 ? 'vip' : 'active',
        address: `Jl. ${pick(['Merdeka', 'Diponegoro', 'Gatot Subroto', 'Sudirman', 'Thamrin'])} No. ${randInt(1, 200)}`,
        city: pick(cities),
      },
    })
    customers.push(created)
  }
  console.log(`  ✓ ${customers.length} customers seeded`)

  // Orders across last 6 months
  const now = new Date()
  const orders = [] as any[]
  for (let i = 0; i < 38; i++) {
    const daysAgo = Math.floor(rand() * 180)
    const created = new Date(now)
    created.setDate(created.getDate() - daysAgo)
    created.setHours(randInt(8, 18), randInt(0, 59), 0, 0)

    const itemCount = randInt(1, 4)
    const chosenProducts: any[] = []
    for (let j = 0; j < itemCount; j++) {
      const prod = pick(products)
      if (!chosenProducts.find((x) => x.id === prod.id)) chosenProducts.push(prod)
    }
    const items = chosenProducts.map((prod) => {
      const qty = randInt(1, 5)
      return {
        productId: prod.id,
        quantity: qty,
        unitPrice: prod.price,
        total: prod.price * qty,
      }
    })
    const subtotal = items.reduce((s, it) => s + it.total, 0)
    const tax = Math.round(subtotal * 0.11)
    const discount = rand() > 0.7 ? Math.round(subtotal * 0.05) : 0
    const total = subtotal + tax - discount
    const status = pick(orderStatuses)
    const cust = pick(customers)

    const order = await db.order.create({
      data: {
        orderNumber: `ORD-${String(1000 + i)}`,
        customerId: cust.id,
        status,
        paymentMethod: pick(paymentMethods),
        subtotal,
        tax,
        discount,
        total,
        notes: rand() > 0.8 ? 'Priority delivery requested.' : null,
        createdAt: created,
        items: { create: items },
      },
    })
    orders.push(order)
  }
  console.log(`  ✓ ${orders.length} orders seeded`)

  // Activities (recent first)
  const activityTemplates = [
    { type: 'order_created', title: 'New order received', desc: (o: any) => `Order ${o.orderNumber} placed by customer` },
    { type: 'payment_received', title: 'Payment received', desc: (o: any) => `Payment for ${o.orderNumber} confirmed` },
    { type: 'order_updated', title: 'Order status updated', desc: (o: any) => `${o.orderNumber} moved to ${o.status}` },
    { type: 'stock_low', title: 'Low stock alert', desc: (p: any) => `${p.name} below reorder level (${p.stock} left)` },
    { type: 'customer_added', title: 'New customer registered', desc: (c: any) => `${c.name} joined as ${c.type} customer` },
  ]
  for (let i = 0; i < 24; i++) {
    const tpl = pick(activityTemplates)
    const ago = Math.floor(rand() * 72)
    const created = new Date(now)
    created.setHours(created.getHours() - ago)
    let subject: any
    if (tpl.type.includes('order')) subject = pick(orders)
    else if (tpl.type === 'stock_low') subject = pick(products.filter((p) => p.stock <= p.reorderLevel)) || pick(products)
    else subject = pick(customers)
    await db.activity.create({
      data: {
        type: tpl.type,
        title: tpl.title,
        description: tpl.desc(subject),
        actor: pick(['Andi', 'System', 'Maya', 'Auto-Scheduler', 'Budi']),
        meta: JSON.stringify({ ref: subject?.id, refNumber: subject?.orderNumber || subject?.sku }),
        createdAt: created,
      },
    })
  }
  console.log(`  ✓ activities seeded`)

  // Settings
  for (const [k, v] of Object.entries(settingsSeed)) {
    await db.setting.create({ data: { key: k, value: v } })
  }
  console.log(`  ✓ ${Object.keys(settingsSeed).length} settings seeded`)

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
