import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import logo from "../assets/icons/logo.png";
import html2pdf from "html2pdf.js";

export default function OrderSuccess() {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const order =
    location.state?.order;

  const paymentId =
    location.state?.paymentId;

    const downloadPDF = () => {

  const element =
    document.getElementById("invoice");

  const options = {

    margin: 0.5,

    filename:
      `Invoice-${order.invoiceNumber}.pdf`,

    image: {
      type: "jpeg",
      quality: 1,
    },

    html2canvas: {
      scale: 2,
    },

    jsPDF: {
      unit: "in",
      format: "a4",
      orientation: "portrait",
    },

  };

  html2pdf()
    .set(options)
    .from(element)
    .save();

};

  if (!order) {

    // PAYMENT SUCCEEDED BUT SAVING THE ORDER HICCUPPED.
    // STILL CONFIRM THE PAYMENT INSTEAD OF A BARE ERROR.
    return (

      <div
        style={{
          minHeight: "100vh",
          background: "#f4f6f9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "25px",
        }}
      >

        <div
          style={{
            width: "90px",
            height: "90px",
            background: "#e8f8ed",
            color: "green",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "45px",
            marginBottom: "20px",
          }}
        >
          ✓
        </div>

        <h2 style={{ color: "green", marginBottom: "10px" }}>
          Payment Successful
        </h2>

        <p style={{ color: "#666", maxWidth: "420px" }}>
          {paymentId
            ? `Your payment (${paymentId}) was received. We are processing your order and will email you shortly.`
            : "Your payment was received. We are processing your order and will email you shortly."}
        </p>

        <button
          onClick={() => navigate("/")}
          style={{ ...primaryBtn, marginTop: "25px" }}
        >
          Back Home
        </button>

      </div>

    );

  }

  return (

    <div
      style={{
        minHeight: "100vh",
        background:
          "#f4f6f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "25px",
      }}
    >

      <div
      id="invoice"
        style={{
          width: "100%",
          maxWidth: "950px",
          background: "#fff",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >

        {/* HEADER */}

        <div
            style={{
                background:
                "linear-gradient(135deg,#D40000,#ff3b3b)",
                padding: "25px",
                color: "#fff",
                display: "flex",
                justifyContent:
                "space-between",
                alignItems: "center",
                flexWrap: "wrap",
            }}
            >

            <div
                style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                }}
            >


    <div>
      <img
            src={logo}
            alt="logo"
            style={{
                borderRadius:"22px",
                padding: "5px",
                objectFit: "cover",
            }}
            />

      <p
        style={{
          margin: 0,
          opacity: 0.9,
        }}
      >
        Print & Services
      </p>

    </div>

  </div>

  {/* RIGHT SIDE */}

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "15px",
    }}
  >

    <div
      style={{
        background:
          "rgba(255,255,255,0.15)",
        padding:
          "10px 18px",
        borderRadius: "10px",
        fontWeight: "bold",
      }}
    >
      Payment Successful
    </div>

    <button
      onClick={() => navigate("/")}
      style={{
        background: "#fff",
        border: "none",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: "22px",
        fontWeight: "bold",
        color: "#D40000",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      ✕
    </button>

  </div>

</div>

        {/* BODY */}

        <div
          style={{
            padding: "35px",
          }}
        >

          {/* SUCCESS */}

          <div
            style={{
              textAlign: "center",
              marginBottom: "35px",
            }}
          >

            <div
              style={{
                width: "90px",
                height: "90px",
                background:
                  "#e8f8ed",
                color: "green",
                borderRadius: "50%",
                display: "flex",
                justifyContent:
                  "center",
                alignItems: "center",
                fontSize: "45px",
                margin:
                  "0 auto 20px",
              }}
            >
              ✓
            </div>

            <h2
              style={{
                color: "green",
                marginBottom: "10px",
                fontSize: "38px",
              }}
            >
              Order Submitted Successfully
            </h2>

            <p
              style={{
                color: "#666",
                fontSize: "18px",
              }}
            >
              Your order has been placed successfully.
            </p>

          </div>

          {/* DETAILS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "25px",
            }}
          >

            {/* LEFT */}

            <div
              style={{
                background:
                  "#fafafa",
                padding: "25px",
                borderRadius: "14px",
                border:
                  "1px solid #eee",
              }}
            >

              <h3
                style={{
                  color: "#D40000",
                  marginBottom: "20px",
                }}
              >
                Order Details
              </h3>

              <Detail
                label="Order ID"
                value={order.orderId}
              />

              <Detail
                label="Invoice"
                value={
                  order.invoiceNumber
                }
              />

              <Detail
                label="Service"
                value={order.service}
              />

              <Detail
                label="Status"
                value={order.status}
              />

              <Detail
                label="Payment"
                value="Paid Online"
              />

            </div>

            {/* RIGHT */}

            <div
              style={{
                background:
                  "#fafafa",
                padding: "25px",
                borderRadius: "14px",
                border:
                  "1px solid #eee",
              }}
            >

              <h3
                style={{
                  color: "#D40000",
                  marginBottom: "20px",
                }}
              >
                Customer Details
              </h3>

              <Detail
                label="Name"
                value={order.fullName}
              />

              <Detail
                label="Mobile"
                value={order.mobile}
              />

              <Detail
                label="Address"
                value={order.address}
              />

              <Detail
                label="City"
                value={order.city}
              />

            </div>

          </div>

          {/* TOTAL */}

          <div
            style={{
              marginTop: "30px",
              background:
                "#fff5f5",
              border:
                "1px solid #ffd4d4",
              padding: "22px",
              borderRadius: "14px",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >

            <div>

              <h2
                style={{
                  color: "#D40000",
                  margin: 0,
                }}
              >
                Total Amount
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#666",
                }}
              >
                GST Included
              </p>

            </div>

            <h1
              style={{
                color: "#D40000",
                margin: 0,
                fontSize: "42px",
              }}
            >
              ₹100.98
            </h1>

          </div>

          {/* BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "18px",
              marginTop: "35px",
              flexWrap: "wrap",
              justifyContent:
                "center",
            }}
          >

            <button
              onClick={() =>
                navigate(
                  `/track-order/${order.orderId}`
                )
              }
              style={primaryBtn}
            >
              Track Order
            </button>
               

               <button
                onClick={downloadPDF}
                style={{
                background: "green",
                color: "#fff",
                border: "none",
                padding: "15px 28px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
                }}
            >
                Download PDF
            </button>

            <button
              onClick={() =>
                navigate("/")
              }
              style={secondaryBtn}
            >
              Back Home
            </button>

          </div>

          {/* FOOTER */}

          <div
            style={{
              marginTop: "35px",
              textAlign: "center",
              color: "#666",
            }}
          >

            You will receive an email
            confirmation shortly.

          </div>

        </div>

      </div>

    </div>

  );

}

/* DETAIL COMPONENT */

function Detail({
  label,
  value,
}) {

  return (

    <div
      style={{
        marginBottom: "15px",
        display: "flex",
        justifyContent:
          "space-between",
        gap: "15px",
      }}
    >

      <span
        style={{
          color: "#777",
          fontWeight: "500",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontWeight: "bold",
          color: "#222",
          textAlign: "right",
        }}
      >
        {value}
      </span>

    </div>

  );

}

/* BUTTONS */

const primaryBtn = {

  background: "#D40000",
  color: "#fff",
  border: "none",
  padding: "15px 28px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",

};

const secondaryBtn = {

  background: "#fff",
  color: "#D40000",
  border: "2px solid #D40000",
  padding: "15px 28px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",

};