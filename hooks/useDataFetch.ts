import { useState, useEffect } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { useDataStore } from '../store/dataStore';

type DataFetchResult = {
  data: Record<string, any>[];
  columns: Column[];
  isLoading: boolean;
  error: string | null;
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

interface DataFetchProps {
	source?: string;
	isCSV: boolean;
}

export function useDataFetch({ source, isCSV }: DataFetchProps): DataFetchResult {
  const { cache, setCache, getLoading, setLoading, getError, setError } = useDataStore();
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
	if (!source) {
		return;
	}
    const fetchData = async () => {
      try {
        setLoading(source, true);
        
        if (cache[source]) {
          // Use cached data
          setData(cache[source].data);
          setColumns(cache[source].columns);
          return;
        }

        const response = await axios.get(source, {
          responseType: isCSV ? 'text' : 'json'
        });

        const processData = (parsedData: Record<string, any>[]) => {
          const columns = Object.keys(parsedData[0]).map((key) => ({
            Header: key,
            accessor: key,
            dtype: getDtype(parsedData[0][key]),
            width: key.length * 10,
          }));
          
          setData(parsedData);
          setColumns(columns);
          setCache(source, { data: parsedData, columns });
        };

        if (isCSV) {
          Papa.parse(response.data, {
            header: true,
			skipEmptyLines: true,
			dynamicTyping: true,
            complete: (result) => processData(result.data as Record<string, any>[]),
          });
        } else {
          const jsonData = response.data;
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            processData(jsonData);
          }
        }
        
        setError(source, null);
      } catch (err) {
        setError(source, err instanceof Error ? err.message : 'An error occurred while fetching data');
      } finally {
        setLoading(source, false);
      }
    };

    fetchData();
  }, [source, isCSV, cache, setCache, setLoading, setError]);

  return { 
    data, 
    columns, 
    isLoading: getLoading(source || '') || false, 
    error: getError(source || '') 
  };
}