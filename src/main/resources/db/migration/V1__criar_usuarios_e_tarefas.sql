CREATE TABLE usuarios (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(100) NOT NULL,
    criado_em  TIMESTAMP    NOT NULL,
    CONSTRAINT uk_usuarios_email UNIQUE (email)
);

CREATE TABLE tarefas (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo        VARCHAR(120)  NOT NULL,
    descricao     VARCHAR(2000),
    prioridade    VARCHAR(10)   NOT NULL,
    status        VARCHAR(15)   NOT NULL,
    prazo         DATE,
    criada_em     TIMESTAMP     NOT NULL,
    atualizada_em TIMESTAMP     NOT NULL,
    concluida_em  TIMESTAMP     NULL,
    usuario_id    BIGINT        NOT NULL,
    CONSTRAINT fk_tarefas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE INDEX idx_tarefas_usuario_status ON tarefas (usuario_id, status);
CREATE INDEX idx_tarefas_usuario_prazo ON tarefas (usuario_id, prazo);
