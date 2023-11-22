/* Module dependencies */
const app     = require('../apps')
const config  = require('../apps/config/config')
const debug   = require('debug')('server:server')
const cluster = require('cluster')
const http    = require('http')
const os      = require('os')
const shell   = require('shelljs')
const chalk   = require('chalk')
/* Set CORS if necessary */
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type, Authorization, Content-Type')
  next()
})

const port = normalizePort(config.port || '8888')
const numCPUs = os.cpus().length
app.set('port', port)
if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; ++i) {
    cluster.fork()
  }
} else {
  var server = http.createServer(app)
  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
}

// FUNCTIONS DEFINITION //
/* 1. Normalize a port into a number, string, or false */
function normalizePort(val) {
  const port = parseInt(val, 10)
  if (isNaN(port)) {
    return val
  } // named pipe
  if (port >= 0) {
    return port
  } // port number
  return false
}

/* 2. Event listener for HTTP server "error" event */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/* 3. Event listener for HTTP server "listening" event */
function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port
  debug('Listening on ' + bind)
  console.log(chalk.green('*** Server listening on port:'), chalk.red(addr.port))
}