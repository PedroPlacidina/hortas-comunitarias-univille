-- Leitura de notificações por usuário.
-- Uma notificação (ex.: aviso_geral) é vista por vários usuários, então "lida" não pode ser
-- uma coluna de notificacoes: cada usuário marca a sua própria leitura.
-- Sem CHARSET/COLLATE explícito para herdar a configuração do banco, como as tabelas da 00.
CREATE TABLE IF NOT EXISTS notificacoes_lidas (
    notificacao_uuid CHAR(36) NOT NULL,
    usuario_uuid CHAR(36) NOT NULL,
    data_leitura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notificacao_uuid, usuario_uuid),
    KEY idx_notificacoes_lidas_usuario (usuario_uuid),
    CONSTRAINT fk_notificacao_lida_notificacao FOREIGN KEY (notificacao_uuid) REFERENCES notificacoes (uuid),
    CONSTRAINT fk_notificacao_lida_usuario FOREIGN KEY (usuario_uuid) REFERENCES usuarios (uuid)
) ENGINE=InnoDB;
