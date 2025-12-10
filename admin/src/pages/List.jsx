import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

import { MaterialReactTable } from 'material-react-table';
import { Box, TextField } from '@mui/material';

const List = ({ token }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateStock = async (productId, color, size, newStock) => {
    try {
      const response = await axios.put(
        backendUrl + "/api/product/updateStock",
        { productId, color, size, stock: newStock },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Stock updated");
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: 'Image',
        enableColumnFilter: false,   // 🔥 Disable filter UI
        enableFilterMatchHighlighting: false,
        Cell: ({ row }) => (
          <img
            src={row.original.image[0]}
            alt=""
            style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
          />
        ),
        size: 80,
      },
      { accessorKey: 'name', header: 'Name', size: 180 },
      { accessorKey: 'category', header: 'Category', size: 120 },
      {
        accessorKey: 'price',
        header: 'Price',
        Cell: ({ cell }) => currency + cell.getValue(),
        size: 80,
      },
    ],
    []
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={list}
      enableSorting
      enableColumnFilters
      enablePagination
      enableBottomToolbar
      enableTopToolbar
      initialState={{ pagination: { pageSize: 10 } }}
      enableExpandAll={false}
      enableExpanding

      // DETAIL PANEL FOR STOCK MANAGEMENT
      renderDetailPanel={({ row }) => (
        <Box sx={{ padding: "16px", background: "#fafafa", borderRadius: 2 }}>
          <h3>Stock Management</h3>

          {row.original.colors?.map((colorObj, idx) => (
            <Box key={idx} sx={{ marginBottom: "16px" }}>
              <strong>{colorObj.color}</strong>

              {colorObj.sizes.map((sizeObj, sIndex) => (
                <Box
                  key={sIndex}
                  sx={{ display: "flex", gap: 2, alignItems: "center", marginTop: "8px", paddingLeft: "12px" }}
                >
                  <span>{sizeObj.size}</span>

                  <TextField
                    type="number"
                    size="small"
                    label="Stock"
                    value={sizeObj.stock}
                    onChange={(e) =>
                      updateStock(
                        row.original._id,
                        colorObj.color,
                        sizeObj.size,
                        Number(e.target.value)
                      )
                    }
                    sx={{ width: "90px" }}
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )}
    />
  );
};

export default List;
