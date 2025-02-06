import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    id: 1,
    name: "Men's Fashion",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e",
    slug: "mens-fashion",
    itemCount: "2,000+ items"
  },
  {
    id: 2,
    name: "Women's Fashion",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
    slug: "womens-fashion",
    itemCount: "3,500+ items"
  },
  {
    id: 3,
    name: "Accessories",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49",
    slug: "accessories",
    itemCount: "1,500+ items"
  },
  {
    id: 4,
    name: "Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    slug: "shoes",
    itemCount: "1,000+ items"
  },
  {
    id: 5,
    name: "Sports & Active Wear",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    slug: "sports-active-wear",
    itemCount: "800+ items"
  },
  {
    id: 6,
    name: "Beauty & Care",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    slug: "beauty-care",
    itemCount: "1,200+ items"
  }
];

export default function ProductCategories() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Explore our wide range of categories and find exactly what you're looking for
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-w-3 aspect-h-2">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={600}
                  height={400}
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                <p className="mt-1 text-sm text-gray-300">{category.itemCount}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
