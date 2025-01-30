import React, { useEffect, useState } from "react";
import { httpClient } from "../lib/api-client";

const TestPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    httpClient.testApi().then((data) => {
      setLoading(false);
      if (data.error) {
        setError(data.error);
        return;
      }
      setData(data.data);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Test API Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestPage;
