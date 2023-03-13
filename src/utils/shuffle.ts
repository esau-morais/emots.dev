/**
 * Shuffles the items in an array randomly using the Fisher-Yates algorithm.
 *
 * @param array - The array to shuffle.
 * @returns A new array with the same items as the input array, but shuffled randomly.
 */
export const shuffleArray = <T>(array: T[]) => {
  let currentIndex = array.length,
    randomIndex: number

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // prettier-ignore
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

export const images = [
  'BlueLight.jpg',
  'GreenLight.jpg',
  'OrangeLight.jpg',
  'PinkLight.jpg',
]
