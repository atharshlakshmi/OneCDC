require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testReportAPI() {
  try {
    console.log('🔍 Testing Reports API...\n');

    // Step 1: Create a test user if doesn't exist
    console.log('1️⃣ Creating/logging in test user...');
    let token;

    try {
      // Try to register
      const registerResponse = await axios.post(`${API_URL}/auth/register/shopper`, {
        email: 'testreporter@example.com',
        password: 'Password123',
        name: 'Test Reporter',
        phone: '91234567'
      });
      token = registerResponse.data.token;
      console.log('✅ User created and logged in.\n');
    } catch (registerError) {
      // If user already exists, just login
      if (registerError.response && registerError.response.status === 400) {
        console.log('ℹ️  User already exists, logging in...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: 'testreporter@example.com',
          password: 'Password123'
        });
        token = loginResponse.data.token;
        console.log('✅ Login successful. Token obtained.\n');
      } else {
        throw registerError;
      }
    }

    // Step 2: Try to report a shop
    console.log('2️⃣ Testing shop report...');
    try {
      const shopReportResponse = await axios.post(
        `${API_URL}/reports/shop`,
        {
          shopId: '69027d4b579b2b73915252c6', // Use an existing shop ID from logs
          category: 'spam',
          description: 'This is a test report for a shop'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('✅ Shop report submitted successfully!');
      console.log('Response:', JSON.stringify(shopReportResponse.data, null, 2));
    } catch (shopError) {
      console.error('❌ Shop report failed:');
      if (shopError.response) {
        console.error('Status:', shopError.response.status);
        console.error('Error:', JSON.stringify(shopError.response.data, null, 2));
      } else {
        console.error('Error:', shopError.message);
      }
    }

    console.log('\n3️⃣ Testing review report...');
    try {
      // First, get a review ID
      const itemReviewsResponse = await axios.get(`${API_URL}/items/Espresso/reviews`);

      if (itemReviewsResponse.data && itemReviewsResponse.data.length > 0) {
        const reviewId = itemReviewsResponse.data[0].id;
        console.log(`Found review ID: ${reviewId}`);

        const reviewReportResponse = await axios.post(
          `${API_URL}/reports/review`,
          {
            reviewId: reviewId,
            category: 'spam',
            description: 'This is a test report for a review'
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log('✅ Review report submitted successfully!');
        console.log('Response:', JSON.stringify(reviewReportResponse.data, null, 2));
      } else {
        console.log('⚠️ No reviews found to test with');
      }
    } catch (reviewError) {
      console.error('❌ Review report failed:');
      if (reviewError.response) {
        console.error('Status:', reviewError.response.status);
        console.error('Error:', JSON.stringify(reviewError.response.data, null, 2));
      } else {
        console.error('Error:', reviewError.message);
      }
    }

    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testReportAPI();
