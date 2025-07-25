import { config } from 'dotenv';
import { textToSpeech } from '../services/geminiService';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envConfig = config({ path: envPath });
  if (envConfig.error) {
    console.warn('Warning: Failed to load .env.local file');
  }
}

// Set API key from GEMINI_API_KEY if not already set
if (!process.env.API_KEY && process.env.GEMINI_API_KEY) {
  process.env.API_KEY = process.env.GEMINI_API_KEY;
}

// Get the current module's directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testTTS(provider: 'google' | 'edge', text: string) {
  console.log(`Testing ${provider.toUpperCase()} TTS with text: "${text}"`);
  
  try {
    const startTime = Date.now();
    const result = await textToSpeech(text, {
      provider,
      google: {
        voice: 'en-US-Neural2-J',
        languageCode: 'en-US',
        speakingRate: 1.0,
        pitch: 0.0
      },
      edge: {
        voice: 'en-US-ChristopherNeural',
        rate: 1.0,
        pitch: '0Hz',
        volume: 1.0
      }
    });

    const duration = Date.now() - startTime;
    
    if (result.error) {
      console.error(`❌ ${provider.toUpperCase()} TTS Error:`, result.error);
      return;
    }

    if (!result.data) {
      console.error(`❌ ${provider.toUpperCase()} TTS returned no data`);
      return;
    }

    // Extract the base64 data
    const base64Data = result.data.split(';base64,').pop();
    if (!base64Data) {
      console.error(`❌ Failed to extract base64 data from ${provider} TTS response`);
      return;
    }

    // Save the audio file
    const extension = provider === 'google' ? 'mp3' : 'webm';
    const filename = `tts-${provider}-${Date.now()}.${extension}`;
    const filepath = join(__dirname, '..', 'test-output', filename);
    
    writeFileSync(filepath, base64Data, 'base64');
    
    console.log(`✅ ${provider.toUpperCase()} TTS Success!`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Audio saved to: ${filepath}`);
    
  } catch (error) {
    console.error(`❌ ${provider.toUpperCase()} TTS Exception:`, error);
  }
}

async function runTests() {
  const testTexts = [
    'Hello, this is a test of the text-to-speech service.',
    'The quick brown fox jumps over the lazy dog.',
    'This implementation supports multiple TTS providers.',
    'Testing with some special characters: 123!@#$%^&*()',
  ];

  const googleApiKey = process.env.API_KEY;
  
  for (const text of testTexts) {
    console.log('\n---\n');
    
    // Only test Google TTS if API key is available
    if (googleApiKey) {
      await testTTS('google', text);
    } else {
      console.log('Skipping Google TTS test (API_KEY not set)');
    }
    
    // Always test edge-tts as it doesn't require an API key
    await testTTS('edge', text);
  }
}

// Create test output directory if it doesn't exist
const testOutputDir = join(process.cwd(), 'test-output');
if (!existsSync(testOutputDir)) {
  mkdirSync(testOutputDir, { recursive: true });
}

// Run the tests
runTests().catch(console.error);
