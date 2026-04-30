import { useState, useEffect } from 'react'
import personService from './services/persons.js'
import Notification from './components/Notification'
import './App.css'



const Filter = ({ search, handleSearchChange }) => (
  <div>
    filter shown with:
    <input value={search} onChange={handleSearchChange} />
  </div>
)

const PersonForm = ({
  addPerson,
  newName,
  handleNameChange,
  newNumber,
  handleNumberChange
}) => (
  <form onSubmit={addPerson}>
    <div>
      name:
      <input value={newName} onChange={handleNameChange} />
    </div>

    <div>
      number:
      <input value={newNumber} onChange={handleNumberChange} />
    </div>

    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Persons = ({ persons, deletePerson }) => (
  <ul>
    {persons.map(person => (
      <li key={person.id}>
        {person.name} {person.number}
        <button onClick={() => deletePerson(person.id)}>
          delete
        </button>
      </li>
    ))}
  </ul>
)

const App = () => {
  const [persons, setPersons] = useState([])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const deletePerson = (id) => {
const person = persons.find(p => p.id === id)

if (!person) return

  const confirmDelete = window.confirm(
    `Delete ${person.name}?`
  )

  if (!confirmDelete) return

  personService
    .remove(id)
    .then(() => {
      setPersons(persons.filter(p => p.id !== id))

      setSuccessMessage(`Deleted ${person.name}`)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    })
    .catch(() => {
      setErrorMessage(
        `Information of ${person.name} was already removed from server`
      )

      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)

      setPersons(persons.filter(p => p.id !== id))
    })
}




  useEffect(() => {
    personService
      .getAll()
       personService.getAll().then(data => {
    setPersons(data)
  })
  }, [])

  

  const handleNameChange = (e) => setNewName(e.target.value)
  const handleNumberChange = (e) => setNewNumber(e.target.value)
  const handleSearchChange = (e) => setSearch(e.target.value)

const addPerson = (event) => {
  event.preventDefault()

  const existingPerson = persons.find(
    person => person.name === newName
  )

  // CASO 1: actualizar persona
  if (existingPerson) {
    const confirmUpdate = window.confirm(
      `${newName} is already added, replace number?`
    )

    if (!confirmUpdate) return

    const changedPerson = {
      ...existingPerson,
      number: newNumber
    }

    personService
      .update(existingPerson.id, changedPerson)
      .then(returnedPerson => {
        setPersons(persons.map(p =>
          p.id !== existingPerson.id ? p : returnedPerson
        ))

        setSuccessMessage(`Updated ${returnedPerson.name}`)
        setTimeout(() => setSuccessMessage(null), 5000)

        setNewName('')
        setNewNumber('')
      })
      .catch(() => {
        setErrorMessage(
          `Information of ${existingPerson.name} was already removed`
        )
        setTimeout(() => setErrorMessage(null), 5000)

        setPersons(persons.filter(p => p.id !== existingPerson.id))
      })

    return
  }

  // CASO 2: crear persona nueva
  const personObject = {
    name: newName,
    number: newNumber
  }

  personService
    .create(personObject)
    .then(returnedPerson => {
      setPersons(persons.concat(returnedPerson))

      setSuccessMessage(`Added ${returnedPerson.name}`)
      setTimeout(() => setSuccessMessage(null), 5000)

      setNewName('')
      setNewNumber('')
    })
    .catch(() => {
      setErrorMessage('Error adding person')
      setTimeout(() => setErrorMessage(null), 5000)
    })

    
  }

 const personsToShow = (persons ?? []).filter(person =>
  person.name.toLowerCase().includes(search.toLowerCase())
)

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={successMessage} type="success" />
      <Notification message={errorMessage} type="error" />

      <Filter search={search} handleSearchChange={handleSearchChange} />

      <h3>Add a new</h3>

      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>

      <Persons
        persons={personsToShow}
        deletePerson={deletePerson} />
    </div>
  )
}

export default App
