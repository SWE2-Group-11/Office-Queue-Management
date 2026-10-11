-- Office Queue Management

PRAGMA foreign_keys = ON;

-- Service types (service_time in minutes)
INSERT INTO service (id, tag_name, service_time) VALUES
    (1, 'deposit',            5),
    (2, 'shipping',           8),
    (3, 'account_management', 12);

-- Counters
INSERT INTO counter (id) VALUES (1), (2), (3);

-- Configuration (service_id, counter_id):
--   counter 1 -> deposit only
--   counter 2 -> deposit + shipping
--   counter 3 -> shipping + account_management
INSERT INTO offers (service_id, counter_id) VALUES
    (1, 1),
    (1, 2),
    (2, 2),
    (2, 3),
    (3, 3);

-- Past days: served tickets (data for the manager stats)
INSERT INTO ticket (date, service_id, counter_id) VALUES
    (date('now', 'localtime', '-35 days'), 1, 1),
    (date('now', 'localtime', '-35 days'), 2, 3),
    (date('now', 'localtime', '-35 days'), 3, 3),
    (date('now', 'localtime', '-7 days'),  1, 1),
    (date('now', 'localtime', '-7 days'),  1, 2),
    (date('now', 'localtime', '-7 days'),  2, 2),
    (date('now', 'localtime', '-7 days'),  3, 3),
    (date('now', 'localtime', '-2 days'),  1, 1),
    (date('now', 'localtime', '-2 days'),  2, 3),
    (date('now', 'localtime', '-1 day'),   1, 1),
    (date('now', 'localtime', '-1 day'),   1, 2),
    (date('now', 'localtime', '-1 day'),   2, 2),
    (date('now', 'localtime', '-1 day'),   2, 3),
    (date('now', 'localtime', '-1 day'),   3, 3);

-- Today: served tickets
INSERT INTO ticket (date, service_id, counter_id) VALUES
    (date('now', 'localtime'), 1, 1),
    (date('now', 'localtime'), 2, 2),
    (date('now', 'localtime'), 3, 3);

-- Today: waiting tickets (counter_id NULL)
INSERT INTO ticket (date, service_id) VALUES
    (date('now', 'localtime'), 1),
    (date('now', 'localtime'), 2),
    (date('now', 'localtime'), 1),
    (date('now', 'localtime'), 3),
    (date('now', 'localtime'), 1),
    (date('now', 'localtime'), 2),
    (date('now', 'localtime'), 1);

-- Accounts
INSERT INTO account (username, hash, salt, role) VALUES
('manager', '98ab8721188c5666db59fec0c696d47d', 'f0e30d9b260e1389', 'manager'),
('device',  '1076b4cd12959131b21e683ab74a567a', 'ea32c73ede99afbc', 'device');