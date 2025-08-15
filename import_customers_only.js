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
          
          if (customers.length === 0) {
            console.log('No customers to import');
            resolve();
            return;
          }
          
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
    console.log('Starting customer import process...');
    
    // Import customers
    await importCustomers();
    
    console.log('Customer data imported successfully!');
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  main();
}