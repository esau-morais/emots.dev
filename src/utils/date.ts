const birthdayDate = new Date('2005-03-03T00:00:00-03:00')
export const currentAge =
  new Date(Date.now() - birthdayDate.getTime()).getFullYear() - 1970
