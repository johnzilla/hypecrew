-- Messages table for real-time messaging between users
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Receivers can mark messages as read"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid())
  WITH CHECK (receiver_id = auth.uid());

-- Enable real-time for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Function to get conversations for a user
CREATE OR REPLACE FUNCTION get_conversations(user_uuid uuid)
RETURNS TABLE (
  other_user_id uuid,
  other_user_name text,
  last_message text,
  last_message_at timestamptz,
  unread boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH latest AS (
    SELECT DISTINCT ON (
      CASE WHEN sender_id = user_uuid THEN receiver_id ELSE sender_id END
    )
      CASE WHEN sender_id = user_uuid THEN receiver_id ELSE sender_id END AS other_id,
      content,
      created_at,
      CASE WHEN receiver_id = user_uuid AND NOT read THEN true ELSE false END AS is_unread
    FROM messages
    WHERE sender_id = user_uuid OR receiver_id = user_uuid
    ORDER BY
      CASE WHEN sender_id = user_uuid THEN receiver_id ELSE sender_id END,
      created_at DESC
  )
  SELECT
    l.other_id,
    COALESCE(p.full_name, p.email),
    l.content,
    l.created_at,
    l.is_unread
  FROM latest l
  JOIN profiles p ON p.id = l.other_id
  ORDER BY l.created_at DESC;
$$;
