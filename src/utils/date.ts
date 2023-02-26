const birthdayDate = new Date('2005-03-03')

export const currentAge =
  new Date(Date.now() - birthdayDate.getTime()).getFullYear() - 1970
