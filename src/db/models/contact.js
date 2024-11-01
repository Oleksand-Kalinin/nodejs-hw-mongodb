import { model, Schema } from 'mongoose';

const contactSchema = new Schema(
    {
        name: {
            type: String,
            require: true,
        },
        phoneNumber: {
            type: String,
            require: true,
        },
        email: {
            type: String,
        },
        isFavourite: {
            type: Boolean,
            default: false,
        },
        contactType: {
            type: String,
            require: true,
            enum: ['work', 'home', 'personal'],
            default: 'personal',
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            require: true,
        },
        photo: {
            type: String,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const ContactsCollection = model('contacts', contactSchema);
