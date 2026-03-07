GRANT USAGE ON SCHEMA taskhub TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA taskhub TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA taskhub GRANT ALL ON TABLES TO anon, authenticated;
