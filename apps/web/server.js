import { createServer } from 'http'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME || 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`)
    handle(req, res, url)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
