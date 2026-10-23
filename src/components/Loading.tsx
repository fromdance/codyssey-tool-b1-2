export function Loading({ message = '불러오는 중입니다.' }: { message?: string }) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p className="state__text">{message}</p>
    </div>
  );
}
