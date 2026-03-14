import 'dotenv/config';
import './config/env';
import bcrypt from 'bcrypt';
import { supabase } from './config/supabase';
import { env } from './config/env';

async function seed() {
  console.log('Seeding Axiom database...');

  // Create superadmin
  const hash = await bcrypt.hash(env.SUPERADMIN_PASSWORD, 12);
  const { data: existing } = await supabase.from('users').select('id').eq('email', env.SUPERADMIN_EMAIL).single();
  let adminId: string;

  if (existing) {
    adminId = existing.id;
    console.log('Superadmin already exists:', adminId);
  } else {
    const { data: admin, error } = await supabase.from('users').insert({
      username: env.SUPERADMIN_USERNAME,
      email: env.SUPERADMIN_EMAIL,
      password_hash: hash,
      role: 'superadmin',
    }).select().single();
    if (error || !admin) {
      console.error('Failed to create superadmin:', error);
      process.exit(1);
    }
    adminId = admin.id;
    console.log('Created superadmin:', adminId);
  }

  // Create default rooms
  const defaultRooms = ['general', 'engineering', 'announcements'];
  for (const name of defaultRooms) {
    const { data: exists } = await supabase.from('rooms').select('id').eq('name', name).single();
    if (exists) {
      console.log(`Room #${name} already exists`);
      continue;
    }
    const { data: room } = await supabase.from('rooms').insert({
      name,
      description: `#${name} channel`,
      created_by: adminId,
    }).select().single();
    if (room) {
      await supabase.from('room_members').insert({
        room_id: room.id,
        user_id: adminId,
        local_role: 'owner',
      });
      console.log(`Created room #${name}:`, room.id);
    }
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
