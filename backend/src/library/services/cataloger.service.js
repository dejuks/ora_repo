import pool from '../../config/db.js';

const DDC_RULES = [
  { code: '000', label: 'Computer science, information & general works', keywords: ['computer', 'computing', 'software', 'programming', 'algorithm', 'artificial intelligence', 'ai', 'data science', 'machine learning', 'information systems'] },
  { code: '020', label: 'Library & information sciences', keywords: ['library', 'catalog', 'bibliography', 'classification', 'archiv', 'metadata'] },
  { code: '100', label: 'Philosophy & psychology', keywords: ['philosophy', 'psychology', 'ethics', 'logic'] },
  { code: '200', label: 'Religion', keywords: ['religion', 'theology', 'bible', 'islam', 'christian', 'faith'] },
  { code: '300', label: 'Social sciences', keywords: ['economics', 'law', 'education', 'politics', 'sociology', 'management', 'business', 'accounting'] },
  { code: '400', label: 'Language', keywords: ['language', 'linguistics', 'grammar', 'english', 'oromo', 'amharic'] },
  { code: '500', label: 'Science', keywords: ['mathematics', 'physics', 'chemistry', 'biology', 'science', 'statistics'] },
  { code: '600', label: 'Technology', keywords: ['engineering', 'medicine', 'agriculture', 'technology', 'health', 'nursing'] },
  { code: '700', label: 'Arts & recreation', keywords: ['art', 'music', 'design', 'sports', 'photography'] },
  { code: '800', label: 'Literature', keywords: ['literature', 'novel', 'poetry', 'fiction', 'drama'] },
  { code: '900', label: 'History & geography', keywords: ['history', 'geography', 'travel', 'biography'] },
];

const safeDigits = (value, fallback = '000') => {
  const cleaned = String(value || '').replace(/[^0-9.]/g, '');
  return cleaned || fallback;
};

const buildCutter = (name = '') => {
  const cleaned = String(name || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  if (!cleaned) return 'X00';
  const first = cleaned[0];
  const tail = cleaned.slice(1, 4).padEnd(3, '0');
  return `${first}${tail}`;
};

const tokenizeText = (text = '') => String(text || '').toLowerCase();

export async function getMaterialDetails(materialId) {
  const materialRes = await pool.query(
    `SELECT cm.*, 
            COALESCE(array_remove(array_agg(DISTINCT ls.name), NULL), '{}') AS subjects,
            COALESCE(array_remove(array_agg(DISTINCT c.full_name), NULL), '{}') AS contributors
       FROM catalog_materials cm
  LEFT JOIN catalog_material_subjects cms ON cms.material_id = cm.material_id
  LEFT JOIN library_subjects ls ON ls.subject_id = cms.subject_id
  LEFT JOIN catalog_material_contributors cmc ON cmc.material_id = cm.material_id
  LEFT JOIN contributors c ON c.contributor_id = cmc.contributor_id
      WHERE cm.material_id = $1
   GROUP BY cm.material_id`,
    [materialId]
  );
  return materialRes.rows[0] || null;
}

export async function suggestClassification({ materialId, search = '' } = {}) {
  let material = null;
  if (materialId) {
    material = await getMaterialDetails(materialId);
  }

  const haystack = tokenizeText([
    material?.title,
    material?.subtitle,
    material?.abstract,
    material?.description,
    search,
    ...(material?.subjects || []),
  ].filter(Boolean).join(' '));

  const ranked = DDC_RULES
    .map((rule) => {
      const hits = rule.keywords.filter((keyword) => haystack.includes(keyword.toLowerCase())).length;
      return { ...rule, score: hits };
    })
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code));

  const primary = ranked[0]?.score > 0 ? ranked[0] : DDC_RULES[0];
  const contributorName = material?.contributors?.[0] || material?.title || 'Unknown';
  const year = material?.publication_year || new Date().getFullYear();
  const callNumber = `${safeDigits(primary.code)} ${buildCutter(contributorName)} ${year}`;

  return {
    material,
    primarySuggestion: {
      classification_code: primary.code,
      label: primary.label,
      score: primary.score,
      call_number: callNumber,
    },
    alternatives: ranked.slice(1, 4).map((rule) => ({
      classification_code: rule.code,
      label: rule.label,
      score: rule.score,
      call_number: `${safeDigits(rule.code)} ${buildCutter(contributorName)} ${year}`,
    })),
  };
}

export async function applyClassification(materialId, payload = {}) {
  const current = await getMaterialDetails(materialId);
  if (!current) return null;

  const classificationCode = safeDigits(payload.classification_code || current.classification_code);
  const callNumber = String(payload.call_number || '').trim() || `${classificationCode} ${buildCutter(current.contributors?.[0] || current.title)} ${current.publication_year || new Date().getFullYear()}`;

  const { rows } = await pool.query(
    `UPDATE catalog_materials
        SET classification_code = $2,
            call_number = $3,
            updated_by = COALESCE($4, updated_by),
            updated_at = NOW()
      WHERE material_id = $1
  RETURNING *`,
    [materialId, classificationCode, callNumber, payload.updated_by || null]
  );
  return rows[0] || null;
}

export async function generateBarcode(copyId, payload = {}) {
  const { rows } = await pool.query(
    `SELECT mc.*, lb.code AS branch_code
       FROM material_copies mc
  LEFT JOIN library_branches lb ON lb.branch_id = mc.branch_id
      WHERE mc.copy_id = $1
      LIMIT 1`,
    [copyId]
  );
  const copy = rows[0];
  if (!copy) return null;

  const prefix = String(payload.prefix || copy.branch_code || 'LIB').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'LIB';
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(100000 + Math.random() * 900000).toString();
  const barcode = payload.force || !copy.barcode ? `${prefix}-${datePart}-${randomPart}` : copy.barcode;
  const accession = copy.accession_number || `${prefix}-ACC-${datePart}-${randomPart.slice(-4)}`;

  const updated = await pool.query(
    `UPDATE material_copies
        SET barcode = $2,
            accession_number = $3
      WHERE copy_id = $1
  RETURNING *`,
    [copyId, barcode, accession]
  );
  return updated.rows[0] || null;
}

export async function generateMissingBarcodes({ materialId, branchId, limit = 50, prefix } = {}) {
  const values = [];
  const clauses = ['(barcode IS NULL OR TRIM(barcode) = \'\')'];
  if (materialId) {
    values.push(materialId);
    clauses.push(`material_id = $${values.length}`);
  }
  if (branchId) {
    values.push(branchId);
    clauses.push(`branch_id = $${values.length}`);
  }
  values.push(Math.max(1, Math.min(Number(limit) || 50, 200)));
  const { rows } = await pool.query(
    `SELECT copy_id
       FROM material_copies
      WHERE ${clauses.join(' AND ')}
      ORDER BY acquisition_date NULLS LAST, copy_id
      LIMIT $${values.length}`,
    values
  );

  const updated = [];
  for (const row of rows) {
    updated.push(await generateBarcode(row.copy_id, { prefix, force: true }));
  }
  return updated;
}
