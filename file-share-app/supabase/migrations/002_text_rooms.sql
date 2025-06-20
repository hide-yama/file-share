-- Create text_rooms table for real-time text sharing
CREATE TABLE IF NOT EXISTS text_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT UNIQUE NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Create index for room_id
CREATE INDEX idx_text_rooms_room_id ON text_rooms(room_id);

-- Create index for expires_at
CREATE INDEX idx_text_rooms_expires_at ON text_rooms(expires_at);

-- Enable Row Level Security
ALTER TABLE text_rooms ENABLE ROW LEVEL SECURITY;

-- Create policy for reading (anyone can read if they know the room_id)
CREATE POLICY "Anyone can read text rooms" ON text_rooms
  FOR SELECT USING (true);

-- Create policy for inserting (anyone can create a room)
CREATE POLICY "Anyone can create text rooms" ON text_rooms
  FOR INSERT WITH CHECK (true);

-- Create policy for updating (anyone can update if they know the room_id)
CREATE POLICY "Anyone can update text rooms" ON text_rooms
  FOR UPDATE USING (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE text_rooms;