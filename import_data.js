const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to import menu items from FoodMenuMaster.csv
async function importMenuItems() {
  console.log('Starting import of menu items...');
  const menuItems = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('FoodMenuMaster.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Skip empty rows
        if (!row.SKU || !row.Name) return;

        const menuItem = {
          handle: row.Handle || null,
          sku: row.SKU,
          name: row.Name,
          category: row.Category || 'ไม่ระบุ',
          description: row.Description || null,
          sold_by_weight: row['Sold by weight'] === 'TRUE' || false,
          option_1_name: row['Option 1 name'] || null,
          option_1_value: row['Option 1 value'] || null,
          option_2_name: row['Option 2 name'] || null,
          option_2_value: row['Option 2 value'] || null,
          option_3_name: row['Option 3 name'] || null,
          option_3_value: row['Option 3 value'] || null,
          cost: parseFloat(row.Cost) || 0,
          barcode: row.Barcode || null,
          sku_of_included_item: row['SKU of included item'] || null,
          quantity_of_included_item: parseInt(row['Quantity of included item']) || null,
          track_stock: row['Track stock'] === 'TRUE' || false,
          available_for_sale_organic: row['Available for sale [Organic]'] !== 'FALSE',
          price_organic: parseFloat(row['Price [Organic]']) || 0,
          in_stock_organic: parseInt(row['In stock [Organic]']) || 0,
          low_stock_organic: parseInt(row['Low stock [Organic]']) || 0
        };

        menuItems.push(menuItem);
      })
      .on('end', async () => {
        try {
          console.log(`Parsed ${menuItems.length} menu items from CSV`);
          
          // Insert data in batches to avoid timeout
          const batchSize = 50;
          for (let i = 0; i < menuItems.length; i += batchSize) {
            const batch = menuItems.slice(i, i + batchSize);
            const { data, error } = await supabase
              .from('menu_items')
              .insert(batch);

            if (error) {
              console.error('Error inserting menu items batch:', error);
              throw error;
            }
            console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(menuItems.length/batchSize)}`);
          }
          
          console.log('Successfully imported all menu items');
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Function to import customers from CustomerMaster.csv
async function importCustomers() {
  console.log('Starting import of customers...');
  const customers = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('CustomerMaster.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Handle BOM and skip empty rows
        const customerId = row['\ufeffCustomer ID'] || row['Customer ID'];
        const customerName = row['Customer name'];
        
        if (!customerId || !customerName) return;

        const customer = {
          customer_id: customerId,
          customer_name: customerName,
          email: row.Email || null,
          phone: row.Phone || null,
          address: row.Address || null,
          city: row.City || null,
          province: row.Province || null,
          postal_code: row['Postal code'] || null,
          country: row.Country || null,
          customer_code: row['Customer code'] || null,
          points_balance: parseInt(row['Points balance']) || 0,
          note: row.Note || null
        };

        customers.push(customer);
      })
      .on('end', async () => {
        try {
          console.log(`Parsed ${customers.length} customers from CSV`);
          
          // Insert data in batches to avoid timeout
          const batchSize = 50;
          for (let i = 0; i < customers.length; i += batchSize) {
            const batch = customers.slice(i, i + batchSize);
            const { data, error } = await supabase
              .from('customer_master')
              .insert(batch);

            if (error) {
              console.error('Error inserting customers batch:', error);
              throw error;
            }
            console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(customers.length/batchSize)}`);
          }
          
          console.log('Successfully imported all customers');
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Main function to run the import
async function main() {
  try {
    console.log('Starting data import process...');
    
    // Import menu items
    await importMenuItems();
    
    // Import customers
    await importCustomers();
    
    console.log('All data imported successfully!');
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { importMenuItems, importCustomers };