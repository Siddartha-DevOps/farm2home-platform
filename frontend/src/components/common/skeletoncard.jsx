// Usage: show while products are loading
export default function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gray-200 h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="bg-gray-200 rounded h-4 w-3/4" />
        <div className="bg-gray-200 rounded h-3 w-1/2" />
        <div className="flex justify-between items-center mt-2">
          <div className="bg-gray-200 rounded h-5 w-1/4" />
          <div className="bg-gray-200 rounded-lg h-9 w-28" />
        </div>
      </div>
    </div>
  );
}

// Usage in a product grid:
// {loading
//   ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
//   : products.map((p) => <ProductCard key={p._id} product={p} />)
// }
