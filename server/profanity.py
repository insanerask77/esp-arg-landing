"""Filtro simple de palabras malsonantes para los comentarios.

Compara por palabra completa (no subcadena) sobre el texto en minúsculas
y sin acentos, así que "computador" no choca con "puto" ni "cono" con
"Concha" como nombre propio. No es infalible (no detecta *"p.u.t.o"*ni
leetspeak): es un filtro básico, no un sistema de moderación completo.
"""

import re
import unicodedata

BLOCKED_WORDS = [
    # Español
    "puta", "puto", "putas", "putos", "hijo de puta", "hijoputa", "hijaputa",
    "gilipollas", "cabron", "cabrona", "cabrones",
    "mierda", "mierdas", "joder", "jodido", "jodida",
    "concha de tu madre", "concha de la lora", "conchetumadre",
    "maricon", "mariconazo", "marica", "pendejo", "pendeja", "pendejada",
    "verga", "vergas", "chinga", "chingada", "chingar", "chingadamadre",
    "carajo", "malparido", "malparida", "culiao", "culiado", "hp",
    # Inglés
    "fuck", "fucking", "fucker", "shit", "bitch", "bastard", "asshole",
    "cunt", "nigger", "nigga", "whore", "slut", "dick", "pussy",
    "motherfucker",
]


def _normalize(text):
    nfkd = unicodedata.normalize("NFKD", text.lower())
    return "".join(ch for ch in nfkd if not unicodedata.combining(ch))


_PATTERNS = [re.compile(r"\b" + re.escape(_normalize(word)) + r"\b") for word in BLOCKED_WORDS]


def contains_profanity(text):
    normalized = _normalize(text)
    return any(pattern.search(normalized) for pattern in _PATTERNS)
