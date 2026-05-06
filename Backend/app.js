const config = require('./utils/config')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const personsRouter = require('./controllers/persons')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

const app = express()

// Conexión a MongoDB
mongoose.set('strictQuery', false)
logger.info('connecting to', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch(err => logger.error('error connecting to MongoDB:', err.message))

// Middlewares estándar
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

// Morgan (como lo tenías, opcional)
morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// Si quieres usar también el requestLogger de middleware, descomenta la siguiente línea:
// app.use(middleware.requestLogger)

// Rutas
app.use('/api/persons', personsRouter)

// Middlewares finales
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app