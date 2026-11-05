export default function ProductLoading() {
  return (
    <div className="container-wide py-10" aria-busy="true" aria-label="Loading product">
      <div className="skeleton h-3 w-72 rounded-full" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.14fr_0.86fr] lg:gap-12 xl:gap-16">
        <div>
          <div className="skeleton aspect-[4/5] rounded-[24px]" />
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton aspect-[4/5] rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="skeleton h-3 w-40 rounded-full" />
          <div className="skeleton h-14 w-4/5 rounded-xl" />
          <div className="skeleton h-4 w-52 rounded-full" />
          <div className="skeleton h-10 w-44 rounded-lg" />
          <div className="skeleton h-28 w-full rounded-xl" />
          <div className="skeleton h-12 w-full rounded-full" />
          <div className="skeleton h-12 w-full rounded-full" />
          <div className="skeleton h-36 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
