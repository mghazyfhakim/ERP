import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Simulated live business events for the ERP tenant.
// In a real SaaS these would be emitted by order/inventory workers.
const EVENTS: { type: string; title: string; desc: (ctx: string) => string; actor: string }[] = [
  {
    type: 'order_created',
    title: 'New order received',
    desc: (c) => `Order ${c} placed via web checkout`,
    actor: 'Web Storefront',
  },
  {
    type: 'payment_received',
    title: 'Payment confirmed',
    desc: (c) => `E-wallet payment for ${c} settled`,
    actor: 'Payment Gateway',
  },
  {
    type: 'stock_low',
    title: 'Low stock alert',
    desc: (c) => `${c} fell below reorder level`,
    actor: 'Inventory Watcher',
  },
  {
    type: 'order_updated',
    title: 'Order shipped',
    desc: (c) => `${c} handed to courier`,
    actor: 'Fulfillment',
  },
  {
    type: 'customer_added',
    title: 'New customer registered',
    desc: (c) => `${c} created an account`,
    actor: 'CRM',
  },
]

const ORDER_REF = ['ORD-1039', 'ORD-1040', 'ORD-1041', 'ORD-1042', 'ORD-1043']
const PRODUCT_REF = [
  'Mechanical Keyboard Keychron K2',
  'Standing Lamp Nordic',
  'Insulated Water Bottle 1L',
  'Organic Honey 500g',
]
const CUSTOMER_REF = ['Rangga Mahendra', 'Salsabila Putri', 'Eko Prasetyo']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildEvent() {
  const tpl = pick(EVENTS)
  let ctx = ''
  if (tpl.type === 'order_created' || tpl.type === 'payment_received' || tpl.type === 'order_updated') {
    ctx = pick(ORDER_REF)
  } else if (tpl.type === 'stock_low') {
    ctx = pick(PRODUCT_REF)
  } else if (tpl.type === 'customer_added') {
    ctx = pick(CUSTOMER_REF)
  }
  return {
    type: tpl.type,
    title: tpl.title,
    description: tpl.desc(ctx),
    actor: tpl.actor,
    timestamp: new Date().toISOString(),
  }
}

const connectedClients = new Set<string>()

io.on('connection', (socket) => {
  connectedClients.add(socket.id)
  console.log(`[realtime] client connected (${socket.id}) — total ${connectedClients.size}`)

  socket.emit('hello', {
    service: 'nexus-realtime',
    message: 'Connected to Nexus ERP realtime channel',
    ts: new Date().toISOString(),
  })

  socket.on('disconnect', () => {
    connectedClients.delete(socket.id)
    console.log(`[realtime] client disconnected (${socket.id}) — total ${connectedClients.size}`)
  })

  socket.on('error', (err) => {
    console.error(`[realtime] socket error (${socket.id}):`, err)
  })
})

// Emit a live business event every 35–55s to simulate real-time ERP activity
function scheduleNext() {
  const delay = 35000 + Math.floor(Math.random() * 20000)
  setTimeout(() => {
    const event = buildEvent()
    io.emit('activity', event)
    console.log(`[realtime] emitted ${event.type}: ${event.description}`)
    scheduleNext()
  }, delay)
}

scheduleNext()

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[realtime] Nexus ERP realtime service listening on port ${PORT}`)
})

process.on('SIGTERM', () => {
  console.log('[realtime] SIGTERM, shutting down...')
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  console.log('[realtime] SIGINT, shutting down...')
  httpServer.close(() => process.exit(0))
})
