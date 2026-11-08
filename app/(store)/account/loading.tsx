export default function AccountLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-32 rounded-[1.2rem] bg-cream" />
        ))}
      </div>
      <div className="h-64 rounded-[1.4rem] bg-cream" />
      <div className="h-52 rounded-[1.4rem] bg-cream" />
    </div>
  );
}
