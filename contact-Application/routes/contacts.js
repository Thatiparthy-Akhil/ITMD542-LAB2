// routes/contacts.js

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const contactsFilePath = path.join(__dirname, '../data/contacts.json');

// Read contacts from file
const readContactsFromFile = () => {
  const contactsData = fs.readFileSync(contactsFilePath);
  return JSON.parse(contactsData);
};

// Write contacts to file
const writeContactsToFile = (contacts) => {
  fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2));
};

// Get all contacts
router.get('/', function(req, res, next) {
  const contacts = readContactsFromFile();
  res.render('contacts/index', { title: 'All Contacts', contacts });
});

// Get single contact
router.get('/:id', function(req, res, next) {
  const contacts = readContactsFromFile();
  const contact = contacts.find(c => c.id === req.params.id);
  if (contact) {
    res.render('contacts/show', { title: 'Contact Details', contact });
  } else {
    res.status(404).send('Contact not found');
  }
});

// Show form to create new contact
router.get('/new', function(req, res, next) {
  res.render('contacts/new', { title: 'New Contact' });
});

// Create new contact
router.post('/', function(req, res, next) {
  const { firstName, lastName, emailAddress, notes } = req.body;
  if (!firstName || !lastName) {
    res.render('contacts/new', { title: 'New Contact', error: 'First Name and Last Name are required' });
    return;
  }
  const newContact = {
    id: uuidv4(),
    firstName,
    lastName,
    emailAddress,
    notes,
    createdAt: new Date()
  };
  const contacts = readContactsFromFile();
  contacts.push(newContact);
  writeContactsToFile(contacts);
  res.redirect('/contacts');
});

// Show form to edit contact
router.get('/:id/edit', function(req, res, next) {
  const contacts = readContactsFromFile();
  const contact = contacts.find(c => c.id === req.params.id);
  if (contact) {
    res.render('contacts/edit', { title: 'Edit Contact', contact });
  } else {
    res.status(404).send('Contact not found');
  }
});

// Update contact
router.post('/:id', function(req, res, next) {
  const { firstName, lastName, emailAddress, notes } = req.body;
  if (!firstName || !lastName) {
    res.render('contacts/edit', { title: 'Edit Contact', error: 'First Name and Last Name are required', contact: req.body });
    return;
  }
  const updatedContact = {
    id: req.params.id,
    firstName,
    lastName,
    emailAddress,
    notes,
    createdAt: new Date()
  };
  const contacts = readContactsFromFile();
  const index = contacts.findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    contacts[index] = updatedContact;
    writeContactsToFile(contacts);
    res.redirect(`/contacts/${req.params.id}`);
  } else {
    res.status(404).send('Contact not found');
  }
});

// Delete contact
router.post('/:id/delete', function(req, res, next) {
  const contacts = readContactsFromFile();
  const index = contacts.findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    contacts.splice(index, 1);
    writeContactsToFile(contacts);
    res.redirect('/contacts');
  } else {
    res.status(404).send('Contact not found');
  }
});

module.exports = router;
