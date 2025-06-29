import Link from 'next/link';

export default function DocsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Teacher Management System Documentation</h1>
      <p>Welcome to the API documentation.</p>
      <Link href="/docs/swagger" style={{ color: 'blue', textDecoration: 'underline' }}>
        View Swagger UI Documentation
      </Link>
    </div>
  );
} 