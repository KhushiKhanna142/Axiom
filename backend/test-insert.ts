import 'dotenv/config';
import './src/config/env';
import { supabase } from './src/config/supabase';

async function test() {
  const { data, error } = await supabase.from('users').insert({
    username: 'test_user_2',
    email: 'test2@axiom.dev',
    password_hash: 'dummypass',
    role: 'member'
  }).select().single();
  
  if (error) {
    console.log('SUPABASE ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS:', data);
  }
}
test();
