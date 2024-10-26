import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({ page, perPage, sortOrder, sortBy, userId }) => {
    const limit = perPage;
    const skip = page > 0 ? (page - 1) * perPage : 0;

    const contactsQuery = ContactsCollection.find({ userId });

    const [total, contacts] = await Promise.all([
        ContactsCollection.countDocuments(contactsQuery),
        contactsQuery
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit),
    ]);

    const paginationData = calculatePaginationData(total, perPage, page);

    return {
        data: contacts,
        ...paginationData,
    };
};

export const getContactById = async (contactId, userId) => {
    const contact = await ContactsCollection.findOne({ _id: contactId, userId });
    return contact;
};

export const createContact = async (newContact) => {
    const contact = await ContactsCollection.create(newContact);
    return contact;
};

export const deleteContact = async (contactId, userId) => {
    const contact = await ContactsCollection.findOneAndDelete({ _id: contactId, userId });
    return contact;
};

export const updateContact = async (contactId, updateContact, userId, options = {}) => {
    const contact = await ContactsCollection.findOneAndUpdate(
        { _id: contactId, userId },
        updateContact,
        { new: true, ...options },
    );
    return contact;
};
