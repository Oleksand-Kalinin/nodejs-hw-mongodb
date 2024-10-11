import { ContactsCollection } from '../db/models/contact.js';

export const getAllContacts = async () => {
    const contacts = await ContactsCollection.find();
    return contacts;
};

export const getContactById = async (contactId) => {
    const contact = await ContactsCollection.findById(contactId);
    return contact;
};

export const createContact = async (newContact) => {
    const contact = await ContactsCollection.create(newContact);
    return contact;
};

export const deleteContact = async (contactId) => {
    const contact = await ContactsCollection.findOneAndDelete({ _id: contactId });
    return contact;
};

export const updateContact = async (contactId, updateContact, options = {}) => {
    const contact = await ContactsCollection.findOneAndUpdate(
        { _id: contactId },
        updateContact,
        { new: true, ...options },
    );
    return contact;
};
