const fs = require('fs');
const path = require('path');

// テスト用の小さなファイルを作成
const testFilePath = path.join(__dirname, 'test-file.txt');
fs.writeFileSync(testFilePath, 'This is a test file for upload testing.');

// FormDataでアップロードテスト
async function testUpload() {
  const FormData = require('form-data');
  const fetch = require('node-fetch');
  
  const form = new FormData();
  form.append('files', fs.createReadStream(testFilePath), 'test-file.txt');
  
  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form
    });
    
    const result = await response.json();
    console.log('Upload response:', JSON.stringify(result, null, 2));
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Upload test failed:', error);
  } finally {
    // テストファイルを削除
    fs.unlinkSync(testFilePath);
  }
}

testUpload();