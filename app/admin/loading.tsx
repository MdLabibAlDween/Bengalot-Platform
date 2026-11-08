export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-4 w-24 rounded-full" />
      <div className="skeleton h-12 w-2/3 rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="skeleton h-28 rounded-[1.2rem]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="skeleton h-80 rounded-[1.4rem]" />
        <div className="skeleton h-80 rounded-[1.4rem]" />
      </div>
    </div>
  );
}
