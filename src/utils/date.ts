import { differenceInYears } from "date-fns";
import { env } from "@/lib/env";

const birthdayDate = new Date("2005-03-03T00:00:00-03:00");
export const currentAge = differenceInYears(new Date(), birthdayDate);

export const currentCompany = env.NEXT_PUBLIC_CURRENT_COMPANY;
