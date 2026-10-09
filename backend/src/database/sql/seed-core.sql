-- Office Queue Management

PRAGMA foreign_keys = ON;

DELETE FROM ticket;
DELETE FROM offers;
DELETE FROM counter;
DELETE FROM service;
DELETE FROM sqlite_sequence WHERE name IN ('ticket', 'service');

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
