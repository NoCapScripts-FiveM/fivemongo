import { ObjectId } from "mongodb";

export function prepareObject(input: any): any {
  if (!input) return {};

  if (Array.isArray(input)) {
    // Convert array to object with stringified indices as keys
    const output: Record<string, any> = {};
    input.forEach((item: any, index: number) => {
      output[index.toString()] = item;
    });
    return output;
  } else if (typeof input === "object") {
    // Clone input to avoid mutating original
    const output = { ...input };

    // Convert _id to ObjectId if present
    if (output._id) {
      try {
        output._id = new ObjectId(output._id);
      } catch (e) {
        // Handle invalid ObjectId string
        console.warn(`Invalid _id for ObjectId conversion: ${output._id}`);
        // Keep original or set to null/undefined based on your needs
      }
    }
    return output;
  }

  // For other types, return as-is
  return input;
}