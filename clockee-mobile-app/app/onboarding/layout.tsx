import { InstitutionFormProvider } from "@/context/InstitutionFormContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <InstitutionFormProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </InstitutionFormProvider>
  );
}
