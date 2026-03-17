-- ORA Library permissions
-- Assumes you already have permissions table with unique(name).

-- PHYSICAL
INSERT INTO permissions (name, description)
VALUES
('library.book.read','Read library books'),
('library.book.create','Create library books'),
('library.book.update','Update library books'),
('library.book.delete','Delete library books'),

('library.copy.read','Read book copies'),
('library.copy.create','Create book copies'),
('library.copy.update','Update book copies'),
('library.copy.delete','Delete book copies'),

('library.loan.read','Read loans'),
('library.loan.issue','Issue books'),
('library.loan.return','Return books'),
('library.loan.renew','Renew loans'),

('library.hold.read','Read holds'),
('library.hold.create','Create hold'),
('library.hold.cancel','Cancel hold'),
('library.hold.fulfill','Fulfill hold'),

('library.fine.read','Read fines'),
('library.fine.pay','Pay fines'),
('library.fine.waive','Waive fines'),

('library.report.read','Read library reports')
ON CONFLICT (name) DO NOTHING;

-- DIGITAL
INSERT INTO permissions (name, description)
VALUES
('digital.read','Read digital resources'),
('digital.upload','Upload digital resources'),
('digital.update','Update digital resources'),
('digital.delete','Delete digital resources'),
('digital.submit','Submit digital resource for approval'),
('digital.approve','Approve digital resources'),
('digital.reject','Reject digital resources'),
('digital.publish','Publish approved digital resources'),
('digital.download','Download digital resources')
ON CONFLICT (name) DO NOTHING;
