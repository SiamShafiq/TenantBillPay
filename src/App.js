// Entry point - App.js

import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import "./App.css";

const defaultBill = {
  floor: "6TH",
  rent: 50000,
  electricity: 1625,
  gas: 1080,
  water: 817,
  garbage: 500,
  service: 6000,
  total: 60022,
  month: "August",
  year: 2025,
  billDate: "2025-08-01",
};

const formatNumber = (num) => {
  return parseInt(num).toLocaleString("en-BD");
};

const BillPreview = ({ bill }) => (
  <div className="bill-preview">
    <div className="bill-box">
      <h3>INVOICE FOR RENT FOR THE PERIOD FROM</h3>
      <p className="month-heading">------------------- {bill.month.toUpperCase()} {bill.year} -------------------</p>
      <table className="bill-table">
        <tbody>
          <tr><td>1. HOUSE RENT FOR <span className="floor-number">{bill.floor}</span> FLOOR</td><td className="currency">TK</td><td className="amount">{formatNumber(bill.rent)}</td></tr>
          <tr><td>2. ELECTRICITY BILL</td><td className="currency">TK</td><td className="amount">{formatNumber(bill.electricity)}</td></tr>
          <tr><td>3. GAS BILL</td><td className="currency">TK</td><td className="amount">{formatNumber(bill.gas)}</td></tr>
          <tr><td>4. WATER BILL</td><td className="currency">TK</td><td className="amount">{formatNumber(bill.water)}</td></tr>
          <tr><td>5. GARBAGE (SOCIETY)</td><td className="currency">TK</td><td className="amount">{formatNumber(bill.garbage)}</td></tr>
          <tr><td>6. SERVICE CHARGE</td><td className="currency">TK</td><td className="amount">{formatNumber(bill.service)}</td></tr>
          <tr className="total-row"><td>7. TOTAL</td><td className="currency">TK</td><td className="amount">{formatNumber(bill.total)}</td></tr>
        </tbody>
      </table>
      <p className="mt">PLEASE PAY BY 5TH TO AKM SHAFIQULLAH, CITY BANK AC NO. 2101182106001 AND HANDOVER THE DEPOSIT SLIP TO LANDLORD.</p>
      <br />
      <div className="footer-box">
        <p className="bill-date-left">DATE: {bill.billDate}</p>
        <div className="landlord-info">
          <p><strong>SHAMSUZZAHAN SHAFIQ</strong></p>
          <p>House 27, Road-1, BLOCK A</p>
        </div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [bill, setBill] = useState(defaultBill);
  const [savedBills, setSavedBills] = useState(
    JSON.parse(localStorage.getItem("bills")) || []
  );
  const [view, setView] = useState("home");
  const [selectedBill, setSelectedBill] = useState(null);
  const billRef = useRef(null);

  useEffect(() => {
    const { rent, electricity, gas, water, garbage, service } = bill;
    const total = [rent, electricity, gas, water, garbage, service].reduce(
      (acc, val) => acc + parseFloat(val || 0),
      0
    );
    setBill((prev) => ({ ...prev, total }));
  }, [bill.rent, bill.electricity, bill.gas, bill.water, bill.garbage, bill.service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBill((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedBills = [...savedBills, bill];
    localStorage.setItem("bills", JSON.stringify(updatedBills));
    setSavedBills(updatedBills);
    alert("Bill saved successfully!");
    setView("home");
  };

  const downloadImage = (targetBill = bill, ref = billRef) => {
    const element = ref.current;
    if (!element) return;

    html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff"
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `bill-${targetBill.month}-${targetBill.year}-${targetBill.floor}.png`;
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const floorOptions = ["3RD", "4TH", "5TH", "6TH"];
  const monthOptions = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (view === "home") {
    return (
      <div className="app-center">
        <h1>🏠 Tenant Billing App</h1>
        <div className="button-group">
          <button onClick={() => setView("new")}>➕ Create New Bill</button>
          <button onClick={() => setView("list")}>📂 View Saved Bills</button>
        </div>
      </div>
    );
  }

  if (view === "list") {
    const groupedBills = savedBills.reduce((acc, bill) => {
      const key = `${bill.month} ${bill.year}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(bill);
      return acc;
    }, {});

    return (
      <div className="app-list">
        <h2>📂 Saved Bills</h2>
        <button onClick={() => setView("home")} className="back-btn">🔙 Back to Menu</button>
        {Object.entries(groupedBills).map(([group, bills]) => (
          <div key={group} className="bill-group">
            <h3>{group}</h3>
            <ul>
              {bills.map((b, i) => (
                <li key={i} className={selectedBill === b ? 'selected-bill' : ''}>
                  <button onClick={() => setSelectedBill(b)}>
                    Floor: {b.floor} — Total: TK {formatNumber(b.total)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {selectedBill && (
          <>
            <div ref={billRef} style={{ width: "fit-content", margin: "0 auto" }}>
              <BillPreview bill={selectedBill} />
            </div>
            <div className="button-group">
              <button onClick={() => downloadImage(selectedBill, billRef)}>
                📥 Download This Bill
              </button>
              <button
                onClick={() => {
                  const confirmDelete = window.confirm("Are you sure you want to delete this bill?");
                  if (!confirmDelete) return;

                  const updated = savedBills.filter(
                    (b) =>
                      !(
                        b.month === selectedBill.month &&
                        b.year === selectedBill.year &&
                        b.floor === selectedBill.floor &&
                        b.total === selectedBill.total &&
                        b.billDate === selectedBill.billDate
                      )
                  );
                  setSavedBills(updated);
                  localStorage.setItem("bills", JSON.stringify(updated));
                  setSelectedBill(null);
                }}
              >
                🗑️ Delete This Bill
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <div className="header">
        <h2>🧾 Bill Generator</h2>
        <button onClick={() => setView("home")} className="back-btn">🔙 Back to Menu</button>
      </div>
      <div className="main-content">
        <div className="form-section">
          {Object.entries(bill).map(([key, value]) => (
            <div key={key} className="input-group">
              <label>{key.toUpperCase()}</label>
              {key === "floor" ? (
                <select name="floor" value={value} onChange={handleChange}>
                  {floorOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : key === "month" ? (
                <select name="month" value={value} onChange={handleChange}>
                  {monthOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : key === "billDate" ? (
                <input
                  type="date"
                  name="billDate"
                  value={value}
                  onChange={handleChange}
                />
              ) : key === "total" ? (
                <input
                  name="total"
                  value={formatNumber(value)}
                  disabled
                />
              ) : (
                <input
                  name={key}
                  value={value}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
          <div className="button-group">
            <button onClick={handleSave}>💾 Save Bill</button>
            <button onClick={() => downloadImage(bill, billRef)}>📥 Download as PNG</button>
          </div>
        </div>

        <div ref={billRef} style={{ width: "fit-content", margin: "0 auto", height:"100%"}}>
          <BillPreview bill={bill} />
        </div>
      </div>
    </div>
  );
};

export default App;
