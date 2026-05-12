/**
 * Fallback rendered while a lazy route chunk loads. Visible for ~100–400 ms
 * on a fresh navigation to a route the user hasn't visited this session.
 * Deliberately minimal — a spinner that doesn't shift layout when the
 * actual page mounts.
 */
export default function RouteFallback() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-subtle, #888)",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
        fontSize: 14,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "2px solid var(--line, rgba(0,0,0,0.1))",
          borderTopColor: "var(--accent, #2563eb)",
          animation: "ct-spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes ct-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
