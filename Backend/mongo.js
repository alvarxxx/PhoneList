const mongoose = require('mongoose')

// 1. Validar argumentos
if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

// 2. URL (IMPORTANTE: usa tu cluster)
const url = `mongodb://alvarxxx:${password}@ac-eqyxcov-shard-00-00.1x7qj12.mongodb.net:27017,ac-eqyxcov-shard-00-01.1x7qj12.mongodb.net:27017,ac-eqyxcov-shard-00-02.1x7qj12.mongodb.net:27017/phonebook?ssl=true&replicaSet=atlas-6mup56-shard-0&authSource=admin&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

// 3. Schema
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

// 4. Modelo
const Person = mongoose.model('Person', personSchema)

// ===============================
// 🔥 CASO 1: SOLO PASSWORD → MOSTRAR DATOS
// ===============================
if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('phonebook:')

    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })

    mongoose.connection.close()
  })

// ===============================
// 🔥 CASO 2: AÑADIR PERSONA
// ===============================
} else if (process.argv.length === 5) {

  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })

} else {
  console.log('wrong number of arguments')
  mongoose.connection.close()
}