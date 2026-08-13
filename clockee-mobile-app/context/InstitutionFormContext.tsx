import { createContext, useContext, useState } from "react";

const InstitutionFormContext = createContext<any>(undefined);

export const InstitutionFormProvider = ({ children }: any) => {
  const [form, setForm] = useState({
    basic: {
      institutionName: "",
      institutionType: "",
    },
    location: {
      country: null,
      state: null,
      city: null,
    },
    contact: {
      email: "",
      phone: "",
      address: "",
    },

  });

  // ✅ SAFE UPDATE (no data loss)
  const updateForm = (section: string, data: any) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }));
  };

  const resetForm = () => {
    setForm({
      basic: {
        institutionName: "",
        institutionType: "",
      },
      location: {
        country: null,
        state: null,
        city: null,
      },
      contact: {
        email: "",
        phone: "",
        address: "",
      }
    });
  };

  return (
    <InstitutionFormContext.Provider
      value={{ form, updateForm, resetForm }}
    >
      {children}
    </InstitutionFormContext.Provider>
  );
};

export const useInstitutionForm = () => {
  const ctx = useContext(InstitutionFormContext);
  if (!ctx) {
    throw new Error(
      "useInstitutionForm must be used inside InstitutionFormProvider"
    );
  }
  return ctx;
};
