import {
  useParams,
  useNavigate,
} from "react-router-dom";
import { useState,useEffect } from "react";
import axios from "axios";
import services from "../data/services";
import Navbar from "../components/Navbar";
import loadRazorpay from "../utils/loadRazorpay";

import {
  ToastContainer,
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function ServiceDetails() {

  const API_URL = import.meta.env.VITE_API_URL;

  const user =
  JSON.parse(
    localStorage.getItem("user")
  );

  const { slug } = useParams();
  const navigate =
  useNavigate();

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
   
  const [frontPreview, setFrontPreview] =
  useState("");

  const [backPreview, setBackPreview] =
  useState("");

  // ADD HERE
  const [frontFileName, setFrontFileName] =
    useState("");

  const [backFileName, setBackFileName] =
    useState("");

    // FORM STATES
const [fullName, setFullName] =
  useState("");

const [address, setAddress] =
  useState("");

const [city, setCity] =
  useState("");

const [stateName, setStateName] =
  useState("");

const [pincode, setPincode] =
  useState("");

const [mobile, setMobile] =
  useState("");

  const [email, setEmail] =
  useState(user?.email || "");

// ERROR STATE
const [errors, setErrors] =
  useState({});

// PAYMENT IN-PROGRESS GUARD
// Prevents opening the Razorpay modal
// multiple times (double clicks / re-entry),
// which re-initializes the SDK and re-fetches
// its internal checkout chunks each time.
const [isPaying, setIsPaying] =
  useState(false);

  const service = services.find(
    (item) => item.slug === slug
  );

  if (!service) {
    return <h1>Service Not Found</h1>;
  }




  //VALIDATION FUNCTION 
const validateForm = () => {

  let newErrors = {};

  if (!fullName.trim()) {
    newErrors.fullName =
      "Full Name is required";
  }

  if (!address.trim()) {
    newErrors.address =
      "Address is required";
  }

  if (!city.trim()) {
    newErrors.city =
      "City is required";
  }

  if (!stateName.trim()) {
    newErrors.stateName =
      "State is required";
  }

  if (pincode.length !== 6) {
    newErrors.pincode =
      "Pincode must be 6 digits";
  }

  if (mobile.length !== 10) {
    newErrors.mobile =
      "Mobile number must be 10 digits";
  }

  // FRONT IMAGE REQUIRED
  if (!frontImage) {

    newErrors.frontImage =
      "Front Image Required";

  }

  // BACK IMAGE REQUIRED
  if (
    service.title !==
    "Passport Size Photo" &&
    !backImage
  ) {

    newErrors.backImage =
      "Back Image Required";

  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;

};


  //Create Payment Function
  const handlePayment = async () => {

  // BLOCK RE-ENTRY WHILE A CHECKOUT
  // IS ALREADY IN PROGRESS
  if (isPaying) {
    return;
  }

  // VALIDATE FIRST
  const isValid =
    validateForm();

  if (!isValid) {

    toast.error(
      "Please Fill All Required Fields"
    );

    return;
  }

  setIsPaying(true);

  try {

    const sdkReady = await loadRazorpay();

    if (!sdkReady || !window.Razorpay) {
      setIsPaying(false);
      toast.error(
        "Payment SDK Failed To Load"
      );
      return;
    }

    const amount =
      parseInt(
        service.price.replace(/[^0-9]/g, "")
      );

    const { data } = await axios.post(
      `${API_URL}/api/payment/create-order`,
      {
        amount,
      }
    );

    const options = {

      key: import.meta.env.VITE_RAZORPAY_KEY_ID,

      amount: data.amount,

      currency: data.currency,

      name: "Devkala",

      description: service.title,

      order_id: data.id,

      handler: async function (response) {

        toast.success(
          "Payment Successful"
        );

        // PAYMENT IS DONE — ALWAYS LAND THE USER ON THE
        // SUCCESS SCREEN, EVEN IF SAVING THE ORDER HICCUPS.
        try {

          const savedOrder = await handleSubmit();

          navigate(
            "/order-success",
            {
              state: {
                order: savedOrder,
                paymentId:
                  response?.razorpay_payment_id,
              },
            }
          );

        } catch (err) {

          console.log(err);

          navigate(
            "/order-success",
            {
              state: {
                order: null,
                paymentId:
                  response?.razorpay_payment_id,
              },
            }
          );

        } finally {

          setIsPaying(false);

        }

      },

      // RE-ENABLE WHEN USER CLOSES MODAL
      modal: {
        ondismiss: function () {
          setIsPaying(false);
        },
      },

      theme: {
        color: "#D40000",
      },

    };

    const razor =
      new window.Razorpay(options);

    // SURFACE FAILED PAYMENTS INSTEAD OF
    // LEAVING THE BUTTON STUCK
    razor.on("payment.failed", function () {
      setIsPaying(false);
      toast.error(
        "Payment Failed"
      );
    });

    razor.open();

  } catch (error) {

    console.log(error);

    setIsPaying(false);

    toast.error(
      "Payment Failed"
    );

  }

};



  const handleSubmit = async () => {

  // let newErrors = {};

  // // FULL NAME
  // if (!fullName.trim()) {
  //   newErrors.fullName =
  //     "Full Name is required";
  // }

  // // ADDRESS
  // if (!address.trim()) {
  //   newErrors.address =
  //     "Address is required";
  // }

  // // CITY
  // if (!city.trim()) {
  //   newErrors.city =
  //     "City is required";
  // }

  // // STATE
  // if (!stateName.trim()) {
  //   newErrors.stateName =
  //     "State is required";
  // }

  // // PINCODE
  // if (pincode.length !== 6) {
  //   newErrors.pincode =
  //     "Pincode must be 6 digits";
  // }

  // // MOBILE
  // if (mobile.length !== 10) {
  //   newErrors.mobile =
  //     "Mobile number must be 10 digits";
  // }



  // IMAGE CHECK

// if (!frontImage) {

//   newErrors.frontImage =
//     "Image Required";

// }

// ONLY REQUIRE BACK IMAGE
// FOR OTHER SERVICES

// if (
//   service.title !==
//   "Passport Size Photo" &&
//   !backImage
// ) {

//   newErrors.backImage =
//     "Back Image Required";

// }

  // SHOW ERRORS
  // setErrors(newErrors);

  // if (
  //   Object.keys(newErrors).length > 0
  // ) {

  //   toast.error(
  //     "Please fill all required fields"
  //   );

  //   return;
  // }

  try {

    // FORM DATA
    const formData = new FormData();

    formData.append(
      "service",
      service.title
    );

    formData.append(
      "fullName",
      fullName
    );

    formData.append(
      "address",
      address
    );

    formData.append(
      "city",
      city
    );

    formData.append(
      "state",
      stateName
    );

    formData.append(
      "pincode",
      pincode
    );

    formData.append(
      "mobile",
      mobile
    );

      formData.append(
        "email",
        email
      );

    formData.append(
      "frontImage",
      frontImage
    );

    if (backImage) {
      formData.append(
        "backImage",
        backImage
      );
   }

    console.log("FORM DATA");

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    // DEBUG
    console.log(frontImage);
    console.log(backImage);

    // API CALL
    const response =
      await axios.post(

        `${API_URL}/api/orders`,

        formData,
      );

    console.log(response.data);

    // RETURN THE SAVED ORDER SO THE PAYMENT HANDLER
    // CAN NAVIGATE TO THE SUCCESS SCREEN.
    return response.data.data;

  } catch (error) {

    console.log(
      error.response?.data || error
    );

    // LET THE CALLER DECIDE WHAT TO DO ON FAILURE.
    throw error;

  }

};

useEffect(() => {

  axios
    .get(`${API_URL}/api/orders`)
    .then((res) => {

      console.log(res.data);

    })
    .catch((err) => {

      console.log(err);

    });

}, []);

  return ( 
      <> 
      <Navbar />
    <section
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "100px 5%",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "auto",
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* IMAGE */}
        <img
          src={service.img}
          alt={service.title}
          style={{
            width: "100%",
            maxHeight: "350px",
            objectFit: "contain",
            borderRadius: "10px",
          }}
        />

        {/* TITLE */}
        <h1
          style={{
            marginTop: "25px",
            color: "red",
            fontSize: "36px",
            fontWeight: "bold",
          }}
        >
          {service.title}
        </h1>

        {/* DESCRIPTION */}
        <p
          style={{
            color: "#555",
            marginTop: "10px",
            fontSize: "17px",
          }}
        >
          {service.desc}
        </p>

        {/* PRICE */}
        <h2
          style={{
            marginTop: "15px",
            color: "#D40000",
            fontWeight: "bold",
          }}
        >
          Print + GST = {service.price}
        </h2>

        {/* UPLOAD SECTION */}
       
          <div
            style={{
              marginTop: "35px",
            }}
          >
            {/* FRONT LABEL */}
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "bold",
                color: "#111",
                fontSize: "17px",
              }}
            >
              Upload Front Side
            </label>  
            {errors.frontImage && (
              <p style={errorStyle}>
                {errors.frontImage}
              </p>
               )}

            {/* FRONT CUSTOM INPUT */}
            <div
              style={{
                border: "1px solid red",
                borderRadius: "6px",
                padding: "12px",
                background: "#fff",
                marginBottom: "25px",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <input
                  type="file"
                  id="frontUpload"
                  accept="image/*"
                  style={{
                    display: "none",
                  }}
                  onChange={(e) => {

                    const file = e.target.files[0];

                    if (file) {

                      // IMAGE SIZE CHECK
                      const fileSize =
                        file.size / 1024 / 1024;

                      if (fileSize > 5) {

                        toast.error(
                          "Front Image Size Must Be Less Than 5MB"
                        );

                        return;
                      }

                      setFrontImage(file);

                      setFrontPreview(
                        URL.createObjectURL(file)
                      );

                      setFrontFileName(file.name);

                    }

                  }}
                />

              <label
                htmlFor="frontUpload"
                style={{
                  background: "#D40000",
                  color: "#fff",
                  padding: "10px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Choose File
              </label>

              <span
                style={{
                  color: "#555",
                  fontSize: "15px",
                }}
              >
                {frontFileName ||
                  "No file chosen"}
              </span>

              {frontImage && (
                <p
                  style={{
                    color: "#666",
                    fontSize: "13px",
                    marginTop: "5px",
                  }}
                >
                  Image Size:
                  {" "}
                  {(
                    frontImage.size /
                    1024 /
                    1024
                  ).toFixed(2)}
                  MB
                </p>
              )}
            </div>

            {/* BACK LABEL */}
            {
              service.title !==
              "Passport Size Photo" && (
                <>
                  {/* BACK LABEL */}
                  <label
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: "bold",
                      color: "#111",
                      fontSize: "17px",
                    }}
                  >
                    Upload Back Side
                  </label>

                  {errors.backImage && (
                    <p style={errorStyle}>
                      {errors.backImage}
                    </p>
                  )}

                  {/* BACK CUSTOM INPUT */}
                  <div
                    style={{
                      border: "1px solid red",
                      borderRadius: "6px",
                      padding: "12px",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      type="file"
                      id="backUpload"
                      style={{
                        display: "none",
                      }}
                      accept="image/*"
                      onChange={(e) => {

                        const file = e.target.files[0];

                        if (file) {

                          const fileSize =
                            file.size / 1024 / 1024;

                          if (fileSize > 5) {

                            toast.error(
                              "Back Image Size Must Be Less Than 5MB"
                            );

                            return;
                          }

                          setBackImage(file);

                          setBackPreview(
                            URL.createObjectURL(file)
                          );

                          setBackFileName(file.name);

                        }

                      }}
                    />

                    <label
                      htmlFor="backUpload"
                      style={{
                        background: "#D40000",
                        color: "#fff",
                        padding: "10px 18px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Choose File
                    </label>

                    <span
                      style={{
                        color: "#555",
                        fontSize: "15px",
                      }}
                    >
                      {backFileName ||
                        "No file chosen"}
                    </span>

                    {backImage && (
                      <p
                        style={{
                          color: "#666",
                          fontSize: "13px",
                          marginTop: "5px",
                        }}
                      >
                        Image Size:
                        {" "}
                        {(
                          backImage.size /
                          1024 /
                          1024
                        ).toFixed(2)}
                        MB
                      </p>
                    )}
                  </div>
                </>
              )
              }
            </div>
          

        {/* PREVIEW SECTION */}
        <div
          style={{
            maxWidth: "600px",
            margin: "40px auto",
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              display: "block",
              marginBottom: "25px",
              fontWeight: "bold",
              color: "#333333",
              fontSize: "30px",
            }}
          >
            Uploaded Preview
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "25px",
              flexWrap: "wrap",
            }}
          >
            {/* FRONT */}
            <div>
              <h4 
              style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: "bold",
              color: "#111",
              fontSize: "17px",
            }}  
              >Front Side</h4>

              {frontImage ? (
                <img
                src={frontPreview}
                alt="Front Preview"
                style={{
                maxWidth: "100%",
                maxHeight: "300px",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "10px",
                border: "1px solid #ddd",
                }}
                />
                ) : (
                  <div
                style={{
                width: "220px",
                height: "140px",
                border: "1px dashed #ccc",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                }}
                >
                No Image
                </div>
              )}
            </div>

            {/* BACK */}
             {
            service.title !==
            "Passport Size Photo" && (
              <div>
                
                {/* BACK */}
                <div>
                  <h4
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: "bold",
                      color: "#111",
                      fontSize: "17px",
                    }}
                  >
                    Back Side
                  </h4>

                  {backImage ? (
                    <img
                      src={backPreview}
                      alt="Back Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "220px",
                        height: "140px",
                        border: "1px dashed #ccc",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>

              </div>
            )
            }
          </div>
        </div>

        {/* ADDRESS FORM */}
        <div
          style={{
            marginTop: "40px",
          }}
        >
          <h2
            style={{
              color: "red",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            Shipping Address
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                window.innerWidth < 768
                  ? "1fr"
                  : "1fr 1fr",
              gap: "15px",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            <div>
            <input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              style={inputStyle}
            />

            {errors.fullName && (
              <p style={errorStyle}>
                {errors.fullName}
              </p>
            )}
          </div>

           <div>
            <input
              placeholder="Address"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              style={inputStyle}
            />

            {errors.address && (
              <p style={errorStyle}>
                {errors.address}
              </p>
            )}
          </div>
            <div>
            <input
              placeholder="City"
              value={city}
              onChange={(e) =>
                setCity(e.target.value)
              }
              style={inputStyle}
            />

            {errors.city && (
              <p style={errorStyle}>
                {errors.city}
              </p>
            )}
          </div>

            <div>
            <input
              placeholder="State"
              value={stateName}
              onChange={(e) =>
                setStateName(e.target.value)
              }
              style={inputStyle}
            />

            {errors.stateName && (
              <p style={errorStyle}>
                {errors.stateName}
              </p>
            )}
          </div>

            <div>
            <input
              placeholder="Pincode"
              value={pincode}
              onChange={(e) =>
                setPincode(e.target.value)
              }
              style={inputStyle}
            />

            {errors.pincode && (
              <p style={errorStyle}>
                {errors.pincode}
              </p>
            )}
          </div>

            <div>
            <input
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value)
              }
              style={inputStyle}
            />

            {errors.mobile && (
              <p style={errorStyle}>
                {errors.mobile}
              </p>
            )}
          </div>
          </div>
        </div>

        {/* BUTTON */}
      <button
        onClick={handlePayment}
        disabled={isPaying}
        style={{
          marginTop: "30px",
          background: "#D40000",
          color: "#fff",
          border: "none",
          padding: "15px 30px",
          borderRadius: "8px",
          cursor: isPaying ? "not-allowed" : "pointer",
          opacity: isPaying ? 0.7 : 1,
          width: "100%",
          fontSize: "17px",
          fontWeight: "bold",
        }}
      >
        {isPaying ? "Processing..." : "Proceed To Checkout"}
      </button>
      </div>
    </section> 
    <ToastContainer
  position="top-right"
  autoClose={3000}
/>
    </>
  );
}


const errorStyle = {
  color: "red",
  fontSize: "13px",
  marginTop: "5px",
};
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};