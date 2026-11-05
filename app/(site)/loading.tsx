export default function Loading() {
  return (
    <div className="container-luxe py-16">
      <div className="skeleton h-3 w-28 rounded-full" />
      <div className="skeleton mt-5 h-14 w-[min(70%,560px)] rounded-xl" />
      <div className="skeleton mt-3 h-3 w-[min(50%,380px)] rounded-full" />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="skeleton aspect-[3/4] rounded-2xl" />
            <div className="skeleton mt-3 h-3 w-2/3 rounded-full" />
            <div className="skeleton mt-2 h-3 w-1/3 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
