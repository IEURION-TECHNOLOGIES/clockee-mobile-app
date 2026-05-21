// helpers/location.ts
import { City, Country, State } from "country-state-city";

export const countries = Country.getAllCountries();

export const getStates = (countryCode: string) => {
  return State.getStatesOfCountry(countryCode);
};

export const getCities = (countryCode: string, stateCode: string) => {
  return City.getCitiesOfState(countryCode, stateCode);
};
