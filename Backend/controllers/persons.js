const personsRouter = require('express').Router()
const Person = require('../models/person')

personsRouter.get('/', (req, res, next) => {
  Person.find({})
    .then(persons => res.json(persons))
    .catch(error => next(error))
})

personsRouter.get('/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => person ? res.json(person) : res.status(404).end())
    .catch(error => next(error))
})

personsRouter.post('/', (req, res, next) => {
  const { name, number } = req.body
  Person.findOne({ name })
    .then(existing => {
      if (existing) {
        existing.number = number
        return existing.save().then(updated => res.json(updated))
      }
      const person = new Person({ name, number })
      return person.save().then(saved => res.json(saved))
    })
    .catch(error => next(error))
})

personsRouter.put('/:id', (req, res, next) => {
  const { name, number } = req.body
  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updated => updated ? res.json(updated) : res.status(404).end())
    .catch(error => next(error))
})

personsRouter.delete('/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch(error => next(error))
})

personsRouter.get('/info', (req, res, next) => {
  Person.countDocuments({})
    .then(count => res.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`))
    .catch(error => next(error))
})

module.exports = personsRouter