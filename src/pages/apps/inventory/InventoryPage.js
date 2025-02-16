import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, message, Popconfirm, Space, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ItemForm from '../../../components/apps/inventory/ItemForm';
import api, { inventoryApi } from '../../../utils/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Consider data stale immediately
      cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
      refetchOnWindowFocus: true, // Refetch when window regains focus
      retry: 1
    },
  },
});

// Wrap the main component with QueryClientProvider
const InventoryPageWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <InventoryPage />
  </QueryClientProvider>
);

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();

  // Use a constant for the query key
  const INVENTORY_QUERY_KEY = ['inventory'];

  const { data: items = [], isLoading } = useQuery({
    queryKey: INVENTORY_QUERY_KEY,
    queryFn: async () => {
      const response = await inventoryApi.getItems();
      return response.data;
    },
    onError: (error) => {
      console.error('Error fetching inventory:', error);
      message.error('Failed to load inventory items');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => inventoryApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(INVENTORY_QUERY_KEY);
      message.success('Item deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      message.error('Failed to delete item');
    }
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    // Force a refetch of the inventory data
    queryClient.invalidateQueries(INVENTORY_QUERY_KEY);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Unit Price',
      dataIndex: 'selling_price',
      key: 'selling_price',
      render: (price) => `$${parseFloat(price).toFixed(2)}`,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingItem(record);
              setIsModalOpen(true);
            }}
          />
          <Popconfirm
            title="Delete item"
            description="Are you sure you want to delete this item?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Inventory Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddItem}
          >
            Add Item
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={items}
          loading={isLoading}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
      >
        <ItemForm
          mode={editingItem ? 'edit' : 'create'}
          initialValues={editingItem}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  );
};

export default InventoryPageWrapper;