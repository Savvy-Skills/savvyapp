export interface Column {
	Header: string;
	accessor: string;
  }
  
  export interface DataTableProps {
	data: any[];
	columns: Column[];
	name: string;
	headerColors?: string[];
	parentWidth?: number;
  }
  
  export interface TableDimensionsProps {
	screenWidth: number;
	screenHeight: number;
	columns: Column[];
  }
  
  export interface TableHeaderProps {
	columns: Column[];
	columnWidth: number;
	headerColors: string[];
  }
  
  export interface TableRowProps {
	item: any;
	columns: Column[];
	columnWidth: number;
  }
  
  