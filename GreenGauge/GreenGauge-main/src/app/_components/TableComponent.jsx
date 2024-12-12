"use client";

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

// Enhanced date formatting function
const readableDate = (timeStr) => {
  // Handle various time formats
  let date;
  
  // Try parsing the standard format first
  try {
    // Handle RFC3339 format (which is what your InfluxDB data uses)
    date = new Date(timeStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      // If invalid, try parsing other possible formats
      const timestamps = timeStr.match(/\d+/g);
      if (timestamps) {
        date = new Date(parseInt(timestamps[0]));
      } else {
        return 'Invalid Date';
      }
    }
  } catch (e) {
    return 'Invalid Date';
  }

  // Format the date using Intl.DateTimeFormat for better localization
  const formatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return formatter.format(date);
};

const TableComponent = ({data}) => {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Process and validate data
    const processedData = React.useMemo(() => {
        return data.map(row => ({
            ...row,
            Current: Number(row.Current || 0).toFixed(2),
            Voltage: Number(row.Voltage || 0).toFixed(2),
            Power: Number(row.Power || 0).toFixed(2),
            Time: row._time || row.Time || 'N/A'
        }));
    }, [data]);

    return (
        <div className='flex flex-col items-center justify-center mb-20 mt-10'>
            <h1 className='text-lg font-semibold mb-4'>Readings Table</h1>
            <Table sx={{ width: 650 }} aria-label="device readings table">
                <TableHead>
                    <TableRow>
                        <TableCell>Current&nbsp;(A)</TableCell>
                        <TableCell align="right">Voltage&nbsp;(V)</TableCell>
                        <TableCell align="right">Power&nbsp;(W)</TableCell>
                        <TableCell align="right">Time</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                {(rowsPerPage > 0
                    ? processedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : processedData
                ).map((row, id) => (
                    <TableRow
                        key={id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row">{row.Current}</TableCell>
                        <TableCell align="right">{row.Voltage}</TableCell>
                        <TableCell align="right">{row.Power}</TableCell>
                        <TableCell align="right">{readableDate(row.Time)}</TableCell>
                    </TableRow>
                ))}
                {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={4} />
                    </TableRow>
                )}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                            colSpan={4}
                            count={processedData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            slotProps={{
                                select: {
                                    inputProps: {
                                        'aria-label': 'rows per page',
                                    },
                                    native: true,
                                },
                            }}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            ActionsComponent={TablePaginationActions}
                        />
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
};

export default TableComponent;