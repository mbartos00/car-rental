const formDataToObject = (formData: FormData) => {
  const obj: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};

  for (const [key, value] of formData.entries()) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = Array.isArray(obj[key])
        ? [...obj[key], value]
        : [obj[key], value];
    } else {
      obj[key] = value;
    }
  }
  return obj;
};

export default formDataToObject;
