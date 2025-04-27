import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";

export const generatePublicId = (size?: number) => {
  const randomString = customAlphabet(alphabet, size || 6);
  return randomString();
};

export const generateSessionId = ({ publicId }: { publicId: string }) => {
  const randomString = customAlphabet(alphabet, 8);
  return `${publicId}-${randomString()}`;
};
