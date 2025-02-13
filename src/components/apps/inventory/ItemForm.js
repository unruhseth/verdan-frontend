import React from 'react';
import { Form, Input, InputNumber, Button, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../../utils/api';

const ItemForm = ({ initialValues, onSuccess, mode }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values) => {
      // Transform form values to match backend expectations
      const payload = {
        ...values,
        cost_price: parseFloat(values.cost_price || 0),
        selling_price: parseFloat(values.selling_price || 0),
        quantity: parseInt(values.quantity || 0, 10),
        min_quantity: parseInt(values.min_quantity || 0, 10),
        reorder_point: parseInt(values.reorder_point || 0, 10),
        unit_type: values.unit_type || 'piece'
      };
      
      // Log the exact payload being sent
      console.log('Sending payload to backend:', JSON.stringify(payload, null, 2));
      
      const response = mode === 'create'
        ? await inventoryApi.createItem(payload)
        : await inventoryApi.updateItem(initialValues?.id, payload);
      
      console.log('Backend response:', response);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Mutation success:', data);
      queryClient.invalidateQueries(['inventory']);
      form.resetFields();
      message.success(`Item ${mode === 'create' ? 'created' : 'updated'} successfully`);
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Mutation error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      message.error(`Failed to ${mode === 'create' ? 'create' : 'update'} item: ${error.message}`);
    }
  });

  const handleSubmit = async (values) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
      onFinishFailed={(errorInfo) => {
        console.log('Form validation failed:', errorInfo);
      }}
    >
      <Form.Item
        name="name"
        label="Item Name"
        rules={[{ required: true, message: 'Please enter item name' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="sku"
        label="SKU"
        rules={[{ required: true, message: 'Please enter SKU' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="unit_type"
        label="Unit Type"
        rules={[{ required: true, message: 'Please enter unit type' }]}
        initialValue="piece"
      >
        <Input placeholder="e.g., piece, kg, liter" />
      </Form.Item>

      <Form.Item
        name="quantity"
        label="Quantity"
        rules={[{ required: true, message: 'Please enter quantity' }]}
        initialValue={0}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="min_quantity"
        label="Minimum Quantity"
        rules={[{ required: true, message: 'Please enter minimum quantity' }]}
        initialValue={0}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="reorder_point"
        label="Reorder Point"
        rules={[{ required: true, message: 'Please enter reorder point' }]}
        initialValue={0}
      >
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="cost_price"
        label="Cost Price"
        rules={[{ required: true, message: 'Please enter cost price' }]}
        initialValue={0}
      >
        <InputNumber
          min={0}
          step={0.01}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="selling_price"
        label="Selling Price"
        rules={[{ required: true, message: 'Please enter selling price' }]}
        initialValue={0}
      >
        <InputNumber
          min={0}
          step={0.01}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        name="location"
        label="Location"
      >
        <Input placeholder="e.g., Warehouse A" />
      </Form.Item>

      <Form.Item
        name="supplier"
        label="Supplier"
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={mutation.isPending}
          style={{ width: '100%' }}
        >
          {mode === 'create' ? 'Create Item' : 'Update Item'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ItemForm; 