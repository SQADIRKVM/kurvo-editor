import { nanoid } from "nanoid";

export function generateUUID(): string {
	return nanoid();
}
