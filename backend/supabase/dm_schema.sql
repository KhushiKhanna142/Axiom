CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ciphertext TEXT NOT NULL,
  nonce TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX dm_sender_idx ON direct_messages(sender_id);
CREATE INDEX dm_recipient_idx ON direct_messages(recipient_id);

-- Instructions: Run this script in the Supabase SQL editor to enable the direct_messages table.
