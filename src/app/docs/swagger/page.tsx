'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerDocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs/swagger')
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch((error) => {
        console.error('Error fetching Swagger spec:', error);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Teacher Management System API Docs</h1>
      {spec ? (
        <SwaggerUI spec={spec} />
      ) : (
        <p>Loading API documentation...</p>
      )}
    </div>
  );
} 