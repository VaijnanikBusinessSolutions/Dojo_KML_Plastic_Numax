import socket
import threading
import json
import time
from datetime import datetime
import sqlite3


class EasyTestServer:
    def __init__(self, host='localhost', port=8888):
        self.host = host
        self.port = port
        self.server_socket = None
        self.clients = {}  # Store client connections and info
        self.running = False
        self.key_event_count = {}  # Track key events per client
        self.db_lock = threading.Lock()  # Thread-safe database access
        self.start_time = datetime.now()

        # Setup SQLite DB
        try:
            self.conn = sqlite3.connect('easytest_data.db', check_same_thread=False)
            self.cursor = self.conn.cursor()
            self._create_table()
            print("💾 Database initialized successfully")
        except sqlite3.Error as e:
            print(f"❌ Database initialization error: {e}")
            raise

    def _create_table(self):
        try:
            self.cursor.execute('''
                CREATE TABLE IF NOT EXISTS key_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_id TEXT NOT NULL,
                    base_id INTEGER,
                    remote_id INTEGER,
                    key_sn TEXT,
                    mode INTEGER,
                    response_info TEXT,
                    sdk_timestamp REAL,
                    client_timestamp TEXT,
                    event_type TEXT,
                    received_at TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            self.conn.commit()
        except sqlite3.Error as e:
            print(f"❌ Database table creation error: {e}")
            raise

    def start_server(self):
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                self.server_socket.bind((self.host, self.port))
            except OSError as e:
                if e.errno == 98:
                    print(f"❌ Port {self.port} is already in use. Please choose a different port or kill the existing process.")
                else:
                    print(f"❌ Failed to bind to {self.host}:{self.port}: {e}")
                raise

            self.server_socket.listen(5)
            self.running = True
            print(f"🚀 EasyTest Server started on {self.host}:{self.port}")
            print("📡 Waiting for client connections...")
            print("🔑 Only REAL hardware keypad events will be processed")

            while self.running:
                try:
                    self.server_socket.settimeout(1.0)
                    client_socket, client_address = self.server_socket.accept()
                    print(f"✅ New client connected: {client_address}")

                    client_thread = threading.Thread(
                        target=self.handle_client,
                        args=(client_socket, client_address),
                        daemon=True
                    )
                    client_thread.start()

                except socket.timeout:
                    continue
                except socket.error as e:
                    if self.running:
                        print(f"❌ Socket error: {e}")
                    break

        except Exception as e:
            print(f"❌ Server startup error: {e}")
        finally:
            self.stop_server()

    def handle_client(self, client_socket, client_address):
        client_id = f"{client_address[0]}:{client_address[1]}"
        self.clients[client_id] = {
            'socket': client_socket,
            'address': client_address,
            'connected_at': datetime.now(),
            'last_seen': datetime.now()
        }
        self.key_event_count[client_id] = 0
        print(f"🔗 Client {client_id} handler started")

        try:
            buffer = ""
            client_socket.settimeout(30.0)

            while self.running:
                try:
                    data = client_socket.recv(4096)
                    if not data:
                        print(f"🔌 Client {client_id} disconnected (no data)")
                        break
                    client_socket.settimeout(30.0)
                    try:
                        buffer += data.decode('utf-8')
                        while '\n' in buffer:
                            line, buffer = buffer.split('\n', 1)
                            if line.strip():
                                try:
                                    message = json.loads(line.strip())
                                    self.process_client_message(client_id, message)
                                except json.JSONDecodeError as e:
                                    print(f"⚠️  JSON decode error from {client_id}: {e} - Line: {line[:100]}...")
                        if buffer.strip() and '\n' not in buffer:
                            try:
                                message = json.loads(buffer.strip())
                                self.process_client_message(client_id, message)
                                buffer = ""
                            except json.JSONDecodeError:
                                if len(buffer) > 10000:
                                    print(f"⚠️  Buffer too large for {client_id}, clearing")
                                    buffer = ""
                    except UnicodeDecodeError as e:
                        print(f"❌ Unicode decode error from {client_id}: {e}")
                        buffer = ""
                except socket.timeout:
                    if not self.running:
                        break
                    print(f"⏰ Timeout waiting for data from {client_id}")
                    try:
                        ping_msg = json.dumps({'type': 'ping', 'timestamp': time.time()}) + '\n'
                        client_socket.send(ping_msg.encode('utf-8'))
                    except:
                        print(f"💔 Client {client_id} appears disconnected")
                        break
                except socket.error as e:
                    print(f"❌ Socket error with client {client_id}: {e}")
                    break
                except Exception as e:
                    print(f"❌ Unexpected error processing message from {client_id}: {e}")
        except Exception as e:
            print(f"❌ Client {client_id} handler error: {e}")
        finally:
            self.disconnect_client(client_id)

    def process_client_message(self, client_id, message):
        try:
            if not isinstance(message, dict):
                print(f"⚠️  Invalid message format from {client_id}: not a dictionary")
                return

            msg_type = message.get('type', 'unknown')
            if client_id in self.clients:
                self.clients[client_id]['last_seen'] = datetime.now()

            if msg_type != 'heartbeat':
                print(f"📨 [{client_id}] Message Type: {msg_type}")

            handler_map = {
                'connect_event': self.handle_connect_event,
                'vote_event': self.handle_vote_event,
                'key_event': self.handle_key_event,
                'hd_param_event': self.handle_hd_param_event,
                'keypad_param_event': self.handle_keypad_param_event,
                'heartbeat': self.handle_heartbeat,
                'pong': self.handle_pong
            }

            handler = handler_map.get(msg_type)
            if handler:
                handler(client_id, message)
            else:
                print(f"⚠️  Unknown message type from {client_id}: {msg_type}")

        except Exception as e:
            print(f"❌ Error processing message from {client_id}: {e}")

    def handle_connect_event(self, client_id, message):
        try:
            data = message.get('data', {})
            print(f"🔌 [{client_id}] Device Connection Event:")
            print(f"   - Base ID: {data.get('base_id')}")
            print(f"   - Mode: {data.get('mode')}")
            print(f"   - Info: {data.get('info')}")
            print(f"   - Remote Client: {client_id}")

            info = data.get('info', '')
            if info == "1":
                print(f"✅ [{client_id}] Device successfully connected and ready!")
            elif info == "2":
                print(f"⚠️  [{client_id}] Device connection in progress")
            else:
                print(f"ℹ️  [{client_id}] Device connection status: {info}")

        except Exception as e:
            print(f"❌ Error handling connect event from {client_id}: {e}")

    def handle_vote_event(self, client_id, message):
        try:
            data = message.get('data', {})
            print(f"🗳️  [{client_id}] Vote Event:")
            print(f"   - Base ID: {data.get('base_id')}")
            print(f"   - Mode: {data.get('mode')}")
            print(f"   - Info: {data.get('info')}")
            print(f"   - Remote Client: {client_id}")
        except Exception as e:
            print(f"❌ Error handling vote event from {client_id}: {e}")

    def handle_key_event(self, client_id, message):
        try:
            data = message.get('data', {})

            event_type = data.get('event_type', '')
            if event_type != 'real_hardware':
                print(f"⚠️  [{client_id}] Ignoring non-hardware key event (type: {event_type})")
                return

            key_id = data.get('key_id')
            key_sn = data.get('key_sn', '').strip()
            info = data.get('info', '').strip()

            if key_id is None:
                print(f"⚠️  [{client_id}] Ignoring invalid key event - missing key_id")
                return

            if not key_sn:
                print(f"⚠️  [{client_id}] Warning: key_sn is empty for key_id {key_id}")

            self.key_event_count[client_id] = self.key_event_count.get(client_id, 0) + 1

            print(f"🔑 [{client_id}] REAL HARDWARE Key Event #{self.key_event_count[client_id]}:")
            print(f"   - Base ID: {data.get('base_id')}")
            print(f"   - Key ID (Remote ID): {key_id}")
            print(f"   - Key SN (Remote Serial): {key_sn}")
            print(f"   - Mode: {data.get('mode')}")
            print(f"   - SDK Timestamp: {data.get('timestamp')}")
            print(f"   - Response Info: '{info}'")
            print(f"   - Client Timestamp: {data.get('client_timestamp')}")
            print(f"   - Remote Client: {client_id}")
            print(f"   - Event Type: {event_type}")

            self.store_key_response(client_id, data)

        except Exception as e:
            print(f"❌ Error handling key event from {client_id}: {e}")

    def handle_hd_param_event(self, client_id, message):
        try:
            data = message.get('data', {})
            print(f"📺 [{client_id}] HD Param Event:")
            print(f"   - Base ID: {data.get('base_id')}")
            print(f"   - Mode: {data.get('mode')}")
            print(f"   - Info: {data.get('info')}")
            print(f"   - Remote Client: {client_id}")
        except Exception as e:
            print(f"❌ Error handling HD param event from {client_id}: {e}")

    def handle_keypad_param_event(self, client_id, message):
        try:
            data = message.get('data', {})
            print(f"⌨️  [{client_id}] Keypad Param Event:")
            print(f"   - Base ID: {data.get('base_id')}")
            print(f"   - Key ID: {data.get('key_id')}")
            print(f"   - Key SN: {data.get('key_sn')}")
            print(f"   - Mode: {data.get('mode')}")
            print(f"   - Info: {data.get('info')}")
            print(f"   - Remote Client: {client_id}")
        except Exception as e:
            print(f"❌ Error handling keypad param event from {client_id}: {e}")

    def handle_heartbeat(self, client_id, message):
        try:
            if int(time.time()) % 60 == 0:
                print(f"💓 [{client_id}] Heartbeat active")
        except Exception as e:
            print(f"❌ Error handling heartbeat from {client_id}: {e}")

    def handle_pong(self, client_id, message):
        try:
            print(f"🏓 [{client_id}] Pong received - client is alive")
        except Exception as e:
            print(f"❌ Error handling pong from {client_id}: {e}")

    def store_key_response(self, client_id, data):
        try:
            response_data = {
                'client_id': client_id,
                'remote_id': data.get('key_id'),
                'response_info': data.get('info'),
                'sdk_timestamp': data.get('timestamp'),
                'client_timestamp': data.get('client_timestamp'),
                'event_type': data.get('event_type'),
                'mode': data.get('mode'),
                'base_id': data.get('base_id'),
                'received_at': datetime.now().isoformat(),
                'event_number': self.key_event_count.get(client_id, 0)
            }

            with self.db_lock:
                try:
                    self.cursor.execute('''
                        INSERT INTO key_events (
                            client_id, base_id, remote_id, key_sn, mode, response_info,
                            sdk_timestamp, client_timestamp, event_type, received_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        response_data['client_id'],
                        response_data['base_id'],
                        response_data['remote_id'],
                        data.get('key_sn', ''),
                        response_data['mode'],
                        response_data['response_info'],
                        response_data['sdk_timestamp'],
                        response_data['client_timestamp'],
                        response_data['event_type'],
                        response_data['received_at']
                    ))
                    self.conn.commit()
                    print(f"💾 Stored REAL hardware response #{response_data['event_number']} into DB")
                except sqlite3.Error as e:
                    print(f"❌ DB insert error: {e}")
                    self._reconnect_database()

            return response_data

        except Exception as e:
            print(f"❌ Error storing key response: {e}")
            return None

    def _reconnect_database(self):
        try:
            print("🔄 Attempting to reconnect to database...")
            if hasattr(self, 'conn'):
                self.conn.close()

            self.conn = sqlite3.connect('easytest_data.db', check_same_thread=False)
            self.cursor = self.conn.cursor()
            print("✅ Database reconnected successfully")
        except sqlite3.Error as e:
            print(f"❌ Database reconnection failed: {e}")

    def send_to_client(self, client_id, message):
        if client_id not in self.clients:
            print(f"⚠️  Client {client_id} not found")
            return False

        try:
            client_socket = self.clients[client_id]['socket']
            message_json = json.dumps(message) + '\n'
            client_socket.send(message_json.encode('utf-8'))
            print(f"📤 Sent to {client_id}: {message['type']}")
            return True
        except socket.error as e:
            print(f"❌ Failed to send to {client_id}: {e}")
            self.disconnect_client(client_id)
            return False
        except Exception as e:
            print(f"❌ Unexpected error sending to {client_id}: {e}")
            return False

    def broadcast_to_clients(self, message):
        success_count = 0
        client_list = list(self.clients.keys())

        for client_id in client_list:
            if self.send_to_client(client_id, message):
                success_count += 1

        print(f"📡 Broadcast sent to {success_count}/{len(client_list)} clients")
        return success_count

    def send_vote_command(self, client_id=None, action='start_vote', base_id=0):
        try:
            valid_actions = ['start_vote', 'stop_vote', 'reset_vote']
            if action not in valid_actions:
                print(f"⚠️  Invalid vote action: {action}")
                return False

            command = {
                'type': 'command',
                'action': action,
                'params': {
                    'base_id': base_id,
                    'vote_type': 10 if action == 'start_vote' else None,
                    'config': "1,1,0,0,4,1" if action == 'start_vote' else None
                }
            }

            if client_id:
                return self.send_to_client(client_id, command)
            else:
                return self.broadcast_to_clients(command) > 0

        except Exception as e:
            print(f"❌ Error sending vote command: {e}")
            return False

    def disconnect_client(self, client_id):
        if client_id not in self.clients:
            return

        try:
            try:
                self.clients[client_id]['socket'].close()
            except Exception as e:
                print(f"⚠️  Error closing socket for {client_id}: {e}")

            try:
                del self.clients[client_id]
            except KeyError:
                pass

            if client_id in self.key_event_count:
                total_events = self.key_event_count[client_id]
                del self.key_event_count[client_id]
                print(f"🔌 Client {client_id} disconnected (processed {total_events} real key events)")
            else:
                print(f"🔌 Client {client_id} disconnected")

        except Exception as e:
            print(f"❌ Error during client cleanup for {client_id}: {e}")

    def get_connected_clients(self):
        try:
            return {
                client_id: {
                    'address': info['address'],
                    'connected_at': info['connected_at'].isoformat(),
                    'last_seen': info['last_seen'].isoformat(),
                    'key_events_processed': self.key_event_count.get(client_id, 0)
                }
                for client_id, info in self.clients.items()
            }
        except Exception as e:
            print(f"❌ Error getting client info: {e}")
            return {}

    def get_statistics(self):
        try:
            total_key_events = sum(self.key_event_count.values())
            uptime = datetime.now() - self.start_time
            return {
                'connected_clients': len(self.clients),
                'total_key_events_processed': total_key_events,
                'key_events_per_client': dict(self.key_event_count),
                'server_uptime': str(uptime),
                'clients': self.get_connected_clients()
            }
        except Exception as e:
            print(f"❌ Error getting statistics: {e}")
            return {
                'connected_clients': 0,
                'total_key_events_processed': 0,
                'error': str(e)
            }

    def stop_server(self):
        print("🛑 Stopping server...")
        self.running = False

        try:
            if hasattr(self, 'conn'):
                self.conn.close()
                print("💾 Database connection closed")
        except Exception as e:
            print(f"⚠️  Error closing database: {e}")

        try:
            stats = self.get_statistics()
            print(f"📊 Final Statistics:")
            print(f"   - Total clients served: {stats.get('connected_clients', 0)}")
            print(f"   - Total real key events processed: {stats.get('total_key_events_processed', 0)}")
        except Exception as e:
            print(f"⚠️  Error printing final statistics: {e}")

        client_list = list(self.clients.keys())
        for client_id in client_list:
            try:
                self.disconnect_client(client_id)
            except Exception as e:
                print(f"⚠️  Error disconnecting client {client_id}: {e}")

        if self.server_socket:
            try:
                self.server_socket.close()
                print("🔌 Server socket closed")
            except Exception as e:
                print(f"⚠️  Error closing server socket: {e}")

        print("✅ Server stopped")


def main():
    server = None
    try:
        server = EasyTestServer(host='0.0.0.0', port=8888)

        print("🚀 Starting EasyTest Socket Server...")
        print(f"   - Server will listen on {server.host}:{server.port}")
        print("   - Clients can connect from any network")
        print("   - Only REAL hardware keypad events will be processed")
        print("   - Press Ctrl+C to stop the server\n")

        server.start_server()

    except KeyboardInterrupt:
        print("\n🛑 Received shutdown signal (Ctrl+C)")
    except Exception as e:
        print(f"❌ Fatal server error: {e}")
    finally:
        if server:
            try:
                server.stop_server()
            except Exception as e:
                print(f"⚠️  Error during server shutdown: {e}")


if __name__ == '__main__':
    main()
