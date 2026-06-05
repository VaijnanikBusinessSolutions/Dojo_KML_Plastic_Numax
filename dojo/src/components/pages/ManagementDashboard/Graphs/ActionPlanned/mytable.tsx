

import React, { useState, useEffect } from "react";
import axios from "axios";
import TableComponent from '../../Table/table';

const MyTable = () => {
  const [tableData, setTableData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    topic: "",
    subtopic: "",
    date: ""
  });

  // --- API CALLS ---
  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/actions/");
      setTableData(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // CHANGED: Only check for Topic and Date. Subtopic is now optional.
    if (!formData.topic || !formData.date) {
      alert("Please fill in Topic and Date fields");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/actions/${editingId}/`, formData);
      } else {
        await axios.post("http://127.0.0.1:8000/api/actions/", formData);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error("Error submitting", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/actions/${editingId}/`);
        fetchData();
        closeModal();
      } catch (error) {
        console.error("Error deleting", error);
      }
    }
  };

  // --- INTERACTION HANDLERS ---

  const openAddModal = () => {
    setFormData({ topic: "", subtopic: "", date: "" });
    setEditingId(null);
    setShowModal(true);
  };

  const handleRowClick = (index) => {
    const item = tableData[index];
    setFormData({
      topic: item.topic,
      subtopic: item.subtopic || "", // Handle nulls if API returns null
      date: item.date
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ topic: "", subtopic: "", date: "" });
  };

  const processedRows = tableData.map((item) => [
    item.topic,
    // item.subtopic,
    item.date
  ]);

  return (
    <div style={styles.container}>
      
      {/* CSS STYLES INJECTION */}
      <style>
        {`
          .blue-striped-table table {
            width: 100%;
            border-collapse: collapse;
            font-family: sans-serif;
          }
          .blue-striped-table thead tr, 
          .blue-striped-table th {
            background-color: #cceeff !important; 
            color: #000;
            text-align: left;
          }
          .blue-striped-table tbody tr:nth-child(odd) {
            background-color: #66b3ff !important;
          }
          .blue-striped-table tbody tr:nth-child(even) {
            background-color: #cceeff !important;
          }
          .blue-striped-table td, 
          .blue-striped-table th {
            padding: 10px;
            color: #000;
            font-weight: 600;
            border: none;
          }
          .blue-striped-table tbody tr:hover {
            filter: brightness(0.9);
            cursor: pointer;
          }
        `}
      </style>

      {/* CLICKABLE BLACK HEADER */}
      <div 
        onClick={openAddModal} 
        style={styles.blackHeader}
        title="Click to Add New"
      >
        {/* <span style={styles.headerTitle}>
          Actions Planned for rejection
        </span> */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={styles.headerTitle}>
            Actions Planned for rejection
          </h3>
          <span style={styles.headerSubtitle}>
            click any row to edit and delete
          </span>
        </div>
        <span style={styles.headerIcon}>Add ▲</span> 
      </div>

      {/* TABLE CONTAINER */}
      <div className="blue-striped-table">
        <TableComponent
          headers={["Topic", /* "Subtopic", */ "Date"]} 
          rows={processedRows}
          onRowClick={handleRowClick}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{editingId ? "Edit Action Plan" : "Add New Action Plan"}</h3>
              <button onClick={closeModal} style={styles.closeX}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <label>Topic <span style={{color:'red'}}>*</span></label>
              <input 
                type="text" 
                value={formData.topic} 
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })} 
                style={styles.input} 
                placeholder="Required"
              />

              {/* CHANGED: Label indicates optional */}
              {/* <label>Subtopic <span style={{color:'#999', fontSize:'0.9em'}}>(Optional)</span></label>
              <input 
                type="text" 
                value={formData.subtopic} 
                onChange={(e) => setFormData({ ...formData, subtopic: e.target.value })} 
                style={styles.input} 
              /> */}

              <label>Date <span style={{color:'red'}}>*</span></label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                style={styles.input} 
              />

              <div style={styles.modalFooter}>
                {editingId && (
                  <button type="button" onClick={handleDelete} style={styles.deleteBtn}>Delete</button>
                )}
                <div style={styles.rightButtons}>
                  <button type="button" onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" style={styles.saveBtn}>{editingId ? "Update" : "Save"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1500px" },
  
  blackHeader: {
    backgroundColor: "#1a1a1a", 
    color: "white",
    padding: "8px 15px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: "0px",
    borderTopRightRadius: "0px",
    marginBottom: "0px" 
  },
  // headerTitle: { fontWeight: "bold", fontSize: "16px" },
   headerTitle: { fontWeight: "bold", fontSize: "16px", margin: "0", 
    lineHeight: "1.2"  },
  headerSubtitle: { 
    fontSize: "11px", 
    fontWeight: "normal", 
    color: "#ccc", // Light grey text
    marginTop: "2px" 
  },
  headerIcon: { fontSize: "12px", color: "#ccc" },

  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: "#fff", padding: "30px", borderRadius: "10px",
    width: "400px", boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    display: "flex", flexDirection: "column"
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  closeX: { background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { padding: "10px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" },
  modalFooter: { display: "flex", justifyContent: "space-between", marginTop: "20px", alignItems: "center" },
  rightButtons: { display: "flex", gap: "10px", marginLeft: "auto" },
  deleteBtn: { backgroundColor: "#dc3545", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" },
  cancelBtn: { backgroundColor: "#6c757d", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" },
  saveBtn: { backgroundColor: "#007bff", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" }
};

export default MyTable;

