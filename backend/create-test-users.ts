import 'dotenv/config';
import './src/config/env';
import bcrypt from 'bcrypt';
import { supabase } from './src/config/supabase';
import { generateKeypair, encryptPrivateKey } from './src/crypto/e2ee';

async function create() {
  const users = [
    { username: 'alice', email: 'alice@axiom.dev', password: 'password123!' },
    { username: 'bob', email: 'bob@axiom.dev', password: 'password123!' }
  ];

  for (const u of users) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).single();
    if (existing) {
      console.log(`${u.username} already exists.`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 12);
    const kp = generateKeypair();
    const { encrypted, salt } = await encryptPrivateKey(kp.secretKey, u.password);
    
    const { error } = await supabase.from('users').insert({
      username: u.username,
      email: u.email,
      password_hash: hash,
      role: 'member',
      public_key: kp.publicKey,
      encrypted_private_key: encrypted,
      key_salt: salt,
    });
    
    if (error) {
      console.error(`Failed to create ${u.username}`, error);
    } else {
      console.log(`Successfully created ${u.username}`);
    }
  }
  process.exit(0);
}

create().catch(console.error);
