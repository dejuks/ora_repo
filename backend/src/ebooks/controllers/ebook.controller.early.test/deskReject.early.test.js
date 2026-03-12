import { q } from "../../../config/db.js";
import { deskReject } from '../ebook.controller';

// Mock q and logHistory (logHistory is called inside deskReject)
jest.mock("../../../config/db.js", () => ({
  q: jest.fn(),
}));

describe('deskReject() deskReject method', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { uuid: 'editor-123' },
      params: { id: 'ebook-456' },
      body: { note: 'Not suitable for publication' },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  // --- Happy Paths ---

  it('should reject an ebook successfully and return success message', async () => {
    // Test: Normal desk reject flow, ebook exists, note provided

    // Setup: q returns ebook, then update, then logHistory, then commit
    q.mockImplementationOnce(async () => ({
      rows: [{ ebook_id: 'ebook-456', status: 'SUBMITTED' }],
    }));
    q.mockImplementationOnce(async () => ({})); // UPDATE
    q.mockImplementationOnce(async () => ({})); // logHistory
    q.mockImplementationOnce(async () => ({})); // COMMIT

    await deskReject(req, res);

    // Check: q called for BEGIN, SELECT, UPDATE, logHistory, COMMIT
    expect(q).toHaveBeenCalledWith('BEGIN');
    expect(q).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false'),
      ['ebook-456']
    );
    expect(q).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE ebooks SET status='REJECTED', updated_at=NOW() WHERE ebook_id=$1"),
      ['ebook-456']
    );
    // logHistory call
    expect(q).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO ebook_workflow_history'),
      expect.any(Array)
    );
    expect(q).toHaveBeenCalledWith('COMMIT');

    // Check: res.json called with success
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Rejected' });
  });

  it('should use default note if note is not provided', async () => {
    // Test: Note is missing, should use "Desk rejected"
    req.body = {}; // no note

    q.mockImplementationOnce(async () => ({
      rows: [{ ebook_id: 'ebook-456', status: 'SCREENING' }],
    }));
    q.mockImplementationOnce(async () => ({})); // UPDATE
    q.mockImplementationOnce(async () => ({})); // logHistory
    q.mockImplementationOnce(async () => ({})); // COMMIT

    await deskReject(req, res);

    // Check: logHistory called with default note
    const logHistoryCall = q.mock.calls.find(
      ([sql]) => sql.includes('INSERT INTO ebook_workflow_history')
    );
    expect(logHistoryCall).toBeDefined();
    const params = logHistoryCall[1];
    expect(params[4]).toBe('Desk rejected'); // note

    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Rejected' });
  });

  // --- Edge Cases ---

  it('should return 404 if ebook does not exist', async () => {
    // Test: Ebook not found

    q.mockImplementationOnce(async () => ({
      rows: [],
    }));

    q.mockImplementationOnce(async () => ({})); // ROLLBACK

    await deskReject(req, res);

    expect(q).toHaveBeenCalledWith('BEGIN');
    expect(q).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false'),
      ['ebook-456']
    );
    expect(q).toHaveBeenCalledWith('ROLLBACK');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
  });

  it('should handle database errors gracefully and rollback', async () => {
    // Test: Simulate error during UPDATE

    q.mockImplementationOnce(async () => ({
      rows: [{ ebook_id: 'ebook-456', status: 'SUBMITTED' }],
    }));
    q.mockImplementationOnce(async () => {
      throw new Error('DB error');
    }); // UPDATE fails
    q.mockImplementationOnce(async () => ({})); // ROLLBACK

    await deskReject(req, res);

    expect(q).toHaveBeenCalledWith('BEGIN');
    expect(q).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false'),
      ['ebook-456']
    );
    expect(q).toHaveBeenCalledWith('ROLLBACK');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'DB error' });
  });

  it('should handle error during logHistory and rollback', async () => {
    // Test: logHistory throws error

    q.mockImplementationOnce(async () => ({
      rows: [{ ebook_id: 'ebook-456', status: 'SUBMITTED' }],
    }));
    q.mockImplementationOnce(async () => ({})); // UPDATE
    q.mockImplementationOnce(async () => {
      throw new Error('logHistory failed');
    }); // logHistory fails
    q.mockImplementationOnce(async () => ({})); // ROLLBACK

    await deskReject(req, res);

    expect(q).toHaveBeenCalledWith('ROLLBACK');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'logHistory failed' });
  });

  it('should handle error during COMMIT and return 500', async () => {
    // Test: COMMIT throws error

    q.mockImplementationOnce(async () => ({
      rows: [{ ebook_id: 'ebook-456', status: 'SUBMITTED' }],
    }));
    q.mockImplementationOnce(async () => ({})); // UPDATE
    q.mockImplementationOnce(async () => ({})); // logHistory
    q.mockImplementationOnce(async () => {
      throw new Error('COMMIT failed');
    }); // COMMIT fails
    q.mockImplementationOnce(async () => ({})); // ROLLBACK

    await deskReject(req, res);

    expect(q).toHaveBeenCalledWith('ROLLBACK');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'COMMIT failed' });
  });

  it('should handle missing req.body gracefully (no note)', async () => {
    // Test: req.body is undefined

    req.body = undefined;

    q.mockImplementationOnce(async () => ({
      rows: [{ ebook_id: 'ebook-456', status: 'SUBMITTED' }],
    }));
    q.mockImplementationOnce(async () => ({})); // UPDATE
    q.mockImplementationOnce(async () => ({})); // logHistory
    q.mockImplementationOnce(async () => ({})); // COMMIT

    await deskReject(req, res);

    // logHistory should use default note
    const logHistoryCall = q.mock.calls.find(
      ([sql]) => sql.includes('INSERT INTO ebook_workflow_history')
    );
    expect(logHistoryCall).toBeDefined();
    const params = logHistoryCall[1];
    expect(params[4]).toBe('Desk rejected'); // note

    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Rejected' });
  });

  it('should handle ebook with unusual status values', async () => {
    // Test: ebook.status is not SUBMITTED/SCREENING, but deskReject should still proceed

    q.mockImplementationOnce(async () => ({
      rows: [{ ebook_id: 'ebook-456', status: 'UNDER_REVIEW' }],
    }));
    q.mockImplementationOnce(async () => ({})); // UPDATE
    q.mockImplementationOnce(async () => ({})); // logHistory
    q.mockImplementationOnce(async () => ({})); // COMMIT

    await deskReject(req, res);

    // logHistory should record fromStatus as 'UNDER_REVIEW'
    const logHistoryCall = q.mock.calls.find(
      ([sql]) => sql.includes('INSERT INTO ebook_workflow_history')
    );
    expect(logHistoryCall).toBeDefined();
    const params = logHistoryCall[1];
    expect(params[1]).toBe('UNDER_REVIEW'); // fromStatus
    expect(params[2]).toBe('REJECTED'); // toStatus
    expect(params[3]).toBe('DESK_REJECT'); // action

    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Rejected' });
  });
});