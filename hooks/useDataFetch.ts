import { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

type DataFetchResult = {
  data: Record<string, any>[];
  columns: { Header: string; accessor: string; width: number }[];
  isLoading: boolean;
  error: Error | null;
};

export function useDataFetch(source: string, isCSV: boolean = true): DataFetchResult {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<{ Header: string; accessor: string; width: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [metadata, setMetadata] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(source, {
          responseType: isCSV ? 'text' : 'json'
        });

        if (isCSV) {
          Papa.parse(response.data, {
            header: true,
            complete: (result) => {
              setData(result.data as Record<string, any>[]);
              setColumns(
                Object.keys(result.data[0] as Record<string, any>).map((key) => ({
                  Header: key,
                  accessor: key,
                  width: key.length * 10,
                }))
              );
            },
          });
        } else {
          const jsonData = response.data;
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            setData(jsonData);
            setColumns(
              Object.keys(jsonData[0]).map((key) => ({
                Header: key,
                accessor: key,
                width: key.length * 10,
              }))
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [source, isCSV]);

  return { data, columns, isLoading, error };
}