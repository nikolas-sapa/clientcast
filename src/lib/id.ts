import { customAlphabet } from 'nanoid';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

export const newId = customAlphabet(ALPHABET, 10);
export const newShortId = customAlphabet(ALPHABET, 6);
