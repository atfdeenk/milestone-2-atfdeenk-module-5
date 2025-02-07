export const generateRandomRating = () => {
  // Generate a random rating between 3.5 and 5.0
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
  
  // Generate a random number of reviews between 10 and 1000
  const reviews = Math.floor(Math.random() * 990) + 10;
  
  return {
    rating: parseFloat(rating),
    reviews
  };
};
