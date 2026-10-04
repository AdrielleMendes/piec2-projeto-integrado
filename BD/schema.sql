PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS pessoas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nome         TEXT    NOT NULL,
    documento    TEXT    UNIQUE,
    email        TEXT,
    ativo        INTEGER NOT NULL DEFAULT 1,
    criado_em    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS faces (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    pessoa_id      INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    embedding      BLOB    NOT NULL,
    dimensao       INTEGER NOT NULL,
    modelo         TEXT    NOT NULL,
    versao_modelo  TEXT    NOT NULL,
    qualidade      REAL,
    imagem_path    TEXT,
    ativo          INTEGER NOT NULL DEFAULT 1,
    criado_em      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_faces_pessoa
    ON faces(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_faces_modelo
    ON faces(modelo, versao_modelo);

CREATE TABLE IF NOT EXISTS cameras (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nome   TEXT    NOT NULL,
    local  TEXT,
    url    TEXT,
    ativo  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS reconhecimentos (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    face_id              INTEGER REFERENCES faces(id),
    pessoa_id            INTEGER REFERENCES pessoas(id),
    camera_id            INTEGER REFERENCES cameras(id),
    similaridade         REAL    NOT NULL,
    limiar               REAL    NOT NULL,
    status               TEXT    NOT NULL
        CHECK (status IN ('match','desconhecido','baixa_qualidade')),
    imagem_captura_path  TEXT,
    criado_em            TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reconhecimentos_data
    ON reconhecimentos(criado_em);
CREATE INDEX IF NOT EXISTS idx_reconhecimentos_pessoa
    ON reconhecimentos(pessoa_id);

CREATE TABLE IF NOT EXISTS consentimentos (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    pessoa_id           INTEGER NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    finalidade          TEXT    NOT NULL,
    texto_versao        TEXT,
    data_consentimento  TEXT    NOT NULL,
    data_revogacao      TEXT,
    ativo               INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_consentimentos_pessoa
    ON consentimentos(pessoa_id);

CREATE TABLE IF NOT EXISTS configuracoes (
    chave          TEXT PRIMARY KEY,
    valor          TEXT NOT NULL,
    atualizado_em  TEXT NOT NULL DEFAULT (datetime('now'))
);
