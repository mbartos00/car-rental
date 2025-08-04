import { type ZodObject, type ZodRawShape, z } from "zod";
import formDataToObject from "./formDataToObject";

interface ErrorTreeNode {
  errors?: string[];
  properties?: Record<string, ErrorTreeNode>;
}

const validateFormFields = <T extends ZodRawShape>(
  schema: ZodObject<T>,
  formData: FormData
): Partial<Record<keyof T, string[]>> | undefined => {
  const validatedFields = schema.safeParse(formDataToObject(formData));

  if (!validatedFields.success) {
    const errorTree = z.treeifyError(validatedFields.error) as ErrorTreeNode;
    const errors: Partial<Record<keyof T, string[]>> = {};

    if (errorTree.properties) {
      for (const [key, value] of Object.entries(errorTree.properties)) {
        if (key in schema.shape && value?.errors) {
          errors[key as keyof T] = value.errors;
        }
      }
    }

    return errors;
  }

  return undefined;
};

export default validateFormFields;
