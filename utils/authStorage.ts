import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "clockee_auth_user";

export const saveUser = async (user: any) => {
  await AsyncStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
};

export const getSavedUser = async () => {
  const data = await AsyncStorage.getItem(USER_KEY);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(
      "[AuthStorage] Failed parsing saved user:",
      error
    );

    return null;
  }
};

export const removeSavedUser = async () => {
  await AsyncStorage.removeItem(USER_KEY);
};
