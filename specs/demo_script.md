# Demo Script

## Database Schema for the table `script`
- id: integer
- created_at: current time/date
- type: string that's one of the following: chat_message, query
- author: string
- query: string
- response: string

## For chat messages, rows will look this:
- id: (some number)
- created_at: (current time/date)
- type: chat_message
- author: "cuong"
- response: "cool demo!!"

## For SQL queries:
- id: (some number)
- created_at: (current time/date)
- author: null
- query: "SELECT * FROM users"
- response: " id | username |         created_at         \n----+----------+----------------------------\n  1 | cuong    | 2025-09-12 14:23:45.123456\n(1 row)\n"