import React, { useState, useMemo } from "react";

// Standard Saaty Random Consistency Index (RI) table
const RI_TABLE = { 1: 0.0, 2: 0.0, 3: 0.58, 4: 0.9, 5: 1.12 };

// Your exact 5 agricultural criteria
const CRITERIA = [
  "pH Level",
  "NPK Suitability Score",
  "Rainfall/Moisture",
  "Temperature",
  "Market Price",
];

// 10 pairwise combinations representing Comparisons 1 to 10
const COMPARISON_CONFIG = [
  { id: 1, c1: 0, c2: 1, label: "pH Level vs NPK Suitability Score" },
  { id: 2, c1: 0, c2: 2, label: "pH Level vs Rainfall/Moisture" },
  { id: 3, c1: 0, c2: 3, label: "pH Level vs Temperature" },
  { id: 4, c1: 0, c2: 4, label: "pH Level vs Market Price" },
  { id: 5, c1: 1, c2: 2, label: "NPK Suitability Score vs Rainfall/Moisture" },
  { id: 6, c1: 1, c2: 3, label: "NPK Suitability Score vs Temperature" },
  { id: 7, c1: 1, c2: 4, label: "NPK Suitability Score vs Market Price" },
  { id: 8, c1: 2, c2: 3, label: "Rainfall/Moisture vs Temperature" },
  { id: 9, c1: 2, c2: 4, label: "Rainfall/Moisture vs Market Price" },
  { id: 10, c1: 3, c2: 4, label: "Temperature vs Market Price" },
];

