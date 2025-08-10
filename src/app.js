import React, { useState } from 'react';
import { ShoppingCart, Plus, Edit, Trash2, Printer, RotateCcw, Save, X, Home } from 'lucide-react';

const RestaurantPOS = () => {
  // States
  const [currentPage, setCurrentPage] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [orderNumber, setOrderNumber] = useState(1);
  const [editingItem, setEditingItem] = useState(null);

  // Sample menu data
  const [menuData, setMenuData] = useState([
    // สลัดและอาหารเพื่อสุขภาพ
    { id: 1, name: 'สลัดผักใสใส', category: 'สลัดและอาหารเพื่อสุขภาพ', price: 89, image: null },
    { id: 2, name: 'สลัดไก่ย่าง', category: 'สลัดและอาหารเพื่อสุขภาพ', price: 129, image: null },
    { id: 3, name: 'สลัดปลาแซลมอน', category: 'สลัดและอาหารเพื่อสุขภาพ', price: 189, image: null },
    { id: 4, name: 'สลัดซีซาร์', category: 'สลัดและอาหารเพื่อสุขภาพ', price: 109, image: null },
    { id: 5, name: 'โบวล์ควินัว', category: 'สลัดและอาหารเพื่อสุขภาพ', price: 149, image: null },

    // หมี่และเส้น
    { id: 6, name: 'หมี่คลุกไก่ฉีก', category: 'หมี่และเส้น', price: 69, image: null },
    { id: 7, name: 'หมี่คลุกหมูย่าง', category: 'หมี่และเส้น', price: 79, image: null },
    { id: 8, name: 'เส้นเล็กต้มยำ', category: 'หมี่และเส้น', price: 89, image: null },
    { id: 9, name: 'บะหมี่แห้งหมูแดง', category: 'หมี่และเส้น', price: 85, image: null },
    { id: 10, name: 'เกาเหลาไก่', category: 'หมี่และเส้น', price: 75, image: null },

    // เครื่องดื่มเพื่อสุขภาพ
    { id: 11, name: 'น้ำสับปะรดคั้นสด', category: 'เครื่องดื่มเพื่อสุขภาพ', price: 45, image: null },
    { id: 12, name: 'สมูทตี้มะม่วง', category: 'เครื่องดื่มเพื่อสุขภาพ', price: 59, image: null },
    { id: 13, name: 'น้ำดีท็อกซ์', category: 'เครื่องดื่มเพื่อสุขภาพ', price: 55, image: null },
    { id: 14, name: 'น้ำผักโขมมิกซ์', category: 'เครื่องดื่มเพื่อสุขภาพ', price: 65, image: null },
    { id: 15, name: 'ชาเขียวน้ำผึ้ง', category: 'เครื่องดื่มเพื่อสุขภาพ', price: 39, image: null },

    // ขนมและของหวาน
    { id: 16, name: 'เค้กกล้วยหอม', category: 'ขนมและของหวาน', price: 49, image: null },
    { id: 17, name: 'พุดดิ้งเชีย', category: 'ขนมและของหวาน', price: 55, image: null },
    { id: 18, name: 'โยเกิร์ตผลไม้', category: 'ขนมและของหวาน', price: 45, image: null },
    { id: 19, name: 'มูสช็อกโกแลต', category: 'ขนมและของหวาน', price: 65, image: null },
    { id: 20, name: 'พาร์เฟ่ผลไม้', category: 'ขนมและของหวาน', price: 59, image: null }
  ]);

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
  const processOrder = () => {
    if (cart.length === 0) return;
    
    const order = {
      id: orderNumber,
      items: [...cart],
      total: calculateTotal(),
      timestamp: new Date().toLocaleString('th-TH')
    };
    
    setOrderHistory([order, ...orderHistory]);
    setCart([]);
    setOrderNumber(orderNumber + 1);
    alert(`ออร์เดอร์ #${orderNumber} ได้รับการสั่งซื้อแล้ว!`);
  };

  // Print order (simulate)
  const printOrder = () => {
    if (cart.length === 0) {
      alert('ไม่มีรายการในตะกร้า');
      return;
    }
    
    const orderContent = `
ครัวแม่กับป๋า
===================
ออร์เดอร์ #${orderNumber}
${new Date().toLocaleString('th-TH')}
===================

${cart.map(item => `${item.name} x${item.quantity} - ฿${item.price * item.quantity}`).join('\n')}

===================
รวมทั้งหมด: ฿${calculateTotal()}
===================
    `;
    
    console.log(orderContent);
    alert('พิมพ์ใบเสร็จแล้ว (ดูใน Console)');
  };

  const editItem = (item) => {
    setEditingItem(item);
    setCurrentPage('management');
  };

  const deleteItem = (itemId) => {
    if (confirm('คุณต้องการลบรายการนี้หรือไม่?')) {
      setMenuData(menuData.filter(item => item.id !== itemId));
    }
  };

  // Main menu page
  const MenuPage = () => (
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

    const saveItem = () => {
      if (!formData.name || !formData.category || !formData.price) {
        alert('กรุณากรอกข้อมูลให้ครบ');
        return;
      }

      if (editingItem) {
        setMenuData(menuData.map(item => 
          item.id === editingItem.id 
            ? { 
                ...item, 
                name: formData.name, 
                category: formData.category, 
                price: parseFloat(formData.price), 
                image: formData.image 
              }
            : item
        ));
        setEditingItem(null);
      } else {
        const newId = Math.max(...menuData.map(item => item.id)) + 1;
        setMenuData([...menuData, {
          id: newId,
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          image: formData.image
        }]);
      }
      
      setFormData({ name: '', category: '', price: '', image: null });
      alert('บันทึกข้อมูลเรียบร้อยแล้ว');
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
      
      {orderHistory.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีประวัติออร์เดอร์</p>
      ) : (
        <div className="space-y-4">
          {orderHistory.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">ออร์เดอร์ #{order.id}</h3>
                <span className="text-gray-500 text-sm">{order.timestamp}</span>
              </div>
              <div className="space-y-1 mb-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>฿{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 font-bold text-right">
                รวม: ฿{order.total}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
            <span className="text-sm">ออร์เดอร์ถัดไป: #{orderNumber}</span>
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
                onClick={() => setCurrentPage('history')}
                className={`px-4 py-2 rounded flex items-center gap-2 ${currentPage === 'history' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              >
                <RotateCcw size={16} />
                ประวัติ
              </button>
            </div>
          </div>

          {/* Page Content */}
          {(currentPage === 'menu' || currentPage === 'category') && !selectedCategory && <MenuPage />}
          {(currentPage === 'menu' || currentPage === 'category') && selectedCategory && <CategoryPage />}
          {currentPage === 'management' && <ManagementPage />}
          {currentPage === 'history' && <HistoryPage />}
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
                  className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
                >
                  สั่งอาหาร
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

export default RestaurantPOS;('menu')}
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
                onClick={() => setCurrentPage