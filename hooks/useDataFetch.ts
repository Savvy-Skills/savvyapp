import { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

type DataFetchResult = {
  data: Record<string, any>[];
  columns: Column[];
  isLoading: boolean;
  error: Error | null;
};

export interface Column {
	Header: string;
	accessor: string;
	dtype: string;
	width: number;
}

const getDtype = (value: any) => {
	if (typeof value === "number") {
		return "number";
	} else if (typeof value === "string") {
		return "string";
	} else if (typeof value === "boolean") {
		return "boolean";
	} else if (typeof value === "object") {
		return "object";
	}
	return "unknown";
};

export function useDataFetch(source: string, isCSV: boolean = true): DataFetchResult {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
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
              const parsedData = result.data as Record<string, any>[];
              setData(parsedData);

              setColumns(
                Object.keys(parsedData[0]).map((key) => ({
                  Header: key,
                  accessor: key,
                  dtype: getDtype(parsedData[0][key]),
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
                dtype: getDtype(jsonData[0][key]),
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