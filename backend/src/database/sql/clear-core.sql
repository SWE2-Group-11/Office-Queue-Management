-- Office Queue Management

PRAGMA foreign_keys = ON;

DELETE FROM ticket;
DELETE FROM offers;
DELETE FROM counter;
DELETE FROM service;
DELETE FROM account;
DELETE FROM sqlite_sequence WHERE name IN ('ticket', 'service', 'account');