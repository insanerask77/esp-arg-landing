#!/usr/bin/env python3
"""Backend de España vs Argentina — Final Mundial 2026.

Sirve el sitio estático (index.html, css/, js/, img/) y una API JSON
mínima respaldada por SQLite para comentarios y el voto de "quién gana"
(con el porcentaje de la afición que vota a cada equipo o empate). Solo
librería estándar de Python: sin pip install, sin frameworks.

IMPORTANTE: hay que ejecutar este archivo (`python3 server/app.py`), no
`python3 -m http.server` — el módulo genérico de Python no sabe nada de
las rutas /api/comments ni /api/vote, así que los POST fallarían.
"""

import json
import re
import sqlite3
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse, parse_qs

from profanity import contains_profanity

ROOT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = Path(__file__).resolve().parent / "data.db"
PORT = int(__import__("os").environ.get("PORT", 8000))

CLIENT_ID_RE = re.compile(r"^[A-Za-z0-9_-]{8,64}$")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                text TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS votes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id TEXT NOT NULL UNIQUE,
                pick TEXT NOT NULL CHECK (pick IN ('esp', 'arg', 'tie')),
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        """)


def list_comments(limit=50):
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, name, text, created_at AS at FROM comments ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]


def insert_comment(name, text):
    now = int(time.time() * 1000)
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO comments (name, text, created_at) VALUES (?, ?, ?)",
            (name, text, now),
        )
        row_id = cur.lastrowid
    return {"id": row_id, "name": name, "text": text, "at": now}


def vote_stats(conn):
    row = conn.execute("""
        SELECT
            SUM(CASE WHEN pick = 'esp' THEN 1 ELSE 0 END) AS esp_votes,
            SUM(CASE WHEN pick = 'arg' THEN 1 ELSE 0 END) AS arg_votes,
            SUM(CASE WHEN pick = 'tie' THEN 1 ELSE 0 END) AS tie_votes,
            COUNT(*) AS total
        FROM votes
    """).fetchone()
    total = row["total"] or 0
    esp_votes = row["esp_votes"] or 0
    arg_votes = row["arg_votes"] or 0
    tie_votes = row["tie_votes"] or 0
    if total == 0:
        return {"espPct": 0, "argPct": 0, "tiePct": 0, "total": 0}
    return {
        "espPct": round(esp_votes * 100 / total, 1),
        "argPct": round(arg_votes * 100 / total, 1),
        "tiePct": round(tie_votes * 100 / total, 1),
        "total": total,
    }


def get_vote_payload(client_id):
    with get_db() as conn:
        mine = None
        if client_id:
            row = conn.execute(
                "SELECT pick FROM votes WHERE client_id = ?", (client_id,)
            ).fetchone()
            if row:
                mine = row["pick"]
        stats = vote_stats(conn)
    return {"mine": mine, "stats": stats}


def upsert_vote(client_id, pick):
    now = int(time.time() * 1000)
    with get_db() as conn:
        conn.execute("""
            INSERT INTO votes (client_id, pick, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(client_id) DO UPDATE SET pick = excluded.pick, updated_at = excluded.updated_at
        """, (client_id, pick, now, now))
        stats = vote_stats(conn)
    return {"mine": pick, "stats": stats}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def log_message(self, fmt, *args):
        pass

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/comments":
            return self._send_json(200, list_comments())
        if parsed.path == "/api/vote":
            client_id = parse_qs(parsed.query).get("clientId", [None])[0]
            if client_id and not CLIENT_ID_RE.match(client_id):
                return self._send_json(400, {"error": "clientId inválido"})
            return self._send_json(200, get_vote_payload(client_id))
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/comments":
            return self._handle_post_comment()
        if parsed.path == "/api/vote":
            return self._handle_post_vote()
        return self._send_json(404, {"error": "No encontrado"})

    def _handle_post_comment(self):
        try:
            data = self._read_json_body()
        except (json.JSONDecodeError, UnicodeDecodeError):
            return self._send_json(400, {"error": "JSON inválido"})

        name = str(data.get("name", "")).strip()
        text = str(data.get("text", "")).strip()
        if not name or not text:
            return self._send_json(400, {"error": "Faltan campos"})
        if len(name) > 30 or len(text) > 280:
            return self._send_json(400, {"error": "Texto demasiado largo"})
        if contains_profanity(name) or contains_profanity(text):
            return self._send_json(400, {"error": "Tu comentario contiene lenguaje inapropiado"})

        comment = insert_comment(name, text)
        return self._send_json(201, comment)

    def _handle_post_vote(self):
        try:
            data = self._read_json_body()
        except (json.JSONDecodeError, UnicodeDecodeError):
            return self._send_json(400, {"error": "JSON inválido"})

        client_id = str(data.get("clientId", ""))
        if not CLIENT_ID_RE.match(client_id):
            return self._send_json(400, {"error": "clientId inválido"})
        pick = str(data.get("pick", ""))
        if pick not in ("esp", "arg", "tie"):
            return self._send_json(400, {"error": "Voto inválido"})

        payload = upsert_vote(client_id, pick)
        return self._send_json(200, payload)


def main():
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Servidor escuchando en http://0.0.0.0:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    main()
