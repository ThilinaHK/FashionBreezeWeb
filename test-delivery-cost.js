// Test script to verify delivery cost calculation
const testDeliveryCalculation = async () => {
  const baseUrl = 'http://localhost:3000';
  
  const testCases = [
    {
      name: 'Small order - Colombo',
      data: { subtotal: 2000, location: 'Colombo', items: [{}, {}] },
      expected: { deliveryCost: 300, total: 2300 }
    },
    {
      name: 'Free delivery threshold',
      data: { subtotal: 5000, location: 'Colombo', items: [{}, {}, {}] },
      expected: { deliveryCost: 0, total: 5000 }
    },
    {
      name: 'Remote area - Jaffna',
      data: { subtotal: 3000, location: 'Jaffna', items: [{}, {}] },
      expected: { deliveryCost: 600, total: 3600 }
    },
    {
      name: 'Very remote area - Mannar',
      data: { subtotal: 1500, location: 'Mannar', items: [{}] },
      expected: { deliveryCost: 800, total: 2300 }
    }
  ];
  
  console.log('Testing Delivery Cost Calculation...\n');
  
  for (const testCase of testCases) {
    try {
      const response = await fetch(`${baseUrl}/api/delivery/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.data)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${testCase.name}:`);
        console.log(`   Subtotal: LKR ${result.subtotal}`);
        console.log(`   Delivery: LKR ${result.deliveryCost}`);
        console.log(`   Total: LKR ${result.total}`);
        console.log(`   Message: ${result.deliveryMessage}`);
        
        if (result.remainingForFreeDelivery > 0) {
          console.log(`   Remaining for free delivery: LKR ${result.remainingForFreeDelivery}`);
        }
        
        console.log('');
      } else {
        console.log(`❌ ${testCase.name}: API request failed`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: ${error.message}`);
    }
  }
};

// Run the test if this script is executed directly
if (require.main === module) {
  testDeliveryCalculation().catch(console.error);
}

module.exports = { testDeliveryCalculation };