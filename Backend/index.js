require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

const Person = require('./models/person')

const app = express()

// Middleware (debe definirse antes de las rutas)
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', req => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// 🔥 Conexión a MongoDB
const url = process.env.MONGODB_URI
mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
    console.log('✅ connected to MongoDB')
    // 🚀 El servidor arranca AHORA, justo después de conectar
    const PORT = process.env.PORT || 3002
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)   // No arrancar el servidor si la BD falla
  })

// ================= ROUTES =================

// GET ALL
app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => res.json(persons))
    .catch(error => next(error))
})

// GET BY ID
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

// POST
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  Person.findOne({ name: body.name })
    .then(existingPerson => {

      if (existingPerson) {
        // Actualizar número si ya existe
        existingPerson.number = body.number
        return existingPerson.save().then(updated => {
          response.json(updated)
        })
      }

      // Crear nueva persona
      const person = new Person({
        name: body.name,
        number: body.number,
      })
      return person.save().then(saved => {
        response.json(saved)
      })
    })
    .catch(error => next(error))
})

// PUT
app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(
    req.params.id,
    person,
    {
      new: true,
      runValidators: true,
      context: 'query'
    }
  )
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

// DELETE
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

// INFO
app.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date()}</p>
      `)
    })
    .catch(error => next(error))
})

// UNKNOWN ENDPOINT
const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// ERROR HANDLER
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)