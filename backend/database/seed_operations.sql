-- ═══════════════════════════════════════════════════════════════════════════
-- SEED: Historial de trading — Mar-May 2026 (~195 operaciones, 63 días)
--
-- Perfil: trader disciplinado con UN solo patrón de riesgo:
--   · LOSS SPIRAL MEDIUM → racha de 4 pérdidas consecutivas (17-18 Mar)
--   · Sin overtrading (máx 4 ops/día)
--   · Sin revenge trading (pérdidas no seguidas de burst de ops)
--   · Win rate ~58% → bonus de disciplina
--
-- Para limpiar: DELETE FROM operations WHERE notes = '[seed]';
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE v_uid UUID;
BEGIN
    SELECT id INTO v_uid FROM users WHERE email = 'alu0101539393@ull.edu.es';
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado. Cambia el email en la línea 15.';
    END IF;

    -- ── 02-Mar (Lun) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-02','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-03-02 09:38:00','2026-03-02 09:38:00'),
    (v_uid,'2026-03-02','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-03-02 11:15:00','2026-03-02 11:15:00'),
    (v_uid,'2026-03-02','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-03-02 14:30:00','2026-03-02 14:30:00');

    -- ── 03-Mar (Mar) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-03','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-03-03 09:45:00','2026-03-03 09:45:00'),
    (v_uid,'2026-03-03','AMD', 'long',20,165.00,161.00,-80.00,-2.4242,'[seed]','2026-03-03 12:00:00','2026-03-03 12:00:00'),
    (v_uid,'2026-03-03','GOOGL','long',12,182.00,186.00,48.00, 2.1978,'[seed]','2026-03-03 15:00:00','2026-03-03 15:00:00');

    -- ── 04-Mar (Mié) · W W L W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-04','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-03-04 09:35:00','2026-03-04 09:35:00'),
    (v_uid,'2026-03-04','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-03-04 11:00:00','2026-03-04 11:00:00'),
    (v_uid,'2026-03-04','AMZN','long',12,228.00,223.00,-60.00,-2.1930,'[seed]','2026-03-04 13:30:00','2026-03-04 13:30:00'),
    (v_uid,'2026-03-04','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-03-04 15:20:00','2026-03-04 15:20:00');

    -- ── 05-Mar (Jue) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-05','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-03-05 10:00:00','2026-03-05 10:00:00'),
    (v_uid,'2026-03-05','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-03-05 14:00:00','2026-03-05 14:00:00');

    -- ── 06-Mar (Vie) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-06','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-03-06 09:50:00','2026-03-06 09:50:00'),
    (v_uid,'2026-03-06','TSLA','long',10,278.00,272.00,-60.00,-2.1583,'[seed]','2026-03-06 12:00:00','2026-03-06 12:00:00'),
    (v_uid,'2026-03-06','AMD', 'long',25,161.00,165.00,100.00, 2.4845,'[seed]','2026-03-06 15:00:00','2026-03-06 15:00:00');

    -- ── 09-Mar (Lun) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-09','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-03-09 09:35:00','2026-03-09 09:35:00'),
    (v_uid,'2026-03-09','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-03-09 12:00:00','2026-03-09 12:00:00'),
    (v_uid,'2026-03-09','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-03-09 15:00:00','2026-03-09 15:00:00');

    -- ── 10-Mar (Mar) · W W L W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-10','AAPL', 'long',15,198.50,202.50, 60.00, 2.0151,'[seed]','2026-03-10 09:38:00','2026-03-10 09:38:00'),
    (v_uid,'2026-03-10','GOOGL','long',12,182.00,186.00, 48.00, 2.1978,'[seed]','2026-03-10 11:00:00','2026-03-10 11:00:00'),
    (v_uid,'2026-03-10','QQQ', 'long',15,492.00,486.00,-90.00,-1.2195,'[seed]','2026-03-10 13:15:00','2026-03-10 13:15:00'),
    (v_uid,'2026-03-10','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-03-10 15:30:00','2026-03-10 15:30:00');

    -- ── 11-Mar (Mié) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-11','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-03-11 09:42:00','2026-03-11 09:42:00'),
    (v_uid,'2026-03-11','TSLA','long',10,278.00,272.00,-60.00,-2.1583,'[seed]','2026-03-11 12:00:00','2026-03-11 12:00:00'),
    (v_uid,'2026-03-11','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-03-11 15:00:00','2026-03-11 15:00:00');

    -- ── 12-Mar (Jue) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-12','NVDA','long',5, 880.00,897.00, 85.00, 1.9318,'[seed]','2026-03-12 09:35:00','2026-03-12 09:35:00'),
    (v_uid,'2026-03-12','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-03-12 12:10:00','2026-03-12 12:10:00'),
    (v_uid,'2026-03-12','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-03-12 15:00:00','2026-03-12 15:00:00');

    -- ── 13-Mar (Vie) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-13','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-03-13 10:00:00','2026-03-13 10:00:00'),
    (v_uid,'2026-03-13','SPY', 'long',15,572.00,566.00,-90.00,-1.0490,'[seed]','2026-03-13 12:30:00','2026-03-13 12:30:00'),
    (v_uid,'2026-03-13','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-03-13 15:10:00','2026-03-13 15:10:00');

    -- ── 16-Mar (Lun) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-16','GOOGL','long',12,182.00,186.00, 48.00, 2.1978,'[seed]','2026-03-16 09:35:00','2026-03-16 09:35:00'),
    (v_uid,'2026-03-16','TSLA', 'long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-03-16 12:00:00','2026-03-16 12:00:00'),
    (v_uid,'2026-03-16','MSFT', 'long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-03-16 15:00:00','2026-03-16 15:00:00');

    -- ── 17-Mar (Mar) · W L L L ── RACHA PÉRDIDAS ops 1-3/4 ──────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-17','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-03-17 09:35:00','2026-03-17 09:35:00'),
    (v_uid,'2026-03-17','AAPL','long',15,201.00,198.00,-45.00,-1.4925,'[seed]','2026-03-17 11:00:00','2026-03-17 11:00:00'),
    (v_uid,'2026-03-17','NVDA','long',5, 890.00,877.00,-65.00,-1.4607,'[seed]','2026-03-17 13:30:00','2026-03-17 13:30:00'),
    (v_uid,'2026-03-17','META','long',8, 552.00,542.00,-80.00,-1.8116,'[seed]','2026-03-17 15:20:00','2026-03-17 15:20:00');

    -- ── 18-Mar (Mié) · L W W ── RACHA op 4/4 luego recuperación ─────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-18','AMZN','long',12,229.00,224.00,-60.00,-2.1834,'[seed]','2026-03-18 09:35:00','2026-03-18 09:35:00'),
    (v_uid,'2026-03-18','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-03-18 12:00:00','2026-03-18 12:00:00'),
    (v_uid,'2026-03-18','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-03-18 15:00:00','2026-03-18 15:00:00');

    -- ── 19-Mar (Jue) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-19','GOOGL','long',12,182.00,186.00, 48.00, 2.1978,'[seed]','2026-03-19 09:38:00','2026-03-19 09:38:00'),
    (v_uid,'2026-03-19','TSLA', 'long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-03-19 12:00:00','2026-03-19 12:00:00'),
    (v_uid,'2026-03-19','AMD',  'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-03-19 15:00:00','2026-03-19 15:00:00');

    -- ── 20-Mar (Vie) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-20','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-03-20 09:40:00','2026-03-20 09:40:00'),
    (v_uid,'2026-03-20','SPY', 'long',15,572.00,566.00,-90.00,-1.0490,'[seed]','2026-03-20 12:30:00','2026-03-20 12:30:00'),
    (v_uid,'2026-03-20','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-03-20 15:00:00','2026-03-20 15:00:00');

    -- ── 23-Mar (Lun) · W W L ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-23','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-03-23 09:38:00','2026-03-23 09:38:00'),
    (v_uid,'2026-03-23','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-03-23 12:00:00','2026-03-23 12:00:00'),
    (v_uid,'2026-03-23','AMZN','long',12,228.00,223.00,-60.00,-2.1930,'[seed]','2026-03-23 15:00:00','2026-03-23 15:00:00');

    -- ── 24-Mar (Mar) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-24','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-03-24 09:40:00','2026-03-24 09:40:00'),
    (v_uid,'2026-03-24','GOOGL','long',12,182.00,186.00,48.00, 2.1978,'[seed]','2026-03-24 12:00:00','2026-03-24 12:00:00'),
    (v_uid,'2026-03-24','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-03-24 15:10:00','2026-03-24 15:10:00');

    -- ── 25-Mar (Mié) · W L W W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-25','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-03-25 09:50:00','2026-03-25 09:50:00'),
    (v_uid,'2026-03-25','TSLA','long',10,278.00,272.00,-60.00,-2.1583,'[seed]','2026-03-25 11:30:00','2026-03-25 11:30:00'),
    (v_uid,'2026-03-25','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-03-25 13:30:00','2026-03-25 13:30:00'),
    (v_uid,'2026-03-25','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-03-25 15:20:00','2026-03-25 15:20:00');

    -- ── 26-Mar (Jue) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-26','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-03-26 10:00:00','2026-03-26 10:00:00'),
    (v_uid,'2026-03-26','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-03-26 14:00:00','2026-03-26 14:00:00');

    -- ── 27-Mar (Vie) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-27','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-03-27 09:40:00','2026-03-27 09:40:00'),
    (v_uid,'2026-03-27','GOOGL','long',12,184.00,180.00,-48.00,-2.1739,'[seed]','2026-03-27 12:00:00','2026-03-27 12:00:00'),
    (v_uid,'2026-03-27','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-03-27 15:00:00','2026-03-27 15:00:00');

    -- ── 30-Mar (Lun) · W W L W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-30','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-03-30 09:38:00','2026-03-30 09:38:00'),
    (v_uid,'2026-03-30','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-03-30 11:00:00','2026-03-30 11:00:00'),
    (v_uid,'2026-03-30','QQQ', 'long',15,492.00,486.00,-90.00,-1.2195,'[seed]','2026-03-30 13:15:00','2026-03-30 13:15:00'),
    (v_uid,'2026-03-30','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-03-30 15:20:00','2026-03-30 15:20:00');

    -- ── 31-Mar (Mar) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-03-31','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-03-31 09:40:00','2026-03-31 09:40:00'),
    (v_uid,'2026-03-31','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-03-31 12:00:00','2026-03-31 12:00:00'),
    (v_uid,'2026-03-31','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-03-31 15:00:00','2026-03-31 15:00:00');

    -- ── 01-Abr (Mié) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-01','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-04-01 09:45:00','2026-04-01 09:45:00'),
    (v_uid,'2026-04-01','TSLA','long',10,278.00,272.00,-60.00,-2.1583,'[seed]','2026-04-01 12:30:00','2026-04-01 12:30:00'),
    (v_uid,'2026-04-01','GOOGL','long',12,182.00,186.00,48.00, 2.1978,'[seed]','2026-04-01 15:00:00','2026-04-01 15:00:00');

    -- ── 02-Abr (Jue) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-02','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-04-02 09:38:00','2026-04-02 09:38:00'),
    (v_uid,'2026-04-02','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-04-02 12:00:00','2026-04-02 12:00:00'),
    (v_uid,'2026-04-02','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-04-02 15:10:00','2026-04-02 15:10:00');

    -- ── 03-Abr (Vie) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-03','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-04-03 10:00:00','2026-04-03 10:00:00'),
    (v_uid,'2026-04-03','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-04-03 14:00:00','2026-04-03 14:00:00');

    -- ── 06-Abr (Lun) · W L W W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-06','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-04-06 09:38:00','2026-04-06 09:38:00'),
    (v_uid,'2026-04-06','META','long',8, 552.00,542.00,-80.00,-1.8116,'[seed]','2026-04-06 11:00:00','2026-04-06 11:00:00'),
    (v_uid,'2026-04-06','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-04-06 13:30:00','2026-04-06 13:30:00'),
    (v_uid,'2026-04-06','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-04-06 15:20:00','2026-04-06 15:20:00');

    -- ── 07-Abr (Mar) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-07','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-04-07 09:40:00','2026-04-07 09:40:00'),
    (v_uid,'2026-04-07','GOOGL','long',12,182.00,186.00,48.00, 2.1978,'[seed]','2026-04-07 12:00:00','2026-04-07 12:00:00'),
    (v_uid,'2026-04-07','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-04-07 15:00:00','2026-04-07 15:00:00');

    -- ── 08-Abr (Mié) · L W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-08','QQQ', 'long',15,492.00,486.00,-90.00,-1.2195,'[seed]','2026-04-08 09:35:00','2026-04-08 09:35:00'),
    (v_uid,'2026-04-08','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-04-08 12:00:00','2026-04-08 12:00:00'),
    (v_uid,'2026-04-08','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-04-08 15:00:00','2026-04-08 15:00:00');

    -- ── 09-Abr (Jue) · W W L W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-09','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-04-09 09:40:00','2026-04-09 09:40:00'),
    (v_uid,'2026-04-09','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-04-09 11:00:00','2026-04-09 11:00:00'),
    (v_uid,'2026-04-09','TSLA','long',10,279.00,273.00,-60.00,-2.1505,'[seed]','2026-04-09 13:15:00','2026-04-09 13:15:00'),
    (v_uid,'2026-04-09','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-04-09 15:20:00','2026-04-09 15:20:00');

    -- ── 10-Abr (Vie) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-10','GOOGL','long',12,182.00,186.00, 48.00, 2.1978,'[seed]','2026-04-10 10:00:00','2026-04-10 10:00:00'),
    (v_uid,'2026-04-10','MSFT', 'long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-04-10 14:00:00','2026-04-10 14:00:00');

    -- ── 13-Abr (Lun) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-13','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-04-13 09:38:00','2026-04-13 09:38:00'),
    (v_uid,'2026-04-13','NVDA','long',5, 892.00,879.00,-65.00,-1.4574,'[seed]','2026-04-13 12:00:00','2026-04-13 12:00:00'),
    (v_uid,'2026-04-13','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-04-13 15:00:00','2026-04-13 15:00:00');

    -- ── 14-Abr (Mar) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-14','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-04-14 09:35:00','2026-04-14 09:35:00'),
    (v_uid,'2026-04-14','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-04-14 12:00:00','2026-04-14 12:00:00'),
    (v_uid,'2026-04-14','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-04-14 15:10:00','2026-04-14 15:10:00');

    -- ── 15-Abr (Mié) · W L W W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-15','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-04-15 09:45:00','2026-04-15 09:45:00'),
    (v_uid,'2026-04-15','AMZN','long',12,229.00,224.00,-60.00,-2.1834,'[seed]','2026-04-15 11:00:00','2026-04-15 11:00:00'),
    (v_uid,'2026-04-15','GOOGL','long',12,182.00,186.00,48.00, 2.1978,'[seed]','2026-04-15 13:30:00','2026-04-15 13:30:00'),
    (v_uid,'2026-04-15','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-04-15 15:20:00','2026-04-15 15:20:00');

    -- ── 16-Abr (Jue) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-16','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-04-16 10:00:00','2026-04-16 10:00:00'),
    (v_uid,'2026-04-16','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-04-16 14:00:00','2026-04-16 14:00:00');

    -- ── 17-Abr (Vie) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-17','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-04-17 09:40:00','2026-04-17 09:40:00'),
    (v_uid,'2026-04-17','TSLA','long',10,278.00,272.00,-60.00,-2.1583,'[seed]','2026-04-17 12:00:00','2026-04-17 12:00:00'),
    (v_uid,'2026-04-17','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-04-17 15:00:00','2026-04-17 15:00:00');

    -- ── 20-Abr (Lun) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-20','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-04-20 09:35:00','2026-04-20 09:35:00'),
    (v_uid,'2026-04-20','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-04-20 12:00:00','2026-04-20 12:00:00'),
    (v_uid,'2026-04-20','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-04-20 15:00:00','2026-04-20 15:00:00');

    -- ── 21-Abr (Mar) · L W W W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-21','GOOGL','long',12,184.00,180.00,-48.00,-2.1739,'[seed]','2026-04-21 09:38:00','2026-04-21 09:38:00'),
    (v_uid,'2026-04-21','AAPL', 'long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-04-21 11:00:00','2026-04-21 11:00:00'),
    (v_uid,'2026-04-21','MSFT', 'long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-04-21 13:30:00','2026-04-21 13:30:00'),
    (v_uid,'2026-04-21','NVDA', 'long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-04-21 15:20:00','2026-04-21 15:20:00');

    -- ── 22-Abr (Mié) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-22','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-04-22 10:00:00','2026-04-22 10:00:00'),
    (v_uid,'2026-04-22','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-04-22 14:00:00','2026-04-22 14:00:00');

    -- ── 23-Abr (Jue) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-23','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-04-23 09:40:00','2026-04-23 09:40:00'),
    (v_uid,'2026-04-23','SPY', 'long',15,572.00,566.00,-90.00,-1.0490,'[seed]','2026-04-23 12:00:00','2026-04-23 12:00:00'),
    (v_uid,'2026-04-23','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-04-23 15:00:00','2026-04-23 15:00:00');

    -- ── 24-Abr (Vie) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-24','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-04-24 09:45:00','2026-04-24 09:45:00'),
    (v_uid,'2026-04-24','GOOGL','long',12,182.00,186.00,48.00, 2.1978,'[seed]','2026-04-24 12:30:00','2026-04-24 12:30:00'),
    (v_uid,'2026-04-24','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-04-24 15:10:00','2026-04-24 15:10:00');

    -- ── 27-Abr (Lun) · W L W W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-27','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-04-27 09:38:00','2026-04-27 09:38:00'),
    (v_uid,'2026-04-27','NVDA','long',5, 892.00,879.00,-65.00,-1.4574,'[seed]','2026-04-27 11:00:00','2026-04-27 11:00:00'),
    (v_uid,'2026-04-27','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-04-27 13:30:00','2026-04-27 13:30:00'),
    (v_uid,'2026-04-27','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-04-27 15:20:00','2026-04-27 15:20:00');

    -- ── 28-Abr (Mar) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-28','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-04-28 10:00:00','2026-04-28 10:00:00'),
    (v_uid,'2026-04-28','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-04-28 14:00:00','2026-04-28 14:00:00');

    -- ── 29-Abr (Mié) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-29','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-04-29 09:38:00','2026-04-29 09:38:00'),
    (v_uid,'2026-04-29','META','long',8, 552.00,542.00,-80.00,-1.8116,'[seed]','2026-04-29 12:00:00','2026-04-29 12:00:00'),
    (v_uid,'2026-04-29','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-04-29 15:00:00','2026-04-29 15:00:00');

    -- ── 30-Abr (Jue) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-04-30','GOOGL','long',12,182.00,186.00, 48.00, 2.1978,'[seed]','2026-04-30 09:45:00','2026-04-30 09:45:00'),
    (v_uid,'2026-04-30','MSFT', 'long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-04-30 12:00:00','2026-04-30 12:00:00'),
    (v_uid,'2026-04-30','NVDA', 'long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-04-30 15:10:00','2026-04-30 15:10:00');

    -- ── 01-May (Vie) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-01','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-05-01 09:50:00','2026-05-01 09:50:00'),
    (v_uid,'2026-05-01','QQQ', 'long',15,492.00,486.00,-90.00,-1.2195,'[seed]','2026-05-01 12:30:00','2026-05-01 12:30:00'),
    (v_uid,'2026-05-01','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-05-01 15:00:00','2026-05-01 15:00:00');

    -- ── 04-May (Lun) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-04','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-05-04 09:35:00','2026-05-04 09:35:00'),
    (v_uid,'2026-05-04','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-05-04 12:00:00','2026-05-04 12:00:00'),
    (v_uid,'2026-05-04','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-05-04 15:00:00','2026-05-04 15:00:00');

    -- ── 05-May (Mar) · W L W W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-05','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-05-05 09:40:00','2026-05-05 09:40:00'),
    (v_uid,'2026-05-05','TSLA','long',10,279.00,273.00,-60.00,-2.1505,'[seed]','2026-05-05 11:00:00','2026-05-05 11:00:00'),
    (v_uid,'2026-05-05','GOOGL','long',12,182.00,186.00,48.00, 2.1978,'[seed]','2026-05-05 13:30:00','2026-05-05 13:30:00'),
    (v_uid,'2026-05-05','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-05-05 15:20:00','2026-05-05 15:20:00');

    -- ── 06-May (Mié) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-06','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-05-06 10:00:00','2026-05-06 10:00:00'),
    (v_uid,'2026-05-06','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-05-06 14:00:00','2026-05-06 14:00:00');

    -- ── 07-May (Jue) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-07','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-05-07 09:38:00','2026-05-07 09:38:00'),
    (v_uid,'2026-05-07','SPY', 'long',15,572.00,566.00,-90.00,-1.0490,'[seed]','2026-05-07 12:15:00','2026-05-07 12:15:00'),
    (v_uid,'2026-05-07','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-05-07 15:00:00','2026-05-07 15:00:00');

    -- ── 08-May (Vie) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-08','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-05-08 09:45:00','2026-05-08 09:45:00'),
    (v_uid,'2026-05-08','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-05-08 12:00:00','2026-05-08 12:00:00'),
    (v_uid,'2026-05-08','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-05-08 15:00:00','2026-05-08 15:00:00');

    -- ── 11-May (Lun) · W W L W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-11','MSFT', 'long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-05-11 09:38:00','2026-05-11 09:38:00'),
    (v_uid,'2026-05-11','GOOGL','long',12,182.00,186.00, 48.00, 2.1978,'[seed]','2026-05-11 11:00:00','2026-05-11 11:00:00'),
    (v_uid,'2026-05-11','NVDA', 'long',5, 892.00,879.00,-65.00,-1.4574,'[seed]','2026-05-11 13:15:00','2026-05-11 13:15:00'),
    (v_uid,'2026-05-11','AMD',  'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-05-11 15:20:00','2026-05-11 15:20:00');

    -- ── 12-May (Mar) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-12','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-05-12 10:00:00','2026-05-12 10:00:00'),
    (v_uid,'2026-05-12','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-05-12 14:00:00','2026-05-12 14:00:00');

    -- ── 13-May (Mié) · L W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-13','AMZN','long',12,229.00,224.00,-60.00,-2.1834,'[seed]','2026-05-13 09:40:00','2026-05-13 09:40:00'),
    (v_uid,'2026-05-13','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-05-13 12:00:00','2026-05-13 12:00:00'),
    (v_uid,'2026-05-13','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-05-13 15:00:00','2026-05-13 15:00:00');

    -- ── 14-May (Jue) · W W L W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-14','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-05-14 09:38:00','2026-05-14 09:38:00'),
    (v_uid,'2026-05-14','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-05-14 11:00:00','2026-05-14 11:00:00'),
    (v_uid,'2026-05-14','GOOGL','long',12,184.00,180.00,-48.00,-2.1739,'[seed]','2026-05-14 13:30:00','2026-05-14 13:30:00'),
    (v_uid,'2026-05-14','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-05-14 15:20:00','2026-05-14 15:20:00');

    -- ── 15-May (Vie) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-15','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-05-15 10:00:00','2026-05-15 10:00:00'),
    (v_uid,'2026-05-15','QQQ', 'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-05-15 14:00:00','2026-05-15 14:00:00');

    -- ── 18-May (Lun) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-18','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-05-18 09:40:00','2026-05-18 09:40:00'),
    (v_uid,'2026-05-18','TSLA','long',10,278.00,272.00,-60.00,-2.1583,'[seed]','2026-05-18 12:00:00','2026-05-18 12:00:00'),
    (v_uid,'2026-05-18','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-05-18 15:00:00','2026-05-18 15:00:00');

    -- ── 19-May (Mar) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-19','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-05-19 09:45:00','2026-05-19 09:45:00'),
    (v_uid,'2026-05-19','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-05-19 12:30:00','2026-05-19 12:30:00'),
    (v_uid,'2026-05-19','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-05-19 15:10:00','2026-05-19 15:10:00');

    -- ── 20-May (Mié) · W L W W ───────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-20','GOOGL','long',12,182.00,186.00, 48.00, 2.1978,'[seed]','2026-05-20 09:38:00','2026-05-20 09:38:00'),
    (v_uid,'2026-05-20','NVDA', 'long',5, 892.00,879.00,-65.00,-1.4574,'[seed]','2026-05-20 11:00:00','2026-05-20 11:00:00'),
    (v_uid,'2026-05-20','AMD',  'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-05-20 13:30:00','2026-05-20 13:30:00'),
    (v_uid,'2026-05-20','QQQ',  'long',15,490.00,497.00,105.00, 1.4286,'[seed]','2026-05-20 15:20:00','2026-05-20 15:20:00');

    -- ── 21-May (Jue) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-21','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-05-21 10:00:00','2026-05-21 10:00:00'),
    (v_uid,'2026-05-21','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-05-21 14:00:00','2026-05-21 14:00:00');

    -- ── 22-May (Vie) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-22','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-05-22 09:45:00','2026-05-22 09:45:00'),
    (v_uid,'2026-05-22','META','long',8, 552.00,542.00,-80.00,-1.8116,'[seed]','2026-05-22 12:00:00','2026-05-22 12:00:00'),
    (v_uid,'2026-05-22','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-05-22 15:10:00','2026-05-22 15:10:00');

    -- ── 25-May (Lun) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-25','MSFT','long',10,400.00,408.00, 80.00, 2.0000,'[seed]','2026-05-25 09:40:00','2026-05-25 09:40:00'),
    (v_uid,'2026-05-25','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-05-25 12:00:00','2026-05-25 12:00:00'),
    (v_uid,'2026-05-25','GOOGL','long',12,182.00,186.00,48.00, 2.1978,'[seed]','2026-05-25 15:00:00','2026-05-25 15:00:00');

    -- ── 26-May (Mar) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-26','AMD', 'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-05-26 09:38:00','2026-05-26 09:38:00'),
    (v_uid,'2026-05-26','QQQ', 'long',15,492.00,486.00,-90.00,-1.2195,'[seed]','2026-05-26 12:15:00','2026-05-26 12:15:00'),
    (v_uid,'2026-05-26','SPY', 'long',20,570.00,576.00,120.00, 1.0526,'[seed]','2026-05-26 15:00:00','2026-05-26 15:00:00');

    -- ── 27-May (Mié) · W W W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-27','TSLA','long',10,275.00,281.00, 60.00, 2.1818,'[seed]','2026-05-27 09:45:00','2026-05-27 09:45:00'),
    (v_uid,'2026-05-27','AMZN','long',12,226.00,231.00, 60.00, 2.2124,'[seed]','2026-05-27 12:30:00','2026-05-27 12:30:00'),
    (v_uid,'2026-05-27','AAPL','long',15,200.00,204.00, 60.00, 2.0000,'[seed]','2026-05-27 15:00:00','2026-05-27 15:00:00');

    -- ── 28-May (Jue) · W L W ─────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-28','META','long',8, 548.00,559.00, 88.00, 2.0073,'[seed]','2026-05-28 09:40:00','2026-05-28 09:40:00'),
    (v_uid,'2026-05-28','MSFT','long',10,401.00,394.00,-70.00,-1.7456,'[seed]','2026-05-28 12:00:00','2026-05-28 12:00:00'),
    (v_uid,'2026-05-28','NVDA','long',5, 885.00,902.00, 85.00, 1.9209,'[seed]','2026-05-28 15:00:00','2026-05-28 15:00:00');

    -- ── 29-May (Vie) · W W ───────────────────────────────────────────────────
    INSERT INTO operations(user_id,date,symbol,type,quantity,buy_price,sell_price,pnl,pnl_percentage,notes,created_at,updated_at) VALUES
    (v_uid,'2026-05-29','GOOGL','long',12,182.00,186.00, 48.00, 2.1978,'[seed]','2026-05-29 10:00:00','2026-05-29 10:00:00'),
    (v_uid,'2026-05-29','AMD',  'long',20,163.00,167.00, 80.00, 2.4540,'[seed]','2026-05-29 14:00:00','2026-05-29 14:00:00');

    RAISE NOTICE 'Seed completado para usuario: %', v_uid;
END $$;
