import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

export default function Admin() {

  const API_URL = import.meta.env.VITE_API_URL;

  const isAdmin =
    localStorage.getItem("isAdmin");

  if (!isAdmin) {
    return <Navigate to="/login" />;
  }

  const [orders, setOrders] =
    useState([]);

  const [totalOrders, setTotalOrders] =
    useState(0);

  const [totalUsers, setTotalUsers] =
    useState(0);

  useEffect(() => {

    fetchOrders();

    axios
      .get(
        `${API_URL}/api/admin/total-orders`
      )
      .then((res) => {

        setTotalOrders(
          res.data.totalOrders
        );

      });

    axios
      .get(
        `${API_URL}/api/admin/total-users`
      )
      .then((res) => {

        setTotalUsers(
          res.data.totalUsers
        );

      });

  }, []);

  const fetchOrders = async () => {

    try {

      const res = await axios.get(
        `${API_URL}/api/orders`
      );

      setOrders(
        res.data.reverse()
      );

    } catch (error) {

      console.log(error);

    }

  };

  const updateStatus = async (id) => {

    try {

      await axios.put(
        `${API_URL}/api/orders/${id}`,
        {
          status: "Delivered",
        }
      );

      fetchOrders();

    } catch (error) {

      console.log(error);

    }

  };

  const deleteOrder = async (id) => {

    try {

      await axios.delete(
        `${API_URL}/api/orders/${id}`
      );

      setOrders(
        orders.filter(
          (item) => item._id !== id
        )
      );

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div style={mainContainer}>

      {/* HEADER */}

<div
  style={{
    ...headerStyle,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  }}
>

  <div>

    <h1 style={titleStyle}>
      Admin Dashboard
    </h1>

    <p style={subtitleStyle}>
      Manage Orders & Users
    </p>

  </div>

  <button
    onClick={() => window.location.href = "/"}
    style={{
      padding: "12px 22px",
      background: "#dc2626",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "15px",
      height: "50px",
    }}
  >
    Go To Home Page
  </button>

</div>

      {/* TOP CARDS */}

      <div style={cardGrid}>

        <div style={dashboardCard}>

          <h2 style={cardNumber}>
            {totalOrders}
          </h2>

          <p style={cardText}>
            Total Orders
          </p>

        </div>

        <div style={dashboardCard2}>

          <h2 style={cardNumber}>
            {totalUsers}
          </h2>

          <p style={cardText}>
            Total Users
          </p>

        </div>

      </div>

      {/* TABLE */}

      <div style={tableContainer}>

        <table style={tableStyle}>

          <thead>

              <tr>

                <th style={thStyle}>Order ID</th>

                <th style={thStyle}>Date</th>

                <th style={thStyle}>User</th>

                <th style={thStyle}>Service</th>

                <th style={thStyle}>Mobile</th>

                <th style={thStyle}>Address</th>

                <th style={thStyle}>Front Image</th>

                <th style={thStyle}>Back Image</th>

                <th style={thStyle}>Status</th>

                <th style={thStyle}>Actions</th>

              </tr>

            </thead>

          <tbody>

          {
            orders.map((item, index) => (

              <tr
                key={index}
                style={trStyle}
              >

                {/* ORDER ID */}

                <td style={tdStyle}>

                  <span
                    style={{
                      color: "#38bdf8",
                      fontWeight: "bold",
                    }}
                  >
                    #{item._id.slice(-6)}
                  </span>

                </td>

                {/* DATE */}

                <td style={tdStyle}>

                  <div>
                    {
                      new Date(
                        item.createdAt
                      ).toLocaleDateString()
                    }
                  </div>

                  <small
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    {
                      new Date(
                        item.createdAt
                      ).toLocaleTimeString()
                    }
                  </small>

                </td>

                {/* USER */}

                <td style={tdStyle}>

                  <div style={nameBox}>
                    {item.fullName}
                  </div>

                </td>

                {/* SERVICE */}

                <td style={tdStyle}>
                  {item.service}
                </td>

                {/* MOBILE */}

                <td style={tdStyle}>
                  {item.mobile}
                </td>

                {/* ADDRESS */}

                <td style={tdStyle}>

                  {item.address},

                  <br />

                  {item.city},

                  <br />

                  {item.state}
                  {" - "}
                  {item.pincode}

                </td>

                {/* FRONT IMAGE */}

                <td style={tdStyle}>

                  <img
                    src={item.frontImage}
                    alt="front"
                    style={imageStyle}
                  />

                  <br />

                  <a
                    // href={item.frontImage} 
                    href={item.frontImage.replace(
                      "/upload/",
                      "/upload/fl_attachment/"
                    )}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={downloadLink}
                  >
                    Download
                  </a>

                </td>

                {/* BACK IMAGE */}

                <td style={tdStyle}>

                  <img
                    src={item.backImage}
                    alt="back"
                    style={imageStyle}
                  />

                  <br />

                  <a
                    // href={item.backImage}
                     href={item.backImage.replace(
                      "/upload/",
                      "/upload/fl_attachment/"
                    )}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={downloadLink}
                  >
                    Download
                  </a>

                </td>

                {/* STATUS */}

                <td style={tdStyle}>

                  <span
                    style={
                      item.status === "Pending"
                        ? pendingStyle
                        : deliveredStyle
                    }
                  >
                    {item.status}
                  </span>

                </td>

                {/* ACTIONS */}

                <td style={tdStyle}>

                  <button
                    onClick={() =>
                      updateStatus(item._id)
                    }
                    style={deliverBtn}
                  >
                    Delivered
                  </button>

                  <button
                    onClick={() =>
                      deleteOrder(item._id)
                    }
                    style={deleteBtn}
                  >
                    Delete
                  </button>

                  <a
                    href={`${API_URL}/api/invoice/${item._id}`}
                    target="_blank"
                    rel="noreferrer"
                  >

                    <button
                      style={invoiceBtn}
                    >
                      Invoice
                    </button>

                  </a>

                </td>

              </tr>

            ))
          }

          </tbody>

        </table>

      </div>

    </div>

  );

}

/* MAIN */

const mainContainer = {

  minHeight: "100vh",

  background: "#0f172a",

  padding: "30px",

  color: "#fff",

  fontFamily: "Arial",

};

/* HEADER */

const headerStyle = {

  marginBottom: "30px",

};

const titleStyle = {

  fontSize: "42px",

  fontWeight: "bold",

  marginBottom: "8px",

};

const subtitleStyle = {

  color: "#94a3b8",

  fontSize: "18px",

};

/* CARDS */

const cardGrid = {

  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit,minmax(250px,1fr))",

  gap: "25px",

  marginBottom: "40px",

};

