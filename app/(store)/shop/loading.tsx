export default function ShopLoading() {
  return (
    <div className="container-wide py-16">
      <div className="skeleton h-4 w-32 rounded-full" />
      <div className="skeleton mt-6 h-20 w-2/3 rounded-2xl" />
      <div className="mt-4 skeleton h-4 w-1/3 rounded-full" />
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item}>
            <div className="skeleton aspect-[4/5] rounded-[1.5rem]" />
            <div className="skeleton mt-4 h-4 w-3/4 rounded-full" />
            <div className="skeleton mt-2 h-3 w-1/3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