export default function AniLinkAHP() {
  const [evaluations, setEvaluations] = useState({
    1: { preferred: "c1", scale: 1, remarks: "" },
    2: { preferred: "c1", scale: 1, remarks: "" },
    3: { preferred: "c1", scale: 1, remarks: "" },
    4: { preferred: "c1", scale: 1, remarks: "" },
    5: { preferred: "c1", scale: 1, remarks: "" },
    6: { preferred: "c1", scale: 1, remarks: "" },
    7: { preferred: "c1", scale: 1, remarks: "" },
    8: { preferred: "c1", scale: 1, remarks: "" },
    9: { preferred: "c1", scale: 1, remarks: "" },
    10: { preferred: "c1", scale: 1, remarks: "" },
  });

  const handleChange = (id, field, value) => {
    setEvaluations((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // Perform complete AHP calculations
  const { matrix, colSums, weights, weightedSum, lambdaMax, CI, CR } = useMemo(() => {
    const n = CRITERIA.length;
    const mat = Array.from({ length: n }, () => Array(n).fill(1));

    // Construct Pairwise Comparison Matrix (A)
    COMPARISON_CONFIG.forEach(({ id, c1, c2 }) => {
      const { preferred, scale } = evaluations[id];
      const val = Number(scale);
      if (preferred === "c1") {
        mat[c1][c2] = val;
        mat[c2][c1] = 1 / val;
      } else {
        mat[c1][c2] = 1 / val;
        mat[c2][c1] = val;
      }
    });

    // 1. Column sums
    const cSums = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        cSums[j] += mat[i][j];
      }
    }

    // 2. Normalized matrix & Priority Vector (weights)
    const w = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let rSum = 0;
      for (let j = 0; j < n; j++) {
        rSum += mat[i][j] / cSums[j];
      }
      w[i] = rSum / n;
    }

    // 3. Weighted sum vector (A * w)
    const wSum = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        wSum[i] += mat[i][j] * w[j];
      }
    }

    // 4. Principal Eigenvalue (lambda_max)
    const lMax =
      wSum.reduce((acc, val, idx) => acc + val / w[idx], 0) / n;

    // 5. Consistency Index & Ratio
    const ciVal = (lMax - n) / (n - 1);
    const crVal = ciVal / RI_TABLE[n];

    return {
      matrix: mat,
      colSums: cSums,
      weights: w,
      weightedSum: wSum,
      lambdaMax: lMax,
      CI: ciVal,
      CR: crVal,
    };
  }, [evaluations]);

  const isConsistent = CR < 0.10;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "920px", margin: "24px auto", padding: "24px", color: "#222", backgroundColor: "#fff" }}>
      {/* Header exactly styled from document */}
      <div style={{ borderBottom: "2px solid #1b5e20", paddingBottom: "14px", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "24px", color: "#1b5e20", margin: "0 0 6px 0", fontWeight: "bold" }}>
          AHP Criteria Importance Pairwise Evaluation
        </h1>
        <p style={{ margin: "4px 0", fontSize: "14px", color: "#444", fontStyle: "italic" }}>
          To determine the relative importance of the selected agricultural criteria used by AniLink in evaluating suitable crops.
        </p>
        <p style={{ margin: "4px 0", fontSize: "14px", color: "#444" }}>
          The purpose of this evaluation is to determine which agricultural factors should have greater or lesser importance when AniLink evaluates the suitability of crops for a farmer's conditions.
        </p>
      </div>

      {/* Comparisons 1 to 10 */}
      <h2 style={{ fontSize: "17px", color: "#1b5e20", borderBottom: "1px solid #ddd", paddingBottom: "6px" }}>
        Pairwise Comparisons & Remarks
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
        {COMPARISON_CONFIG.map(({ id, c1, c2 }) => {
          const item = evaluations[id];
          return (
            <div key={id} style={{ border: "1px solid #dcdcdc", borderRadius: "6px", padding: "12px 16px", backgroundColor: "#fbfbfb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <span style={{ fontWeight: "bold", fontSize: "14px", color: "#1b5e20" }}>
                  Comparison {id} Remarks
                </span>

                {/* Preference direction */}
                <div style={{ fontSize: "13px" }}>
                  <label style={{ marginRight: "10px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={`pref-${id}`}
                      checked={item.preferred === "c1"}
                      onChange={() => handleChange(id, "preferred", "c1")}
                    />{" "}
                    <strong>{CRITERIA[c1]}</strong>
                  </label>
                  <span>is preferred over</span>
                  <label style={{ marginLeft: "10px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={`pref-${id}`}
                      checked={item.preferred === "c2"}
                      onChange={() => handleChange(id, "preferred", "c2")}
                    />{" "}
                    <strong>{CRITERIA[c2]}</strong>
                  </label>
                </div>

                {/* Saaty Scale selector */}
                <div>
                  <label style={{ fontSize: "13px", marginRight: "6px" }}>Scale:</label>
                  <select
                    value={item.scale}
                    onChange={(e) => handleChange(id, "scale", Number(e.target.value))}
                    style={{ padding: "4px 8px", fontSize: "13px", borderRadius: "4px", border: "1px solid #bbb" }}
                  >
                    <option value={1}>1 - Equal Importance</option>
                    <option value={2}>2 - Weak / Slight</option>
                    <option value={3}>3 - Moderate Importance</option>
                    <option value={4}>4 - Moderate Plus</option>
                    <option value={5}>5 - Strong Importance</option>
                    <option value={6}>6 - Strong Plus</option>
                    <option value={7}>7 - Very Strong Importance</option>
                    <option value={8}>8 - Very Strong Plus</option>
                    <option value={9}>9 - Extreme Importance</option>
                  </select>
                </div>
              </div>

              {/* Exact ' | ' remarks line from the document */}
              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#666", fontWeight: "bold" }}>|</span>
                <input
                  type="text"
                  placeholder="Enter remarks or justification for this comparison..."
                  value={item.remarks}
                  onChange={(e) => handleChange(id, "remarks", e.target.value)}
                  style={{ width: "100%", padding: "6px 10px", fontSize: "13px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Consistency Validation & CR Result */}
      <div style={{ marginTop: "24px", padding: "16px", borderRadius: "8px", border: isConsistent ? "1px solid #a5d6a7" : "1px solid #ef9a9a", backgroundColor: isConsistent ? "#e8f5e9" : "#ffebee" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", color: isConsistent ? "#2e7d32" : "#c62828" }}>
          Consistency Verification Result
        </h3>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "14px" }}>
          <div><strong>Consistency Ratio (CR):</strong> {(CR * 100).toFixed(2)}% ({CR.toFixed(4)})</div>
          <div><strong>Principal Eigenvalue (λ max):</strong> {lambdaMax.toFixed(4)}</div>
          <div><strong>Consistency Index (CI):</strong> {CI.toFixed(4)}</div>
          <div><strong>Random Index (RI, n=5):</strong> {RI_TABLE[5]}</div>
        </div>
        <div style={{ marginTop: "8px", fontSize: "13px", fontWeight: "bold", color: isConsistent ? "#2e7d32" : "#c62828" }}>
          Status: {isConsistent ? "✓ CONSISTENT (CR < 0.10) - Pairwise evaluation judgments are acceptable." : "⚠ INCONSISTENT (CR ≥ 0.10) - Judgments exceed acceptable inconsistency. Please adjust ratings."}
        </div>
      </div>

      {/* Computed Weights Table */}
      <div style={{ marginTop: "24px" }}>
        <h3 style={{ fontSize: "16px", color: "#1b5e20", marginBottom: "8px" }}>Computed Criteria Weights (Priorities)</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f4f1", borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "8px" }}>Criteria</th>
              <th style={{ padding: "8px" }}>Priority Weight (w)</th>
              <th style={{ padding: "8px" }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {CRITERIA.map((crit, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{crit}</td>
                <td style={{ padding: "8px", fontFamily: "monospace" }}>{weights[idx].toFixed(4)}</td>
                <td style={{ padding: "8px" }}>{(weights[idx] * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AHP Pairwise Matrix Display */}
      <div style={{ marginTop: "24px" }}>
        <h3 style={{ fontSize: "16px", color: "#1b5e20", marginBottom: "8px" }}>AHP Pairwise Comparison Matrix [A]</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "center" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid #ccc" }}>
                <th style={{ padding: "8px", textAlign: "left" }}>Factor</th>
                {CRITERIA.map((c, i) => (
                  <th key={i} style={{ padding: "8px" }}>C{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map((crit, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px", textAlign: "left", fontWeight: "bold" }}>C{i + 1}: {crit}</td>
                  {matrix[i].map((val, j) => (
                    <td key={j} style={{ padding: "8px", fontFamily: "monospace" }}>
                      {val >= 1 ? val.toFixed(2) : val.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
                <td style={{ padding: "8px", textAlign: "left" }}>Column Sum</td>
                {colSums.map((sum, j) => (
                  <td key={j} style={{ padding: "8px", fontFamily: "monospace" }}>{sum.toFixed(2)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
