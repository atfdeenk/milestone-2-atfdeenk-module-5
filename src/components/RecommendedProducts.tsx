import Link from 'next/link';
import Image from 'next/image';

const recommendedProducts = [
  {
    id: 108,
    name: "New Product Course",
    price: 999,
    image: "https://i.imgur.com/ZANVnHE.jpeg",
    category: "Electronics",
    rating: 4.8,
    reviews: 128
  },
  {
    id: 103,
    name: "Modern Furniture Set",
    price: 499,
    image: "https://i.imgur.com/Qphac99.jpeg",
    category: "Furniture",
    rating: 4.9,
    reviews: 256
  },
  {
    id: 104,
    name: "Casual Sneakers",
    price: 119.99,
    image: "https://i.imgur.com/qNOjJje.jpeg",
    category: "Shoes",
    rating: 4.7,
    reviews: 189
  },
  {
    id: 107,
    name: "Premium Collection",
    price: 123,
    image: "https://i.imgur.com/QkIa5tT.jpeg",
    category: "Clothes",
    rating: 4.6,
    reviews: 143
  }
];

export default function RecommendedProducts() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Recommended for You
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Handpicked products based on the latest trends and your interests
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {recommendedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">{product.category}</h3>
                <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{product.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    ${product.price}
                  </p>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      ({product.reviews})
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