const dashboardCard = {

  background:
    "linear-gradient(135deg,#ff0000,#ff4d4d)",

  padding: "35px",

  borderRadius: "20px",

  boxShadow:
    "0 10px 40px rgba(255,0,0,0.4)",

  transition: "0.4s",

  cursor: "pointer",

};

const dashboardCard2 = {

  background:
    "linear-gradient(135deg,#2563eb,#60a5fa)",

  padding: "35px",

  borderRadius: "20px",

  boxShadow:
    "0 10px 40px rgba(37,99,235,0.4)",

  transition: "0.4s",

  cursor: "pointer",

};

const cardNumber = {

  fontSize: "45px",

  marginBottom: "10px",

};

const cardText = {

  fontSize: "20px",

  fontWeight: "bold",

};

/* TABLE */

const tableContainer = {

  overflowX: "auto",

  background: "#111827",

  borderRadius: "20px",

  padding: "20px",

  boxShadow:
    "0 10px 40px rgba(0,0,0,0.5)",

};

const tableStyle = {

  width: "100%",

  borderCollapse: "collapse",

};

const thStyle = {

  padding: "18px",

  textAlign: "left",

  background: "#1e293b",

  color: "#fff",

  fontSize: "16px",

};

const tdStyle = {

  padding: "18px",

  borderBottom:
    "1px solid rgba(255,255,255,0.1)",

  color: "#e2e8f0",

  fontSize: "15px",

};

const trStyle = {

  transition: "0.3s",

};

const nameBox = {

  fontWeight: "bold",

  fontSize: "17px",

  color: "#fff",

};

/* IMAGE */

const imageStyle = {

  width: "120px",

  height: "80px",

  objectFit: "cover",

  borderRadius: "12px",

  border: "2px solid #334155",

};

/* STATUS */

const pendingStyle = {

  background: "#f59e0b",

  padding: "8px 14px",

  borderRadius: "30px",

  color: "#fff",

  fontWeight: "bold",

};

const deliveredStyle = {

  background: "#22c55e",

  padding: "8px 14px",

  borderRadius: "30px",

  color: "#fff",

  fontWeight: "bold",

};

/* BUTTONS */

const deliverBtn = {

  padding: "10px 16px",

  background: "#16a34a",

  color: "#fff",

  border: "none",

  borderRadius: "8px",

  cursor: "pointer",

  marginRight: "10px",

  fontWeight: "bold",

};

const deleteBtn = {

  padding: "10px 16px",

  background: "#dc2626",

  color: "#fff",

  border: "none",

  borderRadius: "8px",

  cursor: "pointer",

  fontWeight: "bold",

};

const invoiceBtn = {

  padding: "10px 16px",

  background:
    "linear-gradient(135deg,#2563eb,#60a5fa)",

  color: "#fff",

  border: "none",

  borderRadius: "8px",

  cursor: "pointer",

  marginTop: "10px",

  fontWeight: "bold",

};

const downloadLink = {

  display: "inline-block",

  marginTop: "8px",

  color: "#38bdf8",

  textDecoration: "none",

  fontSize: "14px",

  fontWeight: "bold",

};