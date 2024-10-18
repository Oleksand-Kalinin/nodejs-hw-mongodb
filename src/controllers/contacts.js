import {
    createContact,
    deleteContact,
    getAllContacts,
    getContactById,
    updateContact,
} from '../services/contacts.js';

import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';



export const getContactsController = async (req, res) => {
    const { page, perPage } = parsePaginationParams(req.query);
    const result = await getAllContacts({ page, perPage });
    res.status(200).json({
        status: 200,
        message: 'Successfully found contacts',
        data: result,
    });
};

export const getContactByIdController = async (req, res) => {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
        throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
    });
};

export const createContactController = async (req, res) => {
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;
    const newContact = { name, phoneNumber, email, isFavourite, contactType };

    const contact = await createContact(newContact);

    res.status(201).json({
        status: 201,
        message: 'Successfully created a contact!',
        data: contact,
    });
};

export const deleteContactController = async (req, res) => {
    const { contactId } = req.params;

    const contact = await deleteContact(contactId);

    if (!contact) {
        throw createHttpError(404, 'Contact not found');
    }

    res.status(204).send();
};

export const patchContactController = async (req, res) => {
    const { contactId } = req.params;
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;
    const updatedContact = { name, phoneNumber, email, isFavourite, contactType };

    const contact = await updateContact(contactId, updatedContact);

    if (!contact) {
        throw createHttpError(404, 'Contact not found');
    }

    res.status(200).json({
        status: 20,
        message: 'Successfully patched a contact!',
        data: contact,
    });
};
