import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Edit, Trash2, Printer, RotateCcw, Save, X, Home, BarChart3, Calendar, Filter } from 'lucide-react';
import { supabase } from './supabaseClient';

const RestaurantPOS = () => {
  // States
  const [currentPage, setCurrentPage] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReportCategory, setSelectedReportCategory] = useState('all');
  const [editingItem, setEditingItem] = useState(null);

  // Menu data from database
  const [menuData, setMenuData] = useState([]);

  // Load data on component mount
  useEffect(() => {
    loadMenuData();
    loadOrderHistory();
  }, []);

  // Generate order ID in format yy-mm-running_number
  const generateOrderId = async () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = `${year}-${month}-`;
    
    // Get today's orders count
    const { data, error } = await supabase
      .from('orders')
      .select('order_id')
      .like('order_id', `${prefix}%`);
    
    if (error) {
      console.error('Error getting order count:', error);
      return `${prefix}001`;
    }
    
    const runningNumber = (data.length + 1).toString().padStart(3, '0');
    return `${prefix}${runningNumber}`;
  };

  // Load menu data from Supabase
  const loadMenuData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) {
        console.error('Error loading menu:', error);
        return;
      }
      
      setMenuData(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load order history from Supabase
  const loadOrderHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error loading orders:', error);
        return;
      }
      
      setOrderHistory(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Load reports data
  const loadReportsData = async (startDate, endDate, category = 'all') => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .order('timestamp', { ascending: false });
      
      if (startDate) {
        query = query.gte('timestamp', startDate);
      }
      if (endDate) {
        query = query.lte('timestamp', endDate + 'T23:59:59');
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading reports:', error);
        return;
      }
      
      let filteredData = data || [];
      
      if (category !== 'all') {
        filteredData = data.filter(order => 
          order.order_items.some(item => {
            const menuItem = menuData.find(m => m.name === item.item_name);
            return menuItem && menuItem.category === category;
          })
        );
      }
      
      setReportData(filteredData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate report summary
  const calculateReportSummary = () => {
    const totalSales = reportData.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = reportData.length;
    
    const categoryStats = {};
    
    reportData.forEach(order => {
      order.order_items.forEach(item => {
        const menuItem = menuData.find(m => m.name === item.item_name);
        if (menuItem) {
          const category = menuItem.category;
          if (!categoryStats[category]) {
            categoryStats[category] = { count: 0, total: 0 };
          }
          categoryStats[category].count += item.quantity;
          categoryStats[category].total += item.item_price * item.quantity;
        }
      });
    });
    
    return { totalSales, totalOrders, categoryStats };
  };

  // Fixed categories array to prevent re-render
  const categories = ['สลัดและอาหารเพื่อสุขภาพ', 'หมี่และเส้น', 'เครื่องดื่มเพื่อสุขภาพ', 'ขนมและของหวาน'];

  // Category colors
  const categoryColors = {
    'สลัดและอาหารเพื่อสุขภาพ': 'bg-emerald-500',
    'หมี่และเส้น': 'bg-orange-500',
    'เครื่องดื่มเพื่อสุขภาพ': 'bg-blue-500',
    'ขนมและของหวาน': 'bg-pink-500'
  };

  // Add to cart
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  // Update quantity
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Process order
  const processOrder = async () => {
    if (cart.length === 0) return;
    
    setLoading(true);
    try {
      const orderId = await generateOrderId();
      const total = calculateTotal();
      
      // Insert order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          total: total
        });
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        alert('เกิดข้อผิดพลาดในการบันทึกออร์เดอร์');
        return;
      }
      
      // Insert order items
      const orderItems = cart.map(item => ({
        order_id: orderId,
        item_name: item.name,
        item_price: item.price,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        alert('เกิดข้อผิดพลาดในการบันทึกรายการ');
        return;
      }
      
      // Clear cart and reload history
      setCart([]);
      loadOrderHistory();
      alert(`ออร์เดอร์ ${orderId} ได้รับการสั่งซื้อแล้ว!`);
    } catch (error) {
      console.error('Error processing order:', error);
      alert('เกิดข้อผิดพลาดในการสั่งอาหาร');
    } finally {
      setLoading(false);
    }
  };

  // Print order
  const printOrder = async () => {
    if (cart.length === 0) {
      alert('ไม่มีรายการในตะกร้า');
      return;
    }
    
    const orderId = await generateOrderId();
    const orderContent = `ครัวแม่กับป๋า
===================
ออร์เดอร์ ${orderId}
${new Date().toLocaleString('th-TH')}
===================

${cart.map(item => `${item.name} x${item.quantity} - ฿${item.price * item.quantity}`).join('\n')}

===================
รวมทั้งหมด: ฿${calculateTotal()}
===================`;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ใบเสร็จ - ครัวแม่กับป๋า</title>
          <style>
            body { font-family: 'Courier New', monospace; white-space: pre-line; margin: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${orderContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // Print receipt for specific order
  const printOrderReceipt = (order) => {
    const orderContent = `ครัวแม่กับป๋า
===================
ออร์เดอร์ ${order.order_id}
${new Date(order.timestamp).toLocaleString('th-TH')}
===================

${order.order_items.map(item => `${item.item_name} x${item.quantity} - ฿${item.item_price * item.quantity}`).join('\n')}

===================
รวมทั้งหมด: ฿${order.total}
===================`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ใบเสร็จ - ครัวแม่กับป๋า</title>
          <style>
            body { font-family: 'Courier New', monospace; white-space: pre-line; margin: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${orderContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const editItem = (item) => {
    setEditingItem(item);
    setCurrentPage('management');
  };

  const deleteItem = async (itemId) => {
    if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId);
      
      if (error) {
        console.error('Error deleting item:', error);
        alert('เกิดข้อผิดพลาดในการลบรายการ');
        return;
      }
      
      alert('ลบรายการเรียบร้อยแล้ว');
      loadMenuData(); // Reload menu data
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  // Main menu page
  const MenuPage = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดเมนู...</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {categories.map(category => (
          <div
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setCurrentPage('category');
            }}
            className={`${categoryColors[category]} text-white p-6 rounded-lg cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center text-center font-medium`}
          >
            {category}
          </div>
        ))}
      </div>
    );
  };

  // Category items page
  const CategoryPage = () => (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setCurrentPage('menu');
          }}
          className="mr-4 p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          ← กลับ
        </button>
        <h2 className="text-xl font-bold">{selectedCategory}</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {menuData
          .filter(item => item.category === selectedCategory)
          .map(item => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border shadow-sm"
            >
              {item.image && (
                <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!item.image && (
                <div className="w-full h-32 mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">🍽️</span>
                </div>
              )}
              <div className="text-center">
                <div className="font-medium text-sm mb-1">{item.name}</div>
                <div className="text-green-600 font-bold">฿{item.price}</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  // Management page with isolated form
  const ManagementPage = () => {
    const [formData, setFormData] = useState({
      name: editingItem?.name || '',
      category: editingItem?.category || '',
      price: editingItem?.price?.toString() || '',
      image: editingItem?.image || null
    });

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            image: event.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    };

    const saveItem = async () => {
      if (!formData.name || !formData.category || !formData.price) {
        alert('กรุณากรอกข้อมูลให้ครบ');
        return;
      }

      setLoading(true);
      try {
        const itemData = {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          image_url: formData.image
        };

        if (editingItem) {
          // Update existing item
          const { error } = await supabase
            .from('menu_items')
            .update(itemData)
            .eq('id', editingItem.id);
          
          if (error) {
            console.error('Error updating item:', error);
            alert('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
            return;
          }
          
          setEditingItem(null);
          alert('แก้ไขข้อมูลเรียบร้อยแล้ว');
        } else {
          // Insert new item
          const { error } = await supabase
            .from('menu_items')
            .insert(itemData);
          
          if (error) {
            console.error('Error adding item:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
            return;
          }
          
          alert('เพิ่มข้อมูลใหม่เรียบร้อยแล้ว');
        }
        
        setFormData({ name: '', category: '', price: '', image: null });
        loadMenuData(); // Reload menu data
      } catch (error) {
        console.error('Error saving item:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    const clearForm = () => {
      setFormData({ name: '', category: '', price: '', image: null });
      setEditingItem(null);
    };

    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">จัดการเมนู</h2>
        
        {/* Add/Edit Form */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-bold mb-3">
            {editingItem ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="ชื่ออาหาร"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="off"
            />
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">เลือกประเภท</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="ราคา"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
              step="0.01"
              autoComplete="off"
            />
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="p-2 border rounded w-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          {formData.image && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">ตัวอย่างรูปภาพ:</p>
              <img 
                src={formData.image} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={saveItem}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
            >
              <Save size={16} />
              {editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
            </button>
            <button
              onClick={clearForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
            >
              <X size={16} />
              ล้างฟอร์ม
            </button>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="mb-6">
              <h3 className={`text-lg font-bold mb-2 p-2 text-white rounded ${categoryColors[category]}`}>
                {category}
              </h3>
              <div className="space-y-2">
                {menuData
                  .filter(item => item.category === category)
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-lg">🍽️</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-green-600 font-bold ml-4">฿{item.price}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editItem(item)}
                          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Order history page
  const HistoryPage = () => (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">ประวัติออร์เดอร์</h2>
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      )}
      
      {!loading && orderHistory.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีประวัติออร์เดอร์</p>
      ) : (
        <div className="space-y-4">
          {orderHistory.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">ออร์เดอร์ {order.order_id}</h3>
                <span className="text-gray-500 text-sm">{new Date(order.timestamp).toLocaleString('th-TH')}</span>
              </div>
              <div className="space-y-1 mb-2">
                {order.order_items && order.order_items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.item_name} x{item.quantity}</span>
                    <span>฿{item.item_price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <button
                  onClick={() => printOrderReceipt(order)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1 text-sm"
                >
                  <Printer size={14} />
                  พิมพ์ใบเสร็จ
                </button>
                <span className="font-bold">รวม: ฿{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Reports page
  const ReportsPage = () => {
    const { totalSales, totalOrders, categoryStats } = calculateReportSummary();
    
    const handleDateRangeSubmit = () => {
      if (!dateRange.start || !dateRange.end) {
        alert('กรุณาเลือกช่วงวันที่');
        return;
      }
      loadReportsData(dateRange.start, dateRange.end, selectedReportCategory);
    };
    
    const setQuickDateRange = (type) => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      switch (type) {
        case 'today':
          setDateRange({ start: today, end: today });
          loadReportsData(today, today, selectedReportCategory);
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
          setDateRange({ start: weekAgo, end: today });
          loadReportsData(weekAgo, today, selectedReportCategory);
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split('T')[0];
          setDateRange({ start: monthAgo, end: today });
          loadReportsData(monthAgo, today, selectedReportCategory);
          break;
        default:
          break;
      }
    };
    
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">รายงานการขาย</h2>
        
        {/* Date Range Filters */}
        <div className="bg-white p-4 rounded-lg border mb-6">
          <h3 className="text-lg font-bold mb-3">กรองข้อมูล</h3>
          
          {/* Quick Date Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setQuickDateRange('today')}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
            >
              วันนี้
            </button>
            <button
              onClick={() => setQuickDateRange('week')}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
            >
              7 วันที่แล้ว
            </button>
            <button
              onClick={() => setQuickDateRange('month')}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
            >
              30 วันที่แล้ว
            </button>
          </div>
          
          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ประเภทอาหาร</label>
              <select
                value={selectedReportCategory}
                onChange={(e) => setSelectedReportCategory(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">ทั้งหมด</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDateRangeSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
            >
              <Filter size={16} />
              ค้นหา
            </button>
          </div>
        </div>
        
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        )}
        
        {/* Summary Cards */}
        {!loading && reportData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-green-800">ยอดขายรวม</h3>
              <p className="text-3xl font-bold text-green-600">฿{totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-blue-800">จำนวนออร์เดอร์</h3>
              <p className="text-3xl font-bold text-blue-600">{totalOrders} ออร์เดอร์</p>
            </div>
          </div>
        )}
        
        {/* Category Statistics */}
        {!loading && Object.keys(categoryStats).length > 0 && (
          <div className="bg-white p-4 rounded-lg border mb-6">
            <h3 className="text-lg font-bold mb-4">รายงานตามประเภท</h3>
            <div className="space-y-3">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <div key={category} className={`p-3 rounded ${categoryColors[category]} text-white`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category}</span>
                    <div className="text-right">
                      <div>{stats.count} รายการ</div>
                      <div className="font-bold">฿{stats.total.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!loading && reportData.length === 0 && (
          <p className="text-gray-500 text-center py-8">ไม่พบข้อมูลในช่วงที่ที่เลือก</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full mr-3 flex items-center justify-center">
              <span className="text-green-600 font-bold">👨‍🍳👩‍🍳</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">ครัวแม่กับป๋า</h1>
              <p className="text-sm opacity-90">ระบบจัดการหลังบ้าน</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {loading && <span className="text-sm">กำลังประมวลผล...</span>}
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1">
          {/* Navigation */}
          <div className="bg-white border-b p-2">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentPage('menu');
                  setSelectedCategory(null);
                }}
                className={`px-4 py-2 rounded flex items-center gap-2 ${currentPage === 'menu' || currentPage === 'category' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              >
                <Home size={16} />
                เมนูหลัก
              </button>
              <button
                onClick={() => setCurrentPage('management')}
                className={`px-4 py-2 rounded flex items-center gap-2 ${currentPage === 'management' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              >
                <Edit size={16} />
                จัดการเมนู
              </button>
              <button
                onClick={() => setCurrentPage('history')}
                className={`px-4 py-2 rounded flex items-center gap-2 ${currentPage === 'history' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              >
                <RotateCcw size={16} />
                ประวัติ
              </button>
              <button
                onClick={() => setCurrentPage('reports')}
                className={`px-4 py-2 rounded flex items-center gap-2 ${currentPage === 'reports' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              >
                <BarChart3 size={16} />
                รายงาน
              </button>
            </div>
          </div>

          {/* Page Content */}
          {(currentPage === 'menu' || currentPage === 'category') && !selectedCategory && <MenuPage />}
          {(currentPage === 'menu' || currentPage === 'category') && selectedCategory && <CategoryPage />}
          {currentPage === 'management' && <ManagementPage />}
          {currentPage === 'history' && <HistoryPage />}
          {currentPage === 'reports' && <ReportsPage />}
        </div>

        {/* Cart Sidebar */}
        <div className="w-80 bg-white border-l">
          <div className="p-4 border-b">
            <h3 className="font-bold flex items-center gap-2">
              <ShoppingCart size={18} />
              ตะกร้าสินค้า
            </h3>
          </div>
          
          <div className="p-4 flex-1 overflow-auto max-h-96">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">ยังไม่มีรายการ</p>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-green-600 font-bold">฿{item.price}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-gray-300 rounded text-xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-gray-300 rounded text-xs"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-6 h-6 bg-red-500 text-white rounded text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="p-4 border-t">
              <div className="text-xl font-bold mb-4 text-right">
                รวม: ฿{calculateTotal()}
              </div>
              <div className="space-y-2">
                <button
                  onClick={printOrder}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Printer size={16} />
                  พิมพ์ใบเสร็จ
                </button>
                <button
                  onClick={processOrder}
                  disabled={loading}
                  className={`w-full py-2 rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  {loading ? 'กำลังประมวลผล...' : 'สั่งอาหาร'}
                </button>
                <button
                  onClick={() => setCart([])}
                  className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  ล้างตะกร้า
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPOS;