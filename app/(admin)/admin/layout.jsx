// app/(admin)/layout.jsx
export default function AdminGroupLayout({ children }) {
  // Keep this minimal; don’t import client-only stuff here.
  return <>{children}</>;
}
