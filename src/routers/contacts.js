import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import {
    createContactController,
    deleteContactController,
    getContactByIdController,
    getContactsController,
    patchContactController,
} from '../controllers/contacts.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
    createContactSchema,
    updateContactSchema,
} from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.get('/', ctrlWrapper(getContactsController));

router.get(
    '/:contactId',
    isValidId('contactId'),
    ctrlWrapper(getContactByIdController),
);

router.post(
    '/',
    upload.single('photo'),
    validateBody(createContactSchema),
    ctrlWrapper(createContactController),
);

router.delete(
    '/:contactId',
    isValidId('contactId'),
    ctrlWrapper(deleteContactController),
);

router.patch(
    '/:contactId',
    isValidId('contactId'),
    upload.single('photo'),
    validateBody(updateContactSchema),
    ctrlWrapper(patchContactController),
);

export default router;
