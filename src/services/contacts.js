import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({ page, perPage }) => {
    const limit = perPage;
    const skip = page > 0 ? (page - 1) * perPage : 0;

    const [total, contacts] = await Promise.all([
        ContactsCollection.countDocuments(),
        ContactsCollection.find().skip(skip).limit(limit),
    ]);

    const paginationData = calculatePaginationData(total, perPage, page);

    return {
        contacts,
        ...paginationData,
    };
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
