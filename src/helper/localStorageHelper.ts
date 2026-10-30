export const localStorageHelper = {
  get: (key: string) => {
    try {
      const serializedValue = localStorage.getItem(key);
      if (serializedValue === null) {
        return undefined;
      }
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error(`Error al obtener ${key} del localStorage:`, error);
      return undefined;
    }
  },

  set: (key: string, value: any) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error al establecer ${key} en el localStorage:`, error);
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error al eliminar ${key} del localStorage:`, error);
    }
  },

  getEmpresaId: () => {
    try {
      const serializedValue = localStorage.getItem("auth");
      if (serializedValue === null) return undefined;
      const auth = JSON.parse(serializedValue)
      return auth?.empresa_id;
    } catch (error) {
      console.error(`Error al obtener auth del localStorage:`, error);
      return undefined;
    }
  }

};