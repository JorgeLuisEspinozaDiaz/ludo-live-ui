import { useState } from "react";

export const UseForm = <T>(initialState: T) => {
  const [form, setForm] = useState<T>({ ...initialState });

  const handleInputChange = ({ target }: any) => {
    const { value, name } = target;
    setForm({ ...form, [name]: value });
  };

  const handleInputChangeReset = (name: keyof T) => {
    setForm({ ...form, [name]: "" });
  };

  const handleReset = (newFormState: T = initialState) => {
    const claves = Object.keys(newFormState || {});
    const clavesOld = Object.keys(form || {});

    for (const clave of clavesOld) {
      const target = { name: clave, value: undefined };
      const { value, name } = target as { value: any; name: keyof T };
      form[name] = value;
    }

    for (const clave of claves) {
      const target = { name: clave, value: (newFormState || {})[clave] };
      const { value, name } = target as { value: any; name: keyof T };
      form[name] = value;
    }

    // setForm(newFormState);
  };

  const keyUpHandler = ({ target }: any) => {
    const { value, name } = target as { value: any; name: keyof T };
    if (form && typeof form === "object" && name) {
      form[name] = value !== undefined && value !== "" ? value : undefined;
    }
  };

  return {
    form,
    handleInputChange,
    handleInputChangeReset,
    handleReset,
    keyUpHandler,
  };
};
